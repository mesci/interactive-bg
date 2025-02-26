import { Hands } from '@mediapipe/hands';

export class HandTracker {
    constructor() {
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.videoElement = document.getElementById('video-input');
        
        // When the page loads, request camera permission
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            this.requestCameraPermission();
        } else {
            console.error('getUserMedia is not supported in this browser');
        }
    }

    async requestCameraPermission() {
        try {
            // Check camera status
            const permissionStatus = await navigator.permissions.query({ name: 'camera' });
            
            if (permissionStatus.state === 'denied') {
                alert('Camera access is blocked. Please enable it in your browser settings and refresh the page.');
                return;
            }

            // Start camera stream
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });

            this.videoElement.srcObject = stream;
            this.videoElement.setAttribute('playsinline', '');
            this.videoElement.setAttribute('muted', '');
            this.videoElement.setAttribute('autoplay', '');

            // When the video is ready, start
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play()
                        .then(resolve)
                        .catch(error => {
                            console.error('Video play failed:', error);
                            resolve();
                        });
                };
            });

            console.log('Camera initialized successfully');

        } catch (error) {
            console.error('Camera initialization error:', error);
            
            if (error.name === 'NotAllowedError') {
                alert('Please enable camera access in your browser settings and refresh the page');
            } else {
                alert('Camera error: ' + error.message);
            }
        }
    }

    onResults(callback) {
        this.hands.onResults(callback);
    }

    async start() {
        try {
            await this.hands.initialize();
            this.detect();
        } catch (error) {
            console.error('MediaPipe initialization error:', error);
        }
    }

    detect() {
        if (this.videoElement.readyState === 4) {
            this.hands.send({ image: this.videoElement });
        }
        requestAnimationFrame(() => this.detect());
    }
} 
import { HandTracker } from './handTracking';
import { EffectManager } from './effects';

class App {
    constructor() {
        this.handTracker = new HandTracker();
        this.effectManager = new EffectManager();
        
        this.initialize();
    }

    initialize() {
        this.handTracker.onResults((results) => {
            if (results.multiHandLandmarks) {
                this.effectManager.updateEffects(results.multiHandLandmarks);
            }
        });

        this.handTracker.start();
    }
}

// Start the application
new App(); 
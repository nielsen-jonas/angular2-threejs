import { Injectable } from '@angular/core';

@Injectable()
export class InputService {

    private key = {
        up: new keyState,
        down: new keyState,
        left: new keyState,
        right: new keyState 
    }; 

    constructor() {
        window.addEventListener('keydown', (event) => {
            let key = event.key.toLowerCase();
            switch (key) {
                case 'w':
                case 'arrowup':
                    this.key.up.press();
                    break; 
                case 's':
                case 'arrowdown':
                    this.key.down.press();
                    break;
                case 'a':
                case 'arrowleft':
                    this.key.left.press();
                    break;
                case 'd':
                case 'arrowright':
                    this.key.right.press();
                    break;
            }
        });

        window.addEventListener('keyup', (event) => {
            let key = event.key.toLowerCase();
            switch (key) {
                case 'w':
                case 'arrowup':
                    this.key.up.release();
                    break;
                case 's':
                case 'arrowdown':
                    this.key.down.release();
                    break;
                case 'a':
                case 'arrowleft':
                    this.key.left.release();
                    break;
                case 'd':
                case 'arrowright':
                    this.key.right.release();
                    break;
            }
        });
    }

    public update() {
        this.key.up.update();
        this.key.down.update();
        this.key.left.update();
        this.key.right.update();
    }

    public getKey(key) {
        return this.key[key];
    };

}

export class keyState {
    private keyPress: boolean = false;
    private keyDown: boolean = false;
    private keyRelease: boolean = false;

    public press() {
        if (!this.keyDown) {
            this.keyPress = true;
            this.keyDown = true;
        }
    }

    public release() {
        this.keyPress = false;
        this.keyDown = false;
        this.keyRelease = true;
    }

    public update() {
        this.keyPress = false;
        this.keyRelease = false;
    }

    public isPressed() {
        return this.keyPress;
    }

    public isDown() {
        return this.keyDown;
    }

    public isReleased() {
        return this.keyRelease;
    }
}

import { Injectable } from '@angular/core';

@Injectable()
export class InputService {

    private key = {
        up: new KeyState,
        down: new KeyState,
        left: new KeyState,
        right: new KeyState,
        shift: new KeyState,
        space: new KeyState,
        q: new KeyState
    }; 

    constructor() { // TODO: Decouple from DOM
        window.addEventListener('keydown', (event) => {
            event.preventDefault();
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
                case 'shift':
                    this.key.shift.press();
                    break;
                case ' ':
                    this.key.space.press();
                    break;
                case 'q':
                    this.key.q.press();
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
                case 'shift':
                    this.key.shift.release();
                    break;
                case ' ':
                    this.key.space.release();
                    break;
                case 'q':
                    this.key.q.release();
                    break;
            }
        });
    }

    public flush() {
        this.key.up.flush();
        this.key.down.flush();
        this.key.left.flush();
        this.key.right.flush();
        this.key.shift.flush();
        this.key.space.flush();
        this.key.q.flush();
    }

    public getKey(key) {
        return this.key[key];
    };

}

export class KeyState {
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

    public flush() {
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

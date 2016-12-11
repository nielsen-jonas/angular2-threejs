import { Injectable } from '@angular/core';
import { WindowService } from './window.service';
import { KeyState } from './input.service';

@Injectable()
export class MouseService {

    private element;
    private windowWidth = 0;
    private windowHeight = 0;

    private _mousePosition = require('mouse-position');
    private mousePosition: any;

    private movementX: number = 0;
    private movementY: number = 0;

    private locked: boolean = false;

    private button = {
        left: new KeyState,
        right: new KeyState,
        middle: new WheelState
    };

  constructor(private window: WindowService) { }
  
  public initialize(element) {
      this.updateWindowSize();
      this.element = element;
      this.mousePosition = this._mousePosition(element);

      this.element.addEventListener('mousemove', (event) => {
          this.movementX += event.movementX;
          this.movementY += event.movementY;
      });

      this.element.addEventListener('mousedown', (event) => {
          let button = event.button;
          switch (button) {
              case 0:
                  this.button.left.press();
                  break;
              case 1:
                  this.button.middle.press();
                  break;
              case 2:
                  this.button.right.press();
                  break;

          }
      });

      this.element.addEventListener('mouseup', (event) => {
          let button = event.button;
          switch (button) {
              case 0:
                  this.button.left.release();
                  break;
              case 1:
                  this.button.middle.release();
                  break;
              case 2:
                  this.button.right.release();
                  break;
          }
      });

      this.element.addEventListener('wheel', (event) => {
          let amount = -event.deltaY;
          this.button.middle.addScroll(amount);
      });

      document.addEventListener('pointerlockchange', (event) => { // TODO: Decouple from DOM
          this.locked = (document.pointerLockElement === this.element) ? true : false;
      });
  }

  public getButton(button) {
      return this.button[button];
  }
  
  public getMovementX() {
      return this.movementX;
  }

  public getMovementY() {
      return this.movementY;
  }

  public getPositionX() {
      return this.mousePosition[0];
  }

  public getPositionY() {
      return this.mousePosition[1];
  }

  public getRatioX() {
      return this.mousePosition[0]/this.windowWidth; 
  }

  public getRatioY() {
      return this.mousePosition[1]/this.windowHeight;
  }

  public requestPointerLock() {
      this.element.requestPointerLock();
  }

  public pointerIsLocked() {
      return this.locked;
  }

  public exitPointerLock() { // TODO: Decouple from DOM
      document.exitPointerLock();
  }

  public flush() {
      this.movementX = 0;
      this.movementY = 0;
      this.mousePosition.flush();
      this.button.left.flush();
      this.button.right.flush();
      this.button.middle.flush();
  }

  public updateWindowSize() {
      this.windowWidth = this.window.getWidth();
      this.windowHeight = this.window.getHeight();
  }

}

export class WheelState extends KeyState {
    private scroll: number = 0;

    public flush() {
        super.flush();
        this.scroll = 0;
    }

    public addScroll(amount: number) {
        this.scroll += amount;
    }

    public getScroll() {
        return this.scroll;
    }

    public getScrollUp() {
        return (this.scroll > 0) ? this.scroll : 0;
    }

    public getScrollDown() {
        return (this.scroll < 0) ? -this.scroll : 0;
    }
}

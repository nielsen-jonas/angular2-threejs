import { Component, OnInit, ElementRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { WindowService } from '../window.service';
import { CannonService } from '../cannon.service';
import { ThreeService, Camera } from '../three.service';
import { SceneService } from '../scene.service';
import { GameService } from '../game.service';
import { InputService } from '../input.service';
import { MouseService } from '../mouse.service';

@Component({
  selector: 'tjsg-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  providers: [WindowService, CannonService, Camera, ThreeService, SceneService, GameService, InputService, MouseService]
})
export class GameComponent implements OnInit {

  private elRef: ElementRef;
  private element: any;
  //private tickInterval: any;

  private fps: number = 60;
  private step: number = 1/this.fps;
  private cannonStep: number = 1/(this.fps*2)

  private ticks: number = 0;
  private tickDelta: number;
  private tickLast: number;

  private avgFps: AvgFps = new AvgFps;
  private resized: boolean = false;


  constructor(
      el: ElementRef,
      private zone: NgZone,
      private changeDetector: ChangeDetectorRef,
      private window: WindowService,
      private cannon: CannonService,
      private camera: Camera,
      private three: ThreeService,
      private scene: SceneService,
      private game: GameService,
      private input: InputService,
      private mouse: MouseService) {

      this.elRef = el;
  }

  ngOnInit() {
      this.element = this.elRef.nativeElement.querySelector('#game-container');
      this.window.initialize(this.element);
      this.cannon.initialize();
      this.camera.initialize(this.three.getThree(), this.window.getAspect());
      this.camera.setStep(this.step);
      this.three.initialize();
      this.game.initialize();
      this.mouse.initialize(this.element);
      this.element.appendChild(this.three.getDomElement());
      //this.tickInterval = setInterval(() => { this.tick(); }, (this.step)*1000);
      this.requestTick();
  }

  private requestTick() {
      this.zone.runOutsideAngular(() => {
         requestAnimationFrame((timestamp) => {
             this.tick(timestamp);
             this.changeDetector.detectChanges();
         }); 
      });
  };

  private tick(timestamp) {
      this.requestTick();
      if (typeof this.tickLast != 'undefined') {
          this.tickDelta = timestamp - this.tickLast;
          this.fps = 1000/this.tickDelta;
          this.step = 1/this.fps;
          //this.cannonStep = 1/(this.fps*2);
          
          this.camera.setStep(this.step);
          
          this.cannon.step(this.step, this.tickDelta/1000);
          //this.cannon.step(this.cannonStep, this.tickDelta/1000);
          this.scene.update();
          this.three.render();
          this.game.main(this.step);
          this.input.flush();
          this.mouse.flush();
          this.avgFps.update(this.fps, this.step);
          this.ticks ++;
      }
      this.tickLast = timestamp;
  }

  public getTicks() {
      return this.ticks;
  };
 
  public getFps() {
      return this.fps;
  }

  public getFpsFiltered() {
      return Math.round(this.avgFps.getFps());
  }

  public onResize() {
      this.window.resize(this.element.offsetWidth);
      this.camera.updateWindowSize();
      this.three.updateWindowSize();
      this.mouse.updateWindowSize();
      this.resized = true;
  }

  public onClick() {
      if (!this.mouse.pointerIsLocked()) {
          this.mouse.requestPointerLock();
          if (this.resized) {
              this.camera.reloadSkybox();
              this.resized = false;
          }
      }
  }

  public testing() {
      console.log('testing');
  }

}

export class AvgFps {
    private fps: number = 0;
    private buffer: number[] = [];
    private refreshTime: number = 2;
    private count: number = this.refreshTime;

    public getFps() {
        return this.fps;
    }
    
    public update(fps, step) {
        if (this.count <= 0) {
            let sum = 0;
            for(let i = 0; i < this.buffer.length; i++) {
                sum += this.buffer[i];
            }
            this.fps = sum/this.buffer.length;
            this.buffer = [];
            this.count = this.refreshTime;
        } else {
            this.buffer.push(fps);
            this.count -= step;
        }
    }
}

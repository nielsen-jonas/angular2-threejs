import { Component, OnInit, ElementRef } from '@angular/core';
import { WindowService } from '../window.service';
import { CannonService } from '../cannon.service';
import { ThreeService } from '../three.service';
import { SceneService } from '../scene.service';
import { GameService } from '../game.service';
import { InputService } from '../input.service';

@Component({
  selector: 'tjsg-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  providers: [WindowService, CannonService, ThreeService, SceneService, GameService, InputService]
})
export class GameComponent implements OnInit {

  private hostElement: ElementRef;
  private tickInterval: any;

  private fps: number = 60;
  private step: number = 1/this.fps;

  constructor(
      el: ElementRef,
      private window: WindowService,
      private cannon: CannonService,
      private three: ThreeService,
      private scene: SceneService,
      private game: GameService,
      private input: InputService) {

      this.hostElement = el;
  }

  ngOnInit() {
      this.window.resize(this.hostElement.nativeElement.querySelector('#game-container').offsetWidth);
      this.cannon.initialize();
      this.three.initialize();
      this.game.initialize();
      this.hostElement.nativeElement.querySelector('#game-container').appendChild(this.three.getDomElement());
      this.tickInterval = setInterval(() => { this.tick(); }, (this.step)*1000);
  }

  private tick() {
      this.cannon.step(this.step);
      this.scene.update();
      this.three.render();
      this.game.main();
      this.input.update();
  }
 
  public setFPS(fps: number) {
      if (fps => 1 && fps <= 120) {
          this.fps = fps;
          this.step = 1/this.fps;
          clearTimeout(this.tickInterval);
          this.tickInterval = setInterval(() => { this.tick(); }, (this.step)*1000);
      }
  }

  public onResize() {
      this.window.resize(this.hostElement.nativeElement.querySelector('#game-container').offsetWidth);
      this.three.updateWindowSize();
  }

  public testing() {
      console.log('testing');
  }

}

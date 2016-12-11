import { Component, OnInit, ElementRef } from '@angular/core';
import { WindowService } from '../window.service';
import { CannonService } from '../cannon.service';
import { ThreeService } from '../three.service';
import { SceneService } from '../scene.service';
import { GameService } from '../game.service';
import { InputService } from '../input.service';
import { MouseService } from '../mouse.service';

@Component({
  selector: 'tjsg-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  providers: [WindowService, CannonService, ThreeService, SceneService, GameService, InputService, MouseService]
})
export class GameComponent implements OnInit {

  private elRef: ElementRef;
  private element: any;
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
      private input: InputService,
      private mouse: MouseService) {

      this.elRef = el;
  }

  ngOnInit() {
      this.element = this.elRef.nativeElement.querySelector('#game-container');
      this.window.initialize(this.element);
      this.cannon.initialize();
      this.three.initialize();
      this.game.initialize();
      this.mouse.initialize(this.element);
      this.element.appendChild(this.three.getDomElement());
      this.tickInterval = setInterval(() => { this.tick(); }, (this.step)*1000);
  }

  private tick() {
      this.cannon.step(this.step);
      this.scene.update();
      this.three.render();
      this.game.main();
      this.input.flush();
      this.mouse.flush();
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
      this.window.resize(this.element.offsetWidth);
      this.three.updateWindowSize();
      this.mouse.updateWindowSize();
  }

  public testing() {
      console.log('testing');
  }

}

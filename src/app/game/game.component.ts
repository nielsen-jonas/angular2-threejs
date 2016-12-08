import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { WindowService } from '../window.service';
import { CannonService } from '../cannon.service';
import { ThreeService } from '../three.service';

@Component({
  selector: 'tjsg-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  providers: [WindowService, CannonService, ThreeService]
})
export class GameComponent implements OnInit {

  private hostElement: ElementRef;
  private tickInterval: any;

  private fps: number = 60;
  private step: number = 1/this.fps;

  //@HostListener('click', ['$event.target']) onClick(btn) {
  //  console.log('button', btn, 'clicky');
  //}

  //@HostListener('window:keydown', ['$event']) onkeydown(key) {
  //  console.log(key.key);
  //}

  constructor(el: ElementRef, private window: WindowService, private cannon: CannonService, private three: ThreeService) { 
    this.hostElement = el;
  }

  ngOnInit() {
      this.cannon.initialize();
      this.cannon.makeLife();
      this.window.resize(this.hostElement.nativeElement.querySelector('#game-container').offsetWidth);
      this.three.initialize();
      this.hostElement.nativeElement.querySelector('#game-container').appendChild(this.three.getDomElement());
      this.three.makeLife();
      this.tickInterval = setInterval(() => { this.tick(); }, (this.step)*1000);
  }

  private tick() {
      this.cannon.step(this.step);
      this.three.updatePos(this.cannon.getSphere(), this.cannon.getSphere2());
      this.three.render();
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
}

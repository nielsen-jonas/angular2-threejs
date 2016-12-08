import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { WindowService } from '../window.service';
import { ThreeService } from '../three.service';

@Component({
  selector: 'tjsg-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  providers: [WindowService, ThreeService]
})
export class GameComponent implements OnInit {

  private CANNON: any = require("cannon");

  /* TESTING CANNON */
  // Setup our world
  private world: any = new this.CANNON.World();
  // Create a sphere
  private radius: number = 1; // m
  private sphereBody: any = new this.CANNON.Body({
      mass: 5, // kg
      position: new this.CANNON.Vec3(-4, 0, 10), // m
      shape: new this.CANNON.Sphere(this.radius)
  });
  private sphere2Body: any = new this.CANNON.Body({
      mass: 5, // kg
      position: new this.CANNON.Vec3(-32, 0, 10), // m
      shape: new this.CANNON.Sphere(this.radius)
  });
  // Create a plane
  private groundBody: any = new this.CANNON.Body({
      mass: 0 // mass == 0 makes the body static
  });
  private groundShape: any = new this.CANNON.Plane();
  /* /TESTING CANNON */

  
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

  constructor(el: ElementRef, private window: WindowService, private three: ThreeService) { 
    this.hostElement = el;
  }

  ngOnInit() {
      /* TESTING CANNON */
      this.world.addBody(this.sphereBody);
      this.world.addBody(this.sphere2Body);
      this.groundBody.addShape(this.groundShape);
      this.world.addBody(this.groundBody);
      this.sphere2Body.applyForce(new this.CANNON.Vec3(800,0,0),this.sphereBody.position);
      //this.world.gravity.set(0,0,-9.82); // m/s^2
      this.world.gravity.set(0,0,0); // m/s^2

      /* /TESTING CANNON */
      this.window.resize(this.hostElement.nativeElement.querySelector('#game-container').offsetWidth);
      this.three.initialize();
      this.hostElement.nativeElement.querySelector('#game-container').appendChild(this.three.getDomElement());
      //this.hostElement.nativeElement.querySelector('#game-container').appendChild(this.renderer.domElement);
      this.three.makeLife();
      this.tickInterval = setInterval(() => { this.tick(); }, (this.step)*1000);
  }

  private tick() {
    /* TEST CANNON */
    this.world.step(this.step);
    this.three.updatePos(this.sphereBody, this.sphere2Body);
    /* /TEST CANNON */
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

  public updateWindowSize() {
      this.window.resize(this.hostElement.nativeElement.querySelector('#game-container').offsetWidth);
      this.three.updateWindowSize();
  }
}

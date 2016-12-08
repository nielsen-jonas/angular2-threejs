import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { WindowService } from '../window.service';

@Component({
  selector: 'tjsg-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  providers: [WindowService]
})
export class GameComponent implements OnInit {

  private THREE: any = require("three");
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
  private intervalId: any;

  private scene: any;
  private camera: any;
  private renderer: any;

  private fps: number = 60;
  private step: number = 1/this.fps;

  private sphere: any;
  private sphere2: any;
  
  //@HostListener('click', ['$event.target']) onClick(btn) {
  //  console.log('button', btn, 'clicky');
  //}

  //@HostListener('window:keydown', ['$event']) onkeydown(key) {
  //  console.log(key.key);
  //}

  constructor(el: ElementRef, private window: WindowService) { 
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
      this.scene = new this.THREE.Scene();
      this.camera = new this.THREE.PerspectiveCamera( 45, this.window.getAspect(), 0.1, 1000);
      this.renderer = new this.THREE.WebGLRenderer({ alpha: true });
      this.renderer.setSize(this.window.getWidth(), this.window.getHeight());
      this.renderer.setClearColor('#DDF', 1);
      this.hostElement.nativeElement.querySelector('#game-container').appendChild(this.renderer.domElement);
      this.renderer.clear();
      let geometry = new this.THREE.SphereGeometry( 1, 8, 8 );
      let material = new this.THREE.MeshBasicMaterial({ color: 0x00ff00 });
      this.sphere = new this.THREE.Mesh( geometry, material );
      this.sphere2 = new this.THREE.Mesh( geometry, material );
      this.scene.add( this.sphere );
      this.scene.add( this.sphere2 );

      this.camera.position.z = 32;
      this.intervalId = setInterval(() => { this.render(); }, (this.step)*1000);
  }

  private render() {
    /* TEST CANNON */
    this.world.step(this.step);
    this.sphere.position.copy(this.sphereBody.position);
    this.sphere2.position.copy(this.sphere2Body.position);
    /* /TEST CANNON */
    this.renderer.render(this.scene, this.camera);
  }
 
  public setFPS(fps: number) {
      if (fps => 1 && fps <= 120) {
          this.fps = fps;
          this.step = 1/this.fps;
          clearTimeout(this.intervalId);
          this.intervalId = setInterval(() => { this.render(); }, (this.step)*1000);
      }
  }

  public setBgColor(color: string) {
    this.renderer.setClearColor(color, 1);
  }

  public updateWindowSize() {
      this.window.resize(this.hostElement.nativeElement.querySelector('#game-container').offsetWidth);
      this.camera.aspect = this.window.getAspect();
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.window.getWidth(), this.window.getHeight());
  }
}

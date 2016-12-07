import { Component, OnInit, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'tjsg-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  private THREE: any = require("three-js")();
  private hostElement: ElementRef;
  private intervalId: any;

  private scene: any;
  private camera: any;
  private renderer: any;

  private windowWidth: number = 1280;
  private windowHeight: number = 720;
  private aspectRatio: number = 16/9;
  private fps: number = 60;
  private step: number = 1/this.fps;

  private cube: any;
  
  @HostListener('click', ['$event.target']) onClick(btn) {
    console.log('button', btn, 'clicky');
  }

  @HostListener('window:keydown', ['$event']) onkeydown(key) {
    console.log(key.key);
  }

  constructor(el:ElementRef) { 
    this.hostElement = el;
  }

  ngOnInit() {
      this.updateWindowSizeVars();
      this.scene = new this.THREE.Scene();
      this.camera = new this.THREE.PerspectiveCamera( 75, this.windowWidth/this.windowHeight, 0.1, 1000);
      this.renderer = new this.THREE.WebGLRenderer({ alpha: true });
      this.renderer.setSize(this.windowWidth, this.windowHeight);
      this.renderer.setClearColor('#DDF', 1);
      this.hostElement.nativeElement.querySelector('#game-container').appendChild(this.renderer.domElement);
      this.renderer.clear();
      let geometry = new this.THREE.BoxGeometry( 1, 1, 1 );
      let material = new this.THREE.MeshBasicMaterial({ color: 0x00ff00 });
      this.cube = new this.THREE.Mesh( geometry, material );
      this.scene.add( this.cube );

      this.camera.position.z = 5;
      this.intervalId = setInterval(() => { this.render(); }, (1/this.fps)*1000);
  }

  private render() {
    this.cube.rotation.x += 1*this.step;
    this.cube.rotation.y += 1*this.step;

    this.renderer.render(this.scene, this.camera);
  }
 
  private updateWindowSizeVars() {
      this.windowWidth = this.hostElement.nativeElement.querySelector('#game-container').offsetWidth;
      this.windowHeight = this.windowWidth/(this.aspectRatio);
  }

  public setFPS(fps: number) {
      if (fps => 1 && fps <= 120) {
          this.fps = fps;
          this.step = 1/this.fps;
          clearTimeout(this.intervalId);
          this.intervalId = setInterval(() => { this.render(); }, (1/this.fps)*1000);
      }
  }

  public setBgColor(color: string) {
    this.renderer.setClearColor(color, 1);
  }

  public updateWindowSize() {
      this.updateWindowSizeVars();
      this.camera.aspect = this.windowWidth / this.windowHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.windowWidth, this.windowHeight);
  }

}

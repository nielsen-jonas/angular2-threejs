import { Injectable } from '@angular/core';
import { CannonService } from './cannon.service';
import { ThreeService, Camera } from './three.service';
import { SceneService } from './scene.service';
import { InputService } from './input.service';
import { MouseService } from './mouse.service';

@Injectable()
export class GameService {

    private camPos;
    private camDir;
    private bodies;

  constructor(
      private cannon: CannonService,
      private three: ThreeService,
      private camera: Camera,
      private scene: SceneService,
      private input: InputService,
      private mouse: MouseService) { }

  public initialize() {
      this.cannon.setGravity(0,-9.8,0);
      this.camera.setCameraPosition(0,0,32);

      // this.scene.createSphere([-8,10,0], 2, 1, 'concrete-plaster');
      this.scene.createSphere({
          position: [0,10,0],
          radius: 2,
          mass: 1,
          material: 'concrete'});
      // this.scene.createSphere([8,10,0], 2, 1, 'concrete-plaster');
      this.scene.createSphere({
          position: [0,20,0],
          radius: 4});
      // this.scene.createSphere([0,30,0]);
      // this.scene.createSphere([0,50,0]);
      // this.scene.createSphere([1,80,0]);
      // 
      // this.scene.createSphere([-10,100,0]);
      // this.scene.createSphere([5,200,0]);

      // this.scene.createSphere([-5,250,5]);
      // this.scene.createSphere([5,300,5]);
      // this.scene.createSphere([-2,400,2]);
      // this.scene.createSphere([1,410,3]);

      this.scene.createSphere({
          position: [0,-128,0],
          radius: 128,
          mass: 0,
          material: 'concrete'});
  }

  public main() {

      // Halt simulation until mousepointer is locked 
      if (!this.mouse.pointerIsLocked()) {
          this.cannon.halt();
          this.three.halt();
          return 0;
      }
      this.cannon.run();
      this.three.run();
      ///////////////////////////////////////////////

      // Camera controls
      this.camera.cameraYaw(this.mouse.getMovementX());
      this.camera.cameraPitch(this.mouse.getMovementY());
      if (this.input.getKey('up').isDown()) {
          this.camera.cameraMoveForward(2);
      }
      if (this.input.getKey('down').isDown()) {
          this.camera.cameraMoveForward(-2);
      }
      if (this.input.getKey('left').isDown()) {
          this.camera.cameraMoveSideways(-2);
      }
      if (this.input.getKey('right').isDown()) {
          this.camera.cameraMoveSideways(2);
      }

      this.camPos = this.camera.getCameraPosition();
      this.camDir = this.camera.getCameraDirection();
      this.bodies = this.cannon.getBodies();
      ////////////////////////////////////////////////

      // delete fallen objects
      for (let i = 0, len = this.bodies.length; i < len; i++) {
          if (typeof this.bodies[i] !== 'undefined') {
              if (this.bodies[i].position.y < -1000) {
                  this.scene.removeObjectByBodyId(i);
              }
          }
      }

      
      if (this.mouse.getButton('left').isPressed()) {
          this.scene.createSphere({
              position: [this.camPos.x, this.camPos.y, this.camPos.z],
              velocity: [40*this.camDir.x, 40*this.camDir.y, 40*this.camDir.z] 
          });
      }

      if(this.mouse.getButton('right').isPressed()) {
          this.scene.createSphere({
              position: [this.camPos.x, this.camPos.y, this.camPos.z],
              velocity: [120*this.camDir.x, 120*this.camDir.y, 120*this.camDir.z]
          });
      }

  }

}

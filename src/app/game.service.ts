import { Injectable } from '@angular/core';
import { CannonService } from './cannon.service';
import { ThreeService } from './three.service';
import { SceneService } from './scene.service';
import { InputService } from './input.service';
import { MouseService } from './mouse.service';

@Injectable()
export class GameService {

  constructor(
      private cannon: CannonService,
      private three: ThreeService,
      private scene: SceneService,
      private input: InputService,
      private mouse: MouseService) { }

  public initialize() {
      this.cannon.setGravity(0,-9.8,0);
      this.three.setCameraPosition(0,0,32);

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
          return 0;
      }
      this.cannon.run();
      ///////////////////////////////////////////////

      // Camera controls
      this.three.cameraYaw(this.mouse.getMovementX());
      this.three.cameraPitch(this.mouse.getMovementY());
      if (this.input.getKey('up').isDown()) {
          this.three.cameraMoveForward(2);
      }
      if (this.input.getKey('down').isDown()) {
          this.three.cameraMoveForward(-2);
      }
      if (this.input.getKey('left').isDown()) {
          this.three.cameraMoveSideways(-2);
      }
      if (this.input.getKey('right').isDown()) {
          this.three.cameraMoveSideways(2);
      }

      let cam = this.three.getCamera();
      let p = cam.getWorldPosition();
      let v = cam.getWorldDirection();
      this.x = p.x;
      this.y = p.y;
      this.z = p.z;
      
      if (this.mouse.getButton('left').isPressed()) {
          this.scene.createSphere({
              position: [p.x, p.y, p.z],
              velocity: [40*v.x, 40*v.y, 40*v.z] 
          });
      }

  }

  private x = 0;
  private y = 0;
  private z = 0;
  public getX(){return this.x;}
  public getY(){return this.y;}
  public getZ(){return this.z;}

}

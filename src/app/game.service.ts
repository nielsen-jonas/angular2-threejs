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

    private charge = 10;
    private item = 0;

  constructor(
      private cannon: CannonService,
      private three: ThreeService,
      private camera: Camera,
      private scene: SceneService,
      private input: InputService,
      private mouse: MouseService) { }

  public initialize() {
      this.cannon.setGravity(0,-9.8,0);
      this.camera.setCameraPosition(0,5,16);

      this.initLvl1();
  }

  public main(step) {

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

      if (this.mouse.getButton('left').isDown()) {
          this.charge += step*10;
          if (this.charge > 20) {
              this.charge = 20;
          }
      }

      
      if (this.mouse.getButton('left').isReleased()) {
          if (this.item == 0) {
              this.scene.createSphere({
                  position: [this.camPos.x, this.camPos.y, this.camPos.z],
                  rotation: [this.camDir.x, this.camDir.y, this.camDir.z],
                  velocity: [this.charge*this.camDir.x, this.charge*this.camDir.y, this.charge*this.camDir.z],
                  radius: 0.12,
                  material: 'soccer-ball'
              });
          } else if (this.item == 1) {
              this.scene.createBox({
                  position: [this.camPos.x, this.camPos.y, this.camPos.z],
                  rotation: [this.camDir.x, this.camDir.y, this.camDir.z],
                  velocity: [this.charge*this.camDir.x, this.charge*this.camDir.y, this.charge*this.camDir.z],
                  dimensions: [.092, .057, .194],
                  material: 'concrete'
              });
          }
          this.charge = 10;
      }
  }

  public getCharge() {
      return this.charge-10;
  }

  private initLvl1() {
      this.scene.createBox({
          position: [29.5, 8, 0],
          dimensions: [.2, 1, 1],
          static: true,
          material: 'concrete'
      });

      this.scene.createSphere({
          position: [24.5,5,0],
          radius: 1,
          material: 'concrete'
      });
      
      this.scene.createBox({
          position: [24.5, 2.2, 0],
          dimensions: [.04,.2,.2],
          static: true,
          material: 'concrete'
      });
      this.scene.createBox({
          position: [19.7,1,0],
          dimensions: [5,.1,.2],
          rotation: [0,0,.1],
          static: true,
          material: 'concrete'
      });

      this.scene.createBox({
          position: [9.9,-1,0],
          rotation: [0,0,.1],
          dimensions: [5,.1,.2],
          static: true,
          material: 'concrete'
      });

      this.scene.createBox({
          position: [2,-2,0],
          dimensions: [3,.1,.2],
          static: true,
          material: 'concrete'
      });

      for (let x = -15; x < 0; x += 6.5){
          this.scene.createBox({
              position: [x,-2,0],
              dimensions: [1,.1,5],
              static: true,
              material: 'concrete' 
          });

          for (let z = -2; z < 3; z += 1) {
              this.scene.createBox({
                  position: [x,1,z],
                  dimensions: [.3,3,.3],
                  material: 'concrete' 
              });
          }
      }

      for (let x = -36; x < -16; x += 10){
          this.scene.createBox({
              position: [x,-2,0],
              dimensions: [5,.1,5],
              static: true,
              material: 'concrete' 
          });
      }
  }

}

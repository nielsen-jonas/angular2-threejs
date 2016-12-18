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

    private charge = 5;
    private item = 0;

    private playerHeadId;
    private playerMidId;
    private playerFeetId;
    private playerHeadBody;
    private playerMidBody;
    private playerFeetBody;

    private CANNON;

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
      this.CANNON = this.cannon.getCannon();

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
          this.charge = 5;
      }

      if (this.input.getKey('shift').isDown()) {
          this.camera.zoomIn();
      }
      if (this.input.getKey('shift').isReleased()) {
          this.camera.zoomOff();
      }
      
      let feetVelocity = this.playerFeetBody.getVelocityAtWorldPoint(new this.CANNON.Vec3(0,0,0), new this.CANNON.Vec3(0,0,0)).y;

      if (Math.round(feetVelocity) == 0) {
          this.playerFeetBody.applyLocalForce(new this.CANNON.Vec3(0, -250, 0), new this.CANNON.Vec3(0, 100, 0));
          this.playerMidBody.applyLocalForce(new this.CANNON.Vec3(0, 150, 0), new this.CANNON.Vec3(0, -100, 0));
          this.playerHeadBody.applyLocalForce(new this.CANNON.Vec3(0, 100, 0), new this.CANNON.Vec3(0, -100, 0));
      }
  }

  public getCharge() {
      return this.charge-5;
  }

  private initLvl1() {
      this.playerFeetId = this.scene.createSphere({
          position: [-30,5.5,0],
          fixedRotation: true,
          linearDamping: 10,
          angularDamping: 10,
          radius: 0.3,
          material: 'player'
      })[0];

      this.playerMidId = this.scene.createSphere({
          position: [-30,4.75,0],
          fixedRotation: true,
          linearDamping: 10,
          angularDamping: 10,
          radius: 0.25,
          material: 'player'
      })[0];

      this.playerHeadId = this.scene.createSphere({
          position: [-30,4,0],
          fixedRotation: true,
          linearDamping: 10,
          angularDamping: 10,
          radius: 0.2,
          material: 'player'
      })[0];

      this.playerFeetBody = this.cannon.getBodyById(this.playerFeetId);
      this.playerMidBody = this.cannon.getBodyById(this.playerMidId);
      this.playerHeadBody = this.cannon.getBodyById(this.playerHeadId);

      this.cannon.distanceConstraintById(this.playerFeetId, this.playerMidId, .75, 10);
      this.cannon.distanceConstraintById(this.playerMidId, this.playerHeadId, .75, 10);
      this.cannon.distanceConstraintById(this.playerFeetId, this.playerHeadId, 1.5, 10);

      this.scene.createBox({
          position: [16, 5, .5],
          dimensions: [.2, 1, 1],
          static: true,
          material: 'spring'
      });
      
      this.scene.createBox({
          position: [9,-2, 3],
          dimensions: [1,.1,1],
          static: true,
          material: 'spring'
      });


      this.scene.createSphere({
          position: [11,6,0],
          radius: 1,
          material: 'concrete'
      });
      
      this.scene.createBox({
          position: [11, 3.2, 0],
          dimensions: [.04,.2,.04],
          static: true,
          material: 'concrete'
      });
      this.scene.createBox({
          position: [6.2,2,0],
          dimensions: [5,.1,.2],
          rotation: [0,0,.1],
          static: true,
          material: 'concrete'
      });

      // Step
      this.scene.createBox({
          position: [-2,-1.3,6.5],
          dimensions: [1.5,.2,1.5],
          static: true,
          material: 'concrete'
      });

      for (let x = -15; x < 0; x += 6.5){
          // floors
          this.scene.createBox({
              position: [x,-1,0],
              dimensions: [1.5,.3,5],
              static: true,
              material: 'concrete' 
          });

          for (let z = -2; z < 3; z += 1) {
              // pillars
              this.scene.createBox({
                  position: [x,3.5,z],
                  dimensions: [.3,3,.3],
                  material: 'concrete' 
              });
          }
      }

      // floors
      for (let x = -35; x < -15; x += 10){
          this.scene.createBox({
              position: [x,0,0],
              dimensions: [5,.3,5],
              static: true,
              material: 'concrete' 
          });
      }
  }

}

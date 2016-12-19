import { Injectable } from '@angular/core';
import { CannonService } from './cannon.service';
import { ThreeService, Camera } from './three.service';
import { SceneService } from './scene.service';
import { InputService } from './input.service';
import { MouseService } from './mouse.service';

@Injectable()
export class Player {
    private CANNON;

    private initialized: boolean = false;

    private headId: number;
    private midId: number;
    private feetId: number;
    private headBody: any;
    private midBody: any;
    private feetBody: any;

    private headRadius: number = .2;
    private midRadius: number = .25;
    private feetRadius: number = .3;
    private partsDistance: number = .05;
    
    private strength: number;
    private chargeMin: number = 5;
    private chargeMax: number = 20;
    private charge = this.chargeMin;

    constructor(private input: InputService, private mouse: MouseService, private scene: SceneService, private camera: Camera, private cannon: CannonService) {
        this.CANNON = cannon.getCannon();
    }

    public initialize(position: number[] = [0,0,0]) {
        this.feetId = this.scene.createSphere({
            position: [position[0],position[1],position[3]],
            fixedRotation: true,
            linearDamping: .6,
            angularDamping: .6,
            radius: this.feetRadius,
            material: 'player'
        })[0];

        this.midId = this.scene.createSphere({
            position: [
                position[0],
                position[1]+this.feetRadius+this.midRadius+this.partsDistance,
                position[3]],
            fixedRotation: true,
            linearDamping: .6,
            angularDamping: .6,
            radius: this.midRadius,
            material: 'player'
        })[0];

        this.headId = this.scene.createSphere({
            position: [
                position[0],
                position[1]+this.feetRadius+this.midRadius*2+this.headRadius+this.partsDistance*2,
                position[3]],
            fixedRotation: true,
            linearDamping: .6,
            angularDamping: .6,
            radius: this.headRadius,
            material: 'player'
        })[0];

        this.feetBody = this.cannon.getBodyById(this.feetId);
        this.midBody = this.cannon.getBodyById(this.midId);
        this.headBody = this.cannon.getBodyById(this.headId);

        this.cannon.distanceConstraintById(this.feetId, this.midId,
            this.feetRadius+this.midRadius+this.partsDistance,
            10);
        this.cannon.distanceConstraintById(this.midId, this.headId,
            this.midRadius+this.headRadius+this.partsDistance,
            10);
        this.cannon.distanceConstraintById(this.feetId, this.headId,
            this.feetRadius+this.midRadius*2+this.headRadius+this.partsDistance*2,
            10);

        // this.cannon.coneTwistConstraintById(this.feetId, this.midId, {
        //     maxForce: 10,
        //     pivotA: new this.CANNON.Vec3(0, -this.midRadius-this.partsDistance/2, 0),
        //     pivotB: new this.CANNON.Vec3(0, this.feetRadius, 0)});

        // this.cannon.coneTwistConstraintById(this.midId, this.headId, {
        //     maxForce: 10,
        //     pivotA: new this.CANNON.Vec3(0, -this.headRadius-this.partsDistance/2, 0),
        //     pivotB: new this.CANNON.Vec3(0, this.midRadius, 0)});

        this.initialized = true;
    }
    public jump() {
        if (!this.isFalling()) {
            let direction = this.camera.getPitchObjDirection();
            let mult = 15;
            this.feetBody.applyImpulse(new this.CANNON.Vec3(-direction.x*mult, 60, -direction.z*mult), this.getFeetPosition());
            this.midBody.applyImpulse(new this.CANNON.Vec3(-direction.x*mult, 60, -direction.z*mult), this.getMidPosition());
            this.headBody.applyImpulse(new this.CANNON.Vec3(-direction.x*mult, 60, -direction.z*mult), this.getHeadPosition());
        }
    }

    private fire() {
        let direction = this.camera.getCameraDirection();
        this.scene.createSphere({
            position: [this.headBody.position.x, this.headBody.position.y+this.headRadius+.15, this.headBody.position.z],
            rotation: [direction.x, direction.y, direction.z],
            velocity: [this.charge*direction.x, this.charge*direction.y+3, this.charge*direction.z],
            radius: 0.12,
            material: 'soccer-ball'
        });
    }

    public getCharge() {
        return this.charge-5;
    }

    public getHeadPosition() {
        return this.headBody.position;
    }

    public getMidPosition() {
        return this.midBody.position;
    }

    public getFeetPosition() {
        return this.feetBody.position;
    }

    public moveForward() {
        if (this.isInitialized && this.isNotFallingVeryMuch()) {
            let direction = this.camera.getPitchObjDirection();
            this.feetBody.applyForce(new this.CANNON.Vec3(-direction.x*100,0,-direction.z*100), this.getFeetPosition());
            this.headBody.applyForce(new this.CANNON.Vec3(-direction.x*100,0,-direction.z*100), this.getFeetPosition());
        }
    }

    public moveBack() {
        if (this.isInitialized && this.isNotFallingVeryMuch()) {
            let direction = this.camera.getPitchObjDirection();
            this.feetBody.applyForce(new this.CANNON.Vec3(direction.x*50,0,direction.z*50), this.getFeetPosition());
            this.headBody.applyForce(new this.CANNON.Vec3(direction.x*50,0,direction.z*50), this.getFeetPosition());
        }
    }

    public moveLeft() {
        if (this.isInitialized && this.isNotFallingVeryMuch()) {
            let direction = this.camera.getPitchObjDirection();
            let x = direction.x;
            let z = direction.z;
            let d2r = Math.PI/180;
            direction.x = x * Math.cos(-90 * d2r) + z * Math.sin(-90 * d2r);
            direction.z = -x * Math.sin(-90 * d2r) + z * Math.cos(-90 * d2r);
            this.feetBody.applyForce(new this.CANNON.Vec3(direction.x*50,0,direction.z*50), this.getFeetPosition());
            this.headBody.applyForce(new this.CANNON.Vec3(direction.x*50,0,direction.z*50), this.getFeetPosition());
        }
    }

    public moveRight() {
        if (this.isInitialized && this.isNotFallingVeryMuch()) {
            let direction = this.camera.getPitchObjDirection();
            let x = direction.x;
            let z = direction.z;
            let d2r = Math.PI/180;
            direction.x = x * Math.cos(90 * d2r) + z * Math.sin(90 * d2r);
            direction.z = -x * Math.sin(90 * d2r) + z * Math.cos(90 * d2r);
            this.feetBody.applyForce(new this.CANNON.Vec3(direction.x*50,0,direction.z*50), this.getFeetPosition());
            this.headBody.applyForce(new this.CANNON.Vec3(direction.x*50,0,direction.z*50), this.getFeetPosition());
        }
    }

    public isFalling(): boolean {
        let feetVelocity = this.feetBody.getVelocityAtWorldPoint(new this.CANNON.Vec3(0,0,0), new this.CANNON.Vec3(0,0,0)).y;
        return !(Math.round(feetVelocity) === 0);
    }

    public isNotFallingVeryMuch(): boolean {
        let feetVelocity = this.feetBody.getVelocityAtWorldPoint(new this.CANNON.Vec3(0,0,0), new this.CANNON.Vec3(0,0,0)).y;
        return (Math.abs(feetVelocity) < 2);
    }

    public getHeadQuaternion() {
        return this.headBody.quaternion;
    }

    public step(step) {
      if (this.input.getKey('up').isDown()) {
          this.moveForward();
      }
      if (this.input.getKey('down').isDown()) {
          this.moveBack();
      }
      if (this.input.getKey('left').isDown()) {
          this.moveLeft();
      }
      if (this.input.getKey('right').isDown()) {
          this.moveRight();
      }
      if (this.input.getKey('space').isPressed()) {
          this.jump();
      }

      if (this.mouse.getButton('left').isDown()) {
          this.charge += step*10;
          if (this.charge > this.chargeMax) {
              this.charge = this.chargeMax;
          }
      }

      
      if (this.mouse.getButton('left').isReleased()) {
          this.fire();
          this.charge = this.chargeMin;
      }

      let headPosition = this.getHeadPosition();
      //let headQuaternion = this.getHeadQuaternion();
      //this.camera.setCameraPosition(headPosition.x,headPosition.y,headPosition.z);
      let direction = this.camera.getCameraDirection();
      this.camera.setCameraPosition(headPosition.x-2.5*direction.x,headPosition.y+.8,headPosition.z-2.5*direction.z);
      //this.camera.setShellQuaternion(headQuaternion.x, headQuaternion.y, headQuaternion.z, headQuaternion.w);
      if (this.isInitialized && this.isNotFallingVeryMuch()) {
          this.feetBody.applyLocalForce(new this.CANNON.Vec3(0, -250, 0), new this.CANNON.Vec3(0, 100, 0));
          this.midBody.applyLocalForce(new this.CANNON.Vec3(0, 150, 0), new this.CANNON.Vec3(0, -100, 0));
          this.headBody.applyLocalForce(new this.CANNON.Vec3(0, 100, 0), new this.CANNON.Vec3(0, -100, 0));
      }
    }

    public isInitialized(): boolean {
        return this.initialized;
    }
}

@Injectable()
export class GameService {

    private camPos;
    private camDir;
    private bodies;

    private item = 0;

    private CANNON;

  constructor(
      private cannon: CannonService,
      private three: ThreeService,
      private camera: Camera,
      private scene: SceneService,
      private input: InputService,
      private mouse: MouseService,
      private player: Player) { }

  public initialize() {
      this.cannon.setGravity(0,-9.8,0);
      this.CANNON = this.cannon.getCannon();
      this.camera.setCameraPosition(0,0,0);

      this.initLvl1();
      this.player.initialize([-25, 8, 0]);
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

      if (this.input.getKey('shift').isDown()) {
          this.camera.zoomIn();
      }
      if (this.input.getKey('shift').isReleased()) {
          this.camera.zoomOff();
      }
      
      this.player.step(step);
  }

  private initLvl1() {
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

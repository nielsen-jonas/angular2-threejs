import { Injectable } from '@angular/core';
import { CannonService } from './cannon.service';
import { ThreeService, Camera } from './three.service';
import { SceneService } from './scene.service';
import { InputService } from './input.service';
import { MouseService } from './mouse.service';
import { lvl0Init, lvl0Loop } from './levels/lvl_0';

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
    private ballObjects: any[] = [];
    private objectRemovedSubscription;

    private camPos = {
        x: 0,
        y: 0,
        z: 0
    };

    private fpsCameraMode = true;

    private headRadius: number = .2;
    private midRadius: number = .25;
    private feetRadius: number = .3;
    private partsDistance: number = .05;
    
    private strength: number;
    private chargeMin: number = 5;
    private chargeMax: number = 20;
    private _fireChargeFillMultiplier: number = 20;
    private charge: number = this.chargeMin;
    private _jumpChargeMin: number = 200;
    private _jumpChargeMax: number = 300;
    private _jumpChargeFillMultiplier: number = 100;
    private jumpCharge: number = this._jumpChargeMin;
    private _moveSpeed = 90; 
    private moveSpd = 0;
    private moveSpd2 = 0;
    private airTime = 0;
    private controlMultiplier = 1;
    private _linDamp = 0.8;
    private linDamp = 0;

    constructor(private input: InputService, private mouse: MouseService, private scene: SceneService, private camera: Camera, private cannon: CannonService) {
        this.CANNON = cannon.getCannon();
        this.objectRemovedSubscription = this.scene.getObjectRemovedEmitter().subscribe(object => this.removeBall(object));
    }

    public initialize(position = {x: 0, y: 0, z: 0}) {
        let angDamp = 0.8;
        let linDamp = this._linDamp;
        this.feetId = this.scene.createSphere({
            position: [position.x,position.y,position.z],
            radius: this.feetRadius,
            material: 'player',
            angularDamping: angDamp,
            linearDamping: linDamp,
            collisionFilterGroup: 2,
            allowSleep: false
        })[0];

        this.midId = this.scene.createSphere({
            position: [
                position.x,
                position.y+this.feetRadius+this.midRadius+this.partsDistance,
                position.z],
            radius: this.midRadius,
            material: 'player',
            angularDamping: angDamp,
            linearDamping: linDamp,
            fixedRotation: true,
            collisionFilterGroup: 2,
            allowSleep: false
        })[0];

        this.headId = this.scene.createSphere({
            position: [
                position.x,
                position.y+this.feetRadius+this.midRadius*2+this.headRadius+this.partsDistance*2,
                position.z],
            radius: this.headRadius,
            material: 'player-head',
            angularDamping: angDamp,
            linearDamping: linDamp,
            fixedRotation: true,
            collisionFilterGroup: 2,
            allowSleep: false
        })[0];

        this.feetBody = this.cannon.getBodyById(this.feetId);
        this.midBody = this.cannon.getBodyById(this.midId);
        this.headBody = this.cannon.getBodyById(this.headId);

        this.cannon.distanceConstraintById(this.feetId, this.midId,
            this.feetRadius+this.midRadius+this.partsDistance,
            80);
        this.cannon.distanceConstraintById(this.midId, this.headId,
            this.midRadius+this.headRadius+this.partsDistance,
            80);
        this.cannon.distanceConstraintById(this.feetId, this.headId,
        this.feetRadius+this.midRadius*2+this.headRadius+this.partsDistance*2,
            10);

        this.initialized = true;
    }

    public clearBalls() {
        for (let i = 0, len = this.ballObjects.length; i < len; i++) {
            this.scene.removeObjectByBodyId(this.ballObjects[i][0]);
        }
        this.ballObjects = [];
    }

    public getBalls() {
        return this.ballObjects;
    }

    getBallBodies() {
        let bodies = [];
        for (let i = 0, len = this.ballObjects.length; i < len; i++) {
           bodies.push(this.cannon.getBodyById(this.ballObjects[i][0])); 
        }
        return bodies;
    }

    // TODO: Find out why updating removed balls results in 'Uncaught TypeError' on clearBalls()
    public removeBall(object) {
        for (let i = 0, len = this.ballObjects.length; i < len; i++) {
            if (object[0] == this.ballObjects[i][0]) {
                this.ballObjects.splice(i, 1);
                break;
            }
        }
    }

    public destroy() {
        this.clearBalls();
        this.scene.removeObjectByBodyId(this.feetId);
        this.scene.removeObjectByBodyId(this.midId);
        this.scene.removeObjectByBodyId(this.headId);
        this.initialized = false;
    }

    public setPosition(position = {x: 0, y: 0, z: 0}) {
        this.feetBody.position.x = this.midBody.position.x = this.headBody.position.x = position.x;
        this.feetBody.position.z = this.midBody.position.z = this.headBody.position.z = position.z;
        this.feetBody.position.y = position.y;
        this.midBody.position.y = position.y + this.feetRadius+this.midRadius+this.partsDistance;
        this.headBody.position.y = position.y + this.feetRadius+this.midRadius*2+this.headRadius+this.partsDistance*2;
        this.feetBody.velocity = new this.CANNON.Vec3(0,0,0);
        this.midBody.velocity = new this.CANNON.Vec3(0,0,0);
        this.headBody.velocity = new this.CANNON.Vec3(0,0,0);
    }

    public jump() {
        let deltaFeetMid = {
            x: this.midBody.position.x - this.feetBody.position.x,
            y: this.midBody.position.y - this.feetBody.position.y,
            z: this.midBody.position.z - this.feetBody.position.z

        };
        let deltaMidHead = {
            x: this.headBody.position.x - this.midBody.position.x,
            y: this.headBody.position.y - this.midBody.position.y,
            z: this.headBody.position.z - this.midBody.position.z
        };
        let height = this.jumpCharge;
        let bonus = .4*this.controlMultiplier;
        this.feetBody.applyImpulse(new this.CANNON.Vec3(-deltaFeetMid.x*height,-deltaFeetMid.y*height,-deltaFeetMid.z*height), this.getFeetPosition());
        this.midBody.applyImpulse(new this.CANNON.Vec3(deltaFeetMid.x*height*bonus,deltaFeetMid.y*height*bonus,deltaFeetMid.z*height*bonus), this.getMidPosition());
        this.headBody.applyImpulse(new this.CANNON.Vec3(deltaMidHead.x*height,deltaMidHead.y*height,deltaMidHead.z*height), this.getHeadPosition());
        this.jumpCharge = this._jumpChargeMin;
    }

    private fire() {
        let direction = this.camera.getCameraDirection();
        this.ballObjects.push(this.scene.createSphere({
            position: [this.headBody.position.x, this.headBody.position.y+this.headRadius+.15, this.headBody.position.z],
            rotation: [direction.x, direction.y, direction.z],
            velocity: [this.charge*direction.x, this.charge*direction.y+3, this.charge*direction.z],
            radius: 0.08,
            material: 'snow'
        }));
    }

    public getCharge() {
        return this.charge-5;
    }

    public getJumpCharge() {
        return (this.jumpCharge-this._jumpChargeMin)/(this._jumpChargeMax-this._jumpChargeMin)*100;
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
        //if (this.isInitialized && this.isOnGround()) {
        if (this.isInitialized) {
            let direction = this.camera.getPitchObjDirection();
            this.feetBody.applyForce(new this.CANNON.Vec3(-direction.x*this.moveSpd,0,-direction.z*this.moveSpd), this.getFeetPosition());
            this.midBody.applyForce(new this.CANNON.Vec3(-direction.x*this.moveSpd*.5,0,-direction.z*this.moveSpd), this.getFeetPosition());
            this.headBody.applyForce(new this.CANNON.Vec3(-direction.x*this.moveSpd,0,-direction.z*this.moveSpd), this.getFeetPosition());
        }
    }

    public moveBack() {
        // if (this.isInitialized && this.isOnGround()) {
        if (this.isInitialized) {
            let direction = this.camera.getPitchObjDirection();
            this.feetBody.applyForce(new this.CANNON.Vec3(direction.x*this.moveSpd2,0,direction.z*this.moveSpd2), this.getFeetPosition());
            this.midBody.applyForce(new this.CANNON.Vec3(direction.x*this.moveSpd2*.5,0,direction.z*this.moveSpd2), this.getFeetPosition());
            this.headBody.applyForce(new this.CANNON.Vec3(direction.x*this.moveSpd2,0,direction.z*this.moveSpd2), this.getFeetPosition());
        }
    }

    public moveLeft() {
        // if (this.isInitialized && this.isOnGround()) {
        if (this.isInitialized) {
            let direction = this.camera.getPitchObjDirection();
            let x = direction.x;
            let z = direction.z;
            let d2r = Math.PI/180;
            direction.x = x * Math.cos(-90 * d2r) + z * Math.sin(-90 * d2r);
            direction.z = -x * Math.sin(-90 * d2r) + z * Math.cos(-90 * d2r);
            this.feetBody.applyForce(new this.CANNON.Vec3(direction.x*this.moveSpd2,0,direction.z*this.moveSpd2), this.getFeetPosition());
            this.midBody.applyForce(new this.CANNON.Vec3(direction.x*this.moveSpd2*.5,0,direction.z*this.moveSpd2), this.getFeetPosition());
            this.headBody.applyForce(new this.CANNON.Vec3(direction.x*this.moveSpd2,0,direction.z*this.moveSpd2), this.getFeetPosition());
        }
    }

    public moveRight() {
        // if (this.isInitialized && this.isOnGround()) {
        if (this.isInitialized) {
            let direction = this.camera.getPitchObjDirection();
            let x = direction.x;
            let z = direction.z;
            let d2r = Math.PI/180;
            direction.x = x * Math.cos(90 * d2r) + z * Math.sin(90 * d2r);
            direction.z = -x * Math.sin(90 * d2r) + z * Math.cos(90 * d2r);
            this.feetBody.applyForce(new this.CANNON.Vec3(direction.x*this.moveSpd2,0,direction.z*this.moveSpd2), this.getFeetPosition());
            this.midBody.applyForce(new this.CANNON.Vec3(direction.x*this.moveSpd2*.5,0,direction.z*this.moveSpd2), this.getFeetPosition());
            this.headBody.applyForce(new this.CANNON.Vec3(direction.x*this.moveSpd2,0,direction.z*this.moveSpd2), this.getFeetPosition());
        }
    }
    public isOnGround(): boolean {
       let rayTo = Object.assign({}, this.feetBody.position);
       rayTo.y -= this.feetRadius+.1;
       let feetGrounded = this.cannon.raycastAny(this.feetBody.position, rayTo, {collisionFilterMask: 1, collisionFilterGroup: 1});
       
       rayTo = Object.assign({}, this.midBody.position);
       rayTo.y -= this.midRadius +.1;
       let midGrounded = this.cannon.raycastAny(this.midBody.position, rayTo, {collisionFilterMask: 1, collisionFilterGroup: 1});

       return feetGrounded || midGrounded;
    }

    public isFalling() {
        return this.feetBody.velocity.y < -.5
    }

    public getHeadQuaternion() {
        return this.headBody.quaternion;
    }

    public updateBodyQuaternion() {
      let q = this.camera.getCameraQuaternion();
      this.headBody.quaternion.set( q.x, q.y, q.z, q.w );
      

      this.midBody.quaternion.y = q.y;
      this.midBody.quaternion.w = q.w;
    }

    public step(step) {
        if (this.fpsCameraMode) {
            this.updateBodyQuaternion();
        }

      if (this.isOnGround()) {
          this.airTime = 0;
      } else {
          this.airTime += step;
      }
      this.controlMultiplier = (this.airTime <= 0) ? 1 : 1/(this.airTime+1) ;
      this.moveSpd = this._moveSpeed*this.controlMultiplier;
      this.moveSpd2 = (this._moveSpeed*.75)*this.controlMultiplier;
      this.linDamp = this._linDamp * this.controlMultiplier;
      this.feetBody.linearDamping = this.linDamp;
      this.midBody.linearDamping = this.linDamp;
      this.headBody.linearDamping = this.linDamp;

      if (this.moveSpd < 1) { this.moveSpd = 1 }
      if (this.moveSpd2 < 1) { this.moveSpd2 = 1 }

      if (this.mouse.getButton('right').isPressed()) {
          this.fpsCameraMode = !this.fpsCameraMode;
          if (this.fpsCameraMode == false) {
              this.camera.move(-50);
          }
      }
      let headPosition = this.getHeadPosition();
      let direction = this.camera.getCameraDirection();
      this.camPos.x = headPosition.x-2.5*direction.x;
      this.camPos.y = headPosition.y+.8;
      this.camPos.z = headPosition.z-2.5*direction.z;
      if (this.fpsCameraMode){
          this.camera.moveTowards(this.camPos);

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
          if (this.input.getKey('space').isDown()) {
              this.jumpCharge += step*this._jumpChargeFillMultiplier;
              if (this.jumpCharge > this._jumpChargeMax) {
                  this.jumpCharge = this._jumpChargeMax;
              }
          }
          if (this.input.getKey('space').isReleased()) {
              this.jump();
          }

          if (this.mouse.getButton('left').isDown()) {
              this.charge += step*this._fireChargeFillMultiplier;
              if (this.charge > this.chargeMax) {
                  this.charge = this.chargeMax;
              }
          }

          if (this.mouse.getButton('left').isReleased()) {
              this.fire();
              this.charge = this.chargeMin;
          }
      } else {
          if (this.input.getKey('up').isDown()) {
              this.camera.move(2);
          }
          if (this.input.getKey('down').isDown()) {
              this.camera.move(-2);
          }
          if (this.input.getKey('left').isDown()) {
              this.camera.strafe(-2);
          }
          if (this.input.getKey('right').isDown()) {
              this.camera.strafe(2);
          }
      }

      //let headQuaternion = this.getHeadQuaternion();
      //this.camera.setCameraPosition(headPosition.x,headPosition.y,headPosition.z);
      //this.camera.setShellQuaternion(headQuaternion.x, headQuaternion.y, headQuaternion.z, headQuaternion.w);
      if (this.isInitialized) {
          //if (this.isOnGround()) {
          if (this.controlMultiplier > .4) {
              this.feetBody.applyForce(new this.CANNON.Vec3(0, -800*this.controlMultiplier, 0), this.feetBody.position);
              this.midBody.applyForce(new this.CANNON.Vec3(0, 600*this.controlMultiplier, 0), this.midBody.position);
              this.headBody.applyForce(new this.CANNON.Vec3(0, 200*this.controlMultiplier, 0), this.headBody.position);
          } else if (!this.isFalling()) {
              this.feetBody.applyForce(new this.CANNON.Vec3(0, -800, 0), this.feetBody.position);
              this.midBody.applyForce(new this.CANNON.Vec3(0, 600, 0), this.midBody.position);
              this.headBody.applyForce(new this.CANNON.Vec3(0, 200, 0), this.headBody.position);
          }
          // if (this.isOnGround()) {
          //     if (this.feetBody.linearDamping != 0.9) {
          //         this.feetBody.linearDamping = 0.9;
          //         this.midBody.linearDamping = 0.9;
          //         this.headBody.linearDamping = 0.9;
          //     }
          // } else {
          //     if (this.feetBody.linearDamping != 0.01) {
          //         this.feetBody.linearDamping = 0.01;
          //         this.midBody.linearDamping = 0.01;
          //         this.headBody.linearDamping = 0.01;
          //     }
          // }
      }
    }

    public getCamPos() {
        return this.camPos;
    };

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
      private player: Player) {
          this.level.push(new Level(this.scene, lvl0Init, lvl0Loop, this.player));
      }

      private level: Level[] = [];

  public initialize() {
      this.cannon.setGravity(0,-9.8,0);
      this.CANNON = this.cannon.getCannon();
      this.camera.setCameraPosition(0,0,0);

      this.level[0].initialize();
      //this.player.initialize([-2.5, 50, 6.5]);
      let startPos = this.level[0].getStartingPosition();
      this.player.initialize(startPos);
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
              if (this.bodies[i].position.y < -200) {
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
      if (this.input.getKey('q').isPressed() || this.player.getFeetPosition().y < -50) {
          this.level[0].clear();
          this.player.destroy();
          this.scene.clear();
          this.level[0].initialize();
          this.player.initialize(this.level[0].getStartingPosition());
      }
      this.level[0].step(step);
  }

}

export class Level {
    private scene;
    private initialized: boolean = false;
    private completed: boolean = false;
    private init; 
    private loop; 
    private objects: any[] = [];
    private assoc: any[] = [];
    private memory: any[] = [];
    private startingPosition = {
        x: 0,
        y: 0,
        z: 0 
    };
    private player: Player;

    constructor(scene, init, loop, player) {
        this.scene = scene;
        this.init = init;
        this.loop = loop;
        this.player = player;

    }

    public initialize() {
        this.init();
        this.initialized = true;
    } 

    public isInitialized(): boolean {
        return this.initialized;
    }

    public isComplete(): boolean {
        return this.completed;
    }

    public step(step) {
        this.loop(step);
    }

    public clear() {
        for (let i = 0, len = this.objects.length; i < len; i++) {
            this.scene.removeObjectByBodyId(this.objects[i][0]);
        }
        for (let key in this.assoc) {
            this.scene.removeObjectByBodyId(this.assoc[key][0]);
        }

        this.objects = [];
        this.assoc = [];
        this.memory = [];
        this.initialized = false;
    }

    public restart() {
        this.clear();
        this.init();
        this.initialized = true;
    }
    public getStartingPosition() {
        return this.startingPosition;
    }
}

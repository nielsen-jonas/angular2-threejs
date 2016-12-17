import { Injectable } from '@angular/core';

@Injectable()
export class CannonService {

    private CANNON: any = require('cannon');

    private world: any;
    private bodies: any[] = [];

    private running: boolean = false;

    private contactMaterials: any[] = [];

  constructor() { }

  public getCannon() {
      return this.CANNON;
  }

  public initialize() {
    // Setup our world
    this.world = new this.CANNON.World();
    this.world.solver.iterations = 20;
    this.world.solver.tolerance = 0;
    for (let i = 0, len = this.contactMaterials.length; i < len; i++) {
        console.log('Adding contact material', this.contactMaterials[i]);
        this.world.addContactMaterial(this.contactMaterials[i]);
    }
  }

  public addContactMaterial(contactMaterial) {
      this.contactMaterials.push(contactMaterial);
  }

  public setGravity(x: number = 0, y: number = 0, z: number = 0) {
      this.world.gravity.set(x, y, z);
  };

  public addBody(body: any) {
      this.bodies[body.id] = body;
      this.world.addBody(body);
  }

  public getBodies() {
      return this.bodies;
  }

  public getBodyById(id: number) {
      return this.bodies[id];
  }

  public removeBody(id) {
      this.world.removeBody(this.bodies[id]);
      delete this.bodies[id];
  }

  public step(fixedTimeStep: number, timeSinceLastCalled: number) {
      if (this.running) {
          this.world.step(fixedTimeStep, timeSinceLastCalled);
      }
  };

  public halt() {
      this.running = false;
  }

  public run() {
      this.running = true;
  }

  public isRunning() {
      return this.running;
  }

}

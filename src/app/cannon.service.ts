import { Injectable } from '@angular/core';

@Injectable()
export class CannonService {

    private CANNON: any = require('cannon');

    private world: any;
    private bodies: any[] = [];

  constructor() { }

  public getCannon() {
      return this.CANNON;
  }

  public initialize() {
    // Setup our world
    this.world = new this.CANNON.World();
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

  public step(step: number) {
      this.world.step(step);
  };

}

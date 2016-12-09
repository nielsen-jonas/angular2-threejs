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
    this.world.gravity.set(0,0,-9);
  }

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

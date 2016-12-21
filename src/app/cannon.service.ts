import { Injectable } from '@angular/core';

@Injectable()
export class CannonService {

    private CANNON: any = require('cannon');

    private world: any;
    private bodies: any[] = [];
    private contactMaterials: any[] = [];

    private running: boolean = false;

  constructor() { }

  public getCannon() {
      return this.CANNON;
  }

  public initialize() {
    // Setup our world
    this.world = new this.CANNON.World();
    //this.world.broadphase = new this.CANNON.NaiveBroadphase();
    this.world.solver.tolerance = 0;
    this.world.solver.iterations = 20;
    //this.world.defaultContactMaterial.contactEquationStiffness = 1e8;
    //this.world.defaultContactMaterial.contactEquationRegularizationTime = 1;
    for (let i = 0, len = this.contactMaterials.length; i < len; i++) {
        this.world.addContactMaterial(this.contactMaterials[i]);
    }
  }

  public addContactMaterial(contactMaterial) {
      this.contactMaterials.push(contactMaterial);
  }

  public setGravity(x: number = 0, y: number = 0, z: number = 0) {
      this.world.gravity.set(x, y, z);
  }

  public addBody(body: any) {
      this.bodies[body.id] = body;
      this.world.addBody(body);
      return body.id;
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

  public distanceConstraintById(id1: number, id2: number, distance: number = null, maxForce: number = null) {
      let constraint = new this.CANNON.DistanceConstraint(this.bodies[id1], this.bodies[id2], distance, maxForce);
      this.world.addConstraint(constraint);
  }
  
  public coneTwistConstraintById(id1: number, id2: number, options = null) {
      let constraint = new this.CANNON.ConeTwistConstraint(this.bodies[id1], this.bodies[id2], options);
      this.world.addConstraint(constraint);
  }

  public lockConstraintById(id1: number, id2: number, options = null) {
      let constraint = new this.CANNON.LockConstraint(this.bodies[id1], this.bodies[id2], options);
      this.world.addConstraint(constraint);
  }

  public raycastAny(from, to, options = {}) {
      return this.world.raycastAny(from, to, options);
  }

  public step(fixedTimeStep: number, timeSinceLastCalled: number) {
      if (this.running) {
          this.world.step(fixedTimeStep, timeSinceLastCalled);
      }
  }

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

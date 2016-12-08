import { Injectable } from '@angular/core';

@Injectable()
export class CannonService {

    private CANNON: any = require('cannon');

    // Setup our world
    private world: any = new this.CANNON.World();

    // Create sphere
    private radius: number = 1 // m
    private sphereBody: any = new this.CANNON.Body({
        mass: 5, // Kg
        position: new this.CANNON.Vec3(-4, 0, 10),
        shape: new this.CANNON.Sphere(this.radius)
    });
    private sphere2Body: any = new this.CANNON.Body({
        mass: 5, // Kg
        position: new this.CANNON.Vec3(-16, 0, 10),
        shape: new this.CANNON.Sphere(this.radius)
    });

    // Create a plane
    private groundBody: any = new this.CANNON.Body({
        mass: 0 // mass == 0 makes the body static
    });
    private groundShape: any = new this.CANNON.Plane();


  constructor() { }

  public makeLife() {
      this.world.addBody(this.sphereBody);
      this.world.addBody(this.sphere2Body);
      this.groundBody.addShape(this.groundShape);
      this.world.addBody(this.groundBody);
      this.sphere2Body.applyForce(new this.CANNON.Vec3(2000,0,0),this.sphereBody.position);
      //this.world.gravity.set(0,0,-9.82); // m/s^2
      this.world.gravity.set(0,0,0); // m/s^2
  }

  public getSphere () {
      return this.sphereBody;
  }

  public getSphere2 () {
      return this.sphere2Body;
  }

  public step(step: number) {
      this.world.step(step);
  };

}

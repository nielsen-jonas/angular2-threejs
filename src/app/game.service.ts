import { Injectable } from '@angular/core';
import { CannonService } from './cannon.service';
import { ThreeService } from './three.service';
import { SceneService } from './scene.service';

@Injectable()
export class GameService {

  constructor(
      private cannon: CannonService,
      private three: ThreeService,
      private scene: SceneService) { }

  public initialize() {
      this.cannon.setGravity(0,-9.8,0);
      this.three.setCameraPosition(0,0,32);
      this.scene.createSphere([-8,0,16]);
      this.scene.createSphere([0,0,16]);
      this.scene.createSphere([8,0,16]);
  }

  public main() {
  }

}

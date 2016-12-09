import { Injectable } from '@angular/core';
import { SceneService } from './scene.service';

@Injectable()
export class GameService {

  constructor(private scene: SceneService) { }

  public initialize() {
      this.scene.createSphere([-8,0,16]);
      this.scene.createSphere([0,0,16]);
      this.scene.createSphere([8,0,16]);
  }

  public main() {
  }

}

import { Injectable } from '@angular/core';
import { CannonService } from './cannon.service';
import { ThreeService } from './three.service';
import { SceneService } from './scene.service';
import { InputService } from './input.service';

@Injectable()
export class GameService {

  constructor(
      private cannon: CannonService,
      private three: ThreeService,
      private scene: SceneService,
      private input: InputService) { }

  public initialize() {
      this.cannon.setGravity(0,-9.8,0);
      this.three.setCameraPosition(0,0,32);
      this.scene.createSphere([-8,0,16]);
      this.scene.createSphere([0,0,16]);
      this.scene.createSphere([8,0,16]);
  }

  public main() {
      if (this.input.getKey('up').isDown()){
          console.log('up');
      }
      if (this.input.getKey('down').isDown()){
          console.log('down');
      }
      if (this.input.getKey('left').isDown()){
          console.log('left');
      }
      if (this.input.getKey('right').isDown()){
          console.log('right');
      }
  }

}

import { Injectable } from '@angular/core';

@Injectable()
export class MouseService {

    private mousePosition = require('mouse-position');
    private mouse: any;

  constructor() {
      console.log('heee');
  }
  
  public initialize(element) {
      this.mouse = this.mousePosition(element);
  }

  public logPos() {
      console.log('mouse-x', this.mouse[0]);
      console.log('mouse-y', this.mouse[1]);
  }

}

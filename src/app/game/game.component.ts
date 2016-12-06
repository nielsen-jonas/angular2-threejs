import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'tjsg-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  private THREE: any = require("three-js")();
  private hostElement: ElementRef;
  private renderer: any;
  
  constructor(el:ElementRef) { 
    this.hostElement = el
  }

  ngOnInit() {
    this.renderer = new this.THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(500, 500);
    this.renderer.setClearColor(0xFFAAAAFF,1);
    this.hostElement.nativeElement.appendChild(this.renderer.domElement);
    this.renderer.clear();
  }

}

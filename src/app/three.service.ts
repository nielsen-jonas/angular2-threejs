import { Injectable } from '@angular/core';
import { WindowService } from './window.service';

@Injectable()
export class ThreeService {

    private THREE: any = require('three');

    private scene: any;
    private camera: any;
    private renderer: any;

    private sphere: any;
    private sphere2: any;

  constructor(private window: WindowService) { }

    public initialize() {
        this.scene = new this.THREE.Scene();
        this.camera = new this.THREE.PerspectiveCamera( 45, this.window.getAspect(), 0.1, 1000);
        this.renderer = new this.THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(this.window.getWidth(), this.window.getHeight());
        this.renderer.setClearColor('#DDF', 1);
        //this.renderer.clear();
    }

    public getDomElement() {
        return this.renderer.domElement;
    }

    public makeLife() {
        let geometry = new this.THREE.SphereGeometry( 1, 8, 8 );
        let material = new this.THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.sphere = new this.THREE.Mesh( geometry, material );
        this.sphere2 = new this.THREE.Mesh( geometry, material );
        this.scene.add( this.sphere );
        this.scene.add( this.sphere2 );
        this.camera.position.z = 32;
    }

    public updatePos(sphere, sphere2) {
        this.sphere.position.copy(sphere.position);
        this.sphere2.position.copy(sphere2.position);
    }

    public render() {
        this.renderer.render(this.scene, this.camera);
    }

    public setBgColor(color: string) {
        this.renderer.setClearColor(color, 1);
    }

    public updateWindowSize() {
        this.camera.aspect = this.window.getAspect();
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.window.getWidth(), this.window.getHeight());
    }

}

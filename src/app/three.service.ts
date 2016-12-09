import { Injectable } from '@angular/core';
import { WindowService } from './window.service';

@Injectable()
export class ThreeService {

    private THREE: any = require('three');

    private scene: any;
    private camera: any;
    private renderer: any;

    private meshes: any[] = [];

    private sphere: any;
    private sphere2: any;

  constructor(private window: WindowService) { }

    public getThree() {
        return this.THREE;
    }
    
    public initialize() {
        this.scene = new this.THREE.Scene();
        this.camera = new this.THREE.PerspectiveCamera( 45, this.window.getAspect(), 0.1, 1000);
        this.renderer = new this.THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(this.window.getWidth(), this.window.getHeight());
        this.renderer.setClearColor('#DDF', 1);
        this.camera.position.z = 32; // TODO: Refactor camera configuration
        //this.renderer.clear();
    }

    public getDomElement() {
        return this.renderer.domElement;
    }

    public getMeshes() {
        return this.meshes;
    }

    public sceneAdd(mesh) {
        this.meshes[mesh.id] = mesh;
        this.scene.add(mesh);
    }

    public updateMeshPos(id, position) {
        this.meshes[id].position.copy(position);
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

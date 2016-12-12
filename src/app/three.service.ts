import { Injectable } from '@angular/core';
import { WindowService } from './window.service';

@Injectable()
export class ThreeService {

    private THREE: any = require('three');

    private scene: any;
    private camera: any;
    private renderer: any;

    private meshes: any[] = [];
    private step: number;
    private camMoveSpd: number;

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
        //this.renderer.clear();
        console.log('THREE CAMERA', this.camera);
    }

    public setStep(step: number) {
        this.step = step;
        this.camMoveSpd = step * 6;
    }
    
    public setCameraPosition(x: number, y: number, z: number) {
        this.camera.position.x = x;
        this.camera.position.y = y;
        this.camera.position.z = z;
    }

    public cameraRotateX(amount) {
        this.camera.rotateY(-amount*0.002);
    }

    public cameraRotateY(amount) {
        this.camera.rotateX( -amount*0.002);
    } 

    public cameraMoveForward(amount) {
        this.camera.translateZ(-amount*this.camMoveSpd);
    }

    public cameraMoveSideways(amount) {
        this.camera.translateX(amount*this.camMoveSpd);
    }

    public getDomElement() {
        return this.renderer.domElement;
    }

    public getMeshes() {
        return this.meshes;
    }

    public getCamera() {
        return this.camera;
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

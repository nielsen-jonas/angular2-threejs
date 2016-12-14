import { Injectable } from '@angular/core';

import { WindowService } from './window.service';

@Injectable()
export class ThreeService {

    private THREE: any = require('three');

    private scene: any;
    private camera: any;
    private camPitchObj: any;
    private renderer: any;

    private running: boolean = false;

    private meshes: any[] = [];
    private step: number;
    private camMoveSpd: number;

    private skybox: Skybox;

  constructor(private window: WindowService) {
        this.scene = new this.THREE.Scene();
        this.renderer = new this.THREE.WebGLRenderer({ alpha: false, antialias: true });
        this.renderer.autoclear = true;
        let ambientLight = new this.THREE.AmbientLight( 0x707070 );
        this.scene.add( ambientLight );
        let directionalLight = new this.THREE.DirectionalLight( 0xfffdf8, .7 );
        directionalLight.position.set(1000,286,-162);
        this.skybox = new Skybox(this.THREE);
        this.scene.add( directionalLight );
        this.run();
  
  }

    public getThree() {
        return this.THREE;
    }

    public run() {
        this.running = true;
    }

    public halt() {
        this.running = false;
    }

    public isRunning() {
        return this.running;
    }
    
    public initialize() {
        this.renderer.setSize(this.window.getWidth(), this.window.getHeight());
        this.camera = new this.THREE.PerspectiveCamera( 45, this.window.getAspect(), 0.1, 1000);
        this.camPitchObj = new this.THREE.Object3D();
        this.camPitchObj.add(this.camera);
        this.scene.add(this.camPitchObj);
        this.skybox.load();
        this.scene.add(this.skybox.getSkybox());
    }

    public setStep(step: number) {
        this.step = step;
        this.camMoveSpd = step * 6;
    }
    
    public setCameraPosition(x: number, y: number, z: number) {
        this.camPitchObj.position.x = x;
        this.camPitchObj.position.y = y;
        this.camPitchObj.position.z = z;
    }

    public cameraYaw(amount) {
        this.camPitchObj.rotateY(-amount*0.002);
    }

    public cameraPitch(amount) {
        this.camera.rotateX( -amount*0.002);
        if (this.camera.rotation.x > 1.4) {
            this.camera.rotation.x = 1.4;
        }
        if (this.camera.rotation.x < -1.4) {
            this.camera.rotation.x = -1.4;
        }
    } 

    public cameraMoveForward(amount) {
        this.camPitchObj.translateZ(-amount*this.camMoveSpd);
        this.camPitchObj.translateY(amount*this.camera.rotation.x*this.camMoveSpd);
          let pos = this.camPitchObj.position;
          this.skybox.updatePosition(pos.x, pos.y, pos.z);
    }

    public cameraMoveSideways(amount) {
        this.camPitchObj.translateX(amount*this.camMoveSpd);
          let pos = this.camPitchObj.position;
          this.skybox.updatePosition(pos.x, pos.y, pos.z);
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

    public getCameraPosition() {
        return this.camera.getWorldPosition();
    }
    
    public getCameraDirection() {
        return this.camera.getWorldDirection();
    }

    public sceneAdd(mesh) {
        this.meshes[mesh.id] = mesh;
        this.scene.add(mesh);
    }

    public sceneRemove(id) {
        this.scene.remove(this.meshes[id]);
        delete this.meshes[id];
    }

    public updateMesh(id, position, quaternion) {
        this.meshes[id].position.copy(position);
        this.meshes[id].quaternion.copy(quaternion);
    }

    public render() {
        if (this.running) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    public setBgColor(color: string) {
        this.renderer.setClearColor(color, 1);
    }

    public updateWindowSize() {
        this.camera.aspect = this.window.getAspect();
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.window.getWidth(), this.window.getHeight());
        this.skybox.load();
    }

}

export class Skybox {
    private THREE;
    private skybox: any;
    private cubeTextureLoader: any;
    
    private urlPrefix = "./assets/cubemap/ice_river/";
    private urls = [
        this.urlPrefix + 'posx.jpg',
        this.urlPrefix + 'negx.jpg',
        this.urlPrefix + 'posy.jpg',
        this.urlPrefix + 'negy.jpg',
        this.urlPrefix + 'posz.jpg',
        this.urlPrefix + 'negz.jpg'];

    private textureCube: any;
    private shader: any;
    private material: any;

    public constructor(THREE) {
        this.THREE = THREE 
        this.cubeTextureLoader = new this.THREE.CubeTextureLoader();
        this.textureCube = this.cubeTextureLoader.load(this.urls);
        this.shader = this.THREE.ShaderLib.cube;
        this.shader.uniforms.tCube.value = this.textureCube;
        this.material = new this.THREE.ShaderMaterial({
            fragmentShader: this.shader.fragmentShader,
            vertexShader: this.shader.vertexShader,
            uniforms: this.shader.uniforms,
            depthWrite: false,
            side: this.THREE.BackSide
        });

    }

    public getSkybox() {
        return this.skybox;
    }

    public updatePosition(x, y, z) {
        this.skybox.position.x = x;
        this.skybox.position.y = y;
        this.skybox.position.z = z;
    }

    public load() {
        this.skybox = new this.THREE.Mesh(new this.THREE.BoxGeometry(1000, 1000, 1000), this.material);
    }

}

import { Injectable } from '@angular/core';

import { WindowService } from './window.service';

@Injectable()
export class Camera {
    private THREE;
    private camera: any;
    private pitchObj: any;
    private camMoveSpd: number;
    private skybox: Skybox;

    public constructor() {
    }

    public initialize(THREE, windowAspect) {
        this.THREE = THREE;
        this.camera = new this.THREE.PerspectiveCamera( 45, windowAspect, 0.1, 1000);
        this.pitchObj = new this.THREE.Object3D();
        this.pitchObj.add(this.camera);
        this.skybox = new Skybox(THREE);
        this.skybox.load();
    }

    public setStep(step) {
        this.camMoveSpd = step * 10;
    }

    public setCameraPosition(x: number, y: number, z: number) {
        this.pitchObj.position.x = x;
        this.pitchObj.position.y = y;
        this.pitchObj.position.z = z;
    }

    public cameraYaw(amount) {
        this.pitchObj.rotateY(-amount*0.002);
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
        this.pitchObj.translateZ(-amount*this.camMoveSpd);
        this.pitchObj.translateY(amount*this.camera.rotation.x*this.camMoveSpd);
          let pos = this.pitchObj.position;
          this.skybox.updatePosition(pos.x, pos.y, pos.z);
    }

    public cameraMoveSideways(amount) {
        this.pitchObj.translateX(amount*this.camMoveSpd);
          let pos = this.pitchObj.position;
          this.skybox.updatePosition(pos.x, pos.y, pos.z);
    }

    public getCamera() {
        return this.camera;
    }

    public getCam() {
        return this.pitchObj;
    }

    public getCameraPosition() {
        return this.camera.getWorldPosition();
    }
    
    public getCameraDirection() {
        return this.camera.getWorldDirection();
    }

    public getSkybox() {
        return this.skybox.getSkybox();
    }

    public updateWindowSize() {
        this.camera.updateProjectionMatrix();
        this.skybox.load();
    }

}

@Injectable()
export class ThreeService {

    private THREE: any = require('three');

    private scene: any;
    private renderer: any;

    private running: boolean = false;

    private meshes: any[] = [];

  constructor(private window: WindowService, private cam: Camera) {
        this.scene = new this.THREE.Scene();
        this.renderer = new this.THREE.WebGLRenderer({ alpha: false, antialias: true });
        this.renderer.autoclear = true;
        let ambientLight = new this.THREE.AmbientLight( 0x707070 );
        this.scene.add( ambientLight );
        let directionalLight = new this.THREE.DirectionalLight( 0xfffdf8, .7 );
        directionalLight.position.set(1000,286,-162);
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
        this.scene.add(this.cam.getSkybox());
        this.scene.add(this.cam.getCam());
    }

    public getDomElement() {
        return this.renderer.domElement;
    }

    public getMeshes() {
        return this.meshes;
    }

    public addMesh(mesh) {
        this.meshes[mesh.id] = mesh;
        this.scene.add(mesh);
    }

    public removeMesh(id) {
        this.scene.remove(this.meshes[id]);
        delete this.meshes[id];
    }

    public updateMesh(id, position, quaternion) {
        this.meshes[id].position.copy(position);
        this.meshes[id].quaternion.copy(quaternion);
    }

    public render() {
        if (this.running) {
            this.renderer.render(this.scene, this.cam.getCamera());
        }
    }

    public setBgColor(color: string) {
        this.renderer.setClearColor(color, 1);
    }

    public updateWindowSize() {
        this.renderer.setSize(this.window.getWidth(), this.window.getHeight());
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

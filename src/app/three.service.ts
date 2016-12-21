import { Injectable } from '@angular/core';

import { WindowService } from './window.service';

@Injectable()
export class Camera {
    private THREE;
    private camera: any;
    private skyboxCamera: SkyboxCamera;
    private step: number;
    private _zoomMin: number = 1;
    private _zoomMax: number = 2.2;
    private _zoomSpd: number = 12;
    private zoom: number = this._zoomMin;
    private pitchObj: any;
    private shellObj: any;
    private camMoveSpd: number;

    public constructor() {
    }

    public initialize(THREE, windowAspect) {
        this.THREE = THREE;
        this.camera = new this.THREE.PerspectiveCamera( 45, windowAspect, .1, 1000);
        this.skyboxCamera = new SkyboxCamera(new this.THREE.PerspectiveCamera( 45, windowAspect, .1, 100));
        this.pitchObj = new this.THREE.Object3D();
        this.pitchObj.add(this.camera);
    }

    public setStep(step) {
        this.step = step;
        this.camMoveSpd = step * 4;
        this.skyboxCamera.setCameraQuaternion(this.getCameraQuaternion());
    }

    public setCameraPosition(x: number, y: number, z: number) {
        this.pitchObj.position.x = x;
        this.pitchObj.position.y = y;
        this.pitchObj.position.z = z;
    }

    public moveTowards(position) {
        let xDistance = position.x - this.pitchObj.position.x;
        let yDistance = position.y - this.pitchObj.position.y;
        let zDistance = position.z - this.pitchObj.position.z;
        let min = .01;
        let distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance + zDistance * zDistance);
        let easingAmount = .2;
        if (distance > .01) {
            this.pitchObj.position.x += xDistance * easingAmount;
            this.pitchObj.position.y += yDistance * easingAmount;
            this.pitchObj.position.z += zDistance * easingAmount;
        }
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

    public move(amount) {
        this.pitchObj.translateZ(-amount*this.camMoveSpd);
        this.pitchObj.translateY(amount*this.camera.rotation.x*this.camMoveSpd);
    }

    public strafe(amount) {
        this.pitchObj.translateX(amount*this.camMoveSpd);
    }

    public getCamera() {
        return this.camera;
    }

    public getCam() {
        return this.pitchObj;
    }

    public getSkyboxCamera() {
        return this.skyboxCamera.getCamera();
    }

    public getCameraPosition() {
        return this.camera.getWorldPosition();
    }
    
    public getCameraDirection() {
        return this.camera.getWorldDirection();
    }

    public getCameraQuaternion() {
        return this.camera.getWorldQuaternion();
    }

    public getPitchObjDirection() {
        return this.pitchObj.getWorldDirection();
    }

    public updateWindowSize() {
        this.camera.updateProjectionMatrix();
        this.skyboxCamera.updateProjectionMatrix();
    }

    public zoomIn() {
        this.zoom += this.step*this._zoomSpd; 
        if (this.zoom != this._zoomMax) {
            if (this.zoom > this._zoomMax) {
                this.zoom = this._zoomMax;
            }
            this.camera.zoom = this.zoom;
            this.camera.updateProjectionMatrix();
            this.skyboxCamera.setZoom(this.camera.zoom);
        }
    }

    public zoomOff() {
        this.zoom = this._zoomMin;
        this.camera.zoom = this.zoom;
        this.camera.updateProjectionMatrix();
        this.skyboxCamera.setZoom(this.camera.zoom);
    } 

}

@Injectable()
export class ThreeService {

    private THREE: any = require('three');

    private scene: any;
    private skybox: Skybox;
    private skyboxScene: any;
    private renderer: any;

    private running: boolean = false;

    private meshes: any[] = [];

    //private lensFlare: LensFlare;

  constructor(private window: WindowService, private cam: Camera) {
      this.init();
  }

  private init() {
        this.scene = new this.THREE.Scene();
        this.skyboxScene = new this.THREE.Scene();
        this.skybox = new Skybox(this.THREE);
        this.skybox.load();
        this.renderer = new this.THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.autoClear = false;
        let ambientLight = new this.THREE.AmbientLight( 0x707070 );
        this.scene.add( ambientLight );
        let directionalLight = new this.THREE.DirectionalLight( 0xfffdf8, .7 );
        directionalLight.position.set(1000,286,-162);
        this.scene.add( directionalLight );
        //this.lensFlare = new LensFlare(this.THREE);
        //this.lensFlare.setPosition(directionalLight.position);
        //this.scene.add(this.lensFlare.getLensFlare());
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
        this.skyboxScene.add(this.skybox.getSkybox());
        this.scene.add(this.cam.getCam());
    }

    public getDomElement() {
        return this.renderer.domElement;
    }

    public getMeshes() {
        return this.meshes;
    }

    public getMeshById(id) {
        return this.meshes[id];
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
            this.renderer.clear();
            this.renderer.render(this.skyboxScene, this.cam.getSkyboxCamera());
            this.renderer.render(this.scene, this.cam.getCamera());
        }
    }

    public setBgColor(color: string) {
        this.renderer.setClearColor(color, 1);
    }

    public updateWindowSize() {
        this.renderer.setSize(this.window.getWidth(), this.window.getHeight());
    }

    public reloadSkybox() {
        this.skybox.reload();
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
        this.THREE = THREE;
        this.cubeTextureLoader = new this.THREE.CubeTextureLoader();
    }

    public getSkybox() {
        return this.skybox;
    }

    public load() {
        this.loadMaterial();
        this.skybox = new this.THREE.Mesh(new this.THREE.BoxGeometry(100, 100, 100), this.material);
    }

    public loadMaterial() {
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

    public reload() {
        this.loadMaterial();
    }

}

export class SkyboxCamera {
    private camera: any;

    public constructor(camera) {
        this.camera = camera;
    }

    public getCamera() {
        return this.camera;
    }

    public setCameraQuaternion(q) {
        this.camera.setRotationFromQuaternion(q);
    }

    public setZoom(zoom: number) {
        this.camera.zoom = zoom;
        this.camera.updateProjectionMatrix();
    }

    public updateProjectionMatrix() {
        this.camera.updateProjectionMatrix();
    }
    
}

// export class LensFlare {
//     private THREE;
//     private scene;
//     private textureLoader; 
//     private textureFlare;
//     private flareColor;
//     private lensFlare;
// 
//     public constructor(THREE) {
//         this.THREE = THREE
//         this.textureLoader = new this.THREE.TextureLoader();
//         this.textureFlare = this.textureLoader.load('./assets/lensflares/star_glow.png');
//         this.flareColor = new this.THREE.Color( 0xffffff );
//         //this.flareColor.setHSL();
//         this.lensFlare = new this.THREE.LensFlare( this.textureFlare, 700, 0.0, this.THREE.AdditiveBlending, this.flareColor );
//     }
// 
//     public setPosition(position) {
//         this.lensFlare.position.copy(position);
//     }
// 
//     public getLensFlare() {
//         return this.lensFlare;
//     }
// 
// }

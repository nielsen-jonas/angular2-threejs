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
    private skyBox: any;
    private step: number;
    private camMoveSpd: number;

    private cubeTextureLoader: any;
    private skyboxReloadTimer: number = 0;
    private skyboxNeedsReload: boolean = true;

  constructor(private window: WindowService) {
        this.scene = new this.THREE.Scene();
        this.renderer = new this.THREE.WebGLRenderer({ alpha: false, antialias: true });
        this.renderer.autoclear = true;
        let ambientLight = new this.THREE.AmbientLight( 0x707070 );
        this.scene.add( ambientLight );
        let directionalLight = new this.THREE.DirectionalLight( 0xfffdf8, .7 );
        directionalLight.position.set(1000,286,-162);
        this.cubeTextureLoader = new this.THREE.CubeTextureLoader();
        this.skyboxReloadTimer = 10;
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
        //console.log('THREE CAMERA', this.camera);
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
        this.updateSkyBoxPosition();
    }

    public cameraMoveSideways(amount) {
        this.camPitchObj.translateX(amount*this.camMoveSpd);
        this.updateSkyBoxPosition();
    }

    public updateSkyBoxPosition() {
        this.skyBox.position.x = this.camPitchObj.position.x;
        this.skyBox.position.y = this.camPitchObj.position.y;
        this.skyBox.position.z = this.camPitchObj.position.z;
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

    public removeMesh(id) {
        //this.scene.remove(this.mesh);
    }

    public updateMesh(id, position, quaternion) {
        this.meshes[id].position.copy(position);
        this.meshes[id].quaternion.copy(quaternion);
    }

    public render() {
        if (this.running) {
            this.renderer.render(this.scene, this.camera);
            if (this.skyboxNeedsReload) {
                this.checkSkyboxReload();
            }
        }
    }

    private checkSkyboxReload() {
        if (this.skyboxReloadTimer >= 1) {
            this.skyboxReloadTimer --;
            if (this.skyboxReloadTimer == 1) {
                this.skyboxReloadTimer = 0;
                this.refreshSkybox();
            }
        }
    }

    public setBgColor(color: string) {
        this.renderer.setClearColor(color, 1);
    }

    public updateWindowSize() {
        this.camera.aspect = this.window.getAspect();
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.window.getWidth(), this.window.getHeight());
        this.skyboxNeedsReload = true;
        this.skyboxReloadTimer = 10;
    }

    public refreshSkybox() {
        this.scene.remove(this.skyBox);
        this.loadSkybox();
    }

    private loadSkybox() {
        let urlPrefix = "./assets/cubemap/ice_river/";
        let urls = [
            urlPrefix + 'posx.jpg',
            urlPrefix + 'negx.jpg',
            urlPrefix + 'posy.jpg',
            urlPrefix + 'negy.jpg',
            urlPrefix + 'posz.jpg',
            urlPrefix + 'negz.jpg'];

        let textureCube = this.cubeTextureLoader.load(urls);
        let shader = this.THREE.ShaderLib.cube;
        shader.uniforms.tCube.value = textureCube;

        let material = new this.THREE.ShaderMaterial({
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            depthWrite: false,
            side: this.THREE.BackSide
        });

        this.skyBox = new this.THREE.Mesh(new this.THREE.BoxGeometry(1000, 1000, 1000), material);
        this.scene.add(this.skyBox);
        this.skyboxNeedsReload = false;
    }

}

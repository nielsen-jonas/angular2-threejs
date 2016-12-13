import { Injectable } from '@angular/core';
import { WindowService } from './window.service';

@Injectable()
export class ThreeService {

    private THREE: any = require('three');

    private scene: any;
    private camera: any;
    private camPitchObj: any;
    private renderer: any;

    private meshes: any[] = [];
    private step: number;
    private camMoveSpd: number;

  constructor(private window: WindowService) {
        this.scene = new this.THREE.Scene();
        this.renderer = new this.THREE.WebGLRenderer({ alpha: false, antialias: true });
        this.renderer.setClearColor('#DDF', 1);
        this.renderer.autoclear = true;
        let ambientLight = new this.THREE.AmbientLight( 0x404040 );
        this.scene.add( ambientLight );
        let directionalLight = new this.THREE.DirectionalLight( 0xfffffff, 0.5 );
        directionalLight.position.set(800,800,800);
        //this.loadSkybox();
        this.scene.add( directionalLight );
  
  }

    public getThree() {
        return this.THREE;
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
    }

    public cameraMoveSideways(amount) {
        this.camPitchObj.translateX(amount*this.camMoveSpd);
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

    public updateMesh(id, position, quaternion) {
        this.meshes[id].position.copy(position);
        this.meshes[id].quaternion.copy(quaternion);
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

    private loadSkybox() {
        let urlPrefix = "./assets/cubemap/ice_river/";
        let urls = [
            urlPrefix + 'posx.jpg',
            urlPrefix + 'negx.jpg',
            urlPrefix + 'posy.jpg',
            urlPrefix + 'negy.jpg',
            urlPrefix + 'posz.jpg',
            urlPrefix + 'negz.jpg'];
        //let textureCube = new this.THREE.CubeTextureLoader().load( urls );
        //textureCube.mapping = this.THREE.CubeRefractionMapping;

        let textureCube = this.THREE.ImageUtils.loadTextureCube(urls, this.THREE.CubeRefractionMapping);
        let shader = this.THREE.ShaderLib.cube;
        shader.uniforms.tCube.value = textureCube;

        let material = new this.THREE.ShaderMaterial({
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            depthWrite: false,
            side: this.THREE.BackSide
        });

        let mesh = new this.THREE.Mesh(new this.THREE.BoxGeometry(1000, 1000, 1000), material);
        this.scene.add(mesh);

    }

}

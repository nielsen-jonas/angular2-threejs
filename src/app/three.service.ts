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
        this.renderer = new this.THREE.WebGLRenderer({ alpha: false, antialias: true });
        this.renderer.setSize(this.window.getWidth(), this.window.getHeight());
        this.renderer.setClearColor('#DDF', 1);
        this.renderer.clear();
        console.log('THREE CAMERA', this.camera);
        let ambientLight = new this.THREE.AmbientLight( 0x404040 );
        this.scene.add( ambientLight );
        let directionalLight = new this.THREE.DirectionalLight( 0xfffffff, 0.5 );
        directionalLight.position.set(1000,1000,1000);
        this.loadSkybox();
        this.scene.add( directionalLight );
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
        let textureCube = new this.THREE.CubeTextureLoader().load( urls );
        textureCube.mapping = this.THREE.CubeRefractionMapping;

        // material samples
        let cubeMaterial3 = new this.THREE.MeshBasicMaterial({ color: 0xccddff, envMap: textureCube, refractionRatio: 0.98, reflectivity: 0.9 });
        let cubeMaterial2 = new this.THREE.MeshBasicMaterial({ color: 0xccfffd, envMap: textureCube, refractionRatio: 0.985 });
        let cubeMaterial1 = new this.THREE.MeshBasicMaterial({ color: 0xffffff, envMap: textureCube, refractionRatio: 0.98 });

        //
        //let loader = new this.THREE.BinaryLoader();
        /*
        let shader = this.THREE.ShaderLib["cube"];
        let uniforms = this.THREE.UniformsUtils.clone( shader.uniforms );
        uniforms['tCube'].texture = textureCube;
        //shader.uniforms['tCube'].value = textureCube;
        let material = new this.THREE.ShaderMaterial({
            fragmentShader: shader.fragmentShader,
            vertextShader: shader.vertexShader,
            uniforms: uniforms
        });

        let geometry = new this.THREE.BoxGeometry(100, 100, 100);
        let skybox = new this.THREE.Mesh(geometry, material);

        this.scene.add( skybox );
        */

        //let sphere = new this.THREE.Mesh(geometry, material)
        //this.scene.add(sphere);
    }

}

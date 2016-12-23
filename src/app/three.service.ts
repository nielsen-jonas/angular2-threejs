import { Injectable } from '@angular/core';

import { WindowService } from './window.service';

@Injectable()
export class Camera {
    private THREE;
    private camera: any;
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
        this.camera = new this.THREE.PerspectiveCamera( 45, windowAspect, .1, 600);
        this.pitchObj = new this.THREE.Object3D();
        this.pitchObj.add(this.camera);
    }

    public setStep(step) {
        this.step = step;
        this.camMoveSpd = step * 4;
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
    }

    public zoomIn() {
        this.zoom += this.step*this._zoomSpd; 
        if (this.zoom != this._zoomMax) {
            if (this.zoom > this._zoomMax) {
                this.zoom = this._zoomMax;
            }
            this.camera.zoom = this.zoom;
            this.camera.updateProjectionMatrix();
        }
    }

    public zoomOff() {
        this.zoom = this._zoomMin;
        this.camera.zoom = this.zoom;
        this.camera.updateProjectionMatrix();
    } 

}

@Injectable()
export class ThreeService {

    private THREE: any = require('three');

    private scene: any;
    private skybox: Skybox;
    private renderer: any;

    private running: boolean = false;

    private meshes: any[] = [];
    private particleSystem: SnowParticleSystem;

    //private lensFlare: LensFlare;

  constructor(private window: WindowService, private cam: Camera) {
      this.init();
  }

  private init() {
        this.scene = new this.THREE.Scene();
        this.skybox = new Skybox(this.THREE);
        this.skybox.load();
        this.renderer = new this.THREE.WebGLRenderer({ alpha: true, antialias: true });
        //let ambientLight = new this.THREE.AmbientLight( 0x707070 );
        let ambientLight = new this.THREE.AmbientLight( 0x808080 );
        this.scene.add( ambientLight );
        let directionalLight = new this.THREE.DirectionalLight( 0xfffdf8, .8 );
        directionalLight.position.set(1000,286,-162);
        this.scene.add( directionalLight );
        //this.lensFlare = new LensFlare(this.THREE);
        //this.lensFlare.setPosition(directionalLight.position);
        //this.scene.add(this.lensFlare.getLensFlare());
        //let particleSystem = this.createParticleSystem();
        //this.scene.add(particleSystem);
        this.particleSystem = new SnowParticleSystem(this.THREE);
        this.scene.add(this.particleSystem.getParticleSystem());
        this.scene.fog = new this.THREE.Fog(0x99a6af, 10, 100);

        
  }

    public getThree() {
        return this.THREE;
    }

    public run() { this.running = true; } public halt() { this.running = false;
    }

    public isRunning() {
        return this.running;
    }
    
    public initialize() {
        this.renderer.setSize(this.window.getWidth(), this.window.getHeight());
        this.scene.add(this.skybox.getSkybox());
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
            this.skybox.setPosition(this.cam.getCameraPosition());
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

    public stepParticleSystem(step) {
        this.particleSystem.step(step);
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

    public setPosition(position) {
        this.skybox.position.x = position.x;
        this.skybox.position.y = position.y;
        this.skybox.position.z = position.z;
    }

    public load() {
        this.loadMaterial();
        this.skybox = new this.THREE.Mesh(new this.THREE.BoxGeometry(500, 500, 500), this.material);
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

export class SnowParticleSystem {
    private THREE;
    private particleCount = 2000;
    private particles;
    private particleMaterial;
    private particleSystem;

    public constructor(THREE) {
        this.THREE = THREE;
        this.initialize();
    }

    public getParticleSystem() {
        return this.particleSystem;
    }

    private initialize() {
        this.particles = new this.THREE.Geometry();
        for (let p = 0; p < this.particleCount; p++) {
            let x = Math.random() * 400 - 200;
            let y = Math.random() * 400 - 200;
            let z = Math.random() * 400 - 200;
            
            let particle = new this.THREE.Vector3(x, y, z);
            this.particles.vertices.push(particle);
        }
        this.particleMaterial = new this.THREE.PointsMaterial({
            color: 0xffffff,
            size: 1,
            map: new this.THREE.TextureLoader().load('./assets/particles/snowflake.jpg'),
            blending: this.THREE.AdditiveBlending,
            transparent: true
        });

        this.particleSystem = new this.THREE.Points(this.particles, this.particleMaterial);
    }

    public step(step) {
        let verts = this.particleSystem.geometry.vertices;
        for (let i = 0; i < verts.length; i++) {
            let vert = verts[i];
            if (vert.y < -200) {
                vert.y = Math.random() * 400 - 200;
            }
            vert.y = vert.y - (10 * step);
        }
        this.particleSystem.rotation.y -= .1 * step;
        this.particleSystem.geometry.verticesNeedUpdate = true;
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

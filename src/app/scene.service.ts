import { Injectable } from '@angular/core';
import { CannonService } from './cannon.service';
import { ThreeService } from './three.service';

@Injectable()
export class SceneService {

    private CANNON: any;
    private THREE: any;

    private objects: any[] = [];

    private textureLoader: any;
    private textures: any[] = [];
    private materials: any[] = [];

    constructor(private cannon: CannonService, private three: ThreeService) {
        this.CANNON = this.cannon.getCannon();
        this.THREE = this.three.getThree();
        this.textureLoader = new this.THREE.TextureLoader();
        this.textures.push(this.textureLoader.load('./assets/textures/sign_arrow.jpg'));
        this.materials['sign-arrow'] = new this.THREE.MeshLambertMaterial({ map: this.textures[0]});
    }

    public update() {
        for (let i = 0, len = this.objects.length; i < len; i++) {
            let body = this.cannon.getBodyById(this.objects[i][0]);
            this.three.updateMesh(this.objects[i][1], body.position, body.quaternion);
        }
    }

    public createSphere(position = [0,0,0], radius: number = 1, mass: number = 1) {
        // Cannon Body
        let body = new this.CANNON.Body({
            mass: mass,
            position: new this.CANNON.Vec3(position[0], position[1], position[2]),
            shape: new this.CANNON.Sphere(radius)
        });
        
        // Three Mesh
        let geometry = new this.THREE.SphereGeometry(radius, 16, 16);
        let mesh = new this.THREE.Mesh( geometry, this.materials['sign-arrow'] );

        this.instantiate(body, mesh);
    };

    private instantiate(body, mesh) {
        // Register Object
        let object = [body.id, mesh.id];
        this.objects.push(object);

        // Add Object
        this.cannon.addBody(body);
        this.three.sceneAdd(mesh);
    }
  
}

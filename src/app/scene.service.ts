import { Injectable } from '@angular/core';
import { CannonService } from './cannon.service';
import { ThreeService } from './three.service';

@Injectable()
export class SceneService {

    private CANNON: any;
    private THREE: any;

    private objects: any[] = [];

    constructor(private cannon: CannonService, private three: ThreeService) {
        this.CANNON = this.cannon.getCannon();
        this.THREE = this.three.getThree();
    }

    public update() {
        for (let i = 0, len = this.objects.length; i < len; i++) {
            let body = this.cannon.getBodyById(this.objects[i][0]);
            this.three.updateMeshPos(this.objects[i][1], body.position);
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
        let geometry = new this.THREE.SphereGeometry(radius, 8, 8);
        let material = new this.THREE.MeshBasicMaterial({ color: 0x00ff00 });
        let sphere = new this.THREE.Mesh( geometry, material );

        // Register Object
        let object = [body.id, sphere.id];
        this.objects.push(object);
        
        // Add Object
        this.cannon.addBody(body);
        this.three.sceneAdd(sphere);
    };
  
}
import { Injectable } from '@angular/core';
import { CannonService } from './cannon.service';
import { ThreeService } from './three.service';

@Injectable()
export class SceneService {

    private CANNON: any;
    private THREE: any;

    private objects: any[] = [];
    private objectCount: number = 0;

    private textureLoader: any;
    private textures: any[] = [];
    private materials: any[] = [];

    constructor(private cannon: CannonService, private three: ThreeService) {
        this.CANNON = this.cannon.getCannon();
        this.THREE = this.three.getThree();
        this.textureLoader = new this.THREE.TextureLoader();
        this.textures.push(this.textureLoader.load('./assets/textures/sign_arrow.jpg'));
        this.materials['sign-arrow'] = new this.THREE.MeshLambertMaterial({ map: this.textures[0]});
        this.textures.push(this.textureLoader.load('./assets/textures/concrete.jpg'));
        this.materials['concrete'] = new this.THREE.MeshLambertMaterial({ map: this.textures[1]});
    }

    public update() {
        for (let i = 0, len = this.objects.length; i < len; i++) {
            let body = this.cannon.getBodyById(this.objects[i][0]);
            this.three.updateMesh(this.objects[i][1], body.position, body.quaternion);
        }
    }

    public getObjectCount() {
        return this.objectCount;
    }

    public createRectangle(conf) {
    }

    public createSphere(conf) {
        if (typeof conf.position == 'undefined') { conf.position = [0,0,0] };
        if (typeof conf.radius == 'undefined') { conf.radius = 1 };
        if (typeof conf.mass == 'undefined') { conf.mass = 1 };
        if (typeof conf.material == 'undefined') { conf.material = 'sign-arrow' };
        if (typeof conf.velocity == 'undefined') { conf.velocity = [0,0,0] };

        // Cannon Body
        let body = new this.CANNON.Body({
            mass: conf.mass,
            position: new this.CANNON.Vec3(conf.position[0], conf.position[1], conf.position[2]),
            shape: new this.CANNON.Sphere(conf.radius),
            velocity: new this.CANNON.Vec3(conf.velocity[0], conf.velocity[1], conf.velocity[2])
        });
        
        // Three Mesh
        let geometry = new this.THREE.SphereGeometry(conf.radius, 16, 16);
        let mesh = new this.THREE.Mesh( geometry, this.materials[conf.material] );

        this.instantiate(body, mesh);
    };

    // public getObjectByBodyId(id) {
    //     for (let i = 0, len = this.objects.length; i < len; i++) {
    //         if (this.objects[i][0] === id) {
    //             return this.objects[i];
    //         }
    //     }
    // }
    // 
    // public getObjectByMeshId(id) {
    //     for (let i = 0, len = this.objects.length; i < len; i++) {
    //         if (this.objects[i][1] === id) {
    //             return this.objects[i];
    //         }
    //     }
    // }

    private getObjectIndexByBodyId(id) {
        for (let i = 0, len = this.objects.length; i < len; i++) {
            if (this.objects[i][0] === id) {
                return i;
            }
        }
    }

    private getObjectIndexByMeshId(id) {
        for (let i = 0, len = this.objects.length; i < len; i++) {
            if (this.objects[i][1] === id) {
                return i;
            }
        }
    }

    public removeObjectByBodyId(id) {
        let index = this.getObjectIndexByBodyId(id);
        this.removeObject(index);
    }
    
    public removeObjectByMeshId(id) {
        let index = this.getObjectIndexByMeshId(id);
        this.removeObject(index);
    }

    private removeObject(index) {
        let object = this.objects[index];
        if (object) {
            this.cannon.removeBody(object[0]);
            this.three.removeMesh(object[1]);
            this.objects.splice(index, 1);
            this.objectCount --;
            return true;
        }
        return false;
    }

    private instantiate(body, mesh) {
       // Register Object
       let object = [body.id, mesh.id];
       this.objects.push(object);
       this.objectCount ++;

       // Add Object
       this.cannon.addBody(body);
       this.three.addMesh(mesh);
   }
  
}

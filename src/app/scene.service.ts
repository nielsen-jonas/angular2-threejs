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
    private cannonMaterials: any[] = [];
    private cannonContactMaterials: any[] = [];
    private threeMaterials: any[] = [];

    constructor(private cannon: CannonService, private three: ThreeService) {

        this.CANNON = this.cannon.getCannon();
        this.THREE = this.three.getThree();

        this.textureLoader = new this.THREE.TextureLoader();
        this.textures['sign-arrow'] = this.textureLoader.load('./assets/textures/sign_arrow.jpg');
        this.textures['concrete'] = this.textureLoader.load('./assets/textures/concrete.jpg');

        this.cannonMaterials['generic'] = new this.CANNON.Material();
        this.threeMaterials['sign-arrow'] = new this.THREE.MeshLambertMaterial({ map: this.textures['sign-arrow']});
        this.threeMaterials['concrete'] = new this.THREE.MeshLambertMaterial({ map: this.textures['concrete']});

        this.materials['sign-arrow'] = [];
        this.materials['concrete'] = [];
        this.materials['sign-arrow'] = new Material;
        this.materials['sign-arrow'].setThreeMaterial('sign-arrow');
        this.materials['concrete'] = new Material;
        this.materials['concrete'].setDensity(2515);
        this.materials['concrete'].setThreeMaterial('concrete');

        this.cannonContactMaterials.push(new this.CANNON.ContactMaterial(this.cannonMaterials['generic'], this.cannonMaterials['generic'], {
            friction: 0.8,
            restitution: 0.0
        }));
        this.cannonContactMaterials[0].contactEquationStiffness = 1e8;
        this.cannonContactMaterials[0].contactEquationRegularizationTime = 3;
        this.cannon.addContactMaterial(this.cannonContactMaterials[0]);
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

    public createBox(conf) {
        if (typeof conf.position == 'undefined') { conf.position = [0,0,0] };
        if (typeof conf.dimensions == 'undefined') { conf.dimensions = [1,1,1]};
        if (typeof conf.static == 'undefined') { conf.static = false };
        if (typeof conf.material == 'undefined') { conf.material = 'sign-arrow' };
        if (typeof conf.velocity == 'undefined') { conf.velocity = [0,0,0] };

        // Cannon Body
        let shape = new this.CANNON.Box(new this.CANNON.Vec3(conf.dimensions[0], conf.dimensions[1], conf.dimensions[2]));
        let mass = conf.static ? 0 : this.materials[conf.material].getDensity() * shape.volume();

        let body = new this.CANNON.Body({
            material: this.cannonMaterials[this.materials[conf.material].getCannonMaterial()],
            mass: mass,
            shape: shape,
            position: new this.CANNON.Vec3(conf.position[0], conf.position[1], conf.position[2]),
            velocity: new this.CANNON.Vec3(conf.velocity[0], conf.velocity[1], conf.velocity[2])
        });

        // Three Mesh
        let geometry = new this.THREE.BoxGeometry(conf.dimensions[0]*2, conf.dimensions[1]*2, conf.dimensions[2]*2);
        let mesh = new this.THREE.Mesh(geometry, this.threeMaterials[this.materials[conf.material].getThreeMaterial()]);
        
        this.instantiate(body, mesh);
    }

    public createSphere(conf) {
        if (typeof conf.position == 'undefined') { conf.position = [0,0,0] };
        if (typeof conf.radius == 'undefined') { conf.radius = 1 };
        if (typeof conf.static == 'undefined') { conf.static = false };
        if (typeof conf.material == 'undefined') { conf.material = 'sign-arrow' };
        if (typeof conf.velocity == 'undefined') { conf.velocity = [0,0,0] };


        // Cannon Body
        let shape = new this.CANNON.Sphere(conf.radius);
        let mass = conf.static ? 0 : this.materials[conf.material].getDensity() * shape.volume();

        let body = new this.CANNON.Body({
            material: this.cannonMaterials[this.materials[conf.material].getCannonMaterial()],
            mass: mass,
            shape: shape,
            position: new this.CANNON.Vec3(conf.position[0], conf.position[1], conf.position[2]),
            velocity: new this.CANNON.Vec3(conf.velocity[0], conf.velocity[1], conf.velocity[2])
        });
        
        // Three Mesh
        let geometry = new this.THREE.SphereGeometry(conf.radius, 16, 16);
        let mesh = new this.THREE.Mesh(geometry, this.threeMaterials[this.materials[conf.material].getThreeMaterial()]);

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

export class Material {
    private density: number = 1000;
    private cannonMaterial: string = 'generic';
    private threeMaterial: string = 'generic';

    public getDensity() {
        return this.density;
    }

    public getCannonMaterial() {
        return this.cannonMaterial;
    }

    public getThreeMaterial() {
        return this.threeMaterial;
    }

    public setDensity(density: number) {
        this.density = density;
    }

    public setCannonMaterial(material: string) {
        this.cannonMaterial = material;
    }

    public setThreeMaterial(material: string) {
        this.threeMaterial = material;
    }
}

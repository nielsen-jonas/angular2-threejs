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
        this.cannonMaterials['concrete'] = new this.CANNON.Material();
        this.cannonMaterials['soccer-ball'] = new this.CANNON.Material();
        this.cannonMaterials['spring'] = new this.CANNON.Material();
        this.cannonMaterials['frictionless'] = new this.CANNON.Material();

        this.threeMaterials['sign-arrow'] = new this.THREE.MeshLambertMaterial({ map: this.textures['sign-arrow']});
        this.threeMaterials['concrete'] = new this.THREE.MeshLambertMaterial({ map: this.textures['concrete']});
        this.threeMaterials['orange'] = new this.THREE.MeshLambertMaterial({ color: 0xffbd4a });
        this.threeMaterials['blue'] = new this.THREE.MeshLambertMaterial({ color: 0x2b50b3 });

        this.materials['soccer-ball'] = new Material;
        this.materials['soccer-ball'].setWeight(.45);
        this.materials['soccer-ball'].setCannonMaterial('soccer-ball');
        this.materials['soccer-ball'].setThreeMaterial('sign-arrow');
        this.materials['concrete'] = new Material;
        this.materials['concrete'].setDensity(25.15);
        this.materials['concrete'].setCannonMaterial('concrete');
        this.materials['concrete'].setThreeMaterial('concrete');
        this.materials['spring'] = new Material;
        this.materials['spring'].setCannonMaterial('spring');
        this.materials['spring'].setThreeMaterial('orange');
        this.materials['player'] = new Material;
        this.materials['player'].setDensity(9.85);
        this.materials['player'].setCannonMaterial('frictionless');
        this.materials['player'].setThreeMaterial('blue');
        
        // Frictionless vs concrete
        this.cannonContactMaterials.push(new this.CANNON.ContactMaterial(this.cannonMaterials['frictionless'], this.cannonMaterials['concrete'], {
            friction: 0.0,
            restitution: 0.0
        }));
        
        // Concrete vs concrete
        this.cannonContactMaterials.push(new this.CANNON.ContactMaterial(this.cannonMaterials['concrete'], this.cannonMaterials['concrete'], {
            friction: 0.02,
            restitution: 0.0
        }));

        // Soccer ball vs soccer ball
        this.cannonContactMaterials.push(new this.CANNON.ContactMaterial(this.cannonMaterials['soccer-ball'], this.cannonMaterials['soccer-ball'], {
            friction: 0.04,
            restitution: 0.4
        }));
        
        // Concrete vs soccer ball
        this.cannonContactMaterials.push(new this.CANNON.ContactMaterial(this.cannonMaterials['concrete'], this.cannonMaterials['soccer-ball'], {
            friction: 0.04,
            restitution: 0.4
        }));

        // Soccer ball vs spring
        this.cannonContactMaterials.push(new this.CANNON.ContactMaterial(this.cannonMaterials['soccer-ball'], this.cannonMaterials['spring'], {
            friction: 0.04,
            restitution: 1.8 
        }));

        // Tune contacts
        for (let i = 0, len = this.cannonContactMaterials.length; i < len; i++) {
            this.cannonContactMaterials[i].contactEquationStiffness = 1e8;
            this.cannonContactMaterials[i].contactEquationRegularizationTime = 1; // Larger value => softer contact
        }
        
        // Send contacts to cannon
        this.addContactMaterials(this.cannonContactMaterials);
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
        conf = this.filterConfiguration(conf, 'box');

        // Cannon Body
        let shape = new this.CANNON.Box(new this.CANNON.Vec3(conf.dimensions[0], conf.dimensions[1], conf.dimensions[2]));
        let mass = this.calculateMass(conf, shape.volume());
        console.log('MASS', mass);
        
        let body = new this.CANNON.Body({
            material: this.cannonMaterials[this.materials[conf.material].getCannonMaterial()],
            mass: mass,
            shape: shape,
            position: new this.CANNON.Vec3(conf.position[0], conf.position[1], conf.position[2]),
            quaternion: new this.CANNON.Quaternion(conf.rotation[0],conf.rotation[1],conf.rotation[2]),
            velocity: new this.CANNON.Vec3(conf.velocity[0], conf.velocity[1], conf.velocity[2]),
            allowSleep: true,
            fixedRotation: conf.fixedRotation
        });

        // Three Mesh
        let geometry = new this.THREE.BoxGeometry(conf.dimensions[0]*2, conf.dimensions[1]*2, conf.dimensions[2]*2);
        let mesh = new this.THREE.Mesh(geometry, this.threeMaterials[this.materials[conf.material].getThreeMaterial()]);
        
        this.instantiate(body, mesh);
    }

    public createCylinder(conf) {
        conf = this.filterConfiguration(conf, 'cylinder');

        // Cannon Body
        let shape = new this.CANNON.Cylinder(conf.radiusTop, conf.radiusBottom, conf.height, conf.radiusSegments);
        let mass = this.calculateMass(conf, shape.volume());

        // Transform body to work with Three
        let quat = new this.CANNON.Quaternion();
        quat.setFromAxisAngle(new this.CANNON.Vec3(1,0,0), -Math.PI/2);
        let translation = new this.CANNON.Vec3(0,0,0);
        shape.transformAllPoints(translation, quat);

        let body = new this.CANNON.Body({
            material: this.cannonMaterials[this.materials[conf.material].getCannonMaterial()],
            mass: mass,
            shape: shape,
            position: new this.CANNON.Vec3(conf.position[0], conf.position[1], conf.position[2]),
            quaternion: new this.CANNON.Quaternion(conf.rotation[0], conf.rotation[1], conf.rotation[2]),
            velocity: new this.CANNON.Vec3(conf.velocity[0], conf.velocity[1], conf.velocity[2]),
            linearDamping: 0.2,
            angularDamping: 0.2,
            allowSleep: true,
            fixedRotation: conf.fixedRotation
        });


        // Three Mesh
        let geometry = new this.THREE.CylinderGeometry(conf.radiusTop, conf.radiusBottom, conf.height, conf.radiusSegments);
        let mesh = new this.THREE.Mesh(geometry, this.threeMaterials[this.materials[conf.material].getThreeMaterial()]);

        this.instantiate(body, mesh);
    }

    public createSphere(conf) {
        conf = this.filterConfiguration(conf, 'sphere');

        // Cannon Body
        let shape = new this.CANNON.Sphere(conf.radius);
        let mass = this.calculateMass(conf, shape.volume());

        let body = new this.CANNON.Body({
            material: this.cannonMaterials[this.materials[conf.material].getCannonMaterial()],
            mass: mass,
            shape: shape,
            position: new this.CANNON.Vec3(conf.position[0], conf.position[1], conf.position[2]),
            quaternion: new this.CANNON.Quaternion(conf.rotation[0],conf.rotation[1],conf.rotation[2]),
            velocity: new this.CANNON.Vec3(conf.velocity[0], conf.velocity[1], conf.velocity[2]),
            linearDamping: 0.2,
            angularDamping: 0.2,
            allowSleep: true,
            fixedRotation: conf.fixedRotation
        });
        
        // Three Mesh
        let geometry = new this.THREE.SphereGeometry(conf.radius, 16, 16);
        let mesh = new this.THREE.Mesh(geometry, this.threeMaterials[this.materials[conf.material].getThreeMaterial()]);

        this.instantiate(body, mesh);
    };

    private filterConfiguration(conf, type: string) {
        if (typeof conf.position == 'undefined') { conf.position = [0,0,0] };
        if (typeof conf.rotation == 'undefined') { conf.rotation = [0,0,0] };
        if (typeof conf.material == 'undefined') { conf.material = 'concrete' };
        if (typeof conf.velocity == 'undefined') { conf.velocity = [0,0,0] };
        if (typeof conf.static == 'undefined') { conf.static = false };
        if (typeof conf.fixedRotation == 'undefined') { conf.fixedRotation = false };
        if (typeof conf.linearDamping == 'undefined') { conf.linearDamping = 0.0 };
        if (typeof conf.angularDamping == 'undefined') { conf.angularDamping = 0.0 };
        switch (type) {
            case 'box':
                break;
            case 'cylinder':
                if (typeof conf.radius == 'undefined') { conf.radius = 1 };
                if (typeof conf.radiusTop == 'undefined') { conf.radiusTop = conf.radius };
                if (typeof conf.radiusBottom == 'undefined') { conf.radiusBottom = conf.radius };
                if (typeof conf.height == 'undefined') { conf.height = 1 };
                if (typeof conf.radiusSegments == 'undefined') { conf.radiusSegments = 16 };
                break;
            case 'sphere':
                if (typeof conf.radius == 'undefined') { conf.radius = 1 };
                conf.linearDamping = 0.2;
                conf.angularDamping = 0.2;
                break
        }
        return conf;
    }

    private calculateMass(conf, volume) {
        let mass = 0;
        if (!conf.static) {
            if (typeof conf.weight != 'undefined' && conf.weight.isInteger()) {
                mass = conf.weight;
            } else if (typeof conf.density != 'undefined' && conf.density.isInteger()) {
                mass = conf.density * volume;
            } else if (typeof this.materials[conf.material].getWeight() != 'undefined') {
                mass = this.materials[conf.material].getWeight();
            } else {
                mass = this.materials[conf.material].getDensity() * volume;
            }
        }
        return mass;
    }

    private addContactMaterials(contactMaterials: any[]) {
        for (let i = 0, len = contactMaterials.length; i < len; i++) {
            this.cannon.addContactMaterial(contactMaterials[i]);
        }
    }

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
    //private density: number = 2000;
    private density: number = 1;
    private weight: number;
    private cannonMaterial: string = 'generic';
    private threeMaterial: string = 'generic';

    public getDensity() {
        return this.density;
    }

    public getWeight() {
        return this.weight;
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

    public setWeight(weight: number) {
        this.weight = weight;
    }

    public setCannonMaterial(material: string) {
        this.cannonMaterial = material;
    }

    public setThreeMaterial(material: string) {
        this.threeMaterial = material;
    }
}

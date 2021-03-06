import { Injectable, EventEmitter, Output } from '@angular/core';
import { CannonService } from './cannon.service';
import { ThreeService } from './three.service';

@Injectable()
export class SceneService {

    private CANNON: any;
    private THREE: any;

    private objects: any[] = [];
    private objectCount: number = 0;
    @Output() private objectRemoved: EventEmitter<any> = new EventEmitter;

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
        this.textures['snow-1'] = this.textureLoader.load('./assets/textures/SnowIceTexture0006.jpg');
        this.textures['snow-ground'] = this.textureLoader.load('./assets/textures/SnowIceTexture0006.jpg');
        this.textures['snow-ground'].wrapS = this.textures['snow-ground'].wrapT = this.THREE.RepeatWrapping;
        this.textures['snow-ground'].repeat.set(64,64);
        this.textures['snowman-head'] = this.textureLoader.load('./assets/textures/snowman_head.jpg');
        
        this.cannonMaterials['generic'] = new CannonMaterialContainer(new this.CANNON.Material());
        this.cannonMaterials['concrete'] = new CannonMaterialContainer(new this.CANNON.Material());
        this.cannonMaterials['concrete'].setFriction(.16);
        this.cannonMaterials['concrete'].setRestitution(0);
        this.cannonMaterials['concrete'].setDensityReal(2515);
        this.cannonMaterials['soccer-ball'] = new CannonMaterialContainer(new this.CANNON.Material());
        this.cannonMaterials['soccer-ball'].setFriction(.01);
        this.cannonMaterials['soccer-ball'].setRestitution(.04);
        this.cannonMaterials['soccer-ball'].setWeight(.0045);
        this.cannonMaterials['spring'] = new CannonMaterialContainer(new this.CANNON.Material());
        this.cannonMaterials['spring'].setFriction(.1);
        this.cannonMaterials['spring'].setRestitution(1.8);
        this.cannonMaterials['player'] = new CannonMaterialContainer(new this.CANNON.Material());
        this.cannonMaterials['player'].setFriction(.1);
        this.cannonMaterials['player'].setRestitution(0);
        this.cannonMaterials['player'].setDensityReal(500);
        this.cannonMaterials['snow'] = new CannonMaterialContainer(new this.CANNON.Material());
        this.cannonMaterials['snow'].setFriction(.01);
        this.cannonMaterials['snow'].setRestitution(0);
        this.cannonMaterials['snow'].setDensityReal(500);

        this.threeMaterials['sign-arrow'] = new this.THREE.MeshLambertMaterial({ map: this.textures['sign-arrow']});
        this.threeMaterials['concrete'] = new this.THREE.MeshLambertMaterial({ map: this.textures['concrete']});
        this.threeMaterials['snow-1'] = new this.THREE.MeshLambertMaterial({
            map: this.textures['snow-1'],
            color: 0xf2f5f7
        });
        this.threeMaterials['snow-ground'] = new this.THREE.MeshLambertMaterial({
            map: this.textures['snow-ground'],
            color: 0xf2f5f7
        });
        this.threeMaterials['snowman-head'] = new this.THREE.MeshLambertMaterial({
            map: this.textures['snowman-head'],
            color: 0xf2f5f7
        });
        this.threeMaterials['orange'] = new this.THREE.MeshLambertMaterial({ color: 0xffbd4a });
        this.threeMaterials['blue'] = new this.THREE.MeshLambertMaterial({ color: 0x2b50b3 });

        this.materials['soccer-ball'] = new Material;
        this.materials['soccer-ball'].setCannonMaterialRef('soccer-ball');
        this.materials['soccer-ball'].setThreeMaterialRef('sign-arrow');
        this.materials['concrete'] = new Material;
        this.materials['concrete'].setCannonMaterialRef('concrete');
        this.materials['concrete'].setThreeMaterialRef('concrete');
        this.materials['spring'] = new Material;
        this.materials['spring'].setCannonMaterialRef('spring');
        this.materials['spring'].setThreeMaterialRef('orange');
        this.materials['player'] = new Material;
        this.materials['player'].setCannonMaterialRef('player');
        this.materials['player'].setThreeMaterialRef('snow-1');
        this.materials['player-head'] = new Material;
        this.materials['player-head'].setCannonMaterialRef('player');
        this.materials['player-head'].setThreeMaterialRef('snowman-head');
        this.materials['snow'] = new Material;
        this.materials['snow'].setCannonMaterialRef('snow');
        this.materials['snow'].setThreeMaterialRef('snow-1');
        this.materials['snow-ground'] = new Material;
        this.materials['snow-ground'].setCannonMaterialRef('snow');
        this.materials['snow-ground'].setThreeMaterialRef('snow-ground');

        // Player vs player 
        this.cannonContactMaterials.push(new this.CANNON.ContactMaterial(this.cannonMaterials['player'], this.cannonMaterials['spring'], {
            friction: 0.0,
            restitution: 0.0
        }));

        // Autmatically generate contact materials for every contact combination
        let ignoreCombinations = [
            ['player', 'player'],
            //['player', 'concrete'],
        ];

        let combinations = uniqueCombinations(this.cannonMaterials);
        for (let i = 0, len = combinations.length; i < len; i++) {
            let accepted = true;
            for (let _i = 0, _len = ignoreCombinations.length; _i < _len; _i++) {
                let ignore = ignoreCombinations[_i];
                let combination = combinations[i];
                if (
                    (ignore[0] === combination[0] && ignore[1] === combination[1]) ||
                    (ignore[1] === combination[0] && ignore[0] === combination[1])) {
                    accepted = false;
                }
            }
            if (accepted) {
                let frictionA = this.cannonMaterials[combinations[i][0]].getFriction();
                let frictionB = this.cannonMaterials[combinations[i][1]].getFriction();
                let friction = (frictionA + frictionB)*.5;
                let restitutionA = this.cannonMaterials[combinations[i][0]].getRestitution();
                let restitutionB = this.cannonMaterials[combinations[i][1]].getRestitution();
                let restitution = (restitutionA + restitutionB)*.5;
                let stiffnessA = this.cannonMaterials[combinations[i][0]].getContactEquationStiffness();
                let stiffnessB = this.cannonMaterials[combinations[i][1]].getContactEquationStiffness();
                let stiffness = (stiffnessA + stiffnessB)*.5;
                let softnessA = this.cannonMaterials[combinations[i][0]].getContactEquationRegularizationTime();
                let softnessB = this.cannonMaterials[combinations[i][1]].getContactEquationRegularizationTime();
                let softness = (softnessA + softnessB)*.5;
                this.cannonContactMaterials.push(new this.CANNON.ContactMaterial(this.cannonMaterials[combinations[i][0]], this.cannonMaterials[combinations[i][1]], {
                    friction: friction,
                    restitution: restitution,
                    contactEquationStiffness: stiffness,
                    contactEquationReqularizatinoTime: softness // Larger value => softer contact
                }));
            }
        }

        // Tune contacts
        for (let i = 0, len = this.cannonContactMaterials.length; i < len; i++) {
            this.cannonContactMaterials[i].contactEquationStiffness = 1e8;
            this.cannonContactMaterials[i].contactEquationRegularizationTime = 1; // Larger value => softer contact
        }
        
        // Send contacts to cannon
        this.addContactMaterials(this.cannonContactMaterials);
    }


    public clear() {
        for (let i = 0, len = this.objects.length; i < len; i++) {
            this.removeObject(i);
        }
        this.objects = [];
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
        
        let body = new this.CANNON.Body({
            material: this.cannonMaterials[this.materials[conf.material].getCannonMaterialRef()],
            mass: mass,
            shape: shape,
            position: new this.CANNON.Vec3(conf.position[0], conf.position[1], conf.position[2]),
            quaternion: new this.CANNON.Quaternion(conf.rotation[0],conf.rotation[1],conf.rotation[2]),
            velocity: new this.CANNON.Vec3(conf.velocity[0], conf.velocity[1], conf.velocity[2]),
            linearDamping: conf.linearDamping,
            angularDamping: conf.angularDamping,
            allowSleep: conf.allowSleep,
            fixedRotation: conf.fixedRotation,
            collisionFilterGroup: conf.collisionFilterGroup,
            collisionFilterMask: conf.collisionFilterMask,
            sleepSpeedLimit: conf.sleepSpeedLimit
        });

        // Three Mesh
        let geometry = new this.THREE.BoxGeometry(conf.dimensions[0]*2, conf.dimensions[1]*2, conf.dimensions[2]*2);
        let mesh = new this.THREE.Mesh(geometry, this.threeMaterials[this.materials[conf.material].getThreeMaterialRef()]);
        
        return this.instantiate(body, mesh);
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
            material: this.cannonMaterials[this.materials[conf.material].getCannonMaterialRef()],
            mass: mass,
            shape: shape,
            position: new this.CANNON.Vec3(conf.position[0], conf.position[1], conf.position[2]),
            quaternion: new this.CANNON.Quaternion(conf.rotation[0], conf.rotation[1], conf.rotation[2]),
            velocity: new this.CANNON.Vec3(conf.velocity[0], conf.velocity[1], conf.velocity[2]),
            linearDamping: conf.linearDamping,
            angularDamping: conf.angularDamping,
            allowSleep: conf.allowSleep,
            fixedRotation: conf.fixedRotation,
            collisionFilterGroup: conf.collisionFilterGroup,
            collisionFilterMask: conf.collisionFilterMask,
            sleepSpeedLimit: conf.sleepSpeedLimit
        });


        // Three Mesh
        let geometry = new this.THREE.CylinderGeometry(conf.radiusTop, conf.radiusBottom, conf.height, conf.radiusSegments);
        let mesh = new this.THREE.Mesh(geometry, this.threeMaterials[this.materials[conf.material].getThreeMaterialRef()]);

        return this.instantiate(body, mesh);
    }

    public createSphere(conf) {
        conf = this.filterConfiguration(conf, 'sphere');

        // Cannon Body
        let shape = new this.CANNON.Sphere(conf.radius);
        let mass = this.calculateMass(conf, shape.volume());

        let body = new this.CANNON.Body({
            material: this.cannonMaterials[this.materials[conf.material].getCannonMaterialRef()],
            mass: mass,
            shape: shape,
            position: new this.CANNON.Vec3(conf.position[0], conf.position[1], conf.position[2]),
            quaternion: new this.CANNON.Quaternion(conf.rotation[0],conf.rotation[1],conf.rotation[2]),
            velocity: new this.CANNON.Vec3(conf.velocity[0], conf.velocity[1], conf.velocity[2]),
            linearDamping: conf.linearDamping,
            angularDamping: conf.angularDamping,
            allowSleep: conf.allowSleep,
            fixedRotation: conf.fixedRotation,
            collisionFilterGroup: conf.collisionFilterGroup,
            collisionFilterMask: conf.collisionFilterMask,
            sleepSpeedLimit: conf.sleepSpeedLimit
        });
        
        // Three Mesh
        let geometry = new this.THREE.SphereGeometry(conf.radius, 16, 16);
        let mesh = new this.THREE.Mesh(geometry, this.threeMaterials[this.materials[conf.material].getThreeMaterialRef()]);

        return this.instantiate(body, mesh);
    };

    private filterConfiguration(conf, type: string) {
        if (typeof conf.position == 'undefined') { conf.position = [0,0,0] }
        if (typeof conf.rotation == 'undefined') { conf.rotation = [0,0,0] }
        if (typeof conf.material == 'undefined') { conf.material = 'concrete' }
        if (typeof conf.velocity == 'undefined') { conf.velocity = [0,0,0] }
        if (typeof conf.static == 'undefined') { conf.static = false }
        if (typeof conf.fixedRotation == 'undefined') { conf.fixedRotation = false }
        if (typeof conf.collisionFilterGroup == 'undefined') { conf.collisionFilterGroup = 1}
        if (typeof conf.collisionFilterMask == 'undefined') { conf.collisionFilterMask = 1 | 2}
        if (typeof conf.allowSleep == 'undefined') { conf.allowSleep = true}
        if (typeof conf.sleepSpeedLimit == 'undefined') { conf.sleepSpeedLimit = 0.2 }
        switch (type) {
            case 'box':
                break;
            case 'cylinder':
                if (typeof conf.radius == 'undefined') { conf.radius = 1 }
                if (typeof conf.radiusTop == 'undefined') { conf.radiusTop = conf.radius }
                if (typeof conf.radiusBottom == 'undefined') { conf.radiusBottom = conf.radius }
                if (typeof conf.height == 'undefined') { conf.height = 1 }
                if (typeof conf.radiusSegments == 'undefined') { conf.radiusSegments = 16 }
                break;
            case 'sphere':
                if (typeof conf.radius == 'undefined') { conf.radius = 1 }
                if (typeof conf.linearDamping == 'undefined') { conf.linearDamping = 0.2 }
                if (typeof conf.angularDamping == 'undefined') { conf.angularDamping = 0.2 }
                break
        }
        if (typeof conf.linearDamping == 'undefined') { conf.linearDamping = 0.0 }
        if (typeof conf.angularDamping == 'undefined') { conf.angularDamping = 0.0 }
        return conf;
    }

    private calculateMass(conf, volume) {
        let mass = 0;
        if (!conf.static) {
            if (typeof conf.weight != 'undefined' && conf.weight.isInteger()) {
                mass = conf.weight;
            } else if (typeof conf.density != 'undefined' && conf.density.isInteger()) {
                mass = conf.density * volume;
            } else if (typeof this.cannonMaterials[this.materials[conf.material].getCannonMaterialRef()].getWeight() != 'undefined') {
                mass = this.cannonMaterials[this.materials[conf.material].getCannonMaterialRef()].getWeight();
            } else {
                mass = this.cannonMaterials[this.materials[conf.material].getCannonMaterialRef()].getDensity() * volume;
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
            this.objectRemoved.emit(object);
            return true;
        }
        return false;
    }

    public getObjectRemovedEmitter() {
        return this.objectRemoved;
    }

    private instantiate(body, mesh) {
       // Register Object
       let object = [body.id, mesh.id];
       this.objects.push(object);
       this.objectCount ++;

       // Add Object
       this.cannon.addBody(body);
       this.three.addMesh(mesh);
       return object;
   }
  
}

export class Material {
    private cannonMaterialRef: string = 'generic';
    private threeMaterialRef: string = 'generic';

    public getCannonMaterialRef() {
        return this.cannonMaterialRef;
    }

    public getThreeMaterialRef() {
        return this.threeMaterialRef;
    }

    public setCannonMaterialRef(materialRef: string) {
        this.cannonMaterialRef = materialRef;
    }

    public setThreeMaterialRef(materialRef: string) {
        this.threeMaterialRef = materialRef;
    }

}

export class CannonMaterialContainer {
    private material;
    private friction: number = 0.3;
    private restitution: number = 0.3;
    private density: number = 1;
    private weight: number;
    private contactEquationStiffness: number = 1e8; // contactEquationStiffness
    private contactEquationRegularizationTime: number = 1; // contactEquationRegularizationTime, Larger value => softer contact

    constructor(material) {
        this.material = material;
    }

    public getMaterial() {
        return this.material;
    }

    public getDensity(): number {
        return this.density;
    }

    public getWeight(): number {
        return this.weight;
    }

    public getFriction(): number {
        return this.friction;
    }

    public getRestitution(): number {
        return this.restitution;
    }

    public getContactEquationStiffness(): number {
        return this.contactEquationStiffness;
    }

    public getContactEquationRegularizationTime(): number {
        return this.contactEquationStiffness;
    }

    public setDensity(density: number) {
        this.density = density;
    }

    public setDensityReal(density: number) {
        this.density = density/100;
    }

    public setWeight(weight: number) {
        this.weight = weight;
    }

    public setFriction(friction: number) {
        this.friction = friction;
    }

    public setRestitution(restitution: number) {
        this.restitution = restitution;
    }

    public setContactEquationStiffness(stiffness: number) {
        this.contactEquationStiffness = stiffness;
    }

    public setContactEquationReqularizationTime(time: number) {
        this.contactEquationRegularizationTime = time;
    }
}

function uniqueCombinations(array) {
    let combined = [];
    for (let key1 in array) {
        for (let key2 in array) {
            let combination = [key1, key2].sort();
            let unique = true;
            for (let i = 0, len = combined.length; i < len; i++) {
                if (combined[i][0] === combination[0] && combined[i][1] === combination[1]) {
                    unique = false;
                    break;
                }
            }
            if (unique) {
                combined.push(combination);
            }
        }
    }
    return combined;
}

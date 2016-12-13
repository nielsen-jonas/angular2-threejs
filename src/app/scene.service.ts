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
        this.textures.push(this.textureLoader.load('./assets/textures/concrete.jpg'));
        this.materials['concrete'] = new this.THREE.MeshLambertMaterial({ map: this.textures[1]});
    }

    public update() {
        for (let i = 0, len = this.objects.length; i < len; i++) {
            let body = this.cannon.getBodyById(this.objects[i][0]);
            this.three.updateMesh(this.objects[i][1], body.position, body.quaternion);
        }
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

    private removeObject(bodyId) {
    }

    private instantiate(body, mesh) {
        // Register Object
        let object = [body.id, mesh.id];
        this.objects.push(object);

        // Add Object
        this.cannon.addBody(body);
        this.three.sceneAdd(mesh);
    }
  
}

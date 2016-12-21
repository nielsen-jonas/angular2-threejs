export function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
}

export let lvl0 = function() {
    this.startingPosition = {
        x: 0,
        y: 15,
        z: 0 
    };

    // Cylinder
    this.objects.push(this.scene.createCylinder({
        position: [35,47,0],
        rotation: [1,0,0],
        velocity: [-10,0,0],
        radius: 1.4,
        height: 4,
        material: 'concrete',
        radiusSegments: 32,
        angularDamping: 0.0,
        linearDamping: 0.0
    }));
    
    // Plank
    this.objects.push(this.scene.createBox({
        position: [6.2,4,0],
        dimensions: [5,.5,2],
        rotation: [0,0,.2],
        static: true,
        material: 'concrete'
    }));

    for (let x = -36; x < 2; x += 12){
        // floors
        this.objects.push(this.scene.createBox({
            position: [x-.5,-1,0],
            dimensions: [.8,.3,5],
            static: true,
            material: 'concrete' 
        }));

        for (let z = -2; z < 3; z += 1) {
            // pillars
            this.objects.push(this.scene.createBox({
                position: [x,7,z],
                dimensions: [.3,6,.45],
                material: 'concrete' 
            }));
        }
    }

    // floors
    for (let x = -60; x < -40; x += 10){
        this.objects.push(this.scene.createBox({
            position: [x,1,0],
            dimensions: [5,.3,5],
            static: true,
            material: 'concrete' 
        }));
    }
}

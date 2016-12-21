
export let lvl0 = function() {
    this.startingPosition = {
        x: -2.5,
        y: 50,
        z: 6.5 
    };

    this.objects.push(this.scene.createBox({
        position: [16, 5, .4],
        dimensions: [.2, 1, 1],
        static: true,
        material: 'spring'
    }));
    
    this.objects.push(this.scene.createSphere({
        position: [11,6,0],
        radius: 1,
        material: 'concrete',
        angularDamping: 0.01
    }));
    
    this.objects.push(this.scene.createBox({
        position: [11, 3.2, 0],
        dimensions: [.04,.2,.04],
        static: true,
        material: 'concrete'
    }));
    this.objects.push(this.scene.createBox({
        position: [6.2,2,0],
        dimensions: [5,.1,.4],
        rotation: [0,0,.1],
        static: true,
        material: 'concrete'
    }));

    // Step
    this.objects.push(this.scene.createBox({
        position: [-2.5,-2.7,1.5],
        dimensions: [1.2,2,6.5],
        static: true,
        material: 'concrete'
    }));

    for (let x = -30; x < 10; x += 10){
        // floors
        this.objects.push(this.scene.createBox({
            position: [x-.5,-1,0],
            dimensions: [.8,.3,5],
            static: true,
            material: 'concrete' 
        }));

        // spring
        this.objects.push(this.scene.createBox({
            position: [x-7, -1.5,6],
            dimensions: [1, .2, 1],
            static: true,
            material: 'spring'
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
    for (let x = -55; x < -35; x += 10){
        this.objects.push(this.scene.createBox({
            position: [x,0,0],
            dimensions: [5,.3,5],
            static: true,
            material: 'concrete' 
        }));
    }
}

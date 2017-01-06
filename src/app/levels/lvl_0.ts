export let lvl0Init = function() {
    this.memory['meteorite-clock'] = 0;
    this.memory['point-a'] = false;
    this.startingPosition = {
        x: 0,
        y: 5,
        z: 40 
    };

    this.objects.push(this.scene.createBox({
        position: [0, 0, 25],
        dimensions: [4, .3, 16],
        static: true,
        material: 'concrete'
    }));

    this.assoc['cylinder'] = this.scene.createCylinder({
        position: [20,25,0],
        rotation: [1,0,0],
        velocity: [-8,0,0],
        radius: 1.4,
        height: 4,
        material: 'concrete',
        radiusSegments: 32,
        angularDamping: 0.0,
        linearDamping: 0.0
    });
    
    // Plank
    this.objects.push(this.scene.createBox({
        position: [6.2,4,0],
        dimensions: [5,.5,2],
        rotation: [0,0,.2],
        static: true,
        material: 'concrete'
    }));

    for (let x = -48, i = 0; x < 2; x += 12, i++){
        // floors
        this.objects.push(this.scene.createBox({
            position: [x-.5,-1,0],
            dimensions: [.8,.3,5],
            static: true,
            material: 'concrete' 
        }));

        for (let z = -2; z < 3; z += 2) {
            // pillars
            this.objects.push(this.scene.createBox({
                position: [x,7.5,z],
                dimensions: [.3,7,.2+i*.1],
                material: 'concrete' 
            }));
        }
    }

    // floors
    for (let x = -72; x < -52; x += 10){
        this.objects.push(this.scene.createBox({
            position: [x,1,0],
            dimensions: [5,.3,5],
            static: true,
            material: 'concrete' 
        }));
    }
}

export let lvl0Loop = function (step) {
    if (this.memory['point-a']) {
        this.win();
    }
    //console.log(this.player.getBalls().length);
    //console.log(this.player.getBallBodies());
    //console.log(this.player.getMidPosition());
    if (!this.memory['point-a']) {
        if (this.memory['meteorite-clock'] <= 0) {
            this.memory['meteorite-clock'] = .1*getRandomInt(1,10);
            let x = getRandomInt(20,100);
            let z = getRandomInt(-20,20);
            this.objects.push(this.scene.createSphere({
                position: [x,200,z],
                radius: getRandomInt(1,2),
                velocity: [-20, 0, 0],
                material: 'concrete'
            }));
        } else { this.memory['meteorite-clock'] -= step }
        
        let position = this.player.getMidPosition();
        if (
            position.x <= -60 && position.x >= -80 &&
            position.z >= -5 && position.z <= 5 &&
            position.y >= 0 && position.y <= 10) {
            this.memory['point-a'] = true;
        }
    }
}

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
}

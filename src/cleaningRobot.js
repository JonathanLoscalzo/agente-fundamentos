class World {
    constructor(numFloors) {
        this.location = 0;
        this.floors = [];
        for (let i = 0; i < numFloors; i++) {
            this.floors.push({ dirty: false });
        }
    }

    markFloorDirty(floorNumber) {
        this.floors[floorNumber].dirty = true;
    }

    simulate(action) {
        switch (action) {
            case 'SUCK':
                this.floors[this.location].dirty = false;
                break;
            case 'LEFT':
                this.location = 0;
                break;
            case 'RIGHT':
                this.location = 1;
                break;
        }

        return action;
    }
}

class Agent extends World {
    constructor(numFloors) {
        super(numFloors);
        this.numFloors = numFloors;
        this.medidaRendimiento = { sucks: 0, moves: 0 };
    }

    markFloorDirty(floorNumber) {
        this.floors[floorNumber].dirty = true;
    }

    isDirty() {
        return this.floors[this.location].dirty;
    }

    getMedidaRendimiento() {
        return 0;
    }

    simulate(action) {
        this.medidaRendimiento.moves++;
        switch (action) {
            case Action.Suck():
                this.floors[this.location].dirty = false;
                this.medidaRendimiento.sucks++;
                break;
            case Action.Left():
                if (this.location > 0) { this.location-- };
                break;
            case Action.Right():
                if (this.location < this.numFloors) { this.location++ };
                break;
            case Action.NoOperation():

                break;
        }

        return action;
    }
}



class Action {
    static Right() { return "RIGHT" };
    static Left() { return "LEFT" };
    static Suck() { return "SUCK" };
    static NoOperation() { return "NOOP" };
}

/**
 * va hacía la derecha o hacia la izquierda siempre
 */
class ReflexVacuumAgent {
    constructor(world) {
        this.direction = Action.Right;
        this.world = world;
    }

    /**
     * Retorna la proxima dirección de movimiento
     */
    next() {
        if (this.world.location == this.world.numFloors - 1) {
            this.direction = Action.Left();
        } else if (this.world.location == 0) {
            this.direction = Action.Right()
        }

        return this.direction;
    }

    /**
     * Si la localición está sucia, limpia.
     * Si no está sucia, se mueve hacia la siguiente direccion
     */
    execute() {
        if (this.world.isDirty()) {
            return this.world.simulate(Action.Suck());
        } else {
            return this.world.simulate(this.next());
        }
    }

}

class NeuronalVacuumAgent {
    constructor(world) {
        this.world = world;
        this.net = new brain.NeuralNetwork();
        this.from = this.world.location;

        this.net.train([
            { input: { location: 0, dirty: true, from: 1 }, output: { "SUCK": 0.8, "LEFT": 0, "RIGHT": 0.2 } },
            { input: { location: 0, dirty: false, from: 1 }, output: { "SUCK": 0, "LEFT": 0, "RIGHT": 1 } },

            { input: { location: 1, dirty: true, from: 0 }, output: { "SUCK": 0.8, "LEFT": 0, "RIGHT": 0.2 } },
            { input: { location: 1, dirty: false, from: 0 }, output: { "SUCK": 0, "LEFT": 0.2, "RIGHT": 0.6 } },
            { input: { location: 1, dirty: true, from: 2 }, output: { "SUCK": 0.8, "LEFT": 0.2, "RIGHT": 0.0 } },
            { input: { location: 1, dirty: false, from: 2 }, output: { "SUCK": 0, "LEFT": 0.6, "RIGHT": 0.2 } },

            { input: { location: 2, dirty: true, from: 1 }, output: { "SUCK": 0.8, "LEFT": 0, "RIGHT": 0.2 } },
            { input: { location: 2, dirty: false, from: 1 }, output: { "SUCK": 0, "LEFT": 0.2, "RIGHT": 0.6 } },
            { input: { location: 2, dirty: true, from: 3 }, output: { "SUCK": 0.8, "LEFT": 0.2, "RIGHT": 0.0 } },
            { input: { location: 2, dirty: false, from: 3 }, output: { "SUCK": 0, "LEFT": 0.6, "RIGHT": 0.2 } },

            { input: { location: 3, dirty: true, from: 2 }, output: { "SUCK": 0.8, "LEFT": 0.2, "RIGHT": 0 } },
            { input: { location: 3, dirty: false, from: 2 }, output: { "SUCK": 0, "LEFT": 1, "RIGHT": 0 } },
        ])
    }

    execute() {
        let input = { location: this.world.location, dirty: this.world.isDirty(), from: this.from }
        this.from = this.world.location;

        var output = this.net.run(input);

        let rule = { action: Action.NoOperation, estimacion: 0 };
        ["SUCK", "LEFT", "RIGHT"].forEach(function (i) {
            if (output[i] > rule.estimacion) {
                rule.action = i;
                rule.estimacion = output[i];
            }
        })

        var action = this.world.simulate(rule.action);


        return action;
    }
}

// class NeuronalVacuumAgent {
//     constructor(world) {
//         this.world = world;
//         this.net = new brain.NeuralNetwork();
//         this.from = this.world.location;

//         this.net.train([
//             { input: { location: 0, dirty: true, from: 1 }, output: { "SUCK": 0.8, "LEFT": 0, "RIGHT": 0.2 } },
//             { input: { location: 0, dirty: false, from: 1 }, output: { "SUCK": 0, "LEFT": 0, "RIGHT": 1 } },

//             { input: { location: 1, dirty: true, from: 0 }, output: { "SUCK": 0.8, "LEFT": 0, "RIGHT": 0.2 } },
//             { input: { location: 1, dirty: false, from: 0 }, output: { "SUCK": 0, "LEFT": 0.2, "RIGHT": 0.6 } },
//             { input: { location: 1, dirty: true, from: 2 }, output: { "SUCK": 0.8, "LEFT": 0.2, "RIGHT": 0.0 } },
//             { input: { location: 1, dirty: false, from: 2 }, output: { "SUCK": 0, "LEFT": 0.6, "RIGHT": 0.2 } },

//             { input: { location: 2, dirty: true, from: 1 }, output: { "SUCK": 0.8, "LEFT": 0, "RIGHT": 0.2 } },
//             { input: { location: 2, dirty: false, from: 1 }, output: { "SUCK": 0, "LEFT": 0.2, "RIGHT": 0.6 } },
//             { input: { location: 2, dirty: true, from: 3 }, output: { "SUCK": 0.8, "LEFT": 0.2, "RIGHT": 0.0 } },
//             { input: { location: 2, dirty: false, from: 3 }, output: { "SUCK": 0, "LEFT": 0.6, "RIGHT": 0.2 } },

//             { input: { location: 3, dirty: true, from: 2 }, output: { "SUCK": 0.8, "LEFT": 0.2, "RIGHT": 0 } },
//             { input: { location: 3, dirty: false, from: 2 }, output: { "SUCK": 0, "LEFT": 1, "RIGHT": 0 } },
//         ])
//     }

//     execute() {
//         let input = { location: this.world.location, dirty: this.world.isDirty(), from: this.from }
//         this.from = this.world.location;

//         var output = this.net.run(input);

//         let rule = { action: Action.NoOperation, estimacion: 0 };
//         ["SUCK", "LEFT", "RIGHT"].forEach(function (i) {
//             if (output[i] > rule.estimacion) {
//                 rule.action = i;
//                 rule.estimacion = output[i];
//             }
//         })

//         var action = this.world.simulate(rule.action);


//         return action;
//     }
// }

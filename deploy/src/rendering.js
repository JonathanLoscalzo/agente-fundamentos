
const SIZE = 100;
const colors = {
    perceptBackground: 'hsl(240,10%,85%)',
    perceptHighlight: 'hsl(60,100%,90%)',
    actionBackground: 'hsl(0,0%,100%)',
    actionHighlight: 'hsl(150,50%,80%)'
};


/* Create a diagram object that includes the world (model) and the svg
   elements (view) */
function makeDiagram(selector, world) {
    let diagram = {};
    diagram.world = world;
    diagram.xPosition = (floorNumber) => 150 + floorNumber * 600 / diagram.world.floors.length;

    diagram.root = d3.select(selector);
    diagram.robot = diagram.root.append('g')
        .attr('class', 'robot')
        .style('transform', `translate(${diagram.xPosition(world.location)}px,100px)`);

    diagram.robot.append('rect')
        .attr('width', SIZE)
        .attr('height', SIZE)
        .attr('fill', 'hsl(120,25%,50%)');

    diagram.perceptText = diagram.robot.append('text')
        .attr('x', SIZE / 2)
        .attr('y', -25)
        .attr('text-anchor', 'middle');

    diagram.actionText = diagram.robot.append('text')
        .attr('x', SIZE / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle');

    diagram.floors = [];

    for (let floorNumber = 0; floorNumber < world.floors.length; floorNumber++) {
        diagram.floors[floorNumber] =
            diagram.root.append('rect')
                .attr('class', 'clean floor') // for css
                .attr('x', diagram.xPosition(floorNumber))
                .attr('y', 225)
                .attr('width', SIZE)
                .attr('height', SIZE / 4)
                .attr('stroke', 'black')
                .on('click', function () {
                    world.markFloorDirty(floorNumber);
                    diagram.floors[floorNumber].attr('class', 'dirty floor');
                });
    }

    return diagram;
}


/* Rendering functions read from the state of the world (diagram.world) 
   and write to the state of the diagram (diagram.*). For most diagrams
   we only need one render function. For the vacuum cleaner example, to
   support the different styles (reader driven, agent driven) and the
   animation (agent perceives world, then pauses, then agent acts) I've
   broken up the render function into several. */

function renderWorld(diagram) {
    for (let floorNumber = 0; floorNumber < diagram.world.floors.length; floorNumber++) {
        diagram.floors[floorNumber]
            .attr('class', diagram.world.floors[floorNumber].dirty ? 'dirty floor' : 'clean floor');
    }

    diagram.robot.style('transform', `translate(${diagram.xPosition(diagram.world.location)}px,100px)`);
}

function renderAgentPercept(diagram, dirty) {
    let perceptLabel = {
        false: "It's clean",
        true: "It's dirty"
    }[dirty];

    diagram.perceptText.text(perceptLabel);
}

function renderAgentAction(diagram, action) {
    let actionLabel = {
        null: 'Waiting',
        'SUCK': 'Vacuuming',
        'LEFT': 'Going left',
        'RIGHT': 'Going right'
    }[action];

    diagram.actionText.text(actionLabel);
}

function render(diagram, percept, action) {
    renderWorld(diagram);
    renderAgentPercept(diagram, percept);
    renderAgentAction(diagram, action);
}

const STEP_TIME_MS = 1900;
const GENERATE_DIRTY = 10000;
function makeReflexVacuumAgentDiagram() {
    let world = new Agent(4), agentProgram = new ReflexVacuumAgent(world);

    let diagram = makeDiagram('#agent-controlled-diagram svg', world);

    let interval, generate_interval;

    function update() {
        let location = diagram.world.location;
        let percept = diagram.world.floors[location].dirty;
        var action = agentProgram.execute();
        render(diagram, percept, action);
    }

    function generate() {
        world.floors.forEach(function (val, index) {
            val.dirty = index % 2 == 0;
        });

        renderWorld(diagram);
    }

    function stop() {
        clearInterval(interval);
        clearInterval(generate_interval);
    }

    $("#generate-acd-world").on('click', function () {
        generate_interval = setInterval(generate, GENERATE_DIRTY);
        generate();
    });

    $("#start-acd-world").on('click', function () {
        update();
        interval = setInterval(update, STEP_TIME_MS);
    });
}

function makeNeuronalVacuumAgentDiagram() {
    let world = new Agent(4), agentProgram = new NeuronalVacuumAgent(world);
    let diagram = makeDiagram('#agent-neuronal-diagram svg', world);
    let interval, generate_interval;

    function update() {
        let location = diagram.world.location;
        let percept = diagram.world.floors[location].dirty;
        var action = agentProgram.execute();
        render(diagram, percept, action);
    }

    function generate() {
        world.floors.forEach(function (val, index) {
            val.dirty = index % 2 == 0;
        });

        renderWorld(diagram);
    }

    function stop() {
        clearInterval(interval);
        clearInterval(generate_interval);
    }

    $("#generate-and-world").on('click', function () {
        generate_interval = setInterval(generate, GENERATE_DIRTY);
        generate();
    });

    $("#start-and-world").on('click', function () {
        update();
        interval = setInterval(update, STEP_TIME_MS);
    });
}



$(document).ready(function () {
    makeReflexVacuumAgentDiagram();
    makeNeuronalVacuumAgentDiagram();
})
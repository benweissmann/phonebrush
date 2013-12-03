Meteor.startup(function() {
    "use strict";

    var renderer, camera, scene, controls;

    var renderNeeded = true;

    var lastPosition = [0, 0, 0];

    var lines = {}; // line id -> ExpandingLine

    var positionAvailable = PositionEstimator.isAvailable();

    var myLineId;
    var nextPointOrder = 0;
    if(positionAvailable) {
        myLineId = Lines.insert({
            color: RandomColor()
        });
    }

    function main() {
        // get new position estimate

        if(positionAvailable) {
            var pos = PositionEstimator.getPosition();
            Session.set("x", pos[0]);
            Session.set("y", pos[1]);
            Session.set("z", pos[2]);

            if((lastPosition[0] !== pos[0]) || (lastPosition[1] !== pos[1]) || (lastPosition[2] !== pos[2])) {
                lastPosition = pos;

                console.log("inserting");
                Points.insert({
                    line: myLineId,
                    x: pos[0],
                    y: pos[1],
                    z: pos[2],
                    order: nextPointOrder
                });

                nextPointOrder++;
            }
        }

        // handle mouse control interaction
        controls.update();

        // re-render if needed
        update();

        // request next frame
        window.requestAnimationFrame(main);
    }

    function init() {
        // set up camera and scene
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.z = 1000;

        scene = new THREE.Scene();


        // set up renderer
        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        document.getElementById("viewer").appendChild( renderer.domElement );


        // set up mouse controls
        controls = new THREE.TrackballControls( camera );

        controls.rotateSpeed = 5.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;

        controls.noZoom = false;
        controls.noPan = false;

        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;

        controls.keys = [ 65, 83, 68 ];

        controls.addEventListener( "change", function() {
            // when the camera is manipulated, we need to re-render
            renderNeeded = true;
        } );


        // watch the database and update the line geometries
        var cursor = Points.find({}, {sort: {order: 1}});
        cursor.observe({
            added: function(point) {
                var line = lines[point.line];

                if(!line) {
                    line = ExpandingLine(scene, Lines.findOne(point.line).color);
                    lines[point.line] = line;
                }

                line.addVertex(point.x, point.y, point.z);

                renderNeeded = true;
            }
        });

    }

    function update() {
        if(renderNeeded) {
            renderer.render( scene, camera );
            renderNeeded = false;
        }
    }

    // show position in console
    _.extend(Template.console, {
        x: function() {
            return Session.get("x");
        },
        y: function() {
            return Session.get("y");
        },
        z: function() {
            return Session.get("z");
        }
    });

    init();
    main();

    window.forceRender = function() {
        renderer.render( scene, camera );
    };
});
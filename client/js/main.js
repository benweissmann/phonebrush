Meteor.startup(function() {
    "use strict";

    var renderer, camera, scene, controls;

    var renderNeeded = true;

    var lastPosition = [0, 0, 0];

    var lines = {}; // line id -> ExpandingLine

    var positionAvailable = PositionEstimator.isAvailable();

    var myLineId = null;
    var nextPointOrder = 0;

    function main() {
        // get new position estimate

        if(positionAvailable) {
            var pos = PositionEstimator.getPosition();
            var vel = PositionEstimator.getVelocity();
            var accel = PositionEstimator.getAcceleration();

            $("#console-x").text(pos[0]);
            $("#console-y").text(pos[1]);
            $("#console-z").text(pos[2]);
            $("#console-x-vel").text(vel[0]);
            $("#console-y-vel").text(vel[1]);
            $("#console-z-vel").text(vel[2]);
            $("#console-x-accel").text(accel[0]);
            $("#console-y-accel").text(accel[1]);
            $("#console-z-accel").text(accel[2]);
            $("#console-drawing").text(THREE.touchIsDown);

            if(THREE.touchIsDown && ((lastPosition[0] !== pos[0]) || (lastPosition[1] !== pos[1]) || (lastPosition[2] !== pos[2]))) {
                lastPosition = pos;

                if(myLineId === null) {
                    myLineId = Lines.insert({
                        color: RandomColor()
                    });
                }

                Points.insert({
                    line: myLineId,
                    x: pos[0]*500,
                    y: pos[1]*500,
                    z: pos[2]*500,
                    order: nextPointOrder
                });

                nextPointOrder++;
            }

            if(!THREE.touchIsDown) {
                myLineId = null;
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


        var supportsWebGL = false;
        try {
          var canvas = document.createElement('canvas');
          supportsWebGL = !!window.WebGLRenderingContext &&
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch(e) {}
        // set up renderer
        if(supportsWebGL) {
            renderer = new THREE.WebGLRenderer();
        }
        else {
            renderer = new THREE.CanvasRenderer();
        }
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setClearColorHex( 0x000000, 1 );

        document.getElementById("viewer").appendChild( renderer.domElement );

        // axes
        var axes = new THREE.AxisHelper( 100 );
        scene.add( axes );


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
                    var width = 10;
                    if(point.line === myLineId) {
                        width = 25;
                    }

                    line = ExpandingLine(scene, {
                        color: Lines.findOne(point.line).color
                    });

                    lines[point.line] = line;
                }

                line.addVertex(point.x, point.y, point.z);

                renderNeeded = true;
            }
        });

        // clear button
        $(function() {
            $("#clear-btn").click(function() {
                Lines.find().forEach(function(line) {
                    Lines.remove({_id: line._id});
                });

                Points.find().forEach(function(point) {
                    Points.remove({_id: point._id});
                });

                scene._objects.forEach(function(obj) {
                    scene.remove(obj);
                });

                renderNeeded = true;
            });
        });
    }

    function update() {
        if(renderNeeded) {
            renderer.render( scene, camera );
            renderNeeded = false;
        }
    }

    init();
    main();

    window.forceRender = function() {
        renderer.render( scene, camera );
    };
});

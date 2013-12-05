// In three.js, lines must have a fixed number of vertices. This abstracts
// away the need to pre-allocate a large buffer and expand as neccesary.

(function(exports) {
    "use strict";

    exports.ExpandingLine = function(scene, opts) {
        var self = {};

        var material, geometry, bufferSize, line, bufferEnd;

        function init() {
            // default arguments
            var color = opts.color || 0x0000ff;
            var initialSize = opts.initialSize || 128;
            var width = opts.width || 5;

            // material
            material = new THREE.LineBasicMaterial({
                color: color,
                linewidth: width
            });

            // init buffer
            bufferSize = initialSize;
            expandBuffer();
            bufferEnd = -1;
        }

        function expandBuffer() {
            var oldGeometry = geometry;

            geometry = new THREE.Geometry();

            if(oldGeometry) {
                geometry.vertices = oldGeometry.vertices;
            }

            while(geometry.vertices.length < bufferSize) {
                geometry.vertices.push(new THREE.Vector3(0, 0, 0));
            }

            if(line) {
                scene.remove(line);
            }

            line = new THREE.Line(geometry, material, THREE.LinePieces);
            scene.add(line);
        }

        self.addVertex = function(x, y, z) {
            if(bufferEnd+2 >= bufferSize) {
                // we need to expand
                bufferSize = bufferSize*2;
                expandBuffer();
            }

            var vertex = new THREE.Vector3(x, y, z);

            if(bufferEnd === -1) {
                // special case first vertex
                geometry.vertices[0] = vertex;
                geometry.vertices[1] = vertex;
                bufferEnd = 1;
            }

            var prevVertex = geometry.vertices[bufferEnd];
            geometry.vertices[++bufferEnd] = prevVertex;
            geometry.vertices[++bufferEnd] = vertex;

            geometry.verticesNeedUpdate = true;
        };


        init();
        return self;
    };
})(this);

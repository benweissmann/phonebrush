(function(exports) {
    "use strict";

    var x, y, z; // add other state variables...

    exports.PositionEstimator = {
        // Returns true iff position estimates are available (e.g. we're
        // on a phone)
        isAvailable: function() {
            // TODO: implement
            return true;
        },

        // Returns the current estimate of [x, y, z] relative to the first
        // time getPosition was called.
        getPosition: function() {
            // TODO: implement
            return [0, 0, 0];
        }
    };


})(this);

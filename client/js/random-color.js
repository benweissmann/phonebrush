
(function(exports) {
    "use strict";

    var randomComponent = function() {
        return Math.round(Math.random() * 255);
    };

    exports.RandomColor = function() {
        return randomComponent() + (randomComponent() << 8) + (randomComponent() << 16);
    };
})(this);
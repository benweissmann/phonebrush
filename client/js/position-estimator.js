(function(exports) {
  "use strict";

  var x = 0, y = 0, z = 0;
  var startedGyro = false;

  exports.PositionEstimator = {
    // Returns true iff position estimates are available (e.g. we're
    // on a phone)
    isAvailable: function() {
      return (gyro.getFeatures().indexOf('devicemotion') != -1) || (gyro.getFeatures().indexOf('MozOrientation') != -1);
    },

    // Returns the current estimate of [x, y, z] relative to the first
    // time getPosition was called.
    getPosition: function() {
      if (!startedGyro) {
        startedGyro = true;
        gyro.startTracking(this._handleGyroUpdate);
      }
      return [x, y, z];
    },

    _handleGyroUpdate: function(event) {
      $('#x').text(event.x)
      $('#y').text(event.y)
      $('#z').text(event.z)
    }
  };


})(this);

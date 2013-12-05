/*(function(exports) {
  "use strict";

  var startedGyro = false;
  var pos = [0, 0, 0];
  var timestep = 50;

  var xUnit = $V([1, 0, 0]);
  var yUnit = $V([0, 1, 0]);
  var zUnit = $V([0, 0, 1]);

  exports.AngularEstimator = {

    getPosition: function() {
      AngularEstimator.startGyro();

      return pos;
    },

    startGyro: function() {
      if (startedGyro) {
        return;
      }

      startedGyro = true;
      gyro.frequency = timestep;
      gyro.calibarete();
      gyro.startTrcking(AngularEstimator._gyroUpdate);
    },

    _gyroUpdate: function(event) {
      var position = yUnit;
      var rotationXMatrix = $M([[1, 0, 0], [0, Math.cos(alpha),   

    }
  };
})(this);
*/

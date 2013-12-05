/*(function(exports) {
  "use strict";

  var startedGyro = false;
  var pos = $V([0, 0, 0]);
  var timestep = 50;
  var movementThreshold = 0.2;

  exports.BasicEstimator = {

    getPosition: function() {
      BasicEstimator.startGyro();

      return pos.elements;
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
      var accel = $V([event.x, event.y, event.z]);

      if (accel.modulus() < movementThreshold) {
        return;
      }

      pos.add(accel.toUnitVector().multiply(timestep / 1000));
    }
  };
})(this);
*/

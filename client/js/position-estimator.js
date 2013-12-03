(function(exports) {
  "use strict";

  var state = {
    pos: [0, 0, 0],
    vel: [0, 0, 0]
  };
  var sampledAccel = [];
  var accelsToSample = 4;
  var startedGyro = false;
  var timestep = 200; // ms
  var lastAccel = [0, 0, 0];

  exports.PositionEstimator = {
    // Returns true iff position estimates are available (e.g. we're on a phone)
    isAvailable: function() {
      return (gyro.getFeatures().indexOf('devicemotion') != -1) || (gyro.getFeatures().indexOf('MozOrientation') != -1);
    },

    // Returns the current estimate of [x, y, z] relative to the first
    // time getPosition was called.
    getPosition: function() {
      if (!startedGyro) {
        this._startGyro();
      }
      return state.pos;
    },

    _startGyro: function() {
      startedGyro = true;
      gyro.frequency = timestep / accelsToSample; // The RK4 integrator needs 4 samples for each step, so we'll divide the time step.
      gyro.calibrate();
      gyro.startTracking(this._handleGyroUpdate);

      window.setTimeout(this._timestep, timestep);
    },

    _timestep: function() {
      if (sampledAccel.length >= accelsToSample) {
        state = RK4.takeStep(state, sampledAccel, timestep / 1000);

      }

      window.setTimeout(PositionEstimator._timestep, timestep);
    },

    _handleGyroUpdate: function(event) {
      if (sampledAccel.length > 0) {
        sampledAccel.push([event.x - lastAccel[0], event.y - lastAccel[1], event.z - lastAccel[2]]);
      } else {
        sampledAccel.push([event.x, event.y, event.z]);
      }
      lastAccel = [event.x, event.y, event.z];
      if (sampledAccel.length > accelsToSample) {
        sampledAccel.shift();
      }
    },

    _override: function(x, y, z) {
      PositionEstimator.getPosition = function() {
        return [x, y, z];
      }

      PositionEstimator.isAvailable = function() {
        return true;
      }
    }
  };
})(this);

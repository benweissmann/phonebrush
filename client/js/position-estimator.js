(function(exports) {
  "use strict";

  var state = {
    pos: [0, 0, 0],
    vel: [0, 0, 0]
  };
  var sampledData = [];
  var startedGyro = false;
  var dampingFactor = 0.004; // Every step, we multiply the previous velocity by 1 - dampingFactor

//  var integrator = RK4;
//  var accelsToSample = 4;
//  var timestep = 200; // ms

  var integrator = Euler;
  var accelsToSample = 1;
  var timestep = 50; // ms

  exports.PositionEstimator = {
    // Returns true iff position estimates are available (e.g. we're on a phone)oo
    isAvailable: function() {
      return true;
      return (gyro.getFeatures().indexOf('devicemotion') != -1) || (gyro.getFeatures().indexOf('MozOrientation') != -1);
    },

    // Returns the current estimate of [x, y, z] relative to the first
    // time getPosition was called.
    getPosition: function() {
      this._startGyro();
      return state.pos;
    },

    getVelocity: function() {
      this._startGyro();
      return state.vel;
    },

    // Returns the last acceleration sampled, relative to the sample taken before it.
    getAcceleration: function() {
      this._startGyro();
      if (sampledData.length == 0) {
        return [0, 0, 0];
      }
      return sampledData[sampledData.length - 1].acceleration;
    },

    _startGyro: function() {
      if (startedGyro) {
        return;
      }

      startedGyro = true;
      gyro.frequency = timestep / accelsToSample; // The RK4 integrator needs 4 samples for each step, so we'll divide the time step.
      gyro.calibrate();
      gyro.startTracking(this._handleGyroUpdate);
    },

    _handleGyroUpdate: function(event) {
      var lastAcceleration = PositionEstimator.getAcceleration();
      if (lastAcceleration[0] == event.x && lastAcceleration[1] == event.y && lastAcceleration[2] == event.z) {
        return;
      }

      var newData = {time: new Date().getTime(), acceleration:[event.x - lastAcceleration[0], event.y - lastAcceleration[1], event.z - lastAcceleration[2]]};
      sampledData.push(newData);

      if (sampledData.length > accelsToSample) {
        sampledData.shift();
      }

      if (sampledData.length >= accelsToSample) {
        state = integrator.takeStep(state, sampledData, timestep / 1000, dampingFactor);
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

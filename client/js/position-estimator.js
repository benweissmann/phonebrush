(function(exports) {
  "use strict";

  var state = {
    pos: [0, 0, 0],
    vel: [0, 0, 0]
  };
  var sampledAccel = [];
  var startedGyro = false;
  var timestep = 200; // ms
  var lastAccel = [0, 0, 0];
  var dampingFactor = 0.1; // Every step, we multiply the previous velocity by 1 - dampingFactor

//  var integrator = RK4;
//  var accelsToSample = 4;

  var integrator = Euler;
  var accelsToSample = 1;

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
      if (sampledAccel.length == 0) {
        return [0, 0, 0];
      }
      return sampledAccel[sampledAccel.length - 1];
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
      if (sampledAccel.length > 0) {
        sampledAccel.push([event.x - lastAccel[0], event.y - lastAccel[1], event.z - lastAccel[2]]);
      } else {
        sampledAccel.push([event.x, event.y, event.z]);
      }

      lastAccel = [event.x, event.y, event.z];
      if (sampledAccel.length > accelsToSample) {
        sampledAccel.shift();
      }

      if (sampledAccel.length >= accelsToSample) {
        state = integrator.takeStep(state, sampledAccel, timestep / 1000, dampingFactor);
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

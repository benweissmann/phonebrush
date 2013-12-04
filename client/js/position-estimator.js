(function(exports) {
  "use strict";

  var state = {
    pos: [0, 0, 0],
    vel: [0, 0, 0]
  };
  var sampledData = [];
  var startedGyro = false;
  var dampingFactor = 0.02; // Every step, we multiply the previous velocity by 1 - dampingFactor
  var lastAcceleration = [0, 0, 0];
  var timestep = 50; // ms

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

    useRK4: function() {
      integrator = RK4;
      accelsToSample = 4;
      timestep = 200;
    },

    useEuler: function() {
      integrator = Euler;
      accelsToSample = 1;
      sampledData = [];
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

      this.useRK4();

      startedGyro = true;
      gyro.frequency = timestep;
      gyro.calibrate();
      gyro.startTracking(this._handleGyroUpdate);
    },

    _handleGyroUpdate: function(event) {
      if (lastAcceleration[0] == event.x && lastAcceleration[1] == event.y && lastAcceleration[2] == event.z) {
        return;
      }

      var lastUpdateTime = new Date().getTime();
      if (sampledData.length > 0) {
        lastUpdateTime = sampledData[sampledData.length - 1].time;
      }

      var differentialAcceleration = [event.x - lastAcceleration[0], event.y - lastAcceleration[1], event.z - lastAcceleration[2]];
      var filteredAcceleration = MovingFilter.addSample(differentialAcceleration);
      var newData = {time: new Date().getTime(), acceleration:filteredAcceleration};
      sampledData.push(newData);

      if (sampledData.length > accelsToSample) {
        sampledData.shift();
      }

      if (sampledData.length >= accelsToSample) {
        state = integrator.takeStep(state, sampledData, (newData.time - lastUpdateTime) / 1000, dampingFactor);
      }
      lastAcceleration = [event.x, event.y, event.z];
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

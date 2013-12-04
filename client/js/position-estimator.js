(function(exports) {
  "use strict";

  var state = {
    pos: [0, 0, 0],
    vel: [0, 0, 0]
  };
  var sampledData = [];
  var startedGyro = false;
  var dampingFactor = 0.1; // Every step, we multiply the previous velocity by 1 - dampingFactor
  var lastAcceleration = [0, 0, 0];
  var timestep = 50; // ms

  var differentialXSamples = [];
  var filteredXSamples = [];
  var takeSamples = false;

  var integrator = Euler;
  var accelsToSample = 1;

  exports.PositionEstimator = {
    // Returns true iff position estimates are available (e.g. we're on a phone)oo
    isAvailable: function() {
      return true;
      return (gyro.getFeatures().indexOf('devicemotion') != -1) || (gyro.getFeatures().indexOf('MozOrientation') != -1);
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

    reset: function() {
      state = {
        pos: [0, 0, 0],
        vel: [0, 0, 0]
      }
      sampledData = [];
      lastAcceleration = [0, 0, 0];
      gyro.calibrate();
    },

    stopSamples: function() {
      takeSamples = false;
    },

    startSamples: function() {
      takeSamples = true;
    },

    differentialXSamples: differentialXSamples,

    filteredXSamples: filteredXSamples,

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
      differentialAcceleration = _.map(differentialAcceleration, function(point) {
        if (Math.abs(point) < 0.2) {
          return 0.0;
        }
        return point;
      });
      var filteredAcceleration = MovingFilter.addSample(differentialAcceleration);

      if (takeSamples) {
        differentialXSamples.push(differentialAcceleration);
        filteredXSamples.push(filteredAcceleration);
      }

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

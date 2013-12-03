(function(exports) {
  "use strict";

  var state = {
    pos: [0, 0, 0],
    vel: [0, 0, 0]
  };
  var sampledAccel = [];
  var startedGyro = false;
  var timestep = 250; // ms 

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
      gyro.frequency = timestep / 4; // We need 4 acceleration values for each time step, so we'll sample the gyro 4 times as frequently
      gyro.calibrate();
      gyro.startTracking(this._handleGyroUpdate);

      window.setTimeout(this._timestep, timestep); 
    },

    _timestep: function() {
      if (sampledAccel.length >= 4) {
        state = RK4.takeStep(state, sampledAccel, timestep / 1000);

        $('#x').text(state.pos[0]);
        $('#y').text(state.pos[1]);
        $('#z').text(state.pos[2]);

        console.log(state.pos);
      }

      window.setTimeout(PositionEstimator._timestep, timestep); 
    },

    _handleGyroUpdate: function(event) {
      sampledAccel.push([event.x, event.y, event.z]);
      gyro.calibrate();
      if (sampledAccel.length > 4) {
        sampledAccel.shift();
      }
    }
  };


})(this);

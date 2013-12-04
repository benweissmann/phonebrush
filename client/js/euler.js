(function(exports) {
  "use strict";

  exports.Euler = {
    takeStep: function(initialState, sampledAccel, timestep, dampingFactor) {
      return {
        pos: RK4._addArrays([initialState.pos, RK4._scaleArray(initialState.vel, timestep)]),
        vel: RK4._addArrays([RK4._scaleArray(initialState.vel, dampingFactor), RK4._scaleArray(sampledAccel[0], timestep)])
      };
    }
  };
})(this);

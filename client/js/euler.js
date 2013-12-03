(function(exports) {
  "use strict";

  exports.Euler = {
    takeStep: function(initialState, sampledAccel, timestep) {
      return {
        pos: RK4._addArrays([initialState.pos, RK4._scaleArray(initialState.vel, timestep)]),
        vel: RK4._addArrays([initialState.vel, RK4._scaleArray(sampledAccel[0], timestep)])
      };
    }
  };
})(this);

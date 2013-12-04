(function(exports) {
  "use strict";

  exports.Euler = {
    takeStep: function(initialState, sampledAccel, timestep, dampingFactor) {
      return {
        pos: ArrayUtils.add([initialState.pos, ArrayUtils.scale(initialState.vel, timestep)]),
        vel: ArrayUtils.add([ArrayUtils.scale(initialState.vel, 1 - dampingFactor), ArrayUtils.scale(sampledAccel[0].acceleration, timestep)])
      };
    }
  };
})(this);

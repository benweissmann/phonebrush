// Referenced http://gafferongames.com/game-physics/integration-basics/

(function(exports) {
  "use strict";

  exports.RK4 = {
    takeStep: function(initialState, sampledAccel, timestep, dampingFactor) {
      var a = RK4._evaluate(initialState, 0, {dPos:[0,0,0], dVel:[0,0,0]}, sampledAccel[0]);
      var b = RK4._evaluate(initialState, 0.5 * timestep, a, sampledAccel[1]);
      var c = RK4._evaluate(initialState, 0.5 * timestep, b, sampledAccel[2]);
      var d = RK4._evaluate(initialState, timestep, c, sampledAccel[3]);

      var dPosDt = RK4._scaleArray(RK4._addArrays([a.dPos, b.dPos, b.dPos, c.dPos, c.dPos, d.dPos]), 1/6);
      var dVelDt= RK4._scaleArray(RK4._addArrays([a.dVel, b.dVel, b.dVel, c.dVel, c.dVel, d.dVel]), 1/6);

      return {
        pos: RK4._addArrays([initialState.pos, RK4._scaleArray(dPosDt, timestep)]),
        vel: RK4._addArrays([RK4._scalearray(initialState.vel, dampingFactor), RK4._scaleArray(dVelDt, timestep)])
      };
    },

    _evaluate: function(state, timestep, derivative, acceleration) {
      var newState = {
        pos: RK4._addArrays([state.pos, RK4._scaleArray(derivative.dPos, timestep)]),
        vel: RK4._addArrays([state.vel, RK4._scaleArray(derivative.dVel, timestep)])
      };

      return {
        dPos: newState.vel,
        dVel: acceleration
      };
    },

    // TODO: For some reason, arguments isn't a list of the arguments passed to this function. So we encase our variable args in another array...
    _addArrays: function(arrays) {
      for (var i = 1; i < arrays.length; i++) {
        if (arrays[0].length != arrays[i].length) {
          console.log("WARNING: Trying to add arrays of unequal length.");
          return [];
        }
      }

      var out = [];
      for (var i = 0; i < arrays[0].length; i ++) {
        out.push(0)
        _.each(arrays, function(array) {
          out[i] += array[i];
        });
      }
      return out;
    },

    _scaleArray: function(array, scale) {
      var out = [];
      _.each(array, function(val) {
        out.push(val * scale);
      });
      return out;
    }
  };
})(this);

// Referenced http://gafferongames.com/game-physics/integration-basics/

(function(exports) {
  "use strict";

  exports.RK4 = {
    takeStep: function(initialState, sampledAccel, timestep, dampingFactor) {
      var a = RK4._evaluate(initialState, 0, {dPos:[0,0,0], dVel:[0,0,0]}, sampledAccel[0].acceleration);
      var b = RK4._evaluate(initialState, 0.5 * timestep, a, sampledAccel[1].acceleration);
      var c = RK4._evaluate(initialState, 0.5 * timestep, b, sampledAccel[2].acceleration);
      var d = RK4._evaluate(initialState, timestep, c, sampledAccel[3].acceleration);

      var dPosDt = ArrayUtils.scale(ArrayUtils.add([a.dPos, b.dPos, b.dPos, c.dPos, c.dPos, d.dPos]), 1/6);
      var dVelDt= ArrayUtils.scale(ArrayUtils.add([a.dVel, b.dVel, b.dVel, c.dVel, c.dVel, d.dVel]), 1/6);

      return {
        pos: ArrayUtils.add([initialState.pos, ArrayUtils.scale(dPosDt, timestep)]),
        vel: ArrayUtils.add([ArrayUtils.scale(initialState.vel, 1 - dampingFactor), ArrayUtils.scale(dVelDt, timestep)])
      };
    },

    _evaluate: function(state, timestep, derivative, acceleration) {
      var newState = {
        pos: ArrayUtils.add([state.pos, ArrayUtils.scale(derivative.dPos, timestep)]),
        vel: ArrayUtils.add([state.vel, ArrayUtils.scale(derivative.dVel, timestep)])
      };

      return {
        dPos: newState.vel,
        dVel: acceleration
      };
    },
  };
})(this);

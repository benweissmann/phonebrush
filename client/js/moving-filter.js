(function(exports) {
  "use strict";

  var weightingCoefficients = [0.8, 0.1, 0.05, 0.05];
  var samples = [];

  exports.MovingFilter = {
    addSample: function(newSample) {
      samples.unshift(newSample);
      if (samples.length > weightingCoefficients.length) {
        samples.pop();
      }

      var weightedAverage = [0, 0, 0];
      for (var i = 0; i < samples.length; i++) {
        weightedAverage = RK4._addArrays([weightedAverage, RK4._scaleArray(samples[i], weightingCoefficients[i])]);
      }
      
      return weightedAverage;
    }
  };
})(this);

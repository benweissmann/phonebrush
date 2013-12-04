(function(exports) {
  exports.ArrayUtils = {
    // TODO: For some reason, arguments isn't a list of the arguments passed to this function. So we encase our variable args in another array...
    add: function(arrays) {
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

    scale: function(array, scale) {
      var out = [];
      _.each(array, function(val) {
        out.push(val * scale);
      });
      return out;
    }
  };
})(this);

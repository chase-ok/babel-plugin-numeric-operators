"use strict";

(function () {
  var x = [1, 2, 3],
      y = [4, 5, 6];x = N["*="](x, N["-"](2, y));return N["[]="](x, slice(1), N["-="](N["[]"](x, slice(1)), y = N["*="](y, x)));
})();

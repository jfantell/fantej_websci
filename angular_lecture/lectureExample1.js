(function(angular) {
   'use strict';
   angular.module('expressionExample', [])
      .controller('ExampleController', ['$scope', function($scope) {
         var exprs = $scope.exprs = [];
         $scope.expr = '3*10|currency';
         $scope.addExp = function(expr) {
            exprs.push(expr);
         };

         $scope.removeExp = function(index) {
            exprs.splice(index, 1);
         };
      }]);
})(window.angular);

/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
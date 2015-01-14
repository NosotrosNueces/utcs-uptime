(function () {
  var uptimeApp = angular.module('uptimeApp', [ ]);

  uptimeApp.controller('CurrentListController', [ '$http', '$scope', function ($http, $scope) {
    $scope.click = function (object) {
      $scope.current = object;
    };

    $http.get('https://utcs.statictypes.me/current').success(function (data) {
      $scope.servers = data;
    });

    $scope.hasPeople = function (value, index) {
      return value.userCount > 0;
    };
  }]);
}());

(function(){
  var uptimeApp = angular.module('uptimeApp', [ ]);

  uptimeApp.controller('CurrentListController', [ '$http', '$scope', function ($http, $scope) {
    $scope.click = function(object) {
      $scope.current = object;
      $scope.userList = object.users.map(function(obj) {return obj.name;}).join();
    };

    $http.get('https://utcs.statictypes.me/current').success(function(data) {
      $scope.servers = data;
    });
  }]);
}());

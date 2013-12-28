'use strict';

/* Controllers */

angular.module('SimbaChat.controllers', []).
  controller('Discussion', [
    "$scope",
    "Chat",
    function($scope, chatService) {
      // { name: "Nick", text: "Cats", time: new Date() }
      $scope.messages = [];
      for (var i=0; i < 100; i++)
      {
        $scope.messages.push(
          {
            name: i % 2 == 0 ? "Nick" : "Yun",
            text: "garble garble parp parp",
            time: new Date().getTime()
          }
        );
      }

      chatService.connect();
    }
  ]);
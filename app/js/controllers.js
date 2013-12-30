'use strict';

/* Controllers */

angular.module('SimbaChat.controllers', []).
  controller('Discussion', [
    "$scope",
    "$location",
    "Chat",
    "Session",
    function($scope, $location, chatService, session) {

      $scope.messages = [];

      $scope.text = "";

      $scope.send = function() {
        console.log("Sending", $scope.text);
        $scope.discussion.send($scope.text);
        $scope.text = "";
      };

      $scope.isSendDisabled = function() {
        return $scope.text.length == 0;
      };

      $scope.discussion = null;

      // Move to login screen when it's done so that Login takes care of bootstrapping us.
      function joinRoom(id) {
        $scope.discussion = chatService.joinDiscussion(id);
        // Use RxJS here to respond to incoming data channel.on()
        $scope.discussion.on(function(message) {
          console.log("Message in: " + message.text + " " + message.userId);
          $scope.messages.push(message);
        });
      }

      // Initialize
      if (session.isAuthenticated) {
        joinRoom(chatService.currentDiscussion);
      } else {
        $scope.$on("Session::isAuthenticatedChanged", function(event, isAuthenticated) {
          if (isAuthenticated) {
            joinRoom(chatService.currentDiscussion);
          }
        });
        console.log($location.search().name);
        session.authenticate($location.search().name || "cats", "blah");
      }


    }
  ]);
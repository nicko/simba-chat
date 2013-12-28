'use strict';


// Declare app level module which depends on filters, and services
angular.module('SimbaChat', [
  'ngRoute',
  'SimbaChat.filters',
  'SimbaChat.services',
  'SimbaChat.directives',
  'SimbaChat.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/discussion', {templateUrl: 'partials/discussion.html', controller: 'Discussion'});
  $routeProvider.otherwise({redirectTo: '/discussion'});
}]);

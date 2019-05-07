/**
 * Initializing the database model for login controller
 * @type [angular module]
 */
	angular.module('lawAdmin.auth').factory('authFactory', ['$http', function ($http) {
		
		/**
		 * Blank authFactory
		 * @type {Object}
		 */
		var authFactory = {};

		var apiUrl = '/';

		/**
		 * Logiprocess function
		 */
		authFactory.processLogin = function (user) {
			return $http.post(apiUrl + 'login', user);
		};

		return authFactory;
	}]);
/**
 * Initializing the database model for login controller
 * @type [angular module]
 */
	angular.module('lawAdmin.authorities').factory('authoritiesFactory', ['$http', function ($http) {
		
		/**
		 * Blank authFactory
		 * @type {Object}
		 */
		var authoritiesFactory = {};

		var apiUrl = '/';

		authoritiesFactory.authorities = function (page, limit) {
			return $http.get(apiUrl + 'authorities?page='+page+'&limit='+limit);
		};

		authoritiesFactory.add = function (data) {
			return $http.post(apiUrl + 'authority', data);
		};

		authoritiesFactory.update = function (data) {
			return $http.post(apiUrl + 'updateAuthority', data);
		};

		authoritiesFactory.delete = function (id) {
			return $http.post(apiUrl + 'deleteAuthority', {id:id});	
		};

		return authoritiesFactory;
	}]);
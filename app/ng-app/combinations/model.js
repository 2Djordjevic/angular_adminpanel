/**
 * Initializing the database model for login controller
 * @type [angular module]
 */
	angular.module('lawAdmin.combinations').factory('combinationsFactory', ['$http', function ($http) {
		
		/**
		 * Blank authFactory
		 * @type {Object}
		 */
		var combinationsFactory = {};

		var apiUrl = '/';

		combinationsFactory.saveCombination = function (data) {
			return $http.post(apiUrl + "combinations", {data:data});
		};

		return combinationsFactory;
	}]);
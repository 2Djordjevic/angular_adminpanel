/**
 * Initializing the database model for login controller
 * @type [angular module]
 */
	angular.module('lawAdmin.categories').factory('categoriesFactory', ['$http', function ($http) {
		
		/**
		 * Blank authFactory
		 * @type {Object}
		 */
		var categoriesFactory = {};

		var apiUrl = '/';

		categoriesFactory.categories = function (page, limit) {
			return $http.get(apiUrl + 'categories?page='+page+'&limit='+limit);
		};

		categoriesFactory.add = function (data) {
			return $http.post(apiUrl + 'category', data);
		};

		categoriesFactory.update = function (data) {
			return $http.post(apiUrl + 'updateCategory', data);
		};

		categoriesFactory.delete = function (id) {
			return $http.post(apiUrl + 'deleteCategory', {id:id});	
		};

		return categoriesFactory;
	}]);
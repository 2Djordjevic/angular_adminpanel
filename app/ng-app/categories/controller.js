/**
 * Initializing the Login Module for law admin
 * @type [angular module]
 */
angular.module('lawAdmin.categories', []);

angular.module('lawAdmin.categories').config(['$routeProvider', function($routeProvider) {
				
		$routeProvider
			.when("/categories", {
				controller: 'categoriesController',
				templateUrl: 'ng-app/categories/view.html',
			});
	}
]);

/**
 * Controller for view tables page
 */
angular.module('lawAdmin.categories').controller('categoriesController', function ($scope, $http, $cookieStore, $rootScope, $location, $interval, $timeout, $filter, categoriesFactory) {
	$rootScope.title = "Law Admin | Categories";
	$rootScope.bodyClass='skin-blue';
	
	/** Get user data */
	if(!$cookieStore.get('user')[0]) {
		$location.path('/login');
	}
	$rootScope.user = $cookieStore.get('user')[0];

	$scope.category = {};
	$scope.filter = {};
	$scope.showUI = false;
	
	$scope.pagination = {};
	$scope.pagination.currentPage = 1;
	$scope.pagination.limit = 10;
	$scope.pagination.maxSize = 5;

	$scope.getCategoriesAsync = function (page, limit) {
		
		page = page ? page : $scope.pagination.currentPage; // default or provided
		limit = limit ? page : $scope.pagination.limit; // default or provided

		// Call api
		categoriesFactory.categories(page, limit)
			.success(function (response) {
				
				$scope.categories = response.data;
				$scope.pagination.total = response.totalRecords;
			})
			.error(function () {
				alert("Error while fetching questions!");
			});
	};

	/** Add answer */
	$scope.addCategory = function () {

		if(!$scope.category.category_name) {
			$scope.categoryError = true;
			return false;
		} else {

			categoriesFactory.add($scope.category)
				.success(function (response) {
					if(response.success === true) {
						// Get answers
						$scope.getCategoriesAsync();
						$scope.category = {}; // Empty models
					}
				})
				.error(function(response) {
					if(response.success === false) {
						$scope.categoryError = true;
						alert(response.message);
					}
				});
		}
	};

	/** Keyword length validation function */
	$scope.checkCategoryLength = function (data) {
		if(!data) {
			return "Required.";
		}
	};

	/** Update particular record */
	$scope.saveCategory = function (data, catId) {
		data.id = catId;
		return categoriesFactory.update(data);
	};

	/** Remove record */
	$scope.removeRecord = function (recordId) {
		var conf = confirm("Are you sure you want to delete this record?");
		if(conf === true) {
			categoriesFactory.delete(recordId)
				.success(function () {
					$scope.getCategoriesAsync();
				})
				.error(function() {
					alert("Error while deleting record.");
				});
		}
	};

	/** Get selected page data */
	$scope.$watch('pagination.currentPage', function (newVal) {
		$scope.getCategoriesAsync(newVal);
	});

	// Get questions call
	$scope.getCategoriesAsync();
});
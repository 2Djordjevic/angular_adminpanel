/**
 * Initializing the Login Module for law admin
 * @type [angular module]
 */
angular.module('lawAdmin.authorities', []);

angular.module('lawAdmin.authorities').config(['$routeProvider', function($routeProvider) {
				
		$routeProvider
			.when("/authorities", {
				controller: 'authoritiesController',
				templateUrl: 'ng-app/authorities/view.html',
			});
	}
]);

/**
 * Controller for view tables page
 */
angular.module('lawAdmin.authorities').controller('authoritiesController', function ($scope, $http, $cookieStore, $rootScope, $location, $interval, $timeout, $filter, authoritiesFactory) {
	$rootScope.title = "Law Admin | authorities";
	$rootScope.bodyClass='skin-blue';
	
	/** Get user data */
	if(!$cookieStore.get('user')[0]) {
		$location.path('/login');
	}
	$rootScope.user = $cookieStore.get('user')[0];

	$scope.authority = {};
	$scope.filter = {};
	$scope.showUI = false;
	
	$scope.pagination = {};
	$scope.pagination.currentPage = 1;
	$scope.pagination.limit = 10;
	$scope.pagination.maxSize = 5;

	$scope.getAuthoritiesAsync = function (page, limit) {
		
		page = page ? page : $scope.pagination.currentPage; // default or provided
		limit = limit ? page : $scope.pagination.limit; // default or provided

		// Call api
		authoritiesFactory.authorities(page, limit)
			.success(function (response) {
				
				$scope.authorities = response.data;
				$scope.pagination.total = response.totalRecords;
			})
			.error(function () {
				alert("Error while fetching questions!");
			});
	};

	/** Add answer */
	$scope.addAuthority = function () {

		if(!$scope.authority.authority_name) {
			$scope.authorityError = true;
			return false;
		} else {

			authoritiesFactory.add($scope.authority)
				.success(function (response) {
					if(response.success === true) {
						// Get answers
						$scope.getAuthoritiesAsync();
						$scope.authority = {}; // Empty models
					}
				})
				.error(function(response) {
					if(response.success === false) {
						$scope.authorityError = true;
						alert(response.message);
					}
				});
		}
	};

	/** Keyword length validation function */
	$scope.checkAuthorityLength = function (data) {
		if(!data) {
			return "Required.";
		}
	};

	/** Update particular record */
	$scope.saveAuthority = function (data, catId) {
		data.id = catId;
		return authoritiesFactory.update(data);
	};

	/** Remove record */
	$scope.removeRecord = function (recordId) {
		var conf = confirm("Are you sure you want to delete this record?");
		if(conf === true) {
			authoritiesFactory.delete(recordId)
				.success(function () {
					$scope.getAuthoritiesAsync();
				})
				.error(function() {
					alert("Error while deleting record.");
				});
		}
	};

	/** Get selected page data */
	$scope.$watch('pagination.currentPage', function (newVal) {
		$scope.getAuthoritiesAsync(newVal);
	});
});
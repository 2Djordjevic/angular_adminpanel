/**
 * Initializing the Login Module for law admin
 * @type [angular module]
 */
angular.module('lawAdmin.combinations', []);

angular.module('lawAdmin.combinations').config(['$routeProvider', function($routeProvider) {
				
		$routeProvider
			.when("/combinations", {
				controller: 'combinationsController',
				templateUrl: 'ng-app/combinations/view.html',
			});
	}
]);

/**
 * Controller for view tables page
 */
angular.module('lawAdmin.combinations').controller('combinationsController', function ($scope, $http, $cookieStore, $rootScope, $location, $interval, $timeout, $filter, combinationsFactory, keywordsFactory, authoritiesFactory) {
	$rootScope.title = "Law Admin | combinations";
	$rootScope.bodyClass='skin-blue';
	
	/** Get user data */
	if(!$cookieStore.get('user')[0]) {
		$location.path('/login');
	}
	$rootScope.user = $cookieStore.get('user')[0];

	$scope.authority = {};
	$scope.filter = {};
	$scope.showUI = false;
	$scope.questionKeywords = [];
	$scope.associatedKeywords = [];
	$scope.insertData = [];
	$scope.errors = [];

	$scope.pagination = {};
	$scope.pagination.currentPage = 1;
	$scope.pagination.limit = 10;
	$scope.pagination.maxSize = 5;

	$scope.getAllKeywordsAsync= function () {
		keywordsFactory.getAllKeywords()
			.success( function (response) {
				$scope.allKeywords = response.data;
				$scope.allKeywordsValues = [];
				for (var i = 0; i < $scope.allKeywords.length; i++) {
					$scope.allKeywordsValues.push($scope.allKeywords[i].keyword);
				}
			})
			.error(function() {
				alert("Error while fetching keywords.");
			});
	};

	$scope.getAuthoritiesAsync = function (page, limit) {
		
		page = 'undefined'; // default or provided
		limit = limit ? page : $scope.pagination.limit; // default or provided

		// Call api
		authoritiesFactory.authorities(page, limit, 'all')
			.success(function (response) {
				
				$scope.authorities = response.data;
				for (var i = 0; i < $scope.authorities.length; i++) {
					$scope.authorities[i].ticked = false;
				}
			})
			.error(function () {
				alert("Error while fetching questions!");
			});
	};

	/** Process Login If All good  */
	$scope.getQuestionsAsync = function () {
		keywordsFactory.getQuestions()
			.success(function (response) {
				
				$scope.questions = response.questions;
				
				// Default value to question dropdown
				// $scope.question.question_id = $scope.questions[0].id;
				
				$scope.showUI = true;
			})
			.error(function () {
				alert("Error while fetching questions!");
			});
	};

	/** Keywords suggestion */
	$scope.getKeywordSuggestions = function(val, question_id, index) {
		return $http.get('/keywordSuggestions', {
			params: {
				keyword: val,
				question_id: question_id
			}
		}).then(function(response) {
			$scope.questionKeywords[index] = response.data.results;
			return response.data.results.map(function(item) {
				return item.keyword;
			});
		});
	};

	$scope.saveCombination = function () {
		// Validation check for all
		var errorCount = 0;
		var associatedKeywordsRowIds = [];
		var index;

		for (var i = 0; i < 8; i++) {
			if($scope.associatedKeywords[i]) {
				index = $.inArray($scope.associatedKeywords[i], $scope.allKeywordsValues);
				if(index === -1) {
					$scope.errors[i] = true;
					errorCount++;
				} else {
					associatedKeywordsRowIds.push($scope.allKeywords[index].id);
					$scope.errors[i] = false;
				}
			} else {
				$scope.errors[i] = true;
				errorCount++;
			}
		}
		
		if(errorCount > 0) {
			return false;
		}
		// console.log($scope.selectedAuthorities);
		if($scope.selectedAuthorities.length === 0) {
			alert("Please select atleast one authority.");
			return false;
		}

		// Prepare data to be inserted
		for (i = 0; i < $scope.selectedAuthorities.length; i++) {
			
			var tmp = [];
			
			for (var j = 0; j < associatedKeywordsRowIds.length; j++) {
				tmp.push(associatedKeywordsRowIds[j]);
			}
			
			tmp.push($scope.selectedAuthorities[i].id); // Add authoity id at the end
			
			$scope.insertData[i] = tmp;
		}

		combinationsFactory.saveCombination($scope.insertData)
			.success( function () {
				$scope.showSaveSuccess = true;
				$timeout(function() {
					$scope.showSaveSuccess = false;
				},5000);
				$scope.associatedKeywords = [];
				$scope.insertData = [];
				angular.forEach( $scope.authorities, function(value) {
					value.ticked = false;
				});
			})
			.error(function() {
				alert("Error while saving combination/s.");
			});
		
	};

	// Get questions call
	$scope.getQuestionsAsync();
	$scope.getAuthoritiesAsync();
	$scope.getAllKeywordsAsync();
});
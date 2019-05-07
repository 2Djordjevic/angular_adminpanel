/**
 * Initializing the Login Module for law admin
 * @type [angular module]
 */
angular.module('lawAdmin.keywords', []);

angular.module('lawAdmin.keywords').config(['$routeProvider', function($routeProvider) {
				
		$routeProvider
			.when("/keywords", {
				controller: 'keywordsController',
				templateUrl: 'ng-app/keywords/keywords.html',
			});
	}
]);

/**
 * Controller for view tables page
 */
angular.module('lawAdmin.keywords').controller('keywordsController', function ($scope, $http, $cookieStore, $rootScope, $location, $interval, $timeout, $filter, keywordsFactory, categoriesFactory) {
	$rootScope.title = "Law Admin | Keywords";
	$rootScope.bodyClass='skin-blue';
	
	/** Get user data */
	if(!$cookieStore.get('user')[0]) {
		$location.path('/login');
	}
	$rootScope.user = $cookieStore.get('user')[0];

	$scope.answer = {};
	$scope.filter = {question_id: '', assigned: '', orderBy:[{column:'id', type:'desc'}]};
	$scope.showUI = false;
	$scope.showData = false;
	$scope.selectedCats = [];
	
	$scope.pagination = {};
	$scope.pagination.currentPage = 1;
	$scope.pagination.limit = 10;
	$scope.pagination.maxSize = 5;

	/** Get categories  */
	$scope.getCatsAsync = function () {
		categoriesFactory.categories()
			.success(function (response) {

				$scope.editableCategories = response.data;
				
				for (var i = 0; i < response.data.length; i++) {
					response.data[i].ticked = false;
				}
				
				$scope.categories = response.data;
				
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

	/** GET RECORDS ASYNC FUNCTION */
	$scope.getAnswersAsync = function (page, limit) {
		
		var value;

		page = page ? page : $scope.pagination.currentPage; // default or provided
		limit = limit ? page : $scope.pagination.limit; // default or provided

		$scope.offset = limit * (page - 1); // offset calculation
		
		switch($scope.filterType){
			case 'question_id':
				value = $scope.filter.question_id;
				break;
			case 'assigned':
				value = $scope.filter.assigned;
				break;
			case 'search':
				value = $scope.filter.searchStr;
				break;
			default:
				value = "all";		
				break;
		}
		if(!value) {
			value = "all";
		}
		
		// Call api
		keywordsFactory.getAnswers(page, limit, $scope.filterType, value, JSON.stringify($scope.filter.orderBy))
			.success(function (response) {
				
				$scope.answers = response.data;
				$scope.pagination.total = response.totalRecords;
			})
			.error(function () {
				alert("Error while fetching questions!");
			});
	};

	/** Add answer */
	$scope.addAnswer = function () {

		if(!$scope.answer.keyword) {
			$scope.keywordError = true;
			return false;
		} else {

			$scope.answer.question_id = $scope.answer.question_id ? $scope.answer.question_id : 0; // Set 0 if blank

			keywordsFactory.addAnswer($scope.answer)
				.success(function (response) {
					if(response.success === true) {
						// Get answers
						$scope.getAnswersAsync();
						$scope.answer = {}; // Empty models
					}
				})
				.error(function(response) {
					if(response.success === false) {
						alert(response.message);
					}
				});
		}
	};

	/** Set provided filter type */
	$scope.setFilter = function (filterType) {
		$scope.filterType = filterType;
		$scope.getAnswersAsync();
	};

	/** Show selected question in ng-repeat iteration */
	$scope.showQuestion = function(answer) {
		if (answer.question_id && $scope.questions) {
			var selected = $filter('filter')($scope.questions, {
				id: answer.question_id
			});
			return selected.length ? selected[0].question : 'Not set';
		} else {
			return answer.question || 'Unassigned';
		}
	};

	/** Keywords suggestion */
	$scope.getKeywordSuggestions = function(val) {
		return $http.get('/keywordSuggestions', {
			params: {
				keyword: val
			}
		}).then(function(response) {
			return response.data.results.map(function(item) {
				return item.keyword;
			});
		});
	};

	/** Keyword length validation function */
	$scope.checkKeywordLength = function (data) {
		if(!data) {
			return "Required.";
		}
	};

	/** Update particular record */
	$scope.saveAnswer = function (data, answerId, index, prevSelectedCategories) {
		
		data.id = answerId;
		
		// Get updated selecte categories
		data.selectedCategories = $scope.selectedCats[index];
		
		// Categories to be deleted
		data.catsToBeDeleted = [];

		var catsArray = [], catIndex;
		
		for (var i = 0; i < data.selectedCategories.length; i++) {
			catsArray.push(data.selectedCategories[i].id);
		}

		for (i = 0; i < prevSelectedCategories.length; i++) {
			
			catIndex = catsArray.indexOf(prevSelectedCategories[i].category_id);

			if(catIndex === -1) {
				data.catsToBeDeleted.push(prevSelectedCategories[i].category_id);
			}
		}
		console.log(data);
		return keywordsFactory.updateAnswer(data);
	};

	/** Remove record */
	$scope.removeRecord = function (recordId) {
		var conf = confirm("Are you sure you want to delete this record?");
		if(conf === true) {
			keywordsFactory.deleteAnswer(recordId)
				.success(function () {
					$scope.getAnswersAsync();
				})
				.error(function() {
					alert("Error while deleting record.");
				});
		}
	};

	/** On change function - Triggered in drop down of Limit filter */
	$scope.setLimit = function () {
		$scope.getAnswersAsync(1);
	};

	/** Toggle ID Column Ordering */
	$scope.toggleColumnFilter = function (column) {
		$scope.filter.orderBy[0].column = column;
		if($scope.filter.orderBy[0].type === 'desc') {
			$scope.filter.orderBy[0].type = 'asc';
		} else {
			$scope.filter.orderBy[0].type = 'desc';
		}

		if(column === 'id') {
			$scope.idSortState = $scope.filter.orderBy[0].type;
		} else {
			$scope.keywordSortState = $scope.filter.orderBy[0].type;
		}

		// Get records
		$scope.getAnswersAsync();
	};

	/** Get selected page data */
	$scope.$watch('pagination.currentPage', function (newVal) {
		$scope.getAnswersAsync(newVal);
	});

	/** Get selected page data */
	$scope.$watch('filter.searchStr', function (newVal) {
		if(newVal) {
			$scope.filterType = "search";
			$scope.getAnswersAsync();
		} else {
			$scope.getAnswersAsync();
		}
	});

	// Get all categories
	$scope.getCatsAsync();

	// Get questions call
	$scope.getQuestionsAsync();
});
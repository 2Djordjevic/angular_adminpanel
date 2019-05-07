/**
 * Initializing the database model for login controller
 * @type [angular module]
 */
	angular.module('lawAdmin.keywords').factory('keywordsFactory', ['$http', function ($http) {
		
		/**
		 * Blank authFactory
		 * @type {Object}
		 */
		var keywordsFactory = {};

		var apiUrl = '/';

		keywordsFactory.getQuestions = function () {
			return $http.get(apiUrl + 'questions');
		};

		keywordsFactory.getAllKeywords = function () {
			return $http.get(apiUrl + 'keywords');
		};

		keywordsFactory.getAnswers = function (page, limit, filterType, value, orderBy) {
			return $http.get(apiUrl + 'answers?page='+page+'&limit='+limit+'&filterType='+filterType+'&value='+value+'&orderBy='+orderBy);
		};

		keywordsFactory.updateAnswer = function (answerData) {
			return $http.post(apiUrl + 'answers', answerData);
		};

		keywordsFactory.addAnswer = function (answerData) {
			return $http.post(apiUrl + 'addAnswer', answerData);
		};

		keywordsFactory.deleteAnswer = function (id) {
			return $http.post(apiUrl + 'deleteAnswer', {id:id});	
		};

		keywordsFactory.keywordSuggestions = function (val) {
			return $http.get('/keywordSuggestions', {
				params: {
					keyword: val
				}
			});
		};

		return keywordsFactory;
	}]);
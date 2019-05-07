/**
 * Initializing the Login Module for law admin
 * @type [angular module]
 */
angular.module('lawAdmin.auth', []);

angular.module('lawAdmin.auth').config(['$routeProvider', function($routeProvider) {
		
		// $httpProvider.defaults.useXDomain = true;
	 //  	delete $httpProvider.defaults.headers.common['X-Requested-With'];
		
		$routeProvider
			.when("/login", {
				controller: 'loginController',
				templateUrl: 'ng-app/auth/login.html',
			});
	}
]);

/**
 * Controller for view tables page
 */
angular.module('lawAdmin.auth').controller('loginController', function ($scope, $location, $rootScope, $cookieStore, authFactory) {
	$rootScope.bodyClass = 'login-page';
	$rootScope.title = "Law Admin | Login";
	$scope.user = {};

	/** Process Login If All good  */
	$scope.doLogin = function (allGood) {
		if(allGood) {
			authFactory.processLogin($scope.user)
				.success(function (response) {
					$cookieStore.put("user", response.data);
					// Store cookies and redirect to questions.
					$location.path("/keywords");
				})
				.error(function (response, code) {
					if(code === 401) {
						alert("Invalid credentials. Please try again.");
					} else {
						alert("Error while login!");
					}
				});
		}
	};
});
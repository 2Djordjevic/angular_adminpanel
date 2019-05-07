angular.module('lawAdmin').controller('rootController', ['$rootScope', '$cookieStore', '$location', '$window', function($rootScope, $cookieStore, $location, $window){
	$rootScope.bodyClass = 'login-page';
	$rootScope.title = "";

	$rootScope.logout = function () {
		
		$cookieStore.put('user',[]);

		$window.history.pushState(null, null, location.href);

        $window.onpopstate = function() {
            history.go(1);
        };

		$location.path('/login');
	};
}]);
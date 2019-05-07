angular.module('lawAdmin', [
		'ngRoute',
		'ngCookies',
		'ui.bootstrap',
		'xeditable',
		'isteven-multi-select',
		'lawAdmin.auth',
		'lawAdmin.keywords',
		'lawAdmin.categories',
		'lawAdmin.authorities',
		'lawAdmin.combinations'
	]);

angular.module('lawAdmin').config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/menu', {
		controller:'menuController',
		templateUrl:'ng-app/partials/menu.html'
	})
	.otherwise("/login");
}]);

angular.module('lawAdmin').run(function(editableOptions){
	editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

angular.module('lawAdmin').controller('rootController', ['$rootScope', function($rootScope){
	$rootScope.bodyClass = 'login-page';
}]);
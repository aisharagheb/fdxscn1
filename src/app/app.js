angular.module( 'orderCloud', [
	'templates-app',
	'ngSanitize',
	'ngAnimate',
	'ngMessages',
	'ngTouch',
    'ui.tree',
	'ui.router',
	'ui.bootstrap',
	'orderCloud.sdk',
	'toastr',
    'ordercloud-infinite-scroll',
	'ordercloud-buyer-select',
    'ordercloud-search',
    'ordercloud-assignment-helpers',
    'ordercloud-paging-helpers',
    'ordercloud-auto-id',
    'ordercloud-impersonation'
])

	.run( SetBuyerID )
	.run( Security )
	.config( Routing )
	.config( ErrorHandling )
	.controller( 'AppCtrl', AppCtrl )
;

function SetBuyerID( BuyerID, buyerid ) {
	BuyerID.Get() ? angular.noop() : BuyerID.Set(buyerid);
}

function Security( $rootScope, $state, Auth ) {
	$rootScope.$on('$stateChangeStart', function(e, to) {
		/*TODO: make the '$stateChangeStart event' accept a function so users can control the redirect from each state's declaration.*/
		if (!to.data.limitAccess) return;
		Auth.IsAuthenticated()
			.catch(sendToLogin);

		function sendToLogin() {
			$state.go('login');
		}
	})
}

function Routing( $urlRouterProvider, $urlMatcherFactoryProvider ) {
	$urlMatcherFactoryProvider.strictMode(false);
	$urlRouterProvider.otherwise( '/home' );
	//$locationProvider.html5Mode(true);
	//TODO: For HTML5 mode to work we need to always return index.html as the entry point on the serverside
}

function ErrorHandling( $provide ) {
	$provide.decorator('$exceptionHandler', handler);

	function handler( $delegate, $injector ) {
		return function( ex, cause ) {
			$delegate(ex, cause);
			$injector.get('toastr').error(ex.data ? (ex.data.error || (ex.data.Errors ? ex.data.Errors[0].Message : ex.data)) : ex.message, 'Error');
		};
	}
}

function AppCtrl( $state, appname, Credentials ) {
	var vm = this;
	vm.name = appname;
	vm.showLeftNav = true;
	vm.toggleLeftNav = function() {
		vm.showLeftNav = !vm.showLeftNav;
	};
	vm.logout = function() {
		Credentials.Delete();
		$state.go('login');
	};
}
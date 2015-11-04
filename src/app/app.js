angular.module( 'orderCloud', [
	'templates-app',
	'ngSanitize',
	'ngAnimate',
	'ngMessages',
	'ngTouch',
	'ui.router',
	'ui.bootstrap',
	'orderCloud.sdk',
	'toastr',
    'ordercloud-infinite-scroll',
	'ordercloud-buyer-select'
])

	.run( SetBuyerID )
	.run( Security )
	.config( Routing )
	.config( ErrorHandling )
	.controller( 'AppCtrl', AppCtrl )

	//Constants needed for the OrderCloud AngularJS SDK
	.constant('ocscope', 'FullAccess')
	.constant('appname', 'OrderCloud Components Dev')

	//Client ID for a Registered Distributor or Buyer Company
    .constant('clientid', '0e0450e6-27a0-4093-a6b3-d7cd9ebc2b8f') //DISTRIBUTOR - Four51 OrderCloud Components
    //.constant('clientid', 'f0976e5c-ed16-443a-98ad-d084c7010e05') //BUYER - Four51 OrderCloud Components Buyer

	//Test Environment
	.constant('authurl', 'https://testauth.ordercloud.io/oauth/token')
	.constant('apiurl', 'https://testapi.ordercloud.io')

    //Production Environment
    //.constant('authurl', 'http://core.four51.com:11629/OAuth/Token')
    //.constant('apiurl', 'http://core.four51.com:9002')

    .constant('buyerid', '451ORDERCLOUD')

;

function SetBuyerID( BuyerID, buyerid ) {
    if (!BuyerID.Get()) {
        BuyerID.Set(buyerid);
    }
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
			$injector.get('toastr').error(ex.data ? (ex.data.error || ex.data.Errors[0].Message) : ex.message, 'Error');
		};
	};
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
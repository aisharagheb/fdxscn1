angular.module('orderCloud')
	.config(checkoutShippingConfig)
	.controller('CheckoutShippingCtrl', CheckoutShippingController)
;

function checkoutShippingConfig($stateProvider) {
	$stateProvider
		.state('checkout.shipping', {
			url: '/shipping',
			templateUrl: 'checkout/shipping/templates/checkout.shipping.tpl.html',
			controller: 'CheckoutShippingCtrl',
			controllerAs: 'checkoutShipping'
		})
}

function CheckoutShippingController() {
	var vm = this;
}
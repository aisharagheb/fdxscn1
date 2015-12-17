angular.module('orderCloud')
	.config(checkoutBillingConfig)
	.controller('CheckoutBillingCtrl', CheckoutBillingController)
;

function checkoutBillingConfig($stateProvider) {
	$stateProvider
		.state('checkout.billing', {
			url: '/billing',
			templateUrl: 'checkout/billing/templates/checkout.billing.tpl.html',
			controller: 'CheckoutBillingCtrl',
			controllerAs: 'checkoutBilling'
		})
}

function CheckoutBillingController() {
	var vm = this;
}
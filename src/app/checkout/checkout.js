angular.module('orderCloud')
	.config(checkoutConfig)
	.controller('CheckoutCtrl', CheckoutController)
	.controller('OrderSummaryCtrl', OrderSummaryController)
	.controller('OrderConfirmationCtrl', OrderConfirmationController)
;

function checkoutConfig($stateProvider) {
	$stateProvider
		.state('base.checkout', {
			url: '/checkout',
			templateUrl: 'checkout/templates/checkout.tpl.html',
			controller: 'CheckoutCtrl',
			controllerAs: 'checkout'
		})
		.state('base.orderSummary', {
			url: '/checkout/summary',
			templateUrl: 'checkout/templates/summary.tpl.html',
			controller: 'OrderSummaryCtrl',
			controllerAs: 'orderSummary'
		})
		.state('base.orderConfirmation', {
			url: '/confirmation',
			templateUrl: 'checkout/templates/confirmation.tpl.html',
			controller: 'OrderConfirmationCtrl',
			controllerAs: 'orderConfirmation'
		})
}

function CheckoutController() {
	var vm = this;
}

function OrderSummaryController() {
	var vm = this;
}

function OrderConfirmationController() {
	var vm = this;
}
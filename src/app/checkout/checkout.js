angular.module('orderCloud')
	.config(checkoutConfig)
	.controller('CheckoutCtrl', CheckoutController)
	.controller('OrderSummaryCtrl', OrderSummaryController)
	.controller('OrderConfirmationCtrl', OrderConfirmationController)
;

function checkoutConfig($stateProvider) {
	$stateProvider
		.state('checkout', {
			parent: 'base',
			url: '/checkout',
			templateUrl: 'checkout/templates/checkout.tpl.html',
			controller: 'CheckoutCtrl',
			controllerAs: 'checkout'
		})
		.state('checkout.summary', {
			url: '/summary',
			views: {
				'@base': {
					templateUrl: 'checkout/templates/summary.tpl.html',
					controller: 'OrderSummaryCtrl',
					controllerAs: 'orderSummary'
				}
			}
		})
		.state('checkout.confirmation', {
			url: '/confirmation',
			views: {
				'@base': {
					templateUrl: 'checkout/templates/confirmation.tpl.html',
					controller: 'OrderConfirmationCtrl',
					controllerAs: 'orderConfirmation'
				}
			}
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
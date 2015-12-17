angular.module('orderCloud')
	.config(checkoutPaymentConfig)
	.controller('CheckoutPaymentCtrl', CheckoutPaymentController)
;

function checkoutPaymentConfig($stateProvider) {
	$stateProvider
		.state('checkout.payment', {
			url: '/payment',
			templateUrl: 'checkout/payment/templates/checkout.payment.tpl.html',
			controller: 'CheckoutPaymentCtrl',
			controllerAs: 'checkoutPayment',
			resolve: {
				AvailableCostCenters: function(Me) {
					return Me.As().ListCostCenters();
				}
			}
		})
}

function CheckoutPaymentController(AvailableCostCenters) {
	var vm = this;
}
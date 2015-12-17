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
			controllerAs: 'checkoutBilling',
			resolve: {
				BillingAddresses: function($q, Me, Underscore) {
					return Me.As().ListAddresses().then(function(data) {
						return Underscore.where(data.Items, {Billing:true});
					});
				}
			}
		})
}

function CheckoutBillingController(BillingAddresses) {
	var vm = this;
	vm.billingAddresses = BillingAddresses;
}
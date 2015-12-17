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
			controllerAs: 'checkoutShipping',
			resolve: {
				ShippingAddresses: function($q, Me, Underscore) {
					return Me.As().ListAddresses().then(function(data) {
						return Underscore.where(data.Items, {Shipping:true});
					});
				}
			}
		})
}

function CheckoutShippingController(ShippingAddresses) {
	var vm = this;
	vm.shippingAddresses = ShippingAddresses;
}
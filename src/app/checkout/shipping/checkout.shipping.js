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

function CheckoutShippingController($state, $rootScope, Addresses, Orders, Me, ImpersonationService) {
	var vm = this;
    vm.saveAddress = null;
    vm.isAlsoBilling = null;
    vm.address = {};
    vm.SaveShippingAddress = saveShipAddress;
    vm.SaveCustomAddress = saveCustomAddress;
    vm.customShipping = false;
    vm.shippingAddress = null;

    function saveShipAddress(order) {
        if (order && order.ShippingAddressID) {
            Addresses.Get(order.ShippingAddressID)
                .then(function(address){
                    Orders.SetShippingAddress(order.ID, address)
                        .then(function() {
                            $rootScope.$broadcast('OrderShippingAddressChanged', order, address);
                        });
                })

        }
    }

    function saveCustomAddress(order) {
        if (vm.saveAddress) {
            Addresses.Create(vm.address)
                .then(function(address) {
                    ImpersonationService.Impersonation(function() {
                        Me.Get()
                            .then(function(me) {
                                Addresses.SaveAssignment({
                                    AddressID: address.ID,
                                    UserID: me.ID,
                                    IsBilling: vm.isAlsoBilling,
                                    IsShipping: true
                                })
                                    .then(function() {
                                        Addresses.Get(address.ID)
                                            .then(function(address) {
                                                Orders.SetShippingAddress(order.ID, address)
                                                    .then(function() {
                                                        $state.reload();
                                                    });
                                    })
                                });
                            });
                    });
                });
        }
        else {
            Orders.SetShippingAddress(order.ID, vm.address)
                .then(function() {
                    $state.reload();
                });
        }
    }
}
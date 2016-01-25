angular.module('orderCloud')
	.config(checkoutShippingConfig)
	.controller('CheckoutShippingCtrl', CheckoutShippingController)
    .factory('OrderShippingAddress', OrderShippingAddressFactory)
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

function CheckoutShippingController($state, $rootScope, Addresses, Orders, Me, ImpersonationService, OrderShippingAddress) {
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
            OrderShippingAddress.Set(order.ShippingAddressID);
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

function OrderShippingAddressFactory($q, $localForage, appname, Addresses) {
    var StorageName = appname + '.ShippingAddressID';
    return {
        Get: Get,
        Set: Set,
        Clear: Clear
    };

    function Get() {
        var dfd = $q.defer();
        $localForage.getItem(StorageName)
            .then(function(shipID) {
                if (shipID) {
                    Addresses.Get(shipID)
                        .then(function(address) {
                            if (!address.Items) {
                                dfd.resolve(address);
                            }
                            else dfd.reject();
                        })
                        .catch(function() {
                            Clear();
                            dfd.reject();
                        });
                }
                else dfd.reject();
            })
            .catch(function() {
                dfd.reject();
            });
        return dfd.promise;
    }

    function Set(ShipAddressID) {
        $localForage.setItem(StorageName, ShipAddressID);
    }

    function Clear() {
        $localForage.removeItem(StorageName);
    }
}

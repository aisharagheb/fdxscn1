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
				BillingAddresses: function($q, Me, Underscore, ImpersonationService) {
                    return ImpersonationService.Impersonation(function() {
                        var dfd = $q.defer();
                        Me.ListAddresses()
                            .then(function(data) {
                                dfd.resolve(Underscore.where(data.Items, {Biling: true}));
                            });
                        return dfd.promise;
                    });
				}
			}
		})
}

function CheckoutBillingController($state, Orders, Addresses, BillingAddresses, Me, ImpersonationService) {
	var vm = this;
	vm.billingAddresses = BillingAddresses;
    vm.SaveBillingAddress = SaveBillingAddress;
    vm.SaveCustomAddress = SaveCustomAddress;

    function SaveBillingAddress(order) {
        if (order && order.BillingAddressID) {
            Orders.Patch(order.ID, {BillingAddressID: order.BillingAddressID})
                .then(function() {
                    $state.reload();
                })
        }
    }

    function SaveCustomAddress(order) {
        if (vm.saveAddress) {
            Addresses.Create(vm.address)
                .then(function(address) {
                    ImpersonationService.Impersonation(function() {
                        Me.Get()
                            .then(function(me) {
                                Addresses.SaveAssignment({
                                    AddressID: address.ID,
                                    UserID: me.ID,
                                    IsBilling: true,
                                    IsShipping: false
                                })
                                .then(function() {
                                    Orders.Patch(order.ID, {BillingAddressID: address.ID})
                                        .then(function() {
                                            $state.reload();
                                        });
                                });
                            });
                    });
                });
        }
        else {
            Orders.SetBillingAddress(order.ID, vm.address)
                .then(function() {
                    $state.reload();
                });
        }
    }
}
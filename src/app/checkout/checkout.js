angular.module('orderCloud')
	.config(checkoutConfig)
	.controller('CheckoutCtrl', CheckoutController)
	.controller('OrderReviewCtrl', OrderReviewController)
	.controller('OrderConfirmationCtrl', OrderConfirmationController)
    //toggle isMultipleAddressShipping if you do not wish to allow line items to ship to multiple addresses
    .constant('isMultipleAddressShipping', true);
;

function checkoutConfig($stateProvider) {
	$stateProvider
		.state('checkout', {
			parent: 'base',
            data: {componentName: 'Checkout'},
			url: '/checkout',
			templateUrl: 'checkout/templates/checkout.tpl.html',
			controller: 'CheckoutCtrl',
			controllerAs: 'checkout',
			resolve: {
                CurrentOrder: function(CurrentOrder) {
                    return CurrentOrder.Get();
                },
				LineItemsList: function($q, Underscore, Products, LineItems, CurrentOrder) {
					var dfd = $q.defer();
					LineItems.Get(CurrentOrder.ID)
						.then(function(data) {
							var productQueue =[];
							var productIDs = Underscore.uniq(Underscore.pluck(data.Items, 'ProductID'));
							angular.forEach(productIDs, function(id) {
								productQueue.push(Products.Get(id));
							});
							$q.all(productQueue)
								.then(function(results) {
									angular.forEach(data.Items, function(li) {
										li.Product = angular.copy(Underscore.where(results, {ID:li.ProductID})[0]);
									});
									dfd.resolve(data);
								})
						});
					return dfd.promise;
				},
                ShippingAddresses: function($q, Me, Underscore, ImpersonationService, CurrentOrder) {
                    return ImpersonationService.Impersonation(function() {
                        var dfd = $q.defer();
                        Me.ListAddresses()
                            .then(function(data) {
                                dfd.resolve(Underscore.where(data.Items, {Shipping:true}));
                            });
                        return dfd.promise;
                    });
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
		.state('orderReview', {
            parent: 'base',
            data: {componentName: 'Checkout'},
			url: '/order/:orderid/review',
            templateUrl: 'checkout/templates/review.tpl.html',
            controller: 'OrderReviewCtrl',
            controllerAs: 'orderReview',
            resolve: {
                SubmittedOrder: function(Orders, $stateParams, $state, toastr) {
                    return Orders.Get($stateParams.orderid)
                        .then(function(order){
                            if(order.Status == 'Unsubmitted') {
                                $state.go('checkout.shipping')
                                    .then(function() {
                                        toastr.error('You cannot review an Unsubmitted Order', 'Error');
                                    })
                            }
                        })
                }
			}
		})

}

function CheckoutController($q, $state, CurrentOrder, LineItemsList, Addresses, LineItems, Products, Underscore, ShippingAddresses, LineItemHelpers, isMultipleAddressShipping) {
	var vm = this;
	vm.lineItems = LineItemsList;
	vm.currentOrder = CurrentOrder;
    vm.currentShipAddress = null;
    vm.shippingAddresses = ShippingAddresses;
    vm.updateLineItemShipping = UpdateShipping;
    vm.removeItem = LineItemHelpers.RemoveItem;
    vm.updateQuantity = LineItemHelpers.UpdateQuantity;
    vm.setCustomShipping = LineItemHelpers.CustomShipper;
    vm.isMultipleAddressShipping = isMultipleAddressShipping;

    // currently selected shipping address if all line items are going to the same place
    vm.currentOrder.ShippingAddressID = vm.lineItems.Items[0].ShippingAddressID;
    angular.forEach(vm.lineItems.Items, function(item) {
        if (vm.currentOrder.ShippingAddressID !== item.ShippingAddressID) {
            vm.currentOrder.ShippingAddressID = null;
        }
    });
    if (vm.currentOrder.ShippingAddressID) {
        vm.currentShipAddress = Underscore.where(vm.shippingAddresses, {ID: vm.currentOrder.ShippingAddressID})[0];
    }

    // paging function for line items
	vm.pagingfunction = function() {
		if (vm.lineItems.Meta.Page < vm.lineItems.Meta.TotalPages) {
			var dfd = $q.defer();
			LineItems.List(CurrentOrder.ID, vm.lineItems.Meta.Page + 1, vm.lineItems.Meta.PageSize)
				.then(function(data) {
					vm.lineItems.Meta = data.Meta;
					var productQueue = [];
					var productIDs = Underscore.uniq(Underscore.pluck(data.Items, 'ProductID'));
					angular.forEach(productIDs, function(id) {
						productQueue.push(Products.Get(id));
					});
					$q.all(productQueue)
						.then(function(results) {
							angular.forEach(data.Items, function(li) {
								li.Product = angular.copy(Underscore.where(results, {ID:li.ProductID})[0]);
							});
							vm.lineItems.Items = [].concat(vm.lineItems.Items, data.Items);
						})
				});
			return dfd.promise;
		}
		else return null;
	}

    function UpdateShipping(lineItem) {
        // Only lineItem.ShippingAddress.ID has the changed shipping address!
        Addresses.Get(lineItem.ShippingAddress.ID)
            .then(function(address) {
                LineItems.SetShippingAddress(vm.currentOrder.ID, lineItem.ID, address)
                    .then(function(address) {
                        console.log(address);
                        lineItem.ShippingAddress = address;
                    });
            });
    }

    // default state (if someone navigates to checkout -> checkout.shipping)
    if ($state.current.name === 'checkout') {
        $state.transitionTo('checkout.shipping');
    }
}

function OrderConfirmationController(CurrentOrder, LineItemsList, Orders, $state, isMultipleAddressShipping) {
    var vm = this;
    vm.currentOrder = CurrentOrder;
    vm.lineItems = LineItemsList;
    vm.isMultipleAddressShipping = isMultipleAddressShipping;

    vm.submitOrder = function() {
        Orders.Submit(vm.currentOrder.ID)
            .then(function() {
                CurrentOrder.Remove()
                    .then(function(){
                        $state.go('orderReview', {orderid: vm.currentOrder.ID})
                    })
            })
    }
}

function OrderReviewController(SubmittedOrder) {
	var vm = this;
    vm.submittedOrder = SubmittedOrder;

    //if(vm.submittedOrder.Status == 'Unsubmitted') {
    //    $state.go('checkout')
    //        .then(function() {
    //            toastr.error('You cannot review an Unsubmitted Order', 'Error');
    //        })
    //}
}


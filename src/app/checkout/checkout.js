angular.module('orderCloud')
	.config(checkoutConfig)
	.controller('CheckoutCtrl', CheckoutController)
	.controller('OrderReviewCtrl', OrderReviewController)
	.controller('OrderConfirmationCtrl', OrderConfirmationController)
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
                ShippingAddresses: function($q, Me, Underscore, ImpersonationService) {
                    return ImpersonationService.Impersonation(function() {
                        var dfd = $q.defer();
                        Me.ListAddresses()
                            .then(function(data) {
                                dfd.resolve(Underscore.where(data.Items, {Shipping:true}));
                            });
                        return dfd.promise;
                    });
                },
                CustomShippingAddresses: function($q, Underscore, ShippingAddresses, LineItemsList, Addresses) {
                    // Return Addresses that are not saved or assigned anywhere but my exist on the LineItems (created with Orders.SetShippingAddress({{ new address }});)
                    var ShippingAddressIDs = Underscore.pluck(ShippingAddresses, 'ID');
                    var LIShippingAddressIDs = Underscore.uniq(Underscore.pluck(LineItemsList.Items, 'ShippingAddress.ID'));
                    var dfd = $q.defer();
                    var queue = [];
                    angular.forEach(LIShippingAddressIDs, function(LI_ID) {
                        if (ShippingAddressIDs.indexOf(LI_ID) === -1) {
                            queue.push(Addresses.Get(LI_ID));
                        }
                    });
                    $q.all(queue)
                        .then(function() {
                            dfd.resolve();
                        });
                    return dfd.promise;
                }
			}
		})
		.state('checkout.review', {
			url: '/review',
			views: {
				'@base': {
					templateUrl: 'checkout/templates/review.tpl.html',
					controller: 'OrderReviewCtrl',
					controllerAs: 'orderReview'
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

function CheckoutController($q, $state, CurrentOrder, LineItemsList, Addresses, LineItems, Products, Underscore, ShippingAddresses) {
	var vm = this;
	vm.lineItems = LineItemsList;
	vm.currentOrder = CurrentOrder;
    vm.shippingAddresses = ShippingAddresses;
    vm.updateLineItemShipping = UpdateShipping;
    vm.removeItem = DeleteItem;
    vm.updateQuantity = UpdateQuantity;

    vm.currentOrder.ShippingAddressID = vm.lineItems.Items[0].ShippingAddressID;
    angular.forEach(vm.lineItems.Items, function(item) {
        if (vm.currentOrder.ShippingAddressID !== item.ShippingAddressID) {
            vm.currentOrder.ShippingAddressID = null;
        }
    });

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

    function DeleteItem(LineItemID) {
        LineItems.Delete(vm.order.ID, LineItemID)
            .then(function() {
                $state.reload();
            });
    }

    function UpdateQuantity(LineItem) {
        if (LineItem.Quantity > 0) {
            LineItems.Patch(vm.order.ID, LineItem.ID, {Quantity: LineItem.Quantity})
                .then(function() {
                    $state.reload();
                });
        }
    }

    $state.transitionTo('checkout.shipping');
}

function OrderReviewController() {
	var vm = this;
}

function OrderConfirmationController() {
	var vm = this;
}
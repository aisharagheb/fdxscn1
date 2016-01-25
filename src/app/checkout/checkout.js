angular.module('orderCloud')
	.config(checkoutConfig)
	.controller('CheckoutCtrl', CheckoutController)
	.controller('OrderReviewCtrl', OrderReviewController)
	.controller('OrderConfirmationCtrl', OrderConfirmationController)
    .directive('ordercloudCheckoutLineitems', CheckoutLineItemsListDirective)
    .directive('ordercloudConfirmationLineitems', ConfirmationLineItemsListDirective)
    .controller('CheckoutLineItemsCtrl', CheckoutLineItemsController)
    .controller('ConfirmationLineItemsCtrl', ConfirmationLineItemsController)
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
                Order: function($q, $state, toastr, CurrentOrder) {
                    var dfd = $q.defer();
                    CurrentOrder.Get()
                        .then(function(order) {
                            dfd.resolve(order)
                        })
                        .catch(function() {
                            toastr.error('You do not have an active open order.', 'Error');
                            if ($state.current.name.indexOf('checkout') > -1) {
                                $state.go('home');
                            }
                            dfd.reject();
                        });
                    return dfd.promise;
                },
                OrderShipAddress: function($q, OrderShippingAddress) {
                    var dfd = $q.defer();
                    OrderShippingAddress.Get()
                        .then(function(data) {
                            dfd.resolve(data);
                        })
                        .catch(function() {
                            dfd.resolve(null);
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
                SubmittedOrder: function($q, Orders, $stateParams, $state, toastr) {
                    var dfd = $q.defer();
                    Orders.Get($stateParams.orderid)
                        .then(function(order){
                            if(order.Status == 'Unsubmitted') {
                                $state.go('checkout.shipping')
                                    .then(function() {
                                        toastr.error('You cannot review an Unsubmitted Order', 'Error');
                                        dfd.reject();
                                    });
                            }
                            else dfd.resolve(order);
                        });
                    return dfd.promise;
                }
			}
		})

}

function CheckoutController($state, $rootScope, Order, Orders, ShippingAddresses, OrderShipAddress, OrderShippingAddress) {
    var vm = this;
    vm.currentOrder = Order;
    vm.currentOrder.ShippingAddressID = OrderShipAddress ? OrderShipAddress.ID : null;
    vm.currentOrder.ShippingAddress = OrderShipAddress;
    vm.shippingAddresses = ShippingAddresses;
    vm.isMultipleAddressShipping = true;

    vm.orderIsValid = false;
    if(vm.currentOrder.BillingAddress && vm.currentOrder.BillingAddress.ID != null && vm.currentOrder.PaymentMethod != null){
        vm.orderIsValid = true;
    }

    // default state (if someone navigates to checkout -> checkout.shipping)
    if ($state.current.name === 'checkout') {
        $state.transitionTo('checkout.shipping');
    }

    $rootScope.$on('OrderShippingAddressChanged', function(event, order, address) {
        vm.currentOrder = order;
        vm.currentOrder.ShippingAddressID = address.ID;
        vm.currentOrder.ShippingAddress = address;
    });

    $rootScope.$on('OC:UpdateOrder', function(event, OrderID) {
        Orders.Get(OrderID)
            .then(function(data) {
                vm.currentOrder.Subtotal = data.Subtotal;
            });
    });

    $rootScope.$on('LineItemAddressUpdated', function() {
        vm.currentOrder.ShippingAddress = null;
        vm.currentOrder.ShippingAddressID = null;
        OrderShippingAddress.Clear();
    });
}

function OrderConfirmationController(Order, CurrentOrder, Orders, $state, isMultipleAddressShipping, $exceptionHandler) {
    var vm = this;
    vm.currentOrder = Order;
    vm.isMultipleAddressShipping = isMultipleAddressShipping;

    vm.submitOrder = function() {
        Orders.Submit(vm.currentOrder.ID)
            .then(function() {
                CurrentOrder.Remove()
                    .then(function(){
                        $state.go('orderReview', {orderid: vm.currentOrder.ID})
                    })
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function OrderReviewController(SubmittedOrder, isMultipleAddressShipping, LineItems, $q, LineItemHelpers) {
	var vm = this;
    vm.submittedOrder = SubmittedOrder;
    vm.isMultipleAddressShipping = isMultipleAddressShipping;

    var dfd = $q.defer();
    var queue = [];
    LineItems.List(vm.submittedOrder.ID)
        .then(function(li) {
            vm.LineItems = li;
            if (li.Meta.TotalPages > li.Meta.Page) {
                var page = li.Meta.Page;
                while (page < li.Meta.TotalPages) {
                    page += 1;
                    queue.push(LineItems.List(vm.submittedOrder.ID, page));
                }
            }
            $q.all(queue)
                .then(function(results) {
                    angular.forEach(results, function(result) {
                        vm.LineItems.Items = [].concat(vm.LineItems.Items, result.Items);
                        vm.LineItems.Meta = result.Meta;
                    });
                    dfd.resolve(LineItemHelpers.GetProductInfo(vm.LineItems.Items.reverse()));
                });
        });

    vm.print = function() {
        window.print();
    }

}

function CheckoutLineItemsListDirective() {
    return {
        scope: {
            order: '=',
            addresses: '='
        },
        templateUrl: 'checkout/templates/checkout.lineitems.tpl.html',
        controller: 'CheckoutLineItemsCtrl',
        controllerAs: 'checkoutLI'
    };
}

function CheckoutLineItemsController($scope, $q, LineItems, LineItemHelpers, Underscore) {
    var vm = this;
    vm.lineItems = {};
    vm.UpdateQuantity = LineItemHelpers.UpdateQuantity;
    vm.UpdateShipping = LineItemHelpers.UpdateShipping;
    vm.setCustomShipping = LineItemHelpers.CustomShipping;
    vm.RemoveItem = LineItemHelpers.RemoveItem;

    $scope.$on('LineItemAddressUpdated', function(event, LineItemID, address) {
        Underscore.where(vm.lineItems.Items, {ID: LineItemID})[0].ShippingAddress = address;
    });

    $scope.$on('OrderShippingAddressChanged', function(event, order, address) {
        angular.forEach(vm.lineItems.Items, function(li) {
            li.ShippingAddressID = address.ID;
            li.ShippingAddress = address;
        });
    });

    $scope.$watch(function() {
        return $scope.order.ID;
    }, function() {
        LineItemsInit($scope.order.ID)
    });

    function LineItemsInit(OrderID) {
        LineItems.Get(OrderID)
            .then(function(data) {
                vm.lineItems = data;
                LineItemHelpers.GetProductInfo(vm.lineItems.Items);
            });
    }

    vm.pagingfunction = function() {
        if (vm.lineItems.Meta.Page < vm.lineItems.Meta.TotalPages) {
            var dfd = $q.defer();
            LineItems.List($scope.order.ID, vm.lineItems.Meta.Page + 1, vm.lineItems.Meta.PageSize)
                .then(function(data) {
                    vm.lineItems.Meta = data.Meta;
                    vm.lineItems.Items = [].concat(vm.lineItems.Items, data.Items);
                    LineItemHelpers.GetProductInfo(vm.lineItems.Items);
                });
            return dfd.promise;
        }
        else return null;
    }
}

function ConfirmationLineItemsListDirective() {
    return {
        scope: {
            order: '='
        },
        templateUrl: 'checkout/templates/confirmation.lineitems.tpl.html',
        controller: 'ConfirmationLineItemsCtrl',
        controllerAs: 'confirmationLI'
    };
}

function ConfirmationLineItemsController($scope, $q, LineItems, LineItemHelpers, isMultipleAddressShipping) {
    var vm = this;
    vm.lineItems = {};
    vm.isMultipleAddressShipping = isMultipleAddressShipping;

    $scope.$watch(function() {
        return $scope.order.ID;
    }, function() {
        LineItems.Get($scope.order.ID)
            .then(function(data) {
                vm.lineItems = data;
                LineItemHelpers.GetProductInfo(vm.lineItems.Items);
            });
    });

    vm.pagingfunction = function() {
        if (vm.lineItems.Meta.Page < vm.lineItems.Meta.TotalPages) {
            var dfd = $q.defer();
            LineItems.List($scope.order.ID, vm.lineItems.Meta.Page + 1, vm.lineItems.Meta.PageSize)
                .then(function(data) {
                    vm.lineItems.Meta = data.Meta;
                    vm.lineItems.Items = [].concat(vm.lineItems.Items, data.Items);
                    LineItemHelpers.GetProductInfo(vm.lineItems.Items);
                });
            return dfd.promise;
        }
        else return null;
    }
}

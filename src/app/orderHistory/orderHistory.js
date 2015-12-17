angular.module( 'orderCloud' )

    .config( OrderHistoryConfig )
    .controller( 'OrderHistoryCtrl', OrderHistoryController )
    .controller( 'OrderHistoryDetailCtrl', OrderHistoryDetailController )
    .controller( 'OrderHistoryDetailLineItemCtrl', OrderHistoryDetailLineItemController )
    .factory( 'OrderHistoryFactory', OrderHistoryFactory )
    .filter('paymentmethods', paymentmethods)
;

function OrderHistoryConfig( $stateProvider ) {
    $stateProvider
        .state( 'orderHistory', {
            parent: 'base',
            url: '/order-history',
            templateUrl:'orderHistory/templates/orderHistory.list.tpl.html',
            controller:'OrderHistoryCtrl',
            controllerAs: 'orderHistory',
            data: {componentName: 'Order History'},
            resolve: {
                OrderList: function(Orders) {
                    return Orders.List('incoming');
                }
            }
        })
        .state( 'orderHistory.detail', {
            url: '/:orderid',
            templateUrl: 'orderHistory/templates/orderHistory.detail.tpl.html',
            controller: 'OrderHistoryDetailCtrl',
            controllerAs: 'orderHistoryDetail',
            resolve: {
                SelectedOrder: function($stateParams, OrderHistoryFactory) {
                    return OrderHistoryFactory.GetOrderDetails($stateParams.orderid);
                }
            }
        })
        .state( 'orderHistory.detail.lineItem', {
            url: '/:lineitemid',
            templateUrl: 'orderHistory/templates/orderHistory.detail.lineItem.tpl.html',
            controller: 'OrderHistoryDetailLineItemCtrl',
            controllerAs: 'orderHistoryDetailLineItem',
            resolve: {
                SelectedLineItem: function($stateParams, OrderHistoryFactory) {
                    return OrderHistoryFactory.GetLineItemDetails($stateParams.orderid, $stateParams.lineitemid);
                }
            }
        })
    ;
}

function OrderHistoryController( OrderList ) {
    var vm = this;
    vm.orders = OrderList;
}

function OrderHistoryDetailController( SelectedOrder ) {
    var vm = this;
    vm.order = SelectedOrder;
}

function OrderHistoryDetailLineItemController( SelectedLineItem ) {
    var vm = this;
    vm.lineItem = SelectedLineItem;
}

function OrderHistoryFactory( $q, Underscore, Orders, LineItems, Products, SpendingAccounts ) {
    var service = {
        GetOrderDetails: _getOrderDetails,
        GetLineItemDetails: _getLineItemDetails
    };

    function _getOrderDetails(orderID) {
        var deferred = $q.defer();
        var order;
        var lineItemQueue = [];
        var productQueue = [];

        Orders.Get(orderID)
            .then(function(data) {
                order = data;
                order.LineItems = [];
                gatherLineItems();
            });

        function gatherLineItems() {
            LineItems.List(orderID, 1, 100)
                .then(function(data) {
                    order.LineItems = order.LineItems.concat(data.Items);
                    for (var i = 2; i <= data.Meta.TotalPages; i++) {
                        lineItemQueue.push(LineItems.List(orderID, i, 100));
                    }
                    $q.all(lineItemQueue).then(function(results) {
                        angular.forEach(results, function(result) {
                            order.LineItems = order.LineItems.concat(result.Items);
                        });
                        gatherProducts();
                    });
                });
        }

        function gatherProducts() {
            var productIDs = Underscore.uniq(Underscore.pluck(order.LineItems, 'ProductID'));

            angular.forEach(productIDs, function(productID) {
                productQueue.push((function() {
                    var d = $q.defer();

                    Products.Get(productID)
                        .then(function(product) {
                            angular.forEach(Underscore.where(order.LineItems, {ProductID: product.ID}), function(item) {
                                item.Product = product;
                            });

                            d.resolve();
                        });

                    return d.promise;
                })());
            });

            $q.all(productQueue).then(function() {
                if (order.SpendingAccountID) {
                    SpendingAccounts.Get(order.SpendingAccountID)
                        .then(function(sa) {
                            order.SpendingAccount = sa;
                            deferred.resolve(order);
                        });
                }
                else {
                    deferred.resolve(order);
                }
            });
        }

        return deferred.promise;
    }

    function _getLineItemDetails(orderID, lineItemID) {
        var deferred = $q.defer();
        var lineItem;

        LineItems.Get(orderID, lineItemID)
            .then(function(li) {
                lineItem = li;
                getProduct();
            });

        function getProduct() {
            Products.Get(lineItem.ProductID)
                .then(function(product) {
                    lineItem.Product = product;
                    deferred.resolve(lineItem);
                });
        }

        return deferred.promise;
    }

    return service;
}

function paymentmethods() {
    var map = {
        'PurchaseOrder': 'Purchase Order',
        'CreditCard': 'CreditCard',
        'SpendingAccount': 'Spending Account',
        'PayPalExpressCheckout': 'PayPal Express Checkout'
    };
    return function(method) {
        if (!map[method]) return method;
        return map[method];
    }
}
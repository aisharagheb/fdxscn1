angular.module( 'orderCloud' )

    .config( OrderHistoryConfig )
    .controller( 'OrderHistoryCtrl', OrderHistoryController )
    .controller( 'OrderHistoryDetailCtrl', OrderHistoryDetailController )
    .factory( 'OrderHistoryFactory', OrderHistoryFactory )
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

function OrderHistoryFactory( $q, Underscore, Orders, LineItems, Products ) {
    var service = {
        GetOrderDetails: _getOrderDetails
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
                deferred.resolve(order);
            });
        }

        return deferred.promise;
    }

    return service;
}
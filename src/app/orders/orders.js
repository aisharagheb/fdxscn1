angular.module( 'orderCloud' )

    .config( OrdersConfig )
    .controller( 'OrdersCtrl', OrdersController )
    .controller( 'OrderEditCtrl', OrderEditController )
;

function OrdersConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.orders', {
            url: '/orders',
            templateUrl:'orders/templates/orders.tpl.html',
            controller:'OrdersCtrl',
            controllerAs: 'orders',
            data: {componentName: 'Orders'},
            resolve: {
                OrderList: function(Orders) {
                    return Orders.List('incoming');
                }
            }
        })
        .state( 'base.orderEdit', {
            url: '/orders/:orderid/edit',
            templateUrl:'orders/templates/orderEdit.tpl.html',
            controller:'OrderEditCtrl',
            controllerAs: 'orderEdit',
            resolve: {
                SelectedOrder: function($stateParams, Orders) {
                    return Orders.Get($stateParams.orderid);
                },
                LineItemList: function($stateParams, LineItems) {
                    return LineItems.List($stateParams.orderid, 1, 20);
                }
            }
        });
}

function OrdersController( OrderList ) {
    var vm = this;
    vm.list = OrderList;
}

function OrderEditController( $exceptionHandler, $state, SelectedOrder, LineItemList, Orders, LineItems, $scope ) {
    var vm = this,
        orderid = SelectedOrder.ID;
    vm.order = SelectedOrder;
    vm.orderID = SelectedOrder.ID;
    vm.list = LineItemList;

    vm.deleteLineItem = function(lineitem) {
        LineItems.Delete(orderid, lineitem.ID)
            .then(function() {
                $state.go($state.current, {}, {reload: true});
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };

    vm.goToProduct = function(lineitem) {
        $state.go('base.productEdit', {'productid': lineitem.ProductID});
    };

    vm.Submit = function() {

        angular.forEach(vm.list.Items, function(lineitem, index) {
            if ($scope.EditForm['Quantity' + index].$dirty || $scope.EditForm['UnitPrice' + index].$dirty ) {
                LineItems.Update(orderid, lineitem.ID, lineitem);
            }
        });
        Orders.Update(orderid, vm.order)
            .then(function() {
                $state.go('^.orders');
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };

    vm.Delete = function() {
        Orders.Delete(orderid)
            .then(function() {
                $state.go('^.orders');
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    }
}
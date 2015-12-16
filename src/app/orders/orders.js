angular.module( 'orderCloud' )

    .config( OrdersConfig )
    .controller( 'OrdersCtrl', OrdersController )
    .controller( 'OrderEditCtrl', OrderEditController )
    .factory( 'OrdersTypeAheadSearchFactory', OrdersTypeAheadSearchFactory )
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
                    return LineItems.List($stateParams.orderid);
                }
            }
        })
    ;
}

function OrdersController(OrderList) {
    var vm = this;
    vm.list = OrderList;
}

function OrderEditController( $exceptionHandler, $state, SelectedOrder, OrdersTypeAheadSearchFactory, LineItemList, Orders, LineItems, $scope ) {
    var vm = this,
    orderid = SelectedOrder.ID;
    vm.order = SelectedOrder;
    vm.orderID = SelectedOrder.ID;
    vm.list = LineItemList;
    vm.pagingfunction = PagingFunction;

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
                $state.go('base.orders');
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };

    vm.Delete = function() {
        Orders.Delete(orderid)
            .then(function() {
                $state.go('base.orders');
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };

    function PagingFunction() {
        if (vm.list.Meta.Page < vm.list.Meta.PageSize) {
            LineItems.List(vm.order.ID, vm.list.Meta.Page + 1, vm.list.Meta.PageSize).then(
                function(data) {
                    vm.list.Meta = data.Meta;
                    vm.list.Items = [].concat(vm.list.Items, data.Items);
                }
            )
        }
    }
    vm.spendingAccountTypeAhead = OrdersTypeAheadSearchFactory.SpendingAccountList;
    vm.shippingAddressTypeAhead = OrdersTypeAheadSearchFactory.ShippingAddressList;
    vm.billingAddressTypeAhead = OrdersTypeAheadSearchFactory.BillingAddressList;
}

function OrdersTypeAheadSearchFactory($q, SpendingAccounts, Addresses, Underscore) {
    return {
        SpendingAccountList: SpendingAccountList,
        ShippingAddressList: ShippingAddressList,
        BillingAddressList: BillingAddressList
    };

    function SpendingAccountList(term) {
        return SpendingAccounts.List(term).then(function(data) {
            return data.Items;
        });
    }

    function ShippingAddressList(term) {
        var dfd = $q.defer();
        var queue = [];
        queue.push(Addresses.List(term));
        queue.push(Addresses.ListAssignments(null, null, null, null, true));
        $q.all(queue)
            .then(function(result) {
                var searchAssigned = Underscore.intersection(Underscore.pluck(result[0].Items, 'ID'), Underscore.pluck(result[1].Items, 'AddressID'));
                var addressList = Underscore.filter(result[0].Items, function(address) {
                    if (searchAssigned.indexOf(address.ID) > -1) {
                        return address;
                    }
                })
                dfd.resolve(addressList);
            });
        return dfd.promise;
    }

    function BillingAddressList(term) {
        var dfd = $q.defer();
        var queue = [];
        queue.push(Addresses.List(term));
        queue.push(Addresses.ListAssignments(null, null, null, null, null, true));
        $q.all(queue)
            .then(function(result) {
                var searchAssigned = Underscore.intersection(Underscore.pluck(result[0].Items, 'ID'), Underscore.pluck(result[1].Items, 'AddressID'));
                var addressList = Underscore.filter(result[0].Items, function(address) {
                    if (searchAssigned.indexOf(address.ID) > -1) {
                        return address;
                    }
                })
                dfd.resolve(addressList);
            });
        return dfd.promise;
    }
}
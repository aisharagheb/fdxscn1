angular.module( 'orderCloud' )

    .config( OrdersConfig )
    .controller( 'OrdersCtrl', OrdersController )
    .controller( 'OrderEditCtrl', OrderEditController )
    .factory( 'OrdersTypeAheadSearchFactory', OrdersTypeAheadSearchFactory )
;

function OrdersConfig( $stateProvider ) {
    $stateProvider
        .state( 'orders', {
            parent: 'base',
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
        .state( 'orders.edit', {
            url: '/:orderid/edit',
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

function OrderEditController( $exceptionHandler, $state, SelectedOrder, OrdersTypeAheadSearchFactory, LineItemList, Orders, LineItems, $scope, $q, Users) {
    var vm = this,
    orderid = SelectedOrder.ID;
    vm.order = SelectedOrder;
    vm.orderID = SelectedOrder.ID;
    vm.list = LineItemList;
    vm.pagingfunction = PagingFunction;
    $scope.isCollapsedPayment = true;
    $scope.isCollapsedBilling = true;
    $scope.isCollapsedShipping = true;

    vm.deleteLineItem = function(lineitem) {
        LineItems.Delete(orderid, lineitem.ID)
            .then(function() {
                $state.go($state.current, {}, {reload: true});
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };

    vm.updateBillingAddress = function(){
        vm.order.BillingAddressID = null;
        vm.order.BillingAddress.ID = null;
        Orders.Update(orderid, vm.order)
            .then(function(){
            Orders.SetBillingAddress(orderid, vm.order.BillingAddress)
                .then(function() {
                    $state.go($state.current, {}, {reload: true});
                });
        })
    };

    vm.updateShippingAddress = function(){
        Orders.SetShippingAddress(orderid, vm.ShippingAddress)
            //.then(function() {
            //    $state.go($state.current, {}, {reload: true});
            //});
    };

    vm.Submit = function() {
        var dfd = $q.defer();
        var queue = [];
        angular.forEach(vm.list.Items, function(lineitem, index) {
            if ($scope.EditForm.LineItems['Quantity' + index].$dirty || $scope.EditForm.LineItems['UnitPrice' + index].$dirty ) {
                queue.push(LineItems.Update(orderid, lineitem.ID, lineitem));
            }
        });
        $q.all(queue)
            .then(function() {
                dfd.resolve();
                Orders.Update(orderid, vm.order)
                    .then(function() {
                        $state.go('orders', {}, {reload:true});
                    })
                    .catch(function(ex) {
                        $exceptionHandler(ex)
                    });
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });

        return dfd.promise;
    };

    vm.Delete = function() {
        Orders.Delete(orderid)
            .then(function() {
                $state.go('orders', {}, {reload:true});
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
                });
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
                });
                dfd.resolve(addressList);
            });
        return dfd.promise;
    }
}
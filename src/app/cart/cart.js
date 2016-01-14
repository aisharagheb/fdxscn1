angular.module('orderCloud')

    .config(CartConfig)
    .controller('CartCtrl', CartController)
    .controller('MiniCartCtrl', MiniCartController)
    .directive('ordercloudMinicart', OrderCloudMiniCartDirective)

;

function CartConfig($stateProvider) {
    $stateProvider
        .state('cart', {
            parent: 'base',
            data: {componentName: 'Cart'},
            url: '/cart',
            templateUrl: 'cart/templates/cart.tpl.html',
            controller: 'CartCtrl',
            controllerAs: 'cart',
            resolve: {
                Order: function($q, toastr, CurrentOrder) {
                    var dfd = $q.defer();
                    CurrentOrder.Get()
                        .then(function(order) {
                            dfd.resolve(order)
                        })
                        .catch(function() {
                            dfd.reject();
                            toastr.error('You do not have an active open order.', 'Error');
                        });
                    return dfd.promise;
                },
                LineItemsList: function($q, Order, Underscore, Me, LineItems, toastr, LineItemHelpers) {
                    var dfd = $q.defer();
                    LineItems.Get(Order.ID)
                        .then(function(data) {
                            if (!data.Items.length) {
                                toastr.error("Your order does not contain any line items.", 'Error');
                                dfd.reject();
                            }
                            else {
                                LineItemHelpers.GetProductInfo(data.Items)
                                    .then(function() {
                                        dfd.resolve(data);
                                    });
                            }
                        })
                        .catch(function() {
                            toastr.error("Your order does not contain any line items.", 'Error');
                            dfd.reject();
                        });
                    return dfd.promise;
                }
            }
        });
}

function CartController($q, Order, Orders, LineItemsList, LineItems, LineItemHelpers, $rootScope) {
    var vm = this;
    vm.order = Order;
    vm.lineItems = LineItemsList;
    vm.removeItem = LineItemHelpers.RemoveItem;
    vm.updateQuantity = LineItemHelpers.UpdateQuantity;
    vm.pagingfunction = PagingFunction;

    function PagingFunction() {
        var dfd = $q.defer();
        if (vm.lineItems.Meta.Page < vm.lineItems.Meta.TotalPages) {
            LineItems.List(vm.order.ID, vm.lineItems.Meta.Page + 1, vm.lineItems.Meta.PageSize)
                .then(function(data) {
                    vm.lineItems.Meta = data.Meta;
                    vm.lineItems.Items = [].concat(vm.lineItems.Items, data.Items);
                    LineItemHelpers.GetProductInfo(vm.lineItems.Items)
                        .then(function() {
                            dfd.resolve(vm.lineItems);
                        });
                });
        }
        else dfd.reject();
        return dfd.promise;
    }

    $rootScope.$on('LineItemQuantityUpdated', function() {
        Orders.Get(vm.order.ID)
            .then(function(data) {
                vm.order = data;
            });
    });
}

function MiniCartController($q, $scope, $rootScope, LineItems, Underscore, LineItemHelpers) {
    var vm = this;
    vm.LineItems = {};
    var queue = [];
    $scope.$watch(function() {
        return $scope.order.ID
    }, function(newVal) {
        if (!newVal) return;
        getLineItems($scope.order).then(function(data) {
            LineItemHelpers.GetProductInfo(data);
        });
    });

    function getLineItems(order) {
        var dfd = $q.defer();
        LineItems.List(order.ID)
            .then(function(li) {
                vm.LineItems = li;
                if (li.Meta.TotalPages > li.Meta.Page) {
                    var page = li.Meta.Page;
                    while (page < li.Meta.TotalPages) {
                        page += 1;
                        queue.push(LineItems.List(order.ID, page));
                    }
                }
                if (queue.length) {
                    $q.all(queue)
                        .then(function(results) {
                            angular.forEach(results, function(result) {
                                vm.LineItems.Items = [].concat(vm.LineItems.Items, result.Items);
                                vm.LineItems.Meta = result.Meta;
                            });
                            dfd.resolve(vm.LineItems.Items.reverse());
                        });
                }
                else dfd.resolve(vm.LineItems.Items.reverse());
            });
        return dfd.promise;
    }

    function getProductInfo(LineItems) {
        var products = Underscore.uniq(Underscore.pluck(LineItems.Items, 'ProductID'));
        var queue = [];
        angular.forEach(products, function(product) {
            queue.push(Products.Get(product));
        });
        $q.all(queue)
            .then(function(results) {
                angular.forEach(LineItems.Items, function(li) {
                    li.Product = angular.copy(Underscore.where(results, {ID:li.ProductID})[0]);
                });
            });
    }

    $rootScope.$on('LineItemAddedToCart', function() {
        getLineItems($scope.order)
            .then(function() {
                vm.showLineItems = true;
            });
    })
}

function OrderCloudMiniCartDirective() {
    return {
        restrict: 'E',
        scope: {
            order: '='
        },
        templateUrl: 'cart/templates/minicart.tpl.html',
        controller: 'MiniCartCtrl',
        controllerAs: 'minicart'
    };
}

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
                Order: function($state, toastr, CurrentOrder) {
                    return CurrentOrder.Get()
                        .catch(function() {
                            toastr.error('You do not have an active open order.', 'Error');
                            $state.go('home');
                        });
                },
                LineItemsList: function($q, Order, Underscore, Me, LineItems, ImpersonationService) {
                    var dfd = $q.defer();
                    LineItems.Get(Order.ID)
                        .then(function(data) {
                            var productQueue =[];
                            var productIDs = Underscore.uniq(Underscore.pluck(data.Items, 'ProductID'));
                            angular.forEach(productIDs, function(id) {
                                productQueue.push(ImpersonationService.Impersonation(function() {
                                    return Me.GetProduct(id);
                                }));
                            });
                            $q.all(productQueue)
                                .then(function(results) {
                                    angular.forEach(data.Items, function(li) {
                                        li.Product = angular.copy(Underscore.where(results, {ID:li.ProductID})[0]);
                                    });
                                    dfd.resolve(data);
                                })
                        })
                        .catch(function() {
                            toastr.error("Your order does not contain any line items.", 'Error');
                        });
                    return dfd.promise;
                }
            }
        });
}

function CartController($q, Underscore, $state, Order, Orders, LineItemsList, LineItems, LineItemHelpers, Products, $rootScope) {
    var vm = this;
    vm.order = Order;
    vm.lineItems = LineItemsList;
    vm.removeItem = LineItemHelpers.RemoveItem;
    vm.updateQuantity = LineItemHelpers.UpdateQuantity;
    vm.pagingfunction = PagingFunction;

    function PagingFunction() {
        if (vm.lineItems.Meta.Page < vm.lineItems.Meta.TotalPages) {
            var dfd = $q.defer();
            LineItems.List(vm.order.ID, vm.lineItems.Meta.Page + 1, vm.lineItems.Meta.PageSize)
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

    $rootScope.$on('LineItemAddedToCart', function() {
        $state.go('cart');
    });

    $rootScope.$on('LineItemUpdated', function() {
        $state.go('cart');
    });

    $rootScope.$on('LineItemQuantityUpdated', function() {
        Orders.Get(vm.order.ID)
            .then(function(data) {
                vm.order = data;
            });
    });
}

function MiniCartController($q, $scope, $rootScope, LineItems, Underscore, Products) {
    var vm = this;
    vm.LineItems = {};
    var queue = [];
    $scope.$watch(function() {
        return $scope.order.ID
    }, function(newVal) {
        if (!newVal) return;
        getLineItems($scope.order);
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
                            getProductInfo(vm.LineItems);
                            dfd.resolve(vm.LineItems.Items.reverse());
                        });
                }
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

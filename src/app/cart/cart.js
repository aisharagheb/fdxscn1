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
                Order: function(CurrentOrder) {
                    return CurrentOrder.Get();
                },
                LineItemsList: function($q, Order, Underscore, Products, LineItems) {
                    var dfd = $q.defer();
                    LineItems.Get(Order.ID)
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
                }
            }
        });
}

function CartController($q, Underscore, $state, Order, LineItemsList, LineItems, Products) {
    var vm = this;
    vm.order = Order;
    vm.lineItems = LineItemsList;
    vm.removeItem = DeleteItem;
    vm.updateQuantity = UpdateQuantity;
    vm.pagingfunction = PagingFunction;

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
}

function MiniCartController() {

}

function OrderCloudMiniCartDirective() {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'cart/templates/minicart.tpl.html',
        controller: 'MiniCartCtrl',
        controllerAs: 'minicart'
    };
}

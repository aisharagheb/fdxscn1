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

function CartController(Order, LineItemsList) {
    var vm = this;
    vm.order = Order;
    vm.lineItems = LineItemsList;
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

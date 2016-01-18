angular.module('orderCloud')

    .controller('OrderInputCtrl', OrderInputController)
    .directive('ordercloudOrderInput', OrderCloudOrderInputDirective)

;

function OrderCloudOrderInputDirective() {
    return {
        restrict: 'E',
        scope: {
            product: '=',
            validationform: '='
        },
        templateUrl: 'catalog/product/templates/order-input.tpl.html',
        controller: 'OrderInputCtrl',
        controllerAs: 'orderInput'
    };
}

function OrderInputController($state, appname, $scope, $rootScope, $localForage, Orders, LineItems, LineItemHelpers, CurrentOrder) {
    var vm = this,
        orderid;
    vm.currentState = $state.current.name;
    vm.price = null;
    vm.addToCart = AddToCart;

    $localForage.getItem(appname + '.CurrentOrderID').then(function(data) {
        orderid = data;
    });

    $scope.$on('$stateChangeSuccess', function(event, toState) {
        vm.currentState = toState.name;
    });

    $scope.$watch(function() {
        return vm.Quantity;
    }, function(newValue, oldValue) {
        if (newValue && newValue !== oldValue) {
            var max_quantity = 0;
            angular.forEach($scope.product.StandardPriceSchedule.PriceBreaks, function(PriceBreaks) {
                if (vm.Quantity >= PriceBreaks.Quantity && PriceBreaks.Quantity > max_quantity) {
                    max_quantity = PriceBreaks.Quantity;
                    vm.price = PriceBreaks.Price * vm.Quantity;
                }
                else return null;
            });
        }
        else if (!newValue) {
            vm.price = null;
        }
    });

    function AddToCart() {
        CurrentOrder.Get()
            .then(function(order) {
                AddLineItem(order, $scope.product);
            })
            .catch(function() {
                Orders.Create({})
                    .then(function(order) {
                        CurrentOrder.Set(order.ID);
                        AddLineItem(order, $scope.product);
                    });
            });
    }

    function AddLineItem(order, product) {
        LineItems.Create(order.ID, {
            ProductID: product.ID,
            Quantity: vm.Quantity,
            Specs: LineItemHelpers.SpecConvert(product.Specs)
        }).then(function(lineItem) {
            $rootScope.$broadcast('LineItemAddedToCart', order.ID, lineItem);
        });
    }
}

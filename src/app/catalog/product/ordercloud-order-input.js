angular.module('orderCloud')

    .controller('OrderInputCtrl', OrderInputController)
    .directive('ordercloudOrderInput', OrderCloudOrderInputDirective)

;

function OrderCloudOrderInputDirective() {
    return {
        restrict: 'E',
        scope: {
            product: '='
        },
        templateUrl: 'catalog/product/templates/order-input.tpl.html',
        controller: 'OrderInputCtrl',
        controllerAs: 'orderInput'
    };
}

function OrderInputController($state, appname, $scope, $localForage, Orders, LineItems) {
    var vm = this,
        orderid;
    vm.currentState = $state.current.name;
    vm.price = null;
    vm.addToCart = AddToCart;
    console.log($scope.product, vm.currentState);

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
            if ($scope.product.StandardPriceSchedule.RestrictedQuantity) {
                angular.forEach($scope.product.StandardPriceSchedule.PriceBreaks, function(PriceBreaks) {
                    if (vm.Quantity == PriceBreaks.Quantity) {
                        vm.price = PriceBreaks.Price * vm.Quantity;
                    }
                    else return null;
                });
            }
            else {
                //TODO: No restricted quantity
            }
        }
        else if (newValue === null) {
            vm.price = null;
        }
    });

    function AddToCart() {
        if (orderid) {
            Orders.Get(orderid).then(function(order) {
                AddLineItem(order, $scope.product);
            });
        }
        else {
            Orders.Create({}).then(function(order) {
                AddLineItem(order, $scope.product);
            });
        }
    }

    function AddLineItem(order, product) {
        console.log('hit add line item');
        LineItems.Create(order.ID, {
            ProductID: product.ID,
            Quantity: vm.Quantity,
            Specs: SetSpecs(product.Specs)
        }).then(function() {
            $localForage.setItem(appname + '.CurrentOrderID', order.ID);
        })
    }

    function SetSpecs(specs) {
        var results = [];
        angular.forEach(specs, function(spec) {
            var spec_to_push = {SpecID: spec.ID};
            if (spec.Options.length > 0) {
                if (spec.DefaultOptionID) {
                    spec_to_push.OptionID = spec.DefaultOptionID;
                }
                if (spec.Value) {
                    angular.forEach(spec.Options, function(option) {
                        if (option.Value === spec.Value) {
                            spec_to_push.Value = spec.Value;
                            spec_to_push.OptionID = spec.OptionID;
                        }
                    });
                }
                else if (spec.OptionID) {
                    spec_to_push.OptionID = spec.OptionID;
                }
            }
            else {
                spec_to_push.Value = spec.Value || spec.DefaultValue || null;
            }
            results.push(spec_to_push);
        });
        return results;
    }
}

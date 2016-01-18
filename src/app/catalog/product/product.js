angular.module('orderCloud')

    .config(ProductConfig)
    .directive('specSelectField', SpecSelectionDirective)
    .controller('ProductCtrl', ProductController)
    .controller('LineItemEditCtrl', LineItemEditController)

;

function ProductConfig($stateProvider) {
    $stateProvider
        .state('catalog.product', {
            url: '/product/:productid',
            templateUrl: 'catalog/product/templates/product.tpl.html',
            views: {
                '': {
                    templateUrl: 'catalog/product/templates/product.tpl.html',
                    controller: 'ProductCtrl',
                    controllerAs: 'product'
                },
                'view@catalog.product': {
                    templateUrl: 'catalog/product/templates/product.view.tpl.html',
                    controller: 'ProductCtrl',
                    controllerAs: 'product'
                }
            },
            resolve: {
                Product: function(Me, $stateParams, ImpersonationService) {
                    return ImpersonationService.Impersonation(function(){
                        return Me.GetProduct($stateParams.productid);
                    });
                },
                SpecList: function(Specs, $q, $stateParams) {
                    var queue = [];
                    var dfd = $q.defer();
                    Specs.ListProductAssignments(null, $stateParams.productid)
                        .then(function(data) {
                            angular.forEach(data.Items, function(assignment) {
                                queue.push(Specs.Get(assignment.SpecID));
                            });
                            $q.all(queue)
                                .then(function(result) {
                                    dfd.resolve(result);
                                });
                        })
                        .catch(function(response) {

                        });
                    return dfd.promise;
                }
            }
        })
        .state('catalog.product.config', {
            url: '/config/:specformid',
            views: {
                'view@catalog.product': {
                    templateUrl: function($stateParams) {
                        var spec_form = 'default-spec-form';
                        if ($stateParams.specformid) {
                            spec_form = $stateParams.specformid;
                        }
                        return 'catalog/product/templates/spec-forms/' + spec_form + '.tpl.html';
                    },
                    controller: 'ProductCtrl',
                    controllerAs: 'product'
                }
            }
        })
        .state('catalog.lineitem', {
            url: '/lineitem/:lineitemid/edit/:specformid',
            views: {
                '': {
                    templateUrl: 'catalog/product/templates/lineitem.edit.tpl.html',
                    controller: 'LineItemEditCtrl',
                    controllerAs: 'product'
                },
                'view@catalog.lineitem': {
                    templateUrl: function($stateParams) {
                        var spec_form = 'default-spec-form';
                        if ($stateParams.specformid) {
                            spec_form = $stateParams.specformid;
                        }
                        return 'catalog/product/templates/spec-forms/' + spec_form + '.tpl.html';
                    },
                    controller: 'LineItemEditCtrl',
                    controllerAs: 'product'
                }
            },
            resolve: {
                LineItem: function($stateParams, Order, LineItems) {
                    return LineItems.Get(Order.ID, $stateParams.lineitemid);
                },
                LI_Product: function(Me, ImpersonationService, LineItem) {
                    return ImpersonationService.Impersonation(function() {
                        return Me.GetProduct(LineItem.ProductID);
                    });
                },
                LI_SpecList: function(Specs, $q, LineItem) {
                    var queue = [];
                    var dfd = $q.defer();
                    Specs.ListProductAssignments(null, LineItem.ProductID)
                        .then(function(data) {
                            angular.forEach(data.Items, function(assignment) {
                                queue.push(Specs.Get(assignment.SpecID));
                            });
                            $q.all(queue)
                                .then(function(result) {
                                    dfd.resolve(result);
                                });
                        })
                        .catch(function(response) {

                        });
                    return dfd.promise;
                }
            }
        });
}

function SpecSelectionDirective(Specs) {
    return {
        scope: {
            spec: '='
        },
        templateUrl: 'catalog/product/templates/spec.selectionfield.tpl.html',
        link: function(scope) {
            scope.showField = false;
            scope.$watch(function() {
                return scope.spec.OptionID;
            }, function(newVal, oldVal) {
                if (!newVal) return;
                Specs.GetOption(scope.spec.ID, scope.spec.OptionID)
                    .then(function(specOption) {
                        if (specOption.IsOpenText) {
                            scope.showField = true;
                            scope.spec.Value = null;
                        }
                        else {
                            scope.showField = false;
                        }
                    });
            });
        }
    };
}

function ProductController(Product, SpecList, Order) {
    var vm = this;
    vm.item = Product;
    vm.order = Order;
    vm.item.Specs = SpecList;
}

function LineItemEditController(Underscore, LineItem, LineItems, LineItemHelpers, LI_Product, LI_SpecList, $rootScope) {
    var vm = this;
    vm.item = LI_Product;
    vm.item.Quantity = LineItem.Quantity;
    vm.item.Specs = LI_SpecList;
    var spec_value = null;
    angular.forEach(vm.item.Specs, function(spec) {
        spec_value = Underscore.where(LineItem.Specs, {SpecID: spec.ID})[0];
        if (spec_value) {
            spec.Value = spec_value.Value;
            spec.OptionID = spec_value.OptionID;
        }
    });

    vm.UpdateLineItem = function() {
        LineItems.Patch(LineItem.OrderID, LineItem.ID, {Quantity: vm.item.Quantity, Specs: LineItemHelpers.SpecConvert(vm.item.Specs)})
            .then(function(data) {
                $rootScope.$broadcast('LineItemUpdated', data);
            });
    }
}

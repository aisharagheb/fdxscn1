angular.module('orderCloud')

    .config(ProductConfig)
    .controller('ProductCtrl', ProductController)
    .controller('ProductEditCtrl', ProductEditController)

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
                    templateUrl: 'catalog/product/templates/product.tpl.html',
                    controller: 'ProductEditCtrl',
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
                    controller: 'ProductEditCtrl',
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

function ProductController(Product, SpecList, Order) {
    var vm = this;
    vm.item = Product;
    vm.order = Order;
    vm.item.Specs = SpecList;
}

function ProductEditController(Underscore, LineItem, Order, LI_Product, LI_SpecList) {
    var vm = this;
    vm.item = LI_Product;
    vm.order = Order;
    vm.item.Specs = LI_SpecList;
    angular.forEach(vm.item.Specs, function(spec) {
        var spec_values = Underscore.where(LineItem.Specs, {SpecID: spec.ID})[0];
        spec.Value = spec_values.Value;
        spec.OptionID = spec_values.OptionID;
    });
}

angular.module('orderCloud')

    .config(ProductConfig)
    .controller('ProductCtrl', ProductController)

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
                Product: function($q, Me, $stateParams, ImpersonationService) {
                    var dfd = $q.defer();
                    Me.GetProduct($stateParams.productid)
                        .then(function(data) {
                            dfd.resolve(data);
                        }, function(response) {
                            ImpersonationService.impersonate(response).then(function() {
                                dfd.resolve(Me.As().GetProduct($stateParams.productid));
                            });
                        });
                    return dfd.promise;
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
        });
}

function ProductController(Product, SpecList, Order) {
    var vm = this;
    vm.item = Product;
    vm.order = Order;
    vm.item.Specs = SpecList;
}

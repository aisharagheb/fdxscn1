angular.module('orderCloud')

    .config(ProductConfig)
    .controller('ProductCtrl', ProductController)
    .controller('ProductConfigCtrl', ProductConfigController)

;

function ProductConfig($stateProvider) {
    $stateProvider
        .state('base.catalog.product', {
            url: '/product/:prodid',
            templateUrl: 'catalog/product/templates/product.tpl.html',
            controller: 'ProductCtrl',
            controllerAs: 'product',
            resolve: {
                Product: function($q, Me, $stateParams, ImpersonationService) {
                    var dfd = $q.defer();
                    Me.GetProduct($stateParams.prodid)
                        .then(function(data) {
                            dfd.resolve(data);
                        }, function(response) {
                            ImpersonationService.impersonate(response).then(function() {
                                dfd.resolve(Me.As().GetProduct($stateParams.prodid));
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
        .state('base.catalog.product.config', {
            url: '/config/:specformid',
            templateUrl: function($stateParams) {
                var spec_form = 'default-spec-form';
                if ($stateParams.specformid) {
                    spec_form = $stateParams.specformid;
                }
                return 'catalog/product/templates/spec-forms/' + spec_form + '.tpl.html';
            },
            controller: 'ProductConfigCtrl',
            controllerAs: 'productConfig'
        });
}

function ProductController(Product, SpecList) {
    var vm = this;
    vm.item = Product;
    vm.item.Specs = SpecList;
}

function ProductConfigController(Product, SpecList) {
    var vm = this;
    vm.item = Product;
    console.log('test');
    vm.item.Specs = SpecList;
}

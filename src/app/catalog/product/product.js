angular.module('orderCloud')

    .config(ProductConfig)
    .controller('ProductCtrl', ProductController)
    .controller('ProductConfigCtrl', ProductConfigController)

;

function ProductConfig($stateProvider) {
    $stateProvider
        .state('base.catalog.product', {
            url: '/product/:productid',
            templateUrl: 'catalog/product/templates/product.tpl.html',
            controller: 'ProductCtrl',
            controllerAs: 'product',
            resolve: {
                Product: function(Me, $stateParams) {
                    return Me.GetProduct($stateParams.productid);
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
    console.log(Product);
    vm.item = Product;
    vm.item.Specs = SpecList;
}

function ProductConfigController(Product) {
    var vm = this;
    vm.item = Product;
}

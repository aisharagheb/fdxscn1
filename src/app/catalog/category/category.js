angular.module('orderCloud')

    .config(CategoryConfig)
    .controller('CategoryCtrl', CategoryController)

;

function CategoryConfig($stateProvider) {
    $stateProvider
        .state('base.catalog.category', {
            url: '/category/:categoryid',
            templateUrl: 'catalog/category/templates/category.tpl.html',
            controller: 'CategoryCtrl',
            controllerAs: 'category',
            resolve: {
                CategoryList: function($q, Me, ImpersonationService, $stateParams) {
                    var dfd = $q.defer();
                    Me.ListSubcategories($stateParams.categoryid)
                        .then(function(response) {
                            dfd.resolve(response);
                        }, function(response) {
                            ImpersonationService.impersonate(response).then(function() {
                                dfd.resolve(Me.As().ListSubcategories($stateParams.categoryid));
                            });
                        });
                    return dfd.promise;
                },
                ProductList: function($q, Me, ImpersonationService, $stateParams) {
                    var dfd = $q.defer();
                    Me.ListProducts(null, $stateParams.categoryid).then(
                        function(response) {
                            dfd.resolve(response);
                        },
                        function(response) {
                            ImpersonationService.impersonate(response).then(function() {
                                dfd.resolve(Me.As().ListProducts(null, $stateParams.categoryid));
                            });
                        });
                    return dfd.promise;
                }
            }
        });
}

function CategoryController(CategoryList, ProductList) {
    var vm = this;
    vm.categories = CategoryList;
    vm.products = ProductList;
}

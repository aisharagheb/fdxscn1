angular.module('orderCloud')

    .config(CatalogConfig)
    .controller('CatalogCtrl', CatalogController)
    .controller('CatalogListCtrl', CatalogListController)
    .directive('ordercloudCategoryList', CategoryListDirective)
    .directive('ordercloudProductList', ProductListDirective)

;

function CatalogConfig($stateProvider) {
    $stateProvider
        .state('base.catalog', {
            url: '/catalog',
            data: {componentName: 'Catalog'},
            views: {
                '': {
                    templateUrl: 'catalog/templates/catalog.tpl.html',
                    controller: 'CatalogCtrl',
                    controllerAs: 'catalog'
                },
                'left@base.catalog': {
                    templateUrl: 'catalog/templates/catalog.list.tpl.html',
                    controller: 'CatalogListCtrl',
                    controllerAs: 'catalogList'
                }
            },
            resolve: {
                Catalog: function($q, Me, ImpersonationService) {
                    var dfd = $q.defer();
                    Me.ListCategories(null, 1).then(
                        function(response) {
                            dfd.resolve(response);
                        },
                        function(response) {
                            ImpersonationService.impersonate(response).then(function() {
                                var categories = Me.As().ListCategories(null, 1);
                                console.log(categories);
                                dfd.resolve(categories);
                            });
                    });
                    return dfd.promise;
                }
            }
        });
}

function CatalogController(Catalog) {
    var vm = this;
    vm.showTree = true;
    vm.toggleTree = function() {
        vm.showTree = !vm.showTree;
    };
    vm.categories = Catalog;
}

function CatalogListController(Catalog) {
    var vm = this;
    vm.tree = Catalog;
}

function CategoryListDirective() {
    return {
        restrict: 'E',
        templateUrl: 'catalog/templates/category.list.tpl.html',
        scope: {
            currentcategory: '=',
            categorylist: '='
        }
    };
}

function ProductListDirective() {
    return {
        restrict: 'E',
        templateUrl: 'catalog/templates/product.list.tpl.html',
        scope: {
            currentcategory: '=',
            productlist: '='
        }
    };
}

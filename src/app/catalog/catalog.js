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
                Catalog: function(Me, ImpersonationService) {
                    return Me.ListCategories(null, 1).then(
                        function(response) {
                            console.log('success hit');
                            return response;
                        },
                        function(response) {
                            console.log('error hit');
                            ImpersonationService.impersonate(response);
                            return Me.As().ListCategories(null, 1);
                        }
                    );
                },
                Tree: function() {
                    return 'test_tree';
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
    console.log(Catalog);
}

function CatalogListController(Tree) {
    var vm = this;
    vm.tree = Tree;
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

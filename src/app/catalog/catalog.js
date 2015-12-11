angular.module('orderCloud')

    .config(CatalogConfig)
    .controller('CatalogCtrl', CatalogController)
    .controller('CatalogTreeCtrl', CatalogTreeController)
    .directive('ordercloudCategoryList', CategoryListDirective)
    .directive('ordercloudProductList', ProductListDirective)
    .factory('CatalogTreeService', CatalogTreeService)

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
                    templateUrl: 'catalog/templates/catalog.tree.tpl.html',
                    controller: 'CatalogTreeCtrl',
                    controllerAs: 'catalogTree'
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
                },
                Tree: function(CatalogTreeService) {
                    return CatalogTreeService.GetCatalogTree();
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

function CatalogTreeController(Tree) {
    var vm = this;
    vm.tree = Tree;
    console.log(vm.tree);
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

function CatalogTreeService($q, Underscore, Me) {
    return {
        GetCatalogTree: tree
    };

    function tree() {
        var tree = [];
        var dfd = $q.defer();
        Me.ListCategories(null, 'all', 1, 100).then(function(list) {
            angular.forEach(Underscore.where(list.Items, {ParentID: null}), function(node) {
                tree.push(getNode(node, list));
            });
            dfd.resolve(tree);
        });
        return dfd.promise;
    }

    function getNode(node, list) {
        var children = Underscore.where(list.Items, {ParentID: node.ID});
        if (children.length > 0) {
            node.children = children;
            angular.forEach(children, function(child) {
                return getNode(child, list);
            });
        }
        else {
            node.children = [];
        }
        return node;
    }
}

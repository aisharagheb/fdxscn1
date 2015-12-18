angular.module('orderCloud')

    .config(CatalogConfig)
    .controller('CatalogCtrl', CatalogController)
    .controller('CatalogTreeCtrl', CatalogTreeController)
    .directive('ordercloudCategoryList', CategoryListDirective)
    .directive('ordercloudProductList', ProductListDirective)
    .factory('CatalogTreeService', CatalogTreeService)
    .directive('catalogNode', CatalogNode)
    .directive('catalogTree', CatalogTree)

;

function CatalogConfig($stateProvider) {
    $stateProvider
        .state('catalog', {
            parent: 'base',
            url: '/catalog',
            data: {componentName: 'Catalog'},
            views: {
                '': {
                    templateUrl: 'catalog/templates/catalog.tpl.html',
                    controller: 'CatalogCtrl',
                    controllerAs: 'catalog'
                },
                'left@catalog': {
                    templateUrl: 'catalog/templates/catalog.tree.tpl.html',
                    controller: 'CatalogTreeCtrl',
                    controllerAs: 'catalogTree'
                }
            },
            resolve: {
                Tree: function(CatalogTreeService) {
                    return CatalogTreeService.GetCatalogTree();
                },
                Catalog: function($q, Me, ImpersonationService, Tree) {
                    var dfd = $q.defer();
                    Me.ListCategories(null, 1).then(
                        function(response) {
                            dfd.resolve(response);
                        },
                        function(response) {
                            ImpersonationService.impersonate(response).then(function() {
                                dfd.resolve(Me.As().ListCategories(null, 1));
                            });
                    });
                    return dfd.promise;
                },
                Order: function($q, $localForage, Tree, Me, appname, ImpersonationService, Orders) {
                    var dfd = $q.defer();
                    Me.Get()
                        .then(function(me) {
                            Orders.List('outgoing', null, null, null, null, null, null, null, {'FromUserID': me.ID})
                                .then(function(list) {
                                    if (list.Items.length === 0) dfd.resolve(null);
                                    else {
                                        dfd.resolve(list.Items[1]);
                                        $localForage.setItem(appname + '.CurrentOrderID', list.Items[1].ID);
                                    }
                                });
                        }, function(response) {
                            ImpersonationService.impersonate(response).then(function() {
                                Me.As().Get()
                                    .then(function(me) {
                                        Orders.List('outgoing', null, null, null, null, null, null, null, {'FromUserID': me.ID})
                                            .then(function(list) {
                                                if (list.Items.length === 0) dfd.resolve(null);
                                                else {
                                                    dfd.resolve(list.Items[1]);
                                                    console.log(list.Items[1]);
                                                    $localForage.setItem(appname + '.CurrentOrderID', list.Items[1].ID);
                                                }
                                            });
                                    });
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

function CatalogTreeController(Tree) {
    var vm = this;
    vm.tree = Tree;
}

function CategoryListDirective() {
    return {
        restrict: 'E',
        templateUrl: 'catalog/templates/category.list.tpl.html',
        scope: {
            categorylist: '='
        }
    };
}

function ProductListDirective() {
    return {
        restrict: 'E',
        templateUrl: 'catalog/templates/product.list.tpl.html',
        scope: {
            productlist: '='
        }
    };
}

function CatalogTreeService($q, Underscore, ImpersonationService, Me) {
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
        }).catch(function(response) {
            ImpersonationService.impersonate(response)
                .then(function() {
                    Me.As().ListCategories(null, 'all', 1, 100).then(function(list) {
                        angular.forEach(Underscore.where(list.Items, {ParentID: null}), function(node) {
                            tree.push(getNode(node, list));
                        });
                        dfd.resolve(tree);
                    });
                });
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

function CatalogTree() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            tree: '='
        },
        template: "<ul class='nav nav-pills nav-stacked'><catalog-node ng-repeat='node in tree' node='node'></catalog-node></ul>"
    };
}

function CatalogNode($compile) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            node: '='
        },
        template: '<li ui-sref-active="active"><a ui-sref="catalog.category({categoryid:node.ID})" ng-bind-html="node.Name"></a></li>',
        link: function(scope, element) {
            if (angular.isArray(scope.node.children)) {
                element.append("<catalog-tree tree='node.children' />");
                $compile(element.contents())(scope);
            }
        }
    };
}

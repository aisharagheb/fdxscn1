angular.module( 'orderCloud' )

    .config( CategoriesConfig )
    .controller( 'CategoriesCtrl', CategoriesController )
    .controller( 'CategoryEditCtrl', CategoryEditController )
    .controller( 'CategoryCreateCtrl', CategoryCreateController )
    .controller( 'CategoryTreeCtrl', CategoryTreeController )
    .controller( 'CategoryAssignPartyCtrl', CategoryAssignPartyController )
    .controller( 'CategoryAssignProductCtrl', CategoryAssignProductController )
    .factory( 'CategoryTreeService', CategoryTreeService )
    .directive( 'categoryNode', CategoryNode )
    .directive( 'categoryTree', CategoryTree )

;

function CategoriesConfig( $stateProvider ) {
    $stateProvider
        .state( 'categories', {
            parent: 'base',
            url: '/categories',
            templateUrl:'categories/templates/categories.tpl.html',
            controller:'CategoriesCtrl',
            controllerAs: 'categories',
            data: {componentName: 'Categories'},
            resolve: {
                CategoryList: function(Categories) {
                    return Categories.List(null, 'all');
                }
            }
        })
        .state( 'categories.tree', {
            url: '/tree',
            templateUrl: 'categories/templates/categoryTree.tpl.html',
            controller: 'CategoryTreeCtrl',
            controllerAs: 'categoryTree',
            resolve: {
                Tree: function(CategoryTreeService) {
                    return CategoryTreeService.GetCategoryTree();
                }
            }
        })
        .state( 'categories.edit', {
            url: '/:categoryid/edit',
            templateUrl:'categories/templates/categoryEdit.tpl.html',
            controller:'CategoryEditCtrl',
            controllerAs: 'categoryEdit',
            resolve: {
                SelectedCategory: function($stateParams, $state, Categories) {
                    return Categories.Get($stateParams.categoryid).catch(function() {
                        $state.go('^.categories');
                    });
                }
            }
        })
        .state( 'categories.create', {
            url: '/create',
            templateUrl:'categories/templates/categoryCreate.tpl.html',
            controller:'CategoryCreateCtrl',
            controllerAs: 'categoryCreate'
        })
        .state( 'categories.assignParty', {
            url: '/:categoryid/assign/party',
            templateUrl: 'categories/templates/categoryAssignParty.tpl.html',
            controller: 'CategoryAssignPartyCtrl',
            controllerAs: 'categoryAssignParty',
            resolve: {
                UserGroupList: function(UserGroups) {
                    return UserGroups.List();
                },
                AssignedUserGroups: function($stateParams, Categories) {
                    return Categories.ListAssignments($stateParams.categoryid);
                },
                SelectedCategory: function($stateParams, $state, Categories) {
                    return Categories.Get($stateParams.categoryid).catch(function() {
                        $state.go('^.categories');
                    });
                }
            }
        })
        .state( 'categories.assignProduct', {
            url: '/:categoryid/assign/product',
            templateUrl: 'categories/templates/categoryAssignProduct.tpl.html',
            controller: 'CategoryAssignProductCtrl',
            controllerAs: 'categoryAssignProd',
            resolve: {
                ProductList: function(Products) {
                    return Products.List();
                },
                ProductAssignments: function(Categories, $stateParams) {
                    return Categories.ListProductAssignments($stateParams.categoryid);
                },
                SelectedCategory: function($stateParams, $state, Categories) {
                    return Categories.Get($stateParams.categoryid).catch(function() {
                        $state.go('^.categories');
                    });
                }
            }
        });
}

function CategoriesController( CategoryList, TrackSearch ) {
    var vm = this;
    vm.list = CategoryList;
    vm.searching = function() {
        return TrackSearch.GetTerm() ? true : false;
    };
}

function CategoryEditController( $exceptionHandler, $state, SelectedCategory, Categories ) {
    var vm = this,
        categoryID = SelectedCategory.ID;
    vm.categoryName = SelectedCategory.Name;
    vm.category = SelectedCategory;

    vm.Submit = function() {
        Categories.Update(categoryID, vm.category)
            .then(function() {
                $state.go('categories', {}, {reload:true})
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    };

    vm.Delete = function() {
        Categories.Delete(SelectedCategory.ID)
            .then(function() {
                $state.go('categories', {}, {reload:true})
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function CategoryCreateController($exceptionHandler,$state, Categories) {
    var vm = this;
    vm.category = {};

    vm.Submit = function() {
        if (vm.category.ParentID === '') {
            vm.category.ParentID = null;
        }
        Categories.Create(vm.category)
            .then(function() {
                $state.go('categories', {}, {reload:true})
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function CategoryTreeController(Tree, CategoryTreeService) {
    var vm = this;
    vm.tree = Tree;

    vm.toggle = function(scope) {
        scope.toggle();
    };

    vm.treeOptions = {
        dropped: function(event) {
            CategoryTreeService.UpdateCategoryNode(event);
        }
    };
}

function CategoryAssignPartyController(Assignments, Paging, UserGroupList, AssignedUserGroups, SelectedCategory, Categories) {
    var vm = this;
    vm.Category = SelectedCategory;
    vm.list = UserGroupList;
    vm.assignments = AssignedUserGroups;
    vm.saveAssignments = SaveAssignment;
    vm.pagingfunction = PagingFunction;

    function SaveFunc(ItemID) {
        return Categories.SaveAssignment({
            UserID: null,
            UserGroupID: ItemID,
            CategoryID: vm.Category.ID
        });
    }

    function DeleteFunc(ItemID) {
        return Categories.DeleteAssignment(vm.Category.ID, null, ItemID);
    }

    function SaveAssignment() {
        return Assignments.saveAssignments(vm.list.Items, vm.assignments.Items, SaveFunc, DeleteFunc);
    }

    function AssignmentFunc() {
        return Categories.ListAssignments(vm.Category.ID, null, vm.assignments.Meta.PageSize);
    }

    function PagingFunction() {
        return Paging.paging(vm.list, 'UserGroups', vm.assignments, AssignmentFunc);
    }
}

function CategoryAssignProductController(Assignments, Paging, ProductList, ProductAssignments, SelectedCategory, Categories) {
    var vm = this;
    vm.Category = SelectedCategory;
    vm.list = ProductList;
    vm.assignments = ProductAssignments;
    vm.saveAssignments = SaveAssignment;
    vm.pagingfunction = PagingFunction;

    function SaveFunc(ItemID) {
        return Categories.SaveProductAssignment({
            CategoryID: vm.Category.ID,
            ProductID: ItemID
        });
    }

    function DeleteFunc(ItemID) {
        return Categories.DeleteProductAssignment(vm.Category.ID, ItemID);
    }

    function SaveAssignment() {
        return Assignments.saveAssignments(vm.list.Items, vm.assignments.Items, SaveFunc, DeleteFunc, 'ProductID');
    }

    function AssignmentFunc() {
        return Categories.ListProductAssignments(vm.Category.ID, null, vm.assignments.Meta.PageSize);
    }

    function PagingFunction() {
        return Paging.paging(vm.list, 'Products', vm.assignments, AssignmentFunc);
    }
}

function CategoryTree() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            tree: '='
        },
        template: "<ul><category-node ng-repeat='node in tree' node='node'></category-node></ul>"
    };
}

function CategoryNode($compile) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            node: '='
        },
        template: '<li><a ui-sref="base.adminCategories.edit({id:node.ID})" ng-bind-html="node.Name"></a></li>',
        link: function(scope, element) {
            if (angular.isArray(scope.node.children)) {
                element.append("<category-tree tree='node.children' />");
                $compile(element.contents())(scope);
            }
        }
    };
}

function CategoryTreeService($q, Underscore, Categories) {
    return {
        GetCategoryTree: tree,
        UpdateCategoryNode: update
    };

    function tree() {
        var tree = [];
        var deferred = $q.defer();
        Categories.List(null, 'all', 1, 100).then(function(list) {
            angular.forEach(Underscore.where(list.Items, { ParentID: null}), function(node) {
                tree.push(getnode(node));
            });

            function getnode(node) {
                var children = Underscore.where(list.Items, { ParentID: node.ID});
                if (children.length > 0) {
                    node.children = children;
                    angular.forEach(children, function(child) {
                        return getnode(child);
                    });
                } else {
                    node.children = [];
                }
                return node;
            }

            deferred.resolve(tree);
        });
        return deferred.promise;
    }

    function update(event) {
        var sourceParentNodeList = event.source.nodesScope.$modelValue,
            destParentNodeList = event.dest.nodesScope.$modelValue,
            masterDeferred = $q.defer();

        updateNodeList(destParentNodeList).then(function() {
            if (sourceParentNodeList != destParentNodeList) {
                if (sourceParentNodeList.length) {
                    updateNodeList(sourceParentNodeList).then(function() {
                        updateParentID().then(function() {
                            masterDeferred.resolve();
                        });
                    });
                } else {
                    updateParentID().then(function() {
                        masterDeferred.resolve();
                    });
                }
            }
        });

        function updateNodeList(nodeList) {
            var deferred = $q.defer(),
                nodeQueue = [];
            angular.forEach(nodeList,function(cat, index) {
                nodeQueue.push((function() {
                    return Categories.Patch(cat.ID, {ListOrder: index});
                }));
            });

            var queueIndex = 0;
            function run(i) {
                nodeQueue[i]().then(function() {
                    queueIndex++;
                    if (queueIndex < nodeQueue.length) {
                        run(queueIndex);
                    } else {
                        deferred.resolve();
                    }
                });
            }
            run(queueIndex);

            return deferred.promise;
        }

        function updateParentID() {
            var deferred = $q.defer(),
                parentID;

            if (event.dest.nodesScope.node) {
                parentID = event.dest.nodesScope.node.ID;
            } else {
                parentID = null;
            }
            event.source.nodeScope.node.ParentID = parentID;
            Categories.Update(event.source.nodeScope.node.ID, event.source.nodeScope.node)
                .then(function() {
                    deferred.resolve();
                });
            return deferred.promise;
        }

        return masterDeferred.promise;
    }
}

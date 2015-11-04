angular.module( 'orderCloud' )

    .config( CategoriesConfig )
    .controller( 'CategoriesCtrl', CategoriesController )
    .controller( 'CategoryEditCtrl', CategoryEditController )
    .controller( 'CategoryCreateCtrl', CategoryCreateController )
    .controller( 'CategoryTreeCtrl', CategoryTreeController )
    .controller( 'CategoryAssignCtrl', CategoryAssignController )
    .controller( 'CategoryAssignProductCtrl', CategoryAssignProductController )

;

function CategoriesConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.categories', {
            url: '/categories',
            templateUrl:'categories/templates/categories.tpl.html',
            controller:'CategoriesCtrl',
            controllerAs: 'categories',
            data: {componentName: 'Categories'},
            resolve: {
                CategoryList: function(Categories) {
                    return Categories.List();
                }
            }
        })
        .state( 'base.categoryTree', {
            url: '/categorytree',
            templateUrl: 'categories/templates/categoryTree.tpl.html',
            controller: 'CategoryTreeCtrl',
            controllerAs: 'CatTree',
            resolve: {

            }
        })
        .state( 'base.categoryEdit', {
            url: '/categories/:categoryid/edit',
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
        .state( 'base.categoryCreate', {
            url: '/categories/create',
            templateUrl:'categories/templates/categoryCreate.tpl.html',
            controller:'CategoryCreateCtrl',
            controllerAs: 'categoryCreate'
        })
        .state( 'base.categoryAssign', {
            url: '/categories/:categoryid/assign/party',
            templateUrl: 'categories/templates/categoryAssign.tpl.html',
            controller: 'CategoryAssignCtrl',
            controllerAs: 'categoryAssign',
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
        .state( 'base.categoryAssignProduct', {
            url: '/categories/:categoryid/assign/product',
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
                $state.go('^.categories')
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    };

    vm.Delete = function() {
        Categories.Delete(SelectedCategory.ID)
            .then(function() {
                $state.go('^.categories')
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
        Categories.Create(vm.category)
            .then(function() {
                $state.go('^.categories')
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function CategoryTreeController() {
    //var vm = this;
}

function CategoryAssignController($q, UserGroupList, AssignedUserGroups, SelectedCategory, Categories) {
    var vm = this;
    vm.Category = SelectedCategory;
    vm.list = UserGroupList;
    vm.AssignedUserGroups = AssignedUserGroups;
    vm.saveAssignments = SaveAssignment;

    function SaveAssignment() {
        var assigned = Underscore.pluck(vm.AssignedUserGroups.Items, 'UserGroupID');
        var selected = Underscore.pluck(Underscore.where(vm.list.Items, {selected: true}), 'ID');
        var unselected = Underscore.pluck(Underscore.filter(vm.list.Items, function(item) {
            return !item.selected;
        }), 'ID');
        var toAssign = Underscore.difference(selected, assigned);
        var toDelete = Underscore.intersection(unselected, assigned);
        var queue = [];
        var dfd = $q.defer();
        angular.forEach(toAssign, function(UserGroupID) {
            queue.push(Categories.SaveAssignment({
                UserGroupID:UserGroupID,
                CategoryID:vm.Category.ID
            }));
        });
        angular.forEach(toDelete, function(UserGroupID) {
            queue.push(Categories.DeleteAssignment(vm.Category.ID, null, UserGroupID));
        });
        $q.all(queue).then(function() {
            dfd.resolve();
            $state.reload($state.current)
        });
        return dfd.promise;
    }
}

function CategoryAssignProductController(Underscore, Assignments, ProductList, ProductAssignments, SelectedCategory, Categories, Products) {
    var vm = this,
        page = 1;
    vm.Category = SelectedCategory;
    vm.list = ProductList;
    vm.ProductAssignments = ProductAssignments;
    vm.SaveAssignment = SaveAssignment;
    vm.PagingFunction = PagingFunction;

    function SetSelected() {
        var assigned = Underscore.pluck(vm.ProductAssignments.Items, 'ProductID');
        angular.forEach(vm.list.Items, function(item) {
            if (assigned.indexOf(item.ID) > -1) {
                item.selected = true;
            }
        });
    }
    SetSelected();

    function SaveFunc(ItemID) {
        return Categories.SaveProductAssignments({
            CategoryID: vm.Category.ID,
            ProductID: ItemID
        });
    }
    function DeleteFunc(ItemID) {
        return Categories.DeleteProductAssignments(vm.Category.ID, ItemID);
    }
    function SaveAssignment() {
        return Assignments.saveAssignments(vm.list.Items, vm.ProductAssignments.Items, SaveFunc, DeleteFunc, 'ProductID');
    }

    function PagingFunction() {
        page += 1;
        if (page <= vm.list.Meta.TotalPages) {
            Products.List(null, page, vm.list.Meta.PageSize)
                .then(function(data) {
                    vm.list.Meta = data.Meta;
                    vm.list.Items = [].concat(vm.list.Items, data.Items);
                    if (page <= vm.ProductAssignments.Meta.TotalPages) {
                        Categories.ListProductAssignments(vm.Category.ID, null, vm.ProductAssignments.Meta.PageSize)
                            .then(function(data) {
                                vm.ProductAssignments.Meta = data.Meta;
                                vm.ProductAssignments.List = [].concat(vm.ProductAssignments.Items, data.Items);
                                SetSelected();
                            });
                    }
                    else {
                        SetSelected();
                    }
                });
        }
    }
}

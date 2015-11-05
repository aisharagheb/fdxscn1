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

function CategoryAssignController(Assignments, Paging, UserGroupList, AssignedUserGroups, SelectedCategory, Categories) {
    var vm = this;
    vm.Category = SelectedCategory;
    vm.list = UserGroupList;
    vm.assignments = AssignedUserGroups;
    vm.saveAssignments = SaveAssignment;
    vm.pagingfunction = PagingFunction;

    function SaveFunc(ItemID) {
        Categories.SaveAssignment({
            UserID: null,
            UserGroupID: ItemID,
            CategoryID: vm.Category.ID
        });
    }

    function DeleteFunc(ItemID) {
        Categories.DeleteAssignment(vm.Category.ID, null, ItemID);
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
    vm.SaveAssignment = SaveAssignment;
    vm.pagingfunction = PagingFunction;

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
        return Assignments.saveAssignments(vm.list.Items, vm.assignments.Items, SaveFunc, DeleteFunc, 'ProductID');
    }

    function AssignmentFunc() {
        return Categories.ListProductAssignments(vm.Category.ID, null, vm.assignments.Meta.PageSize);
    }

    function PagingFunction() {
        return Paging.paging(vm.list, 'Products', vm.assignments, AssignmentFunc);
    }
}

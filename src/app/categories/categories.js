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
                SelectedCategory: function($stateParams, Categories) {
                    return Categories.Get($stateParams.categoryid);
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
                SelectedCategory: function($stateParams, Categories) {
                    return Categories.Get($stateParams.categoryid);
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
                SelectedCategory: function($stateParams, Categories) {
                    return Categories.Get($stateParams.categoryid);
                }
            }
        });
}

function CategoriesController( CategoryList, $state ) {
    var vm = this;
    vm.list = CategoryList;

    vm.goToEdit = function(id) {
        $state.go('^.categoryEdit', {'categoryid': id});
    };
    vm.goToAssignments = function(id) {
        $state.go('^.categoryAssign', {'categoryid': id});
    };
}

function CategoryEditController( $state, SelectedCategory, Categories ) {
    var vm = this,
        categoryID = SelectedCategory.ID;
    vm.categoryName = SelectedCategory.Name;
    vm.category = SelectedCategory;

    vm.Submit = function() {
        Categories.Update(categoryID, vm.category)
            .then(function() {
            $state.go('^.categories')
        });
    };

    vm.Delete = function() {
        Categories.Delete(SelectedCategory.ID)
            .then(function() {
                $state.go('^.categories')
            });
    }
}

function CategoryCreateController($state, Categories) {
    var vm = this;
    vm.category = {};

    vm.Submit = function() {
        Categories.Create(vm.category)
            .then(function() {
                $state.go('^.categories')
            });
    }
}

function CategoryTreeController() {
    var vm = this;
}

function CategoryAssignController(UserGroupList, AssignedUserGroups, SelectedCategory, Categories) {
    var vm = this;
    vm.Category = SelectedCategory;
    vm.list = UserGroupList;
    vm.AssignedUserGroups = AssignedUserGroups;
    vm.saveAssignments = SaveAssignment;
    vm.resetSelections = ResetSelections;

    function SetSelected() {
        angular.forEach(vm.list.Items, function(group) {
            angular.forEach(vm.AssignedUserGroups.Items, function(assignment) {
                if (group.ID === assignment.UserGroupID) {
                    group.selected = true;
                }
            });
        });
    }
    SetSelected();

    function SaveAssignment(form) {
        var assignmentObject = {};
        angular.forEach(vm.list.Items, function(group, index) {
            if (form['assignCheckbox' + index].$dirty) {
                if (group.selected) {
                    assignmentObject = {UserID: null, UserGroupID: group.ID, CategoryID: vm.Category.ID};
                    Categories.SaveAssignment(assignmentObject);
                    vm.AssignedUserGroups.Items.push(assignmentObject);
                }
                else {
                    angular.forEach(vm.AssignedUserGroups.Items, function(assignment, index) {
                        if (assignment.UserGroupID === group.ID) {
                            Categories.DeleteAssignment(vm.Category.ID, null, group.ID);
                            vm.AssignedUserGroups.Items.splice(index, 1);
                            index = index - 1;
                        }
                    });
                }
            }
        });
        form.$setPristine(true);
        SetSelected();
    }

    function ResetSelections(form, index) {
        var matched = false;
        angular.forEach(vm.AssignedUserGroups.Items, function(assignment) {
            if (assignment.UserGroupID === vm.list.Items[index].ID) {
                matched = true
            }
        });
        if (matched && vm.list.Items[index].selected) {
            form['assignCheckbox' + index].$setPristine(true);
        }
        else if (!matched && !vm.list.Items[index].selected) {
            form['assignCheckbox' + index].$setPristine(true);
        }
    }
}

function CategoryAssignProductController(ProductList, ProductAssignments, SelectedCategory, Categories, Products) {
    var vm = this,
        page = 1;
    vm.Category = SelectedCategory;
    vm.list = ProductList;
    vm.ProductAssignments = ProductAssignments;
    vm.SaveAssignment = SaveAssignment;
    vm.ResetSelection = ResetAssignment;
    vm.PagingFunction = PagingFunction;

    function SetSelected() {
        angular.forEach(vm.list.Items, function(product) {
            angular.forEach(vm.ProductAssignments.Items, function(assignment) {
                if (product.ID === assignment.ProductID) {
                    product.selected = true;
                }
            });
        });
    }
    SetSelected();

    function SaveAssignment(form) {
        var assignmentObject = {};
        angular.forEach(vm.list.Items, function(product, index) {
            if (form['assignCheckbox' + index].$dirty) {
                if (product.selected) {
                    assignmentObject = {CategoryID: vm.Category.ID, ProductID: product.ID, ListOrder: null};
                    Categories.SaveProductAssignments(assignmentObject);
                    vm.ProductAssignments.Items.push(assignmentObject);
                }
                else {
                    angular.forEach(vm.ProductAssignments.Items, function(assignment, index) {
                        if (assignment.ProductID === product.ID) {
                            Categories.DeleteProductAssignments(vm.Category.ID, product.ID);
                            vm.ProductAssignments.Items.splice(index, 1);
                            index = index - 1;
                        }
                    });
                }
            }
        });
        form.$setPristine(true);
    }

    function ResetAssignment(form, index) {
        var matched = false;
        angular.forEach(vm.ProductAssignments.Items, function(assignment) {
            if (assignment.ProductID === vm.list.Items[index].ID) {
                matched = true
            }
        });
        if (matched && vm.list.Items[index].selected) {
            form['assignCheckbox' + index].$setPristine(true);
        }
        else if (!matched && !vm.list.Items[index].selected) {
            form['assignCheckbox' + index].$setPristine(true);
        }
    }

    function PagingFunction() {
        page += 1;
        if (page <= vm.list.Meta.TotalPages) {
            Products.List(null, page)
                .then(function(data) {
                    vm.list.Meta = data.Meta;
                    vm.list.Items = [].concat(vm.list.Items, data.Items);
                    if (page <= vm.ProductAssignments.Meta.TotalPages) {
                        Categories.ListProductAssignments(vm.Category.ID, null, page)
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

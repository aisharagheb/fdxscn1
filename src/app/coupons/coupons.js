angular.module( 'orderCloud' )

    .config( CouponsConfig )
    .controller( 'CouponsCtrl', CouponsController )
    .controller( 'CouponEditCtrl', CouponEditController )
    .controller( 'CouponCreateCtrl', CouponCreateController )
    .controller( 'CouponAssignCtrl', CouponAssignController )
    .controller( 'CouponAssignProductCtrl', CouponAssignProductController )
    .controller( 'CouponAssignCategoryCtrl', CouponAssignCategoryController )

;

function CouponsConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.coupons', {
            url: '/coupons',
            templateUrl:'coupons/templates/coupons.tpl.html',
            controller:'CouponsCtrl',
            controllerAs: 'coupons',
            data: {componentName: 'Coupons'},
            resolve: {
                CouponList: function(Coupons) {
                    return Coupons.List();
                }
            }
        })
        .state( 'base.couponEdit', {
            url: '/coupons/:couponid/edit',
            templateUrl:'coupons/templates/couponEdit.tpl.html',
            controller:'CouponEditCtrl',
            controllerAs: 'couponEdit',
            resolve: {
                SelectedCoupon: function($q, $stateParams, Coupons) {
                    var d = $q.defer();
                    Coupons.Get($stateParams.couponid)
                        .then(function(coupon) {
                            if(coupon.StartDate != null)
                                coupon.StartDate = new Date(coupon.StartDate);
                            if(coupon.ExpirationDate != null)
                                coupon.ExpirationDate = new Date(coupon.ExpirationDate);
                            d.resolve(coupon);
                        });
                    return d.promise;
                }
            }
        })
        .state( 'base.couponCreate', {
            url: '/coupons/create',
            templateUrl: 'coupons/templates/couponCreate.tpl.html',
            controller: 'CouponCreateCtrl',
            controllerAs: 'couponCreate'
        })
        .state( 'base.couponAssignParty', {
            url: '/coupons/:couponid/assign/party',
            templateUrl: 'coupons/templates/couponAssignParty.tpl.html',
            controller: 'CouponAssignCtrl',
            controllerAs: 'couponAssign',
            resolve: {
                Buyer: function(Buyers) {
                    return Buyers.Get();
                },
                UserGroupList: function(UserGroups) {
                    return UserGroups.List(null, 1, 20);
                },
                AssignedUserGroups: function($stateParams, Coupons) {
                    return Coupons.ListAssignments($stateParams.couponid);
                },
                SelectedCoupon: function($stateParams, Coupons) {
                    return Coupons.Get($stateParams.couponid);
                }
            }
        })
        .state( 'base.couponAssignProduct', {
            url: '/coupons/:couponid/assign/product',
            templateUrl: 'coupons/templates/couponAssignProduct.tpl.html',
            controller: 'CouponAssignProductCtrl',
            controllerAs: 'couponAssignProd',
            resolve: {
                ProductList: function(Products) {
                    return Products.List();
                },
                ProductAssignments: function(Coupons, $stateParams) {
                    return Coupons.ListAssignedProducts($stateParams.couponid)
                },
                SelectedCoupon: function($stateParams, Coupons) {
                    return Coupons.Get($stateParams.couponid);
                }
            }
        })
        .state( 'base.couponAssignCategory', {
            url: '/coupons/:couponid/assign/category',
            templateUrl: 'coupons/templates/couponAssignCategory.tpl.html',
            controller: 'CouponAssignCategoryCtrl',
            controllerAs: 'couponAssignCat',
            resolve: {
                CategoryList: function(Categories) {
                    return Categories.List();
                },
                CategoryAssignments: function(Coupons, $stateParams) {
                    return Coupons.ListAssignedCategories($stateParams.couponid);
                },
                SelectedCoupon: function($stateParams, Coupons) {
                    return Coupons.Get($stateParams.couponid);
                }
            }
        });
}

function CouponsController( CouponList, TrackSearch ) {
    var vm = this;
    vm.list = CouponList;
    vm.searching = function() {
        return TrackSearch.GetTerm() ? true : false;
    };
}

function CouponEditController( $exceptionHandler, $state, SelectedCoupon, Coupons ) {
    var vm = this,
        couponid = SelectedCoupon.ID;
    vm.couponName = SelectedCoupon.Label;
    vm.coupon = SelectedCoupon;

    vm.Submit = function() {
        Coupons.Update(couponid, vm.coupon)
            .then(function() {
                $state.go('^.coupons')
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    };

    vm.Delete = function() {
        Coupons.Delete(SelectedCoupon.ID)
            .then(function() {
                $state.go('^.coupons')
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function CouponCreateController( $exceptionHandler, $state, Coupons) {
    var vm = this;
    vm.coupon = {};

    vm.GenerateCode = function(bits) {
        bits = typeof  bits !== 'undefined' ? bits : 16;
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var code = "";
        for (var i = 0; i < bits; i += 1) {
            code += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return code;
    }

    vm.Submit = function() {
        Coupons.Create(vm.coupon)
            .then(function() {
                $state.go('^.coupons')
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function CouponAssignController(Buyer, UserGroupList, AssignedUserGroups, SelectedCoupon, Coupons) {
    var vm = this;
    vm.coupon = SelectedCoupon;
    vm.buyer = Buyer;
    vm.userGroups = UserGroupList;
    vm.assignedUserGroups = AssignedUserGroups;
    vm.saveAssignments = saveAssignments;

    function saveAssignments(form) {
        var assignmentObject = {};
        angular.forEach(vm.userGroups.Items, function(group, index) {
            if (form['assignCheckbox' + index].$dirty) {
                if (group.selected) {
                    assignmentObject = {UserID: null, UserGroupID: group.ID, CouponID: vm.coupon.ID};
                    Coupons.SaveAssignment(assignmentObject);
                    vm.assignedUserGroups.Items.push(assignmentObject);
                }
                else {
                    angular.forEach(vm.assignedUserGroups.Items, function(assignment, index) {
                        if (assignment.UserGroupID === group.ID) {
                            Coupons.DeleteAssignment(vm.coupon.ID, null, group.ID);
                            vm.assignedUserGroups.Items.splice(index, 1);
                            index = index - 1;
                        }
                    })
                }
            }
        });
    }
}

function CouponAssignProductController(ProductList, ProductAssignments, SelectedCoupon, Coupons, Products) {
    var vm = this,
        page = 1;
    vm.ProductList = ProductList;
    vm.ProductAssignments = ProductAssignments;
    vm.Coupon = SelectedCoupon;
    vm.saveAssignment = SaveAssignment;
    vm.resetSelection = ResetSelection;
    vm.pagingFunction = PagingFunction;

    function SetSelected() {
        angular.forEach(vm.ProductList.Items, function(product) {
            angular.forEach(vm.ProductAssignments.Items, function(assignment) {
                if (product.ID === assignment.ID) {
                    product.selected = true;
                }
            });
        });
    }
    SetSelected();

    function SaveAssignment(form) {
        angular.forEach(vm.ProductList.Items, function(product, index) {
            if (form['assignCheckbox' + index].$dirty) {
                if (product.selected) {
                    Coupons.SaveProductAssignment(vm.Coupon.ID, product.ID);
                    vm.ProductAssignments.Items.push(product);
                }
                else {
                    angular.forEach(vm.ProductAssignments.Items, function(assignment, index) {
                        if (assignment.ID === product.ID) {
                            Coupons.DeleteProductAssignment(vm.Coupon.ID, product.ID);
                            vm.ProductAssignments.Items.splice(index, 1);
                            index = index - 1;
                        }
                    });
                }
            }
        });
        form.$setPristine(true);
    }

    function ResetSelection(index, form) {
        var matched = false;
        angular.forEach(vm.ProductAssignments.Items, function(assignment) {
            if (assignment.ID === vm.ProductList.Items[index].ID) {
                matched = true
            }
        });
        if (matched && vm.ProductList.Items[index].selected) {
            form['assignCheckbox' + index].$setPristine(true);
        }
        else if (!matched && !vm.ProductList.Items[index].selected) {
            form['assignCheckbox' + index].$setPristine(true);
        }
    }

    function PagingFunction() {
        page += 1;
        if (page <= vm.ProductList.Meta.TotalPages) {
            Products.List(null, page)
                .then(function(data) {
                    vm.ProductList.Meta = data.Meta;
                    vm.ProductList.Items = [].concat(vm.ProductList.Items, data.Items);
                    if (page <= vm.ProductAssignments.Meta.TotalPages) {
                        Coupons.ListProductAssignments(vm.Coupon.ID, page)
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

function CouponAssignCategoryController(CategoryList, CategoryAssignments, SelectedCoupon, Coupons, Categories) {
    var vm = this,
        page = 1;
    vm.CategoryList = CategoryList;
    vm.CategoryAssignments = CategoryAssignments;
    vm.Coupon = SelectedCoupon;
    vm.saveAssignment = SaveAssignment;
    vm.resetSelection = ResetSelection;
    vm.pagingFunction = PagingFunction;

    function SetSelected() {
        angular.forEach(vm.CategoryList.Items, function(category) {
            angular.forEach(vm.CategoryAssignments.Items, function(assignment) {
                if (category.ID === assignment.ID) {
                    category.selected = true;
                }
            });
        });
    }
    SetSelected();

    function SaveAssignment(form) {
        angular.forEach(vm.CategoryList.Items, function(category, index) {
            if (form['assignCheckbox' + index].$dirty) {
                if (category.selected) {
                    Coupons.AssignCategory(vm.Coupon.ID, category.ID);
                    vm.CategoryAssignments.Items.push(category);
                }
                else {
                    angular.forEach(vm.CategoryAssignments.Items, function(assignment, index) {
                        if (assignment.ID === category.ID) {
                            Coupons.DeleteCategoryAssignment(vm.Coupon.ID, category.ID);
                            vm.CategoryAssignments.Items.splice(index, 1);
                            index = index - 1;
                        }
                    });
                }
            }
        });
        form.$setPristine(form);
    }

    function ResetSelection(index, form) {
        var matched = false;
        angular.forEach(vm.CategoryAssignments.Items, function(assignment) {
            if (assignment.ID === vm.CategoryList.Items[index].ID) {
                matched = true
            }
        });
        if (matched && vm.CategoryList.Items[index].selected) {
            form['assignCheckbox' + index].$setPristine(true);
        }
        else if (!matched && !vm.CategoryList.Items[index].selected) {
            form['assignCheckbox' + index].$setPristine(true);
        }
    }

    function PagingFunction() {
        page += 1;
        if (page <= vm.CategoryList.Meta.TotalPages) {
            Categories.List(null, page)
                .then(function(data) {
                    vm.CategoryList.Meta = data.Meta;
                    vm.CategoryList.Items = [].concat(vm.CategoryList.Items, data.Items);
                    if (page <= vm.CategoryAssignments.Meta.TotalPages) {
                        Coupons.ListAssignedCategories(vm.Coupon.ID, page)
                            .then(function(data) {
                                vm.CategoryAssignments.Meta = data.Meta;
                                vm.CategoryAssignments.List = [].concat(vm.CategoryAssignments.Items, data.Items);
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

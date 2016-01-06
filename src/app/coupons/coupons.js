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
        .state( 'coupons', {
            parent: 'base',
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
        .state( 'coupons.edit', {
            url: '/:couponid/edit',
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
        .state( 'coupons.create', {
            url: '/coupons/create',
            templateUrl: 'coupons/templates/couponCreate.tpl.html',
            controller: 'CouponCreateCtrl',
            controllerAs: 'couponCreate'
        })
        .state( 'coupons.assignParty', {
            url: '/:couponid/assign/party',
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
        .state( 'coupons.assignProduct', {
            url: '/:couponid/assign/product',
            templateUrl: 'coupons/templates/couponAssignProduct.tpl.html',
            controller: 'CouponAssignProductCtrl',
            controllerAs: 'couponAssignProd',
            resolve: {
                ProductList: function(Products) {
                    return Products.List();
                },
                ProductAssignments: function(Coupons, $stateParams) {
                    return Coupons.ListProductAssignments($stateParams.couponid);
                },
                SelectedCoupon: function($stateParams, Coupons) {
                    return Coupons.Get($stateParams.couponid);
                }
            }
        })
        .state( 'coupons.assignCategory', {
            url: '/:couponid/assign/category',
            templateUrl: 'coupons/templates/couponAssignCategory.tpl.html',
            controller: 'CouponAssignCategoryCtrl',
            controllerAs: 'couponAssignCat',
            resolve: {
                CategoryList: function(Categories) {
                    return Categories.List();
                },
                CategoryAssignments: function(Coupons, $stateParams) {
                    return Coupons.ListCategoryAssignments($stateParams.couponid);
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
                $state.go('coupons', {}, {reload:true})
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    };

    vm.Delete = function() {
        Coupons.Delete(SelectedCoupon.ID)
            .then(function() {
                $state.go('coupons', {}, {reload:true})
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
                $state.go('coupons', {}, {reload:true})
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function CouponAssignController(Buyer, UserGroupList, AssignedUserGroups, SelectedCoupon, Coupons, Assignments, Paging) {
    var vm = this;
    vm.coupon = SelectedCoupon;
    vm.buyer = Buyer;
    vm.list = UserGroupList;
    vm.assignments = AssignedUserGroups;
    vm.saveAssignments = saveAssignments;
    vm.pagingfunction = PagingFunction;

    function SaveFunc(ItemID) {
        return Coupons.SaveAssignment({
            UserID: null,
            UserGroupID: ItemID,
            CouponID: vm.coupon.ID
        });
    }

    function DeleteFunc(ItemID) {
        return Coupons.DeleteAssignment(vm.coupon.ID, null, ItemID);
    }

    function saveAssignments() {
        return Assignments.saveAssignments(vm.list.Items, vm.assignments.Items, SaveFunc, DeleteFunc, 'UserGroupID');
    }

    function AssignmentFunc() {
        return Coupons.ListAssignments(vm.coupon.ID, null, vm.assignments.Meta.Page + 1, vm.assignments.Meta.PageSize);
    }

    function PagingFunction() {
        return Paging.paging(vm.list, 'UserGroups', vm.assignments, AssignmentFunc);
    }
}

function CouponAssignProductController(ProductList, ProductAssignments, SelectedCoupon, Coupons, Assignments, Paging) {
    var vm = this;
    vm.list = ProductList;
    vm.assignments = ProductAssignments;
    vm.coupon = SelectedCoupon;
    vm.saveAssignments = SaveAssignment;
    vm.pagingfunction = PagingFunction;

    function SaveFunc(ItemID) {
        return Coupons.SaveProductAssignment({
            CouponID: vm.coupon.ID,
            ProductID: ItemID
        });
    }

    function DeleteFunc(ItemID) {
        return Coupons.DeleteProductAssignment(vm.coupon.ID, ItemID);
    }

    function SaveAssignment() {
        return Assignments.saveAssignments(vm.list.Items, vm.assignments.Items, SaveFunc, DeleteFunc, 'ProductID');
    }

    function AssignmentFunc() {
        return Coupons.ListProductAssignments(vm.coupon.ID, null, vm.assignments.Meta.Page + 1, vm.assignments.Meta.PageSize);
    }

    function PagingFunction() {
        return Paging.paging(vm.list, 'Products', vm.assignments, AssignmentFunc);
    }
}

function CouponAssignCategoryController(CategoryList, CategoryAssignments, SelectedCoupon, Coupons, Assignments, Paging) {
    var vm = this;
    vm.list = CategoryList;
    vm.assignments = CategoryAssignments;
    vm.coupon = SelectedCoupon;
    vm.saveAssignments = SaveAssignment;
    vm.pagingfunction = PagingFunction;

    function SaveFunc(ItemID) {
        return Coupons.SaveCategoryAssignment({
            CouponID: vm.coupon.ID,
            CategoryID: ItemID
        });
    }

    function DeleteFunc(ItemID) {
        return Coupons.DeleteCategoryAssignment(vm.coupon.ID, ItemID);
    }

    function SaveAssignment() {
        return Assignments.saveAssignments(vm.list.Items, vm.assignments.Items, SaveFunc, DeleteFunc, 'CategoryID');
    }

    function AssignmentFunc() {
        return Coupons.ListCategoryAssignments(vm.coupon.ID, null, vm.assignments.Meta.Page + 1, vm.assignments.Meta.PageSize);
    }

    function PagingFunction() {
        return Paging.paging(vm.list, 'Categories', vm.assignments, AssignmentFunc);
    }
}

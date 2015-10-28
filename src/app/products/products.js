angular.module('orderCloud')

    .config(ProductsConfig)
    .controller('ProductsCtrl', ProductsController)
    .controller('ProductEditCtrl', ProductEditController)
    .controller('ProductCreateCtrl', ProductCreateController)
    .controller('ProductAssignCtrl', ProductAssignController)

;

function ProductsConfig($stateProvider) {
    $stateProvider
        .state('base.products', {
            url: '/products',
            templateUrl: 'products/templates/products.tpl.html',
            controller: 'ProductsCtrl',
            controllerAs: 'products',
            data: {componentName: 'Products'},
            resolve: {
                ProductList: function (Products) {
                    return Products.List();
                }
            }
        })
        .state('base.productEdit', {
            url: '/products/:productid/edit',
            templateUrl: 'products/templates/productEdit.tpl.html',
            controller: 'ProductEditCtrl',
            controllerAs: 'productEdit',
            resolve: {
                SelectedProduct: function ($stateParams, Products) {
                    return Products.Get($stateParams.productid);
                }
            }
        })
        .state('base.productCreate', {
            url: '/products/create',
            templateUrl: 'products/templates/productCreate.tpl.html',
            controller: 'ProductCreateCtrl',
            controllerAs: 'productCreate'
        })
        .state('base.productAssign', {
            url: '/products/:productid/assign',
            templateUrl: 'products/templates/productAssign.tpl.html',
            controller: 'ProductAssignCtrl',
            controllerAs: 'productAssign',
            resolve: {
                Buyer: function (Buyers) {
                    return Buyers.Get();
                },
                UserGroupList: function (UserGroups) {
                    return UserGroups.List(null, 1, 20);
                },
                PriceScheduleList: function (PriceSchedules) {
                    return PriceSchedules.List(1, 20);
                },
                Assignments: function ($stateParams, Products) {
                    return Products.ListAssignments($stateParams.productid);
                },
                SelectedProduct: function ($stateParams, Products) {
                    return Products.Get($stateParams.productid);
                }
            }
        })
}

function ProductsController(ProductList, $state) {
    var vm = this,
        page = 1;
    vm.list = ProductList;
    vm.goToEdit = function(id) {
        $state.go('^.productEdit', {'productid': id});
    };
    vm.goToAssignments = function(id) {
        $state.go('^.productAssign', {'productid': id});
    };
}

function ProductEditController($state, SelectedProduct, Products) {
    var vm = this,
        productid = SelectedProduct.ID;
    vm.productName = SelectedProduct.ProductName;
    vm.product = SelectedProduct;

    vm.Submit = function () {
        Products.Update(productid, vm.product)
            .then(function () {
                $state.go('^.products')
            });
    };

    vm.Delete = function () {
        Products.Delete(productid)
            .then(function () {
                $state.go('^.products')
            });
    }
}

function ProductCreateController($state, Products) {
    var vm = this;
    vm.product = {};

    vm.Submit = function () {
        Products.Create(vm.product)
            .then(function () {
                $state.go('^.products')
            });
    }
}

function ProductAssignController(buyerid, UserGroups, UserGroupList, PriceScheduleList, Assignments, SelectedProduct, Products, Buyer, $state) {
    var vm = this,
        page = 1;
    vm.buyer = Buyer;
    vm.userGroups = UserGroupList.Items;
    vm.Standard_PS_ID = null;
    vm.Replenishment_PS_ID = null;
    vm.priceSchedules = PriceScheduleList.Items;
    vm.assignments = Assignments.Items;
    vm.product = SelectedProduct;
    vm.pagingFunction = pagingFunction;
    vm.stepOne = true;
    vm.stepTwo = false;
    vm.toOne = function () {
        vm.stepTwo = false;
        vm.stepOne = true;
    };
    vm.toTwo = function () {
        vm.stepTwo = true;
        vm.stepOne = false;
    };

    var reload = (function () {
        $state.go($state.current, {}, {reload: true});
    });

    vm.selectPriceSchedule = function(priceSchedule) {
        if (priceSchedule.selected && priceSchedule.ID !== vm.Standard_PS_ID && priceSchedule.ID !== vm.Replenishment_PS_ID) {
            if (priceSchedule.OrderType === 'Standard') {
                vm.Standard_PS_ID = priceSchedule.ID;
            }
            else if (priceSchedule.OrderType === 'Replenishment') {
                vm.Replenishment_PS_ID = priceSchedule.ID;
            }
        }
        else {
            if (priceSchedule.ID === vm.Standard_PS_ID) {
                vm.Standard_PS_ID = null;
                priceSchedule.selected = false;
            }
            else if (priceSchedule.ID === vm.Replenishment_PS_ID) {
                vm.Replenishment_PS_ID = null;
                priceSchedule.selected = false;
            }
        }
    }

    function checkSelectedPSIDs(party_type, party_id) {
        if (vm.Standard_PS_ID === null || vm.Replenishment_PS_ID === null) {
            angular.forEach(vm.assignments, function(assignment) {
                if (party_type === 'UserGroup' && party_id === assignment.UserGroupID) {
                    updateIDs(assignment);
                }
                if (party_type === 'Buyer' && party_id === assignment.BuyerID) {
                    updateIDs(assignment);
                }
            });
        }
        var assignmentObject = {
            ProductID: vm.product.ID,
            ReplenishmentPriceScheduleID: vm.Replenishment_PS_ID,
            StandardPriceScheduleID: vm.Standard_PS_ID,
            BuyerID: buyerid
        };
        if (party_type === 'UserGroup') {
            assignmentObject.UserGroupID = party_id;
        }
        Products.SaveAssignment(assignmentObject).then(reload);
    }

    function updateIDs(assignment) {
        if (assignment.StandardPriceScheduleID === null && vm.Replenishment_PS_ID === null) {
            vm.Replenishment_PS_ID = assignment.ReplenishmentPriceScheduleID;
        }
        else if (assignment.ReplenishmentPriceScheduleID === null && vm.Standard_PS_ID === null) {
            vm.Standard_PS_ID = assignment.StandardPriceScheduleID;
        }
    }

    vm.saveAssignments = function() {
        if (vm.assignBuyer) {
            checkSelectedPSIDs('Buyer', buyerid);
        }
        else {
            angular.forEach(vm.userGroups, function(group) {
                if (group.selected) {
                    checkSelectedPSIDs('UserGroup', group.ID);
                }
            });
        }
    }

    vm.deleteAssignment = function (assignment, psType) {
        if (psType == null) {
            Products.DeleteAssignment(vm.product.ID, null, assignment.UserGroupID)
                .then(reload);
        }
        else {
            if (psType === 'Standard') {
                assignment.StandardPriceScheduleID = null;

            }
            else if (psType === 'Replenishment') {
                assignment.ReplenishmentPriceScheduleID = null;
            }
            Products.SaveAssignment(assignment)
                .then(reload);
        }
    }


    function pagingFunction() {
        page += 1;
        if (page <= UserGroupList.Meta.TotalPages) {
            UserGroups.List(null, page, 20)
                .then(function (groups) {
                    if (groups.Items && groups.Items.length > 0) {
                        vm.userGroups = [].concat(vm.userGroups, groups.Items)
                    }
                });
        }
        if (page <= PriceScheduleList.Meta.TotalPages) {
            PriceScheduleList.List(null, null, page, 20)
                .then(function (ps) {
                    if (ps.Items && groups.ps.length > 0) {
                        vm.priceSchedules = [].concat(vm.priceSchedules, ps.Items)
                    }
                });
        }
    }

}


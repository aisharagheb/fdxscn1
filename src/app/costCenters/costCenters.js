angular.module( 'orderCloud' )

    .config( CostCentersConfig )
    .controller( 'CostCentersCtrl', CostCentersController )
    .controller( 'CostCenterEditCtrl', CostCenterEditController )
    .controller( 'CostCenterCreateCtrl', CostCenterCreateController )
    .controller( 'CostCenterAssignCtrl', CostCenterAssignController )

;

function CostCentersConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.costCenters', {
            url: '/costCenters',
            templateUrl:'costCenters/templates/costCenters.tpl.html',
            controller:'CostCentersCtrl',
            controllerAs: 'costCenters',
            data: {componentName: 'Cost Centers'},
            resolve: {
                CostCenterList: function(CostCenters) {
                    return CostCenters.List();
                }
            }
        })
        .state( 'base.costCenterEdit', {
            url: '/costCenters/:costCenterid/edit',
            templateUrl:'costCenters/templates/costCenterEdit.tpl.html',
            controller:'CostCenterEditCtrl',
            controllerAs: 'costCenterEdit',
            resolve: {
                SelectedCostCenter: function($stateParams, $state, CostCenters) {
                    return CostCenters.Get($stateParams.costCenterid).catch(function() {
                        $state.go('^.costCenters');
                    });
                }
            }
        })
        .state( 'base.costCenterCreate', {
            url: '/costCenters/create',
            templateUrl:'costCenters/templates/costCenterCreate.tpl.html',
            controller:'CostCenterCreateCtrl',
            controllerAs: 'costCenterCreate'
        })
        .state( 'base.costCenterAssign', {
            url: '/costCenters/:costCenterid/assign',
            templateUrl: 'costCenters/templates/costCenterAssign.tpl.html',
            controller: 'CostCenterAssignCtrl',
            controllerAs: 'costCenterAssign',
            resolve: {
                Buyer: function(Buyers) {
                    return Buyers.Get();
                },
                UserGroupList: function(UserGroups) {
                    return UserGroups.List(null, 1, 20);
                },
                AssignedUserGroups: function($stateParams, CostCenters) {
                    return CostCenters.ListAssignments($stateParams.costCenterid);
                },
                SelectedCostCenter: function($stateParams, $state, CostCenters) {
                    return CostCenters.Get($stateParams.costCenterid).catch(function() {
                        $state.go('^.costCenters');
                    });
                }
            }
        })
}

function CostCentersController( $state, CostCenterList ) {
    var vm = this;
    vm.list = CostCenterList;
    vm.goToEdit = function(id) {
        $state.go('^.costCenterEdit', {'costCenterid': id});
    };
    vm.goToAssignments = function(id) {
        $state.go('^.costCenterAssign', {'costCenterid': id});
    };
}

function CostCenterEditController( $exceptionHandler, $state, SelectedCostCenter, CostCenters ) {
    var vm = this,
        costCenterid = SelectedCostCenter.ID;
    vm.costCenterName = SelectedCostCenter.Name;
    vm.costCenter = SelectedCostCenter;

    vm.Submit = function() {
        CostCenters.Update(costCenterid, vm.costCenter)
            .then(function() {
                $state.go('^.costCenters')
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    };

    vm.Delete = function() {
        CostCenters.Delete(SelectedCostCenter.ID)
            .then(function() {
                $state.go('^.costCenters')
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function CostCenterCreateController( $exceptionHandler,$state, CostCenters) {
    var vm = this;
    vm.costCenter = {};

    vm.Submit = function() {
        CostCenters.Create(vm.costCenter)
            .then(function() {
                $state.go('^.costCenters')
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function CostCenterAssignController(Buyer, UserGroupList, AssignedUserGroups, SelectedCostCenter, CostCenters) {
    var vm = this;
    vm.buyer = Buyer;
    vm.assignBuyer = false;
    vm.userGroups = UserGroupList;
    vm.assignedUserGroups = AssignedUserGroups;
    vm.costCenter = SelectedCostCenter;
    vm.costCenterName = SelectedCostCenter.Name;
    vm.saveAssignments = saveAssignments;

    function saveAssignments(form) {
        var assignmentObject = {};
        angular.forEach(vm.userGroups.Items, function(group, index) {
            if (form['assignCheckbox' + index].$dirty) {
                if (group.selected) {
                    assignmentObject = {UserID: null, UserGroupID: group.ID, CostCenterID: vm.costCenter.ID};
                    CostCenters.SaveAssignment(assignmentObject);
                    vm.assignedUserGroups.Items.push(assignmentObject);
                }
                else {
                    angular.forEach(vm.assignedUserGroups.Items, function(assignment, index) {
                        if (assignment.UserGroupID === group.ID) {
                            CostCenters.DeleteAssignment(vm.costCenter.ID, null, group.ID);
                            vm.assignedUserGroups.Items.splice(index, 1);
                            index = index - 1;
                        }
                    })
                }
            }
        });
    }
}

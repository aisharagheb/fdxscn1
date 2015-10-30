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
                SelectedCostCenter: function($stateParams, CostCenters) {
                    return CostCenters.Get($stateParams.costCenterid);
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
                SelectedCostCenter: function($stateParams, CostCenters) {
                    return CostCenters.Get($stateParams.costCenterid);
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

function CostCenterEditController( $state, SelectedCostCenter, CostCenters ) {
    var vm = this,
        costCenterid = SelectedCostCenter.ID;
    vm.costCenterName = SelectedCostCenter.CostCenterName;
    vm.costCenter = SelectedCostCenter;

    vm.Submit = function() {
        CostCenters.Update(costCenterid, vm.costCenter)
            .then(function() {
                $state.go('^.costCenters')
            });
    };

    vm.Delete = function() {
        CostCenters.Delete(SelectedCostCenter.ID)
            .then(function() {
                $state.go('^.costCenters')
            });
    }
}

function CostCenterCreateController($state, CostCenters) {
    var vm = this;
    vm.costCenter = {};

    vm.Submit = function() {
        CostCenters.Create(vm.costCenter)
            .then(function() {
                $state.go('^.costCenters')
            });
    }
}

function CostCenterAssignController(Buyer, UserGroupList, AssignedUserGroups, SelectedCostCenter, Assignments) {
    var vm = this;
    vm.buyer = Buyer;
    vm.assignBuyer = false;
    vm.userGroups = UserGroupList;
    vm.assignedUserGroups = AssignedUserGroups;
    vm.costCenter = SelectedCostCenter;
    vm.resetSelections = Assignments.resetSelections;
    vm.saveAssignments = Assignments.saveAssignments;
}
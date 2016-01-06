angular.module( 'orderCloud' )

    .config( CostCentersConfig )
    .controller( 'CostCentersCtrl', CostCentersController )
    .controller( 'CostCenterEditCtrl', CostCenterEditController )
    .controller( 'CostCenterCreateCtrl', CostCenterCreateController )
    .controller( 'CostCenterAssignCtrl', CostCenterAssignController )

;

function CostCentersConfig( $stateProvider ) {
    $stateProvider
        .state( 'costCenters', {
            parent: 'base',
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
        .state( 'costCenters.edit', {
            url: '/:costCenterid/edit',
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
        .state( 'costCenters.create', {
            url: '/create',
            templateUrl:'costCenters/templates/costCenterCreate.tpl.html',
            controller:'CostCenterCreateCtrl',
            controllerAs: 'costCenterCreate'
        })
        .state( 'costCenters.assign', {
            url: '/:costCenterid/assign',
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
                        $state.go('^');
                    });
                }
            }
        })
}

function CostCentersController( CostCenterList, TrackSearch ) {
    var vm = this;
    vm.list = CostCenterList;
    vm.searching = function() {
        return TrackSearch.GetTerm() ? true : false;
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
                $state.go('costCenters', {}, {reload:true})
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    };

    vm.Delete = function() {
        CostCenters.Delete(SelectedCostCenter.ID)
            .then(function() {
                $state.go('costCenters', {}, {reload:true})
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
                $state.go('costCenters', {}, {reload:true})
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function CostCenterAssignController(Assignments, Paging, UserGroupList, AssignedUserGroups, SelectedCostCenter, CostCenters) {
    var vm = this;
    vm.CostCenter = SelectedCostCenter;
    vm.list = UserGroupList;
    vm.assignments = AssignedUserGroups;
    vm.saveAssignments = SaveAssignment;
    vm.pagingfunction = PagingFunction;

    function SaveFunc(ItemID) {
        return CostCenters.SaveAssignment({
            UserID: null,
            UserGroupID: ItemID,
            CostCenterID: vm.CostCenter.ID
        });
    }

    function DeleteFunc(ItemID) {
        return CostCenters.DeleteAssignment(vm.CostCenter.ID, null, ItemID);
    }

    function SaveAssignment() {
        return Assignments.saveAssignments(vm.list.Items, vm.assignments.Items, SaveFunc, DeleteFunc);
    }

    function AssignmentFunc() {
        return CostCenters.ListAssignments(vm.CostCenter.ID, null, vm.assignments.Meta.PageSize);
    }

    function PagingFunction() {
        return Paging.paging(vm.list, 'UserGroups', vm.assignments, AssignmentFunc);
    }
}


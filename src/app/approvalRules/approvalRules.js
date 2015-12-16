angular.module( 'orderCloud' )

    .config( ApprovalRulesConfig )
    .controller( 'ApprovalRulesCtrl', ApprovalRulesController )
    .controller( 'ApprovalRuleEditCtrl', ApprovalRuleEditController )
    .controller( 'ApprovalRuleCreateCtrl', ApprovalRuleCreateController )
    .factory( 'ApprovalRuleFactory', ApprovalRuleTypeFactory )

;

function ApprovalRulesConfig( $stateProvider ) {
    $stateProvider
        .state( 'approvalRules', {
            parent: 'base',
            url: '/approvalRules',
            templateUrl:'approvalRules/templates/approvalRules.tpl.html',
            controller:'ApprovalRulesCtrl',
            controllerAs: 'approvalRules',
            data: {componentName: 'Approval Rules'},
            resolve: {
                ApprovalRuleList: function( ApprovalRules) {
                    return ApprovalRules.List();
                }
            }
        })
        .state( 'approvalRules.edit', {
            url: '/:approvalRuleid/edit',
            templateUrl:'approvalRules/templates/approvalRuleEdit.tpl.html',
            controller:'ApprovalRuleEditCtrl',
            controllerAs: 'approvalRuleEdit',
            resolve: {
                SelectedApprovalRule: function( $stateParams, $state, ApprovalRules) {
                    return ApprovalRules.Get($stateParams.approvalRuleid).catch(function() {
                        $state.go('^.approvalRules');
                    });
                }
            }
        })
        .state( 'approvalRules.create', {
            url: '/create',
            templateUrl:'approvalRules/templates/approvalRuleCreate.tpl.html',
            controller:'ApprovalRuleCreateCtrl',
            controllerAs: 'approvalRuleCreate'
        })
}

function ApprovalRulesController( ApprovalRuleList, TrackSearch ) {
    var vm = this;
    vm.list = ApprovalRuleList;
    vm.searching = function() {
        return TrackSearch.GetTerm() ? true : false;
    };
}

function ApprovalRuleEditController( $exceptionHandler, $state, ApprovalRuleFactory, SelectedApprovalRule, ApprovalRules, BuyerID ) {
    var vm = this,
        approvalRuleID = SelectedApprovalRule.ID;
    vm.approvalRuleID = SelectedApprovalRule.ID;
    vm.approvalRule = SelectedApprovalRule;
    vm.approvalRule.ApprovingAssignment.BuyerID = BuyerID.Get();
    vm.approvalRule.SubmittingAssignment.BuyerID = BuyerID.Get();

    vm.Submit = function() {
        ApprovalRules.Update(approvalRuleID, vm.approvalRule)
            .then(function() {
                $state.go('approvalRules', {}, {reload:true});
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    };

    vm.Delete = function() {
        ApprovalRules.Delete(SelectedApprovalRule.ID)
            .then(function() {
                $state.go('approvalRules', {}, {reload:true});
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    };

    vm.userIDTypeAhead = ApprovalRuleFactory.UserList;
    vm.userGroupIDTypeAhead = ApprovalRuleFactory.UserGroupList;
    vm.costCenterIDTypeAhead = ApprovalRuleFactory.CostCenterList;
    vm.categoryIDTypeAhead = ApprovalRuleFactory.CategoryList;
}

function ApprovalRuleCreateController($exceptionHandler, $state, ApprovalRuleFactory, ApprovalRules, BuyerID) {
    var vm = this;
    vm.approvalRule = {};
    vm.approvalRule.ApprovingAssignment = {
        BuyerID: BuyerID.Get()
    };
    vm.approvalRule.SubmittingAssignment = {
        BuyerID: BuyerID.Get()
    };

    vm.Submit = function() {
        ApprovalRules.Create(vm.approvalRule)
            .then(function() {
                $state.go('approvalRules', {}, {reload:true})
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    };

    vm.userIDTypeAhead = ApprovalRuleFactory.UserList;
    vm.userGroupIDTypeAhead = ApprovalRuleFactory.UserGroupList;
    vm.costCenterIDTypeAhead = ApprovalRuleFactory.CostCenterList;
    vm.categoryIDTypeAhead = ApprovalRuleFactory.CategoryList;
}

function ApprovalRuleTypeFactory(Users, UserGroups, CostCenters, Categories) {
    return {
        UserList: UserList,
        UserGroupList: UserGroupList,
        CostCenterList: CostCenterList,
        CategoryList: CategoryList
    };

    function UserList(term) {
        return Users.List(term).then(function(data) {
            return data.Items;
        });
    }

    function UserGroupList(term) {
        return UserGroups.List(term).then(function(data) {
            return data.Items;
        });
    }

    function CostCenterList(term) {
        return CostCenters.List(term).then(function(data) {
            return data.Items;
        })
    }

    function CategoryList(term) {
        return Categories.List(term).then(function(data) {
            return data.Items;
        })
    }
}


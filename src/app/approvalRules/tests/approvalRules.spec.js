describe('Component: ApprovalRules', function() {
    var scope,
        q,
        approvalRule;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($q, $rootScope) {
        q = $q;
        scope = $rootScope.$new();
        approvalRule = {
            ID: "TestApprovalRule123456789",
            SubmitType: "Approve",
            Sequence: 1,
            SubmittingAssignment: {
                BuyerID: "TestBuyer123456789",
                UserID: null,
                UserGroupID: null
        },
            ApprovingAssignment: {
                BuyerID: "TestBuyer123456789",
                UserID: "…",
                UserGroupID: "TestUser123456789"
        },
            Price: 1,
            CostCenterID: null,
            PaymentMethod: null,
            CategoryID: null,
            Quantity: null,
            Stage: 0,
            MinutesAllowed: null,
            ImplicitAction: "None",
            SendShipNoticeEmail: false,
            SendApprovalNoticeEmail: true
        };
    }));

    describe('State: approvalRules', function() {
        var state;
        beforeEach(inject(function($state, ApprovalRules) {
            state = $state.get('approvalRules');
            spyOn(ApprovalRules, 'List').and.returnValue(null);
        }));
        it('should resolve ApprovalRuleList', inject(function ($injector, ApprovalRules) {
            $injector.invoke(state.resolve.ApprovalRuleList);
            expect(ApprovalRules.List).toHaveBeenCalled();
        }));
    });

    describe('State: approvalRules.edit', function() {
        var state;
        beforeEach(inject(function($state, ApprovalRules) {
            state = $state.get('approvalRules.edit');
            var defer = q.defer();
            defer.resolve();
            spyOn(ApprovalRules, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve SelectedApprovalRule', inject(function ($injector, $stateParams, ApprovalRules) {
            $injector.invoke(state.resolve.SelectedApprovalRule);
            expect(ApprovalRules.Get).toHaveBeenCalledWith($stateParams.approvalRuleid);
        }));
    });

    describe('Controller: ApprovalRuleEditCtrl', function() {
        var approvalRuleEditCtrl;
        beforeEach(inject(function($state, $controller) {
            approvalRuleEditCtrl = $controller('ApprovalRuleEditCtrl', {
                $scope: scope,
                SelectedApprovalRule: approvalRule
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(ApprovalRules) {
                approvalRuleEditCtrl.approvalRule = approvalRule;
                approvalRuleEditCtrl.approvalRuleID = "TestApprovalRule123456789";
                var defer = q.defer();
                defer.resolve(approvalRule);
                spyOn(ApprovalRules, 'Update').and.returnValue(defer.promise);
                approvalRuleEditCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the ApprovalRules Update method', inject(function(ApprovalRules) {
                expect(ApprovalRules.Update).toHaveBeenCalledWith(approvalRuleEditCtrl.approvalRuleID, approvalRuleEditCtrl.approvalRule);
            }));
            it ('should enter the approvalRules state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('approvalRules', {}, {reload:true});
            }));
        });

        describe('Delete', function() {
            beforeEach(inject(function(ApprovalRules) {
                var defer = q.defer();
                defer.resolve(approvalRule);
                spyOn(ApprovalRules, 'Delete').and.returnValue(defer.promise);
                approvalRuleEditCtrl.Delete();
                scope.$digest();
            }));
            it ('should call the ApprovalRules Delete method', inject(function(ApprovalRules) {
                expect(ApprovalRules.Delete).toHaveBeenCalledWith(approvalRule.ID);
            }));
            it ('should enter the approvalRules state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('approvalRules', {}, {reload:true});
            }));
        });
    });

    describe('Controller: ApprovalRuleCreateCtrl', function() {
        var approvalRuleCreateCtrl;
        beforeEach(inject(function($state, $controller) {
            approvalRuleCreateCtrl = $controller('ApprovalRuleCreateCtrl', {
                $scope: scope
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(ApprovalRules) {
                approvalRuleCreateCtrl.approvalRule = approvalRule;
                var defer = q.defer();
                defer.resolve(approvalRule);
                spyOn(ApprovalRules, 'Create').and.returnValue(defer.promise);
                approvalRuleCreateCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the ApprovalRules Create method', inject(function(ApprovalRules) {
                expect(ApprovalRules.Create).toHaveBeenCalledWith(approvalRule);
            }));
            it ('should enter the approvalRules state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('approvalRules', {}, {reload:true});
            }));
        });
    });
    
    describe('Factory: ApprovalRuleFactory', function() {
        var approvalRuleService, term;
        beforeEach(inject(function(ApprovalRuleFactory, Users, UserGroups, CostCenters, Categories) {
            approvalRuleService = ApprovalRuleFactory;
            var defer = q.defer();
            defer.resolve(null);
            spyOn(Users, 'List').and.returnValue(defer.promise);
            spyOn(UserGroups, 'List').and.returnValue(defer.promise);
            spyOn(CostCenters, 'List').and.returnValue(defer.promise);
            spyOn(Categories, 'List').and.returnValue(defer.promise);
        }));

        describe('UserList', function() {
            beforeEach(function() {
                term = "test";
                approvalRuleService.UserList(term);
            });

            it ('should call Users List method', inject(function(Users) {
                expect(Users.List).toHaveBeenCalledWith(term);
            }));
        });
        describe('UserGroups', function() {
            beforeEach(function() {
                term = "test";
                approvalRuleService.UserGroupList(term);
            });

            it ('should call UserGroups List method', inject(function(UserGroups) {
                expect(UserGroups.List).toHaveBeenCalledWith(term);
            }));
        });
        describe('CostCenterList', function() {
            beforeEach(function() {
                term = "test";
                approvalRuleService.CostCenterList(term);
            });

            it ('should call CostCenters List method', inject(function(CostCenters) {
                expect(CostCenters.List).toHaveBeenCalledWith(term);
            }));
        });
        describe('CategoryList', function() {
            beforeEach(function() {
                term = "test";
                approvalRuleService.CategoryList(term);
            });

            it ('should call Users List method', inject(function(Categories) {
                expect(Categories.List).toHaveBeenCalledWith(term);
            }));
        });
    });
});


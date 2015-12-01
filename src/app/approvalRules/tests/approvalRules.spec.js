describe('Component: ApprovalRules,', function() {
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

    describe('State: Base.approvalRules,', function() {
        var state;
        beforeEach(inject(function($state, ApprovalRules) {
            state = $state.get('base.approvalRules');
            spyOn(ApprovalRules, 'List').and.returnValue(null);
        }));
        it('should resolve ApprovalRuleList', inject(function ($injector, ApprovalRules) {
            $injector.invoke(state.resolve.ApprovalRuleList);
            expect(ApprovalRules.List).toHaveBeenCalled();
        }));
    });

    describe('State: Base.approvalRuleEdit,', function() {
        var state;
        beforeEach(inject(function($state, ApprovalRules) {
            state = $state.get('base.approvalRuleEdit');
            var defer = q.defer();
            defer.resolve();
            spyOn(ApprovalRules, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve SelectedApprovalRule', inject(function ($injector, $stateParams, ApprovalRules) {
            $injector.invoke(state.resolve.SelectedApprovalRule);
            expect(ApprovalRules.Get).toHaveBeenCalledWith($stateParams.approvalRuleid);
        }));
    });

    describe('Controller: ApprovalRuleEditCtrl,', function() {
        var approvalRuleEditCtrl;
        beforeEach(inject(function($state, $controller, ApprovalRules) {
            approvalRuleEditCtrl = $controller('ApprovalRuleEditCtrl', {
                $scope: scope,
                ApprovalRules: ApprovalRules,
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
                expect($state.go).toHaveBeenCalledWith('base.approvalRules');
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
                expect($state.go).toHaveBeenCalledWith('base.approvalRules');
            }));
        });
    });

    describe('Controller: ApprovalRuleCreateCtrl,', function() {
        var approvalRuleCreateCtrl;
        beforeEach(inject(function($state, $controller, ApprovalRules) {
            approvalRuleCreateCtrl = $controller('ApprovalRuleCreateCtrl', {
                $scope: scope,
                ApprovalRules: ApprovalRules
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
                expect($state.go).toHaveBeenCalledWith('base.approvalRules');
            }));
        });
    });
});


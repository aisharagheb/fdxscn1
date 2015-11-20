describe('Component: CreditCards,', function() {
    var scope,
        q,
        creditCard;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($q, $rootScope) {
        q = $q;
        scope = $rootScope.$new();
        creditCard = {
            ID: "TestCreditCard123456789",
            Token: "token",
            CardType: "Visa",
            PartialAccountNumber: "12345",
            CardholderName: "Test Test",
            ExpirationDate: "08/2018"
        };
    }));

    describe('State: Base.creditCards,', function() {
        var state;
        beforeEach(inject(function($state, CreditCards) {
            state = $state.get('base.creditCards');
            spyOn(CreditCards, 'List').and.returnValue(null);
        }));
        it('should resolve CreditCardList', inject(function ($injector, CreditCards) {
            $injector.invoke(state.resolve.CreditCardList);
            expect(CreditCards.List).toHaveBeenCalled();
        }));
    });

    describe('State: Base.creditCardEdit,', function() {
        var state;
        beforeEach(inject(function($state, CreditCards) {
            state = $state.get('base.creditCardEdit');
            var defer = q.defer();
            defer.resolve();
            spyOn(CreditCards, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve SelectedCreditCard', inject(function ($injector, $stateParams, CreditCards) {
            $injector.invoke(state.resolve.SelectedCreditCard);
            expect(CreditCards.Get).toHaveBeenCalledWith($stateParams.creditCardid);
        }));
    });

    describe('State: Base.creditCardAssign,', function() {
        var state;
        beforeEach(inject(function($state, CreditCards, UserGroups, Buyers) {
            state = $state.get('base.creditCardAssign');
            spyOn(Buyers, 'Get').and.returnValue(null);
            spyOn(UserGroups, 'List').and.returnValue(null);
            spyOn(CreditCards, 'ListAssignments').and.returnValue(null);
            var defer = q.defer();
            defer.resolve();
            spyOn(CreditCards, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve Buyer', inject(function ($injector, Buyers) {
            $injector.invoke(state.resolve.Buyer);
            expect(Buyers.Get).toHaveBeenCalled();
        }));
        it('should resolve UserGroupList', inject(function ($injector, UserGroups) {
            $injector.invoke(state.resolve.UserGroupList);
            expect(UserGroups.List).toHaveBeenCalled();
        }));
        it('should resolve AssignmentsList', inject(function ($injector, $stateParams, CreditCards) {
            $injector.invoke(state.resolve.AssignedUserGroups);
            expect(CreditCards.ListAssignments).toHaveBeenCalledWith($stateParams.creditCardid);
        }));
        it('should resolve SelectedCreditCard', inject(function ($injector, $stateParams, CreditCards) {
            $injector.invoke(state.resolve.SelectedCreditCard);
            expect(CreditCards.Get).toHaveBeenCalledWith($stateParams.creditCardid);
        }));
    });

    describe('Controller: CreditCardEditCtrl,', function() {
        var creditCardEditCtrl;
        beforeEach(inject(function($state, $controller, CreditCards) {
            creditCardEditCtrl = $controller('CreditCardEditCtrl', {
                $scope: scope,
                CreditCards: CreditCards,
                SelectedCreditCard: creditCard
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(CreditCards) {
                creditCardEditCtrl.creditCard = creditCard;
                creditCardEditCtrl.creditCardID = "TestCreditCard123456789";
                var defer = q.defer();
                defer.resolve(creditCard);
                spyOn(CreditCards, 'Update').and.returnValue(defer.promise);
                creditCardEditCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the CreditCards Update method', inject(function(CreditCards) {
                expect(CreditCards.Update).toHaveBeenCalledWith(creditCardEditCtrl.creditCardID, creditCardEditCtrl.creditCard);
            }));
            it ('should enter the creditCards state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.creditCards');
            }));
        });

        describe('Delete', function() {
            beforeEach(inject(function(CreditCards) {
                var defer = q.defer();
                defer.resolve(creditCard);
                spyOn(CreditCards, 'Delete').and.returnValue(defer.promise);
                creditCardEditCtrl.Delete();
                scope.$digest();
            }));
            it ('should call the CreditCards Delete method', inject(function(CreditCards) {
                expect(CreditCards.Delete).toHaveBeenCalledWith(creditCard.ID);
            }));
            it ('should enter the creditCards state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.creditCards');
            }));
        });
    });

    describe('Controller: CreditCardCreateCtrl,', function() {
        var creditCardCreateCtrl;
        beforeEach(inject(function($state, $controller, CreditCards) {
            creditCardCreateCtrl = $controller('CreditCardCreateCtrl', {
                $scope: scope,
                CreditCards: CreditCards
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(CreditCards) {
                creditCardCreateCtrl.creditCard = creditCard;
                creditCardCreateCtrl.creditCard.ExpirationDate = new Date();
                var defer = q.defer();
                defer.resolve(creditCard);
                spyOn(CreditCards, 'Create').and.returnValue(defer.promise);
                creditCardCreateCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the CreditCards Create method', inject(function(CreditCards) {
                expect(CreditCards.Create).toHaveBeenCalledWith(creditCard);
            }));
            it ('should enter the creditCards state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.creditCards');
            }));
        });
    });

    describe('Controller: CreditCardAssignCtrl,', function() {
        var creditCardAssignCtrl;
        beforeEach(inject(function($state, $controller, CreditCards) {
            creditCardAssignCtrl = $controller('CreditCardAssignCtrl', {
                $scope: scope,
                CreditCards: CreditCards,
                UserGroupList: [],
                AssignedUserGroups: [],
                SelectedCreditCard: {},
                Buyer: {}
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('SaveAssignment', function() {
            beforeEach(inject(function(Assignments) {
                var defer = q.defer();
                defer.resolve();
                spyOn(Assignments, 'saveAssignments').and.returnValue(defer.promise);
                creditCardAssignCtrl.saveAssignments();
            }));
            it ('should call the Assignments saveAssignments method', inject(function(Assignments) {
                expect(Assignments.saveAssignments).toHaveBeenCalled();
            }));
        });

        describe('PagingFunction', function() {
            beforeEach(inject(function(Paging) {
                var defer = q.defer();
                defer.resolve();
                spyOn(Paging, 'paging').and.returnValue(defer.promise);
                creditCardAssignCtrl.pagingfunction();
            }));
            it ('should call the Paging paging method', inject(function(Paging) {
                expect(Paging.paging).toHaveBeenCalled();
            }));
        });
    });
});


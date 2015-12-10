describe('Component: GiftCards', function() {
    var scope,
        q,
        giftCard;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($q, $rootScope) {
        q = $q;
        scope = $rootScope.$new();
        giftCard = {
            ID: "TestGiftCard123456789",
            Name: "TestGiftCard",
            AllowAsPaymentMethod: true,
            Balance: 50.0,
            RedemptionCode: "TestRedemptionCode12345",
            StartDate: null,
            EndDate: null,
            xp: null
        };
    }));

    describe('State: Base.giftCards', function() {
        var state;
        beforeEach(inject(function($state, SpendingAccounts) {
            state = $state.get('base.giftCards');
            spyOn(SpendingAccounts, 'List').and.returnValue(null);
        }));
        it('should resolve GiftCardList', inject(function ($injector, SpendingAccounts) {
            $injector.invoke(state.resolve.GiftCardList);
            expect(SpendingAccounts.List).toHaveBeenCalledWith(null, null, null, null, null, {'RedemptionCode': '*'});
        }));
    });

    describe('State: Base.giftCardEdit', function() {
        var state;
        beforeEach(inject(function($state, SpendingAccounts) {
            state = $state.get('base.giftCardEdit');
            var defer = q.defer();
            defer.resolve();
            spyOn(SpendingAccounts, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve SelectedGiftCard', inject(function ($injector, $stateParams, SpendingAccounts) {
            $injector.invoke(state.resolve.SelectedGiftCard);
            expect(SpendingAccounts.Get).toHaveBeenCalledWith($stateParams.giftCardid);
        }));
    });

    describe('State: Base.giftCardAssignGroup', function() {
        var state;
        beforeEach(inject(function($state, SpendingAccounts, UserGroups) {
            state = $state.get('base.giftCardAssignGroup');
            spyOn(UserGroups, 'List').and.returnValue(null);
            spyOn(SpendingAccounts, 'ListAssignments').and.returnValue(null);
            var defer = q.defer();
            defer.resolve();
            spyOn(SpendingAccounts, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve UserGroupList', inject(function ($injector, UserGroups) {
            $injector.invoke(state.resolve.UserGroupList);
            expect(UserGroups.List).toHaveBeenCalled();
        }));
        it('should resolve AssignedUserGroups', inject(function ($injector, $stateParams, SpendingAccounts) {
            $injector.invoke(state.resolve.AssignedUserGroups);
            expect(SpendingAccounts.ListAssignments).toHaveBeenCalledWith($stateParams.giftCardid, null, null, 'Group');
        }));
        it('should resolve SelectedGiftCard', inject(function ($injector, $stateParams, SpendingAccounts) {
            $injector.invoke(state.resolve.SelectedGiftCard);
            expect(SpendingAccounts.Get).toHaveBeenCalledWith($stateParams.giftCardid);
        }));
    });

    describe('State: Base.giftCardAssignUser', function() {
        var state;
        beforeEach(inject(function($state, SpendingAccounts, Users) {
            state = $state.get('base.giftCardAssignUser');
            spyOn(Users, 'List').and.returnValue(null);
            var defer = q.defer();
            defer.resolve();
            spyOn(SpendingAccounts, 'Get').and.returnValue(defer.promise);
            spyOn(SpendingAccounts, 'ListAssignments').and.returnValue(defer.promise);
        }));
        it('should resolve UserList', inject(function ($injector, Users) {
            $injector.invoke(state.resolve.UserList);
            expect(Users.List).toHaveBeenCalled();
        }));
        it('should resolve AssignedUsers', inject(function ($injector, $stateParams, SpendingAccounts) {
            $injector.invoke(state.resolve.AssignedUsers);
            expect(SpendingAccounts.ListAssignments).toHaveBeenCalledWith($stateParams.giftCardid, null, null, 'User');
        }));
        it('should resolve SelectedGiftCard', inject(function ($injector, $stateParams, SpendingAccounts) {
            $injector.invoke(state.resolve.SelectedGiftCard);
            expect(SpendingAccounts.Get).toHaveBeenCalledWith($stateParams.giftCardid);
        }));
    });

    describe('Controller: GiftCardsCtrl', function() {
        var giftCardsCtrl;
        beforeEach(inject(function($state, $controller) {
            giftCardsCtrl = $controller('GiftCardsCtrl', {
                GiftCardList: []
            });
            spyOn($state, 'go').and.returnValue(true);
        }));
        describe('pagingfunction', function() {
            beforeEach(inject(function(SpendingAccounts) {
                var defer = q.defer();
                defer.resolve(null);
                spyOn(SpendingAccounts, 'List').and.returnValue(defer.promise);
                scope.$digest();
                giftCardsCtrl.list = {
                    Meta: {
                        Page: 1,
                        TotalPages: 2,
                        PageSize: 20
                    }
                }
                giftCardsCtrl.pagingfunction();
            }));
            it ('should call the SpendingAccounts List method', inject(function(SpendingAccounts) {
                expect(SpendingAccounts.List).toHaveBeenCalledWith(null, giftCardsCtrl.list.Meta.Page + 1, giftCardsCtrl.list.Meta.PageSize, null, null, {'RedemptionCode': '*'});
            }));
        });
    });

    describe('Controller: GiftCardEditCtrl', function() {
        var giftCardEditCtrl;
        beforeEach(inject(function($state, $controller) {
            giftCardEditCtrl = $controller('GiftCardEditCtrl', {
                $scope: scope,
                SelectedGiftCard: giftCard
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(SpendingAccounts) {
                giftCardEditCtrl.giftCard = giftCard;
                giftCardEditCtrl.giftCardID = "TestGiftCard123456789";
                var defer = q.defer();
                defer.resolve(giftCard);
                spyOn(SpendingAccounts, 'Update').and.returnValue(defer.promise);
                giftCardEditCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the SpendingAccounts Update method', inject(function(SpendingAccounts) {
                expect(SpendingAccounts.Update).toHaveBeenCalledWith(giftCardEditCtrl.giftCardID, giftCardEditCtrl.giftCard);
            }));
            it ('should enter the giftCards state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.giftCards');
            }));
        });

        describe('Delete', function() {
            beforeEach(inject(function(SpendingAccounts) {
                var defer = q.defer();
                defer.resolve(giftCard);
                spyOn(SpendingAccounts, 'Delete').and.returnValue(defer.promise);
                giftCardEditCtrl.Delete();
                scope.$digest();
            }));
            it ('should call the SpendingAccounts Delete method', inject(function(SpendingAccounts) {
                expect(SpendingAccounts.Delete).toHaveBeenCalledWith(giftCard.ID);
            }));
            it ('should enter the giftCards state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.giftCards');
            }));
        });
    });

    describe('Controller: GiftCardCreateCtrl', function() {
        var giftCardCreateCtrl;
        beforeEach(inject(function($state, $controller) {
            giftCardCreateCtrl = $controller('GiftCardCreateCtrl', {
                $scope: scope
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(SpendingAccounts) {
                giftCardCreateCtrl.giftcard = giftCard;
                var defer = q.defer();
                defer.resolve(giftCard);
                spyOn(SpendingAccounts, 'Create').and.returnValue(defer.promise);
                giftCardCreateCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the SpendingAccounts Create method', inject(function(SpendingAccounts) {
                expect(SpendingAccounts.Create).toHaveBeenCalledWith(giftCardCreateCtrl.giftcard);
            }));
            it ('should enter the giftCards state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.giftCards');
            }));
        });
    });

    describe('Controller: GiftCardAssignGroupCtrl', function() {
        var giftCardAssignGroupCtrl;
        beforeEach(inject(function($state, $controller, SpendingAccounts) {
            giftCardAssignGroupCtrl = $controller('GiftCardAssignGroupCtrl', {
                $scope: scope,
                GiftCards: SpendingAccounts,
                UserGroupList: [],
                AssignedUserGroups: [],
                SelectedGiftCard: {}

            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('SaveAssignments', function() {
            beforeEach(inject(function(Assignments) {
                var defer = q.defer();
                defer.resolve();
                spyOn(Assignments, 'saveAssignments').and.returnValue(defer.promise);
                giftCardAssignGroupCtrl.saveAssignments();
            }));
            it ('should call the Assignments saveAssignments method', inject(function(Assignments) {
                expect(Assignments.saveAssignments).toHaveBeenCalled();
            }));
        });

        describe('pagingfunction', function() {
            beforeEach(inject(function(SpendingAccounts) {
                var defer = q.defer();
                defer.resolve(null);
                spyOn(SpendingAccounts, 'ListAssignments').and.returnValue(defer.promise);
                scope.$digest();
                giftCardAssignGroupCtrl.list = {
                    Meta: {
                        Page: 1,
                        TotalPages: 2,
                        PageSize: 20
                    }
                }
                giftCardAssignGroupCtrl.assignments = {
                    Meta: {
                        Page: 1,
                        TotalPages: 2,
                        PageSize: 20
                    }
                }
                giftCardAssignGroupCtrl.pagingfunction();
            }));
            it ('should call the SpendingAccounts List method', inject(function(SpendingAccounts) {
                expect(SpendingAccounts.ListAssignments).toHaveBeenCalledWith(giftCardAssignGroupCtrl.giftCard.ID, null, null, 'Group', giftCardAssignGroupCtrl.list.Meta.Page + 1, giftCardAssignGroupCtrl.list.Meta.PageSize);
            }));
        });
    });

    describe('Controller: GiftCardAssignUserCtrl', function() {
        var giftCardAssignUserCtrl;
        beforeEach(inject(function($state, $controller, SpendingAccounts) {
            giftCardAssignUserCtrl = $controller('GiftCardAssignUserCtrl', {
                $scope: scope,
                GiftCards: SpendingAccounts,
                UserList: [],
                AssignedUsers: [],
                SelectedGiftCard: {},

            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('SaveAssignments', function() {
            beforeEach(inject(function(Assignments) {
                var defer = q.defer();
                defer.resolve();
                spyOn(Assignments, 'saveAssignments').and.returnValue(defer.promise);
                giftCardAssignUserCtrl.saveAssignments();
            }));
            it ('should call the Assignments saveAssignments method', inject(function(Assignments) {
                expect(Assignments.saveAssignments).toHaveBeenCalled();
            }));
        });

        describe('pagingfunction', function() {
            beforeEach(inject(function(SpendingAccounts) {
                var defer = q.defer();
                defer.resolve(null);
                spyOn(SpendingAccounts, 'ListAssignments').and.returnValue(defer.promise);
                scope.$digest();
                giftCardAssignUserCtrl.list = {
                    Meta: {
                        Page: 1,
                        TotalPages: 2,
                        PageSize: 20
                    }
                }
                giftCardAssignUserCtrl.assignments = {
                    Meta: {
                        Page: 1,
                        TotalPages: 2,
                        PageSize: 20
                    }
                }
                giftCardAssignUserCtrl.pagingfunction();
            }));
            it ('should call the SpendingAccounts List method', inject(function(SpendingAccounts) {
                expect(SpendingAccounts.ListAssignments).toHaveBeenCalledWith(giftCardAssignUserCtrl.giftCard.ID, null, null, 'User', giftCardAssignUserCtrl.list.Meta.Page + 1, giftCardAssignUserCtrl.list.Meta.PageSize);
            }));
        });
    });

    describe('Factory: GiftCardFactory', function() {
        var code;
        beforeEach(inject(function(GiftCardFactory) {
            code = GiftCardFactory.makeCode()
        }));
        it ('should return 16 digit code', inject(function() {
            expect(code.length).toEqual(16);
        }));
    });
});


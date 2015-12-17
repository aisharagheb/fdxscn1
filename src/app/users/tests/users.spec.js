describe('Component: Users', function() {
    var scope,
        q,
        today,
        user;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($q, $rootScope) {
        q = $q;
        scope = $rootScope.$new();
        today = new Date();
        user = {
            "Username": "TestUser",
            "ID": "TestUser123456789",
            "Email": "testuser@four51.com",
            "Password": "Fails345",
            "FirstName": "Test",
            "LastName": "Test",
            "TermsAccepted": today,
        }
    }));

    describe('State: users', function() {
        var state;
        beforeEach(inject(function($state, Users) {
            state = $state.get('users');
            spyOn(Users, 'List').and.returnValue(null);
        }));
        it('should resolve UserGroupList', inject(function ($injector, Users) {
            $injector.invoke(state.resolve.UserList);
            expect(Users.List).toHaveBeenCalled();
        }));
    });

    describe('State: users.edit', function() {
        var state;
        beforeEach(inject(function($state, Users) {
            state = $state.get('users.edit');
            spyOn(Users, 'Get').and.returnValue(null);
        }));
        it('should resolve SelectedUserGroup', inject(function ($injector, $stateParams, Users) {
            $injector.invoke(state.resolve.SelectedUser);
            expect(Users.Get).toHaveBeenCalledWith($stateParams.userid);
        }));
    });
    describe('Controller: UserCreateCtrl', function() {
        var userCreateCtrl;
        beforeEach(inject(function($state, $controller) {
            userCreateCtrl = $controller('UserCreateCtrl', {
                $scope: scope
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(Users) {
                userCreateCtrl.user = user;
                var defer = q.defer();
                defer.resolve(user);
                spyOn(Users, 'Create').and.returnValue(defer.promise);
                userCreateCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the Users Create method', inject(function(Users) {
                expect(Users.Create).toHaveBeenCalledWith(user);
            }));
            it ('should enter the users state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('users', {}, {reload:true});
            }));
        });
    });

    describe('Controller: UserEditCtrl', function() {
        var userEditCtrl;
        beforeEach(inject(function($state, $controller) {
            userEditCtrl = $controller('UserEditCtrl', {
                $scope: scope,
                SelectedUser: user
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(Users) {
                userEditCtrl.user = user;
                userEditCtrl.userID = "TestUser123456789";
                var defer = q.defer();
                defer.resolve(user);
                spyOn(Users, 'Update').and.returnValue(defer.promise);
                userEditCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the Users Update method', inject(function(Users) {
                expect(Users.Update).toHaveBeenCalledWith(userEditCtrl.userID, user);
            }));
            it ('should enter the users state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('users', {}, {reload:true});
            }));
        });

        describe('Delete', function() {
            beforeEach(inject(function(Users) {
                var defer = q.defer();
                defer.resolve(user);
                spyOn(Users, 'Delete').and.returnValue(defer.promise);
                userEditCtrl.Delete();
                scope.$digest();
            }));
            it ('should call the Users Delete method', inject(function(Users) {
                expect(Users.Delete).toHaveBeenCalledWith(user.ID);
            }));
            it ('should enter the users state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('users', {}, {reload:true});
            }));
        });
    });
});
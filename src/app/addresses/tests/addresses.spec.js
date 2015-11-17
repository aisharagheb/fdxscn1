describe('Component: Addresses,', function() {
    var scope,
        q,
        address;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($q, $rootScope) {
        q = $q;
        scope = $rootScope.$new();
        address = {
            CompanyName: "TestComp",
            FirstName: "Test",
            LastName: "Testing",
            Street1: "123 4th Ave N",
            Street2: "#200",
            City: "Minneapolis",
            State: "MN",
            Zip: "55403",
            Country: "US",
            AddressName: "TestAddressTest",
            ID: "TestAddress123456789"
        };
    }));

    describe('State: Base.addresses,', function() {
        var state;
        beforeEach(inject(function($state, Addresses) {
            state = $state.get('base.addresses');
            spyOn(Addresses, 'List').and.returnValue(null);
        }));
        it('should resolve AddressList', inject(function ($injector, Addresses) {
            $injector.invoke(state.resolve.AddressList);
            expect(Addresses.List).toHaveBeenCalled();
        }));
    });

    describe('State: Base.addressEdit,', function() {
        var state;
        beforeEach(inject(function($state, Addresses) {
            state = $state.get('base.addressEdit');
            var defer = q.defer();
            defer.resolve();
            spyOn(Addresses, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve SelectedAddress', inject(function ($injector, $stateParams, Addresses) {
            $injector.invoke(state.resolve.SelectedAddress);
            expect(Addresses.Get).toHaveBeenCalledWith($stateParams.addressid);
        }));
    });

    describe('State: Base.addressAssign,', function() {
        var state;
        beforeEach(inject(function($state, Addresses, UserGroups) {
            state = $state.get('base.addressAssign');
            spyOn(UserGroups, 'List').and.returnValue(null);
            spyOn(Addresses, 'ListAssignments').and.returnValue(null);
            var defer = q.defer();
            defer.resolve();
            spyOn(Addresses, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve UserGroupList', inject(function ($injector, UserGroups) {
            $injector.invoke(state.resolve.UserGroupList);
            expect(UserGroups.List).toHaveBeenCalled();
        }));
        it('should resolve AssignmentsList', inject(function ($injector, $stateParams, Addresses) {
            $injector.invoke(state.resolve.AssignmentsList);
            expect(Addresses.ListAssignments).toHaveBeenCalledWith($stateParams.addressid);
        }));
        it('should resolve SelectedAddress', inject(function ($injector, $stateParams, Addresses) {
            $injector.invoke(state.resolve.SelectedAddress);
            expect(Addresses.Get).toHaveBeenCalledWith($stateParams.addressid);
        }));
    });

    describe('Controller: AddressEditCtrl,', function() {
        var addressEditCtrl;
        beforeEach(inject(function($state, $controller, Addresses) {
            addressEditCtrl = $controller('AddressEditCtrl', {
                $scope: scope,
                Addresses: Addresses,
                SelectedAddress: address
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(Addresses) {
                addressEditCtrl.address = address;
                addressEditCtrl.addressID = "TestAddress123456789";
                var defer = q.defer();
                defer.resolve(address);
                spyOn(Addresses, 'Update').and.returnValue(defer.promise);
                addressEditCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the Addresses Update method', inject(function(Addresses) {
                expect(Addresses.Update).toHaveBeenCalledWith(addressEditCtrl.addressID, addressEditCtrl.address);
            }));
            it ('should enter the addresses state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.addresses');
            }));
        });

        describe('Delete', function() {
            beforeEach(inject(function(Addresses) {
                var defer = q.defer();
                defer.resolve(address);
                spyOn(Addresses, 'Delete').and.returnValue(defer.promise);
                addressEditCtrl.Delete();
                scope.$digest();
            }));
            it ('should call the Addresses Delete method', inject(function(Addresses) {
                expect(Addresses.Delete).toHaveBeenCalledWith(address.ID, false);
            }));
            it ('should enter the addresses state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.addresses');
            }));
        });
    });

    describe('Controller: AddressCreateCtrl,', function() {
        var addressCreateCtrl;
        beforeEach(inject(function($state, $controller, Addresses) {
            addressCreateCtrl = $controller('AddressCreateCtrl', {
                $scope: scope,
                Addresses: Addresses
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('Submit', function() {
            beforeEach(inject(function(Addresses) {
                addressCreateCtrl.address = address;
                var defer = q.defer();
                defer.resolve(address);
                spyOn(Addresses, 'Create').and.returnValue(defer.promise);
                addressCreateCtrl.Submit();
                scope.$digest();
            }));
            it ('should call the Addresses Create method', inject(function(Addresses) {
                expect(Addresses.Create).toHaveBeenCalledWith(address);
            }));
            it ('should enter the addresses state', inject(function($state) {
                expect($state.go).toHaveBeenCalledWith('base.addresses');
            }));
        });
    });
});


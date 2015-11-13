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
});


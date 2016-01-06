describe('Component: Addresses', function() {
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

    describe('State: addresses', function() {
        var state;
        beforeEach(inject(function($state, Addresses) {
            state = $state.get('addresses');
            spyOn(Addresses, 'List').and.returnValue(null);
        }));
        it('should resolve AddressList', inject(function ($injector, Addresses) {
            $injector.invoke(state.resolve.AddressList);
            expect(Addresses.List).toHaveBeenCalled();
        }));
    });

    describe('State: addresses.edit', function() {
        var state;
        beforeEach(inject(function($state, Addresses) {
            state = $state.get('addresses.edit');
            var defer = q.defer();
            defer.resolve();
            spyOn(Addresses, 'Get').and.returnValue(defer.promise);
        }));
        it('should resolve SelectedAddress', inject(function ($injector, $stateParams, Addresses) {
            $injector.invoke(state.resolve.SelectedAddress);
            expect(Addresses.Get).toHaveBeenCalledWith($stateParams.addressid);
        }));
    });

    describe('State: addresses.assign', function() {
        var state;
        beforeEach(inject(function($state, Addresses, UserGroups) {
            state = $state.get('addresses.assign');
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

    describe('Controller: AddressEditCtrl', function() {
        var addressEditCtrl;
        beforeEach(inject(function($state, $controller) {
            addressEditCtrl = $controller('AddressEditCtrl', {
                $scope: scope,
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
                expect($state.go).toHaveBeenCalledWith('addresses', {}, {reload:true});
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
                expect($state.go).toHaveBeenCalledWith('addresses', {}, {reload:true});
            }));
        });
    });

    describe('Controller: AddressCreateCtrl', function() {
        var addressCreateCtrl;
        beforeEach(inject(function($state, $controller) {
            addressCreateCtrl = $controller('AddressCreateCtrl', {
                $scope: scope
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
                expect($state.go).toHaveBeenCalledWith('addresses', {}, {reload:true} );
            }));
        });
    });

    describe('Controller: AddressAssignCtrl', function() {
        var addressAssignCtrl;
        beforeEach(inject(function($state, $controller) {
            addressAssignCtrl = $controller('AddressAssignCtrl', {
                $scope: scope,
                AssignmentsList: [],
                UserGroupList: [],
                SelectedAddress: {}
            });
            spyOn($state, 'go').and.returnValue(true);
        }));

        describe('saveAssignments', function() {
            describe('toAdd and toDelete', function() {
                beforeEach(inject(function(Addresses) {
                    spyOn(Addresses, 'SaveAssignment').and.returnValue(null);
                    spyOn(Addresses, 'DeleteAssignment').and.returnValue(null);
                    addressAssignCtrl.assignments= {
                        Meta: {},
                        Items: [
                            {
                                IsShipping: true,
                                IsBilling: true,
                                UserGroupID: 'TestUserGroup12345'
                            }
                        ]
                    };
                    addressAssignCtrl.list = {
                        Meta: {},
                        Items: [
                            {
                                selected: true,
                                IsShipping: true,
                                IsBilling: true,
                                ID: 'TestUserGroup123456789'
                            },
                            {
                                selected: false,
                                IsShipping: true,
                                IsBilling: true,
                                ID: 'TestUserGroup12345'
                            }
                        ]
                    };
                    addressAssignCtrl.Address = {
                        ID: "TestAddress123456789"
                    };
                    addressAssignCtrl.saveAssignments();
                }));
                var assignment = {
                    UserID: null,
                    UserGroupID: "TestUserGroup123456789",
                    AddressID: "TestAddress123456789",
                    IsShipping: true,
                    IsBilling: true
                }
                it ('should call the Addresses SaveAssignment method', inject(function(Addresses) {
                    expect(Addresses.SaveAssignment).toHaveBeenCalledWith(assignment);
                }));
                it ('should call the Addresses DeleteAssignment method', inject(function(Addresses) {
                    expect(Addresses.DeleteAssignment).toHaveBeenCalledWith(addressAssignCtrl.Address.ID, null, addressAssignCtrl.assignments.Items[0].UserGroupID);
                }));
            });
            describe('toUpdate', function() {
                beforeEach(inject(function(Addresses) {
                    spyOn(Addresses, 'SaveAssignment').and.returnValue(null);
                    addressAssignCtrl.assignments= {
                        Meta: {},
                        Items: [
                            {
                                IsShipping: true,
                                IsBilling: true,
                                UserGroupID: 'TestUserGroup12345'
                            }
                        ]
                    };
                    addressAssignCtrl.list = {
                        Meta: {},
                        Items: [
                            {
                                selected: true,
                                IsShipping: false,
                                IsBilling: true,
                                ID: 'TestUserGroup12345'
                            }
                        ]
                    };
                    addressAssignCtrl.Address = {
                        ID: "TestAddress123456789"
                    };
                    addressAssignCtrl.saveAssignments();
                }));
                var assignment = {
                    UserID: null,
                    UserGroupID: "TestUserGroup12345",
                    AddressID: "TestAddress123456789",
                    IsShipping: false,
                    IsBilling: true
                }
                it ('should call the Addresses SaveAssignment method', inject(function(Addresses) {
                    expect(Addresses.SaveAssignment).toHaveBeenCalledWith(assignment);
                }));
            });
        });
        describe('pagingfunction', function() {
            beforeEach(inject(function(UserGroups) {
                spyOn(UserGroups, 'List').and.returnValue(null);
                addressAssignCtrl.list = {
                    Meta: {
                        Page: 1,
                        TotalPages: 2,
                        PageSize: 20
                    }
                }
                addressAssignCtrl.assignments = {
                    Meta: {
                        PageSize: 20
                    }
                }
                addressAssignCtrl.pagingfunction();
            }));
            it ('should call the UserGroups List method', inject(function(UserGroups) {
                expect(UserGroups.List).toHaveBeenCalledWith(null, addressAssignCtrl.list.Meta.Page +1, addressAssignCtrl.list.Meta.PageSize);
            }));
        });

        describe('setSelected', function() {
            var selectedCount = 0;
            var isShippingCount = 0;
            var isBillingCount = 0;
            beforeEach(inject(function() {
                addressAssignCtrl.list = {
                    Meta: {},
                    Items: [
                        {
                            ID: 'TestUserGroup12345'
                        },
                        {
                            ID: 'TestUserGroup123456'
                        },
                        {
                            ID: 'TestUserGroup1234567'
                        },
                        {
                            ID: 'TestUserGroup12345678'
                        }
                    ]
                }
                addressAssignCtrl.assignments = {
                    Meta: {},
                    Items: [
                        {
                            IsShipping: true,
                            IsBilling: true,
                            UserGroupID: 'TestUserGroup12345'
                        },
                        {
                            IsShipping: true,
                            IsBilling: false,
                            UserGroupID: 'TestUserGroup123456'
                        },
                        {
                            IsShipping: false,
                            IsBilling: true,
                            UserGroupID: 'TestUserGroup1234567'
                        }
                    ]
                }
                addressAssignCtrl.setSelected();
                angular.forEach(addressAssignCtrl.list.Items, function(item) {
                    if (item.selected)
                    {
                        selectedCount++;
                    }
                    if (item.IsShipping)
                    {
                        isShippingCount++;
                    }
                    if (item.IsBilling)
                    {
                        isBillingCount++;
                    }
                });
            }));
            it ('should set correct number of list items to selected/isShipping/isBilling', inject(function() {
                expect(selectedCount).toEqual(3);
                expect(isShippingCount).toEqual(2);
                expect(isBillingCount).toEqual(2);
            }));

        });
    });
});


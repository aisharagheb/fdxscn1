angular.module( 'orderCloud' )

	.config( AddressesConfig )
	.controller( 'AddressesCtrl', AddressesController )
	.controller( 'AddressEditCtrl', AddressEditController )
	.controller( 'AddressCreateCtrl', AddressCreateController )
    .controller( 'AddressAssignCtrl', AddressAssignController )

;

function AddressesConfig( $stateProvider ) {
	$stateProvider
		.state( 'base.addresses', {
			url: '/addresses',
			templateUrl:'addresses/templates/addresses.tpl.html',
			controller:'AddressesCtrl',
			controllerAs: 'addresses',
			data: {componentName: 'Addresses'},
			resolve: {
				AddressList: function(Addresses) {
					return Addresses.List();
				}
			}
		})
		.state( 'base.addressEdit', {
			url: '/addresses/:addressid/edit',
			templateUrl:'addresses/templates/addressEdit.tpl.html',
			controller:'AddressEditCtrl',
			controllerAs: 'addressEdit',
			resolve: {
				SelectedAddress: function($stateParams, $state, Addresses) {
					return Addresses.Get($stateParams.addressid).catch(function() {
                        $state.go('^.addresses');
                    });
				}
			}
		})
		.state( 'base.addressCreate', {
			url: '/addresses/create',
			templateUrl:'addresses/templates/addressCreate.tpl.html',
			controller:'AddressCreateCtrl',
			controllerAs: 'addressCreate'
		})
        .state( 'base.addressAssign', {
            url: '/addresses/:addressid/assign',
            templateUrl: 'addresses/templates/addressAssign.tpl.html',
            controller: 'AddressAssignCtrl',
            controllerAs: 'addressAssign',
            resolve: {
                UserGroupList: function(UserGroups) {
                    return UserGroups.List(null, 1, 20);
                },
                Assignments: function($stateParams, Addresses) {
                    return Addresses.ListAssignments($stateParams.addressid);
                },
                SelectedAddress: function($stateParams, $state, Addresses) {
                    return Addresses.Get($stateParams.addressid).catch(function() {
                        $state.go('^.addresses');
                    });
                }
            }
        })
}

function AddressesController( AddressList, $state, TrackSearch ) {
	var vm = this;
	vm.list = AddressList;
    vm.searching = function() {
        return TrackSearch.GetTerm() ? true : false;
    };
}

function AddressEditController( $exceptionHandler, $state, SelectedAddress, Addresses ) {
	var vm = this,
        addressID = SelectedAddress.ID;
	vm.addressName = SelectedAddress.AddressName;
	vm.address = SelectedAddress;

	vm.Submit = function() {
		Addresses.Update(addressID, vm.address)
			.then(function() {
				$state.go('^.addresses');
			})
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
	};

	vm.Delete = function() {
		Addresses.Delete(SelectedAddress.ID, false)
			.then(function() {
				$state.go('^.addresses')
			})
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
	};
}

function AddressCreateController($exceptionHandler, $state, Addresses) {
	var vm = this;
	vm.address = {};

	vm.Submit = function() {
		Addresses.Create(vm.address)
			.then(function() {
				$state.go('^.addresses')
			})
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
	};
}

function AddressAssignController(UserGroupList, Assignments, Addresses, SelectedAddress) {
    var vm = this;
    vm.list = UserGroupList;
    vm.assignments = Assignments.Items;
    vm.address = SelectedAddress;
    setSelected(Assignments, UserGroupList);

    vm.canSubmit = function(form) {
        var disabledvalue = false;
        angular.forEach(vm.list.Items, function(group, index) {
            if (form['assignCheckbox' + index].$dirty) {
                if (group.selected && (group.IsShipping != true && group.IsBilling != true)){
                    disabledvalue = true;
                }
            }
        });
        return disabledvalue;
    }
    
    vm.saveAssignments = function (form) {
        angular.forEach(UserGroupList.Items, function (userGroup, index) {
            if (form['assignCheckbox' + index].$dirty) {
                if(userGroup.selected && (!userGroup.IsBilling && !userGroup.IsShipping)) {
                    form.$valid = false;
                }
                if (userGroup.selected && (userGroup.IsBilling || userGroup.IsShipping)) {
                    var toSave = true;
                    angular.forEach(Assignments.Items, function (assignedUserGroup) {
                        if (assignedUserGroup.UserGroupID === userGroup.ID) {
                            toSave = false;
                        }
                    });
                    if (toSave) {
                        Addresses.SaveAssignment({UserGroupID: userGroup.ID, AddressID: SelectedAddress.ID, IsShipping: userGroup.IsShipping, IsBilling: userGroup.IsBilling});
                    }
                }
                else {
                    angular.forEach(Assignments.Items, function (assignedUserGroup, index) {
                        if (assignedUserGroup.UserGroupID === userGroup.ID) {
                            Addresses.DeleteAssignment(SelectedAddress.ID, null,  userGroup.ID);
                            Assignments.Items.splice(index, 1);
                            userGroup.IsShipping = false;
                            userGroup.IsBilling = false;
                            index = index - 1;
                        }
                    });
                }
            }
        });
        angular.forEach(Assignments.Items, function (assignedUserGroup, index) {
            if (!assignedUserGroup.UserGroupID) {
                Addresses.DeleteAssignment(SelectedAddress.ID, null, assignedUserGroup.ID);
                Assignments.Items.splice(index, 1);
                assignedUserGroup.IsShipping = false;
                assignedUserGroup.IsBilling = false;
                index = index - 1;
            }
        });
        form.$setPristine(true);
        setSelected(Assignments, UserGroupList);
    }
    
    function setSelected(Assignments, UserGroupList) {
        angular.forEach(UserGroupList.Items, function (userGroup) {
            angular.forEach(Assignments.Items, function (assignedUserGroup) {
                if (assignedUserGroup.UserGroupID === userGroup.ID) {
                    userGroup.selected = true;
                    if (assignedUserGroup.IsShipping){
                        userGroup.IsShipping = true;
                    }
                    if (assignedUserGroup.IsBilling){
                        userGroup.IsBilling = true;
                    }
                }
            });
        });
    }
    
    vm.resetSelections = function(index, form) {
        var matched = false;
        angular.forEach(Assignments.Items, function(assignedUserGroup) {
            if (assignedUserGroup.UserGroupID === UserGroupList.Items[index].ID) {
                matched = true;
            }
        });
        if (matched && UserGroupList.Items[index].selected) {
            form['assignCheckbox' + index].$setPristine(true);
            UserGroupList.Items[index].IsShipping = false;
            UserGroupList.Items[index].IsBilling = false;
            setSelected(Assignments, UserGroupList);
        }
        else if (!matched && !UserGroupList.Items[index].selected) {
            form['assignCheckbox' + index].$setPristine(true);
            UserGroupList.Items[index].IsShipping = false;
            UserGroupList.Items[index].IsBilling = false;
            setSelected(Assignments, UserGroupList);
        }
    }
}
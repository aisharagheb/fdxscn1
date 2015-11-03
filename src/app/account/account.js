angular.module( 'orderCloud' )

	.config( AccountConfig )
	.controller( 'AccountCtrl', AccountController )
	.factory( 'ChangePasswordService', ChangePasswordService )
	.controller( 'ChangePasswordCtrl', ChangePasswordController )

;

function AccountConfig( $stateProvider ) {
	$stateProvider
		.state( 'base.account', {
			url: '/account',
			templateUrl:'account/templates/account.tpl.html',
			controller:'AccountCtrl',
			controllerAs: 'account',
			resolve: {
				Profile: function(Me) {
					return Me.Get();
				}
			}
		})
		.state( 'base.changePassword', {
			url: '/account/changepassword',
			templateUrl: 'account/templates/changePassword.tpl.html',
			controller: 'ChangePasswordCtrl',
			controllerAs: 'changePassword',
			resolve: {
				CurrentUser: function(Me) {
					return Me.Get();
				}
			}
		})
}

function AccountController( $exceptionHandler, toastr, Profile, AdminUsers ) {
	var vm = this;
	vm.profile = angular.copy(Profile);
	var currentProfile = Profile;

	vm.update = function() {
		AdminUsers.Update(currentProfile.ID, vm.profile)
			.then(function(data) {
				vm.profile = angular.copy(data);
				currentProfile = data;
				toastr.success('Account changes were saved.', 'Success!');
			})
			.catch(function(ex) {
				$exceptionHandler(ex)
			})
	};

	vm.resetForm = function(form) {
		vm.profile = currentProfile;
		form.$setPristine(true);
	};
}

function ChangePasswordService( $q, Credentials, AdminUsers ) {
	var service = {
		ChangePassword: _changePassword
	};

	function _changePassword(currentUser) {
		var deferred = $q.defer();

		var checkPasswordCredentials = {
			Username: currentUser.Username,
			Password: currentUser.CurrentPassword
		};

		function changePassword() {
			currentUser.Password = currentUser.NewPassword;
			AdminUsers.Update(currentUser.ID, currentUser)
				.then(function() {
					deferred.resolve();
				});
		}

		Credentials.Get(checkPasswordCredentials).then(
			function() {
				changePassword();
			}).catch(function( ex ) {
				deferred.reject(ex);
			});

		return deferred.promise;
	}

	return service;
}

function ChangePasswordController( $state, $exceptionHandler, toastr, ChangePasswordService, CurrentUser ) {
	var vm = this;
	vm.currentUser = CurrentUser;

	vm.changePassword = function() {
		ChangePasswordService.ChangePassword(vm.currentUser)
			.then(function() {
				toastr.success('Password successfully changed', 'Success!');
				$state.go('base.account');
			})
			.catch(function(ex) {
				$exceptionHandler(ex)
			});
	};
}

angular.module( 'orderCloud' )

	.config( AccountConfig )
	.controller( 'AccountCtrl', AccountController )

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

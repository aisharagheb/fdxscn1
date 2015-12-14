angular.module('ordercloud-impersonation', [])

    .factory('ImpersonationService', ImpersonationService)
    .controller('BuyerUserSelectModalCtrl', ModalController)

;

function ImpersonationService($q, $resource, $cookieStore, $uibModal, $state, apiurl, BuyerID, Users, Auth, appname) {
    return {
        impersonate: impersonate
    };

    function impersonate(response) {
        var dfd = $q.defer();
        if (response.status === 404 && response.data.Errors && response.data.Errors[0].ErrorCode === 'NotFound' && response.data.Errors[0].Message === 'CustomerCompany not found: ') {
            var decoded_token = JSON.parse(atob($cookieStore.get(appname + '.token').split('.')[1]));
            if (decoded_token.role === 'FullAccess') {
                if (!Auth.GetImpersonating()) {
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'common/impersonation/templates/buyer-user-modal.tpl.html',
                        controller: 'BuyerUserSelectModalCtrl',
                        controllerAs: 'modalSelect',
                        size: 'lg',
                        resolve: {
                            UserList: function( Users) {
                                return Users.List();
                            }
                        }
                    });
                    modalInstance.result.then(function(selectedUser) {
                        $resource(apiurl + '/v1/buyers/:buyerID/apiclients', {'buyerID': BuyerID.Get()}).get().$promise.then(
                            function(data) {
                                var buyer_clientid = data.Items[0].ID;
                                Users.GetAccessToken(selectedUser.ID, {ClientID: buyer_clientid, Claims: ["FullAccess"]})
                                    .then(function(token) {
                                        Auth.SetImpersonationToken(selectedUser.ID, token["access_token"]);
                                        Auth.SetImpersonating(true);
                                        dfd.resolve();
                                    });
                            }
                        );
                    }, function() {
                        //TODO: display some further message to the user before redirecting
                        $state.go('base.home');
                    });
                } else {
                    Auth.SetImpersonating(true);
                    dfd.resolve();
                }
            } else dfd.resolve('Error: You do not have permission to impersonate a buyer user.');
        }
        else dfd.resolve();
        return dfd.promise;
    }
}

function ModalController($uibModalInstance, $state, UserList) {
    var vm = this;
    vm.list = UserList;
    vm.selected = vm.list[0];

    vm.selectUser = function(index) {
        $uibModalInstance.close(vm.list.Items[index]);
    };

    vm.cancel = function() {
        $uibModalInstance.dismiss('cancel');
        $state.go('base.home');
    };
}

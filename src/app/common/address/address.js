angular.module('ordercloud-address', [])

    .directive('ordercloudAddressForm', AddressFormDirective)
    .directive('ordercloudAddressInfo', AddressInfoDirective)
    .controller('AddressInfoCtrl', AddressInfoController)

;

function AddressFormDirective() {
    return {
        restrict: 'E',
        scope: {
            address: '=',
            isbilling: '='
        },
        templateUrl: 'common/address/templates/address.form.tpl.html'
    };
}

function AddressInfoDirective() {
    return {
        restrict: 'E',
        scope: {
            addressid: '@'
        },
        templateUrl: 'common/address/templates/address.info.tpl.html',
        controller: 'AddressInfoCtrl',
        controllerAs: 'addressInfo'
    };
}

function AddressInfoController($scope, Addresses) {
    var vm = this;
    vm.address = null;

    $scope.$watch(function() {
        return $scope.addressid;
    }, function(newVal) {
        if (newVal) {
            Addresses.Get(newVal)
                .then(function(address) {
                    vm.address = address;
                });
        }
        else vm.address = null;
    });
}


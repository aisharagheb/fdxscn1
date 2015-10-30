angular.module('ordercloud-buyer-select', []);
angular.module('ordercloud-buyer-select')

    .directive('ordercloudSelectBuyer', SelectBuyerDirective)
    .controller('SelectBuyerCtrl', SelectBuyerController)

;

function SelectBuyerDirective() {
    return {
        scope: {},
        restrict: 'E',
        templateUrl: 'common/buyer-select/buyer-select.tpl.html',
        controller: 'SelectBuyerCtrl',
        controllerAs: 'selectBuyer'
    }
}

function SelectBuyerController($state, Buyers, BuyerID) {
    var vm = this,
        page = 1;
    Buyers.List().then(function(data) {
        vm.BuyerList = data;
    });
    vm.ChangeBuyer = ChangeBuyer;
    vm.PagingFunction = PagingFunction;
    Buyers.Get(BuyerID.Get()).then(function(data) {
        vm.selectedBuyer = data;
    });

    function ChangeBuyer(buyer) {
        BuyerID.Set(buyer.ID);
        $state.reload($state.current);
    }

    function PagingFunction() {
        page += 1;
        if (page <= vm.BuyerList.Meta.TotalPages) {
            Buyers.List(null, page)
                .then(function(data) {
                    vm.BuyerList.Meta = data.Meta;
                    vm.BuyerList.Items = [].concat(vm.BuyerList.Items, data.Items);
                });
        }
    }
}

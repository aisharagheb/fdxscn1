angular.module( 'orderCloud' )

    .config( BuyerConfig )
    .controller( 'BuyerCtrl', BuyerController )
    .controller( 'BuyerEditCtrl', BuyerEditController )
    .controller( 'BuyerCreateCtrl', BuyerCreateController )

;

function BuyerConfig( $stateProvider ) {
    $stateProvider
        .state( 'buyers', {
            parent: 'base',
            url: '/buyers',
            templateUrl: 'buyers/templates/buyers.tpl.html',
            controller: 'BuyerCtrl',
            controllerAs: 'buyers',
            data: { componentName: 'Buyers' },
            resolve: {
                BuyerList: function(Buyers) {
                    return Buyers.List();
                }
            }
        })
        .state( 'buyers.edit', {
            url: '/:buyerid/edit',
            templateUrl: 'buyers/templates/buyerEdit.tpl.html',
            controller: 'BuyerEditCtrl',
            controllerAs: 'buyerEdit',
            resolve: {
                SelectedBuyer: function($stateParams, Buyers) {
                    return Buyers.Get($stateParams.buyerid);
                }
            }
        })
        .state( 'buyers.create', {
            url: '/create',
            templateUrl: 'buyers/templates/buyerCreate.tpl.html',
            controller: 'BuyerCreateCtrl',
            controllerAs: 'buyerCreate'
        });
}

function BuyerController(BuyerList) {
    var vm = this;
    vm.list = BuyerList;
}

function BuyerEditController($exceptionHandler, $state, SelectedBuyer, Buyers) {
    var vm = this;
    vm.buyer = SelectedBuyer;
    vm.buyerName = SelectedBuyer.Name;

    vm.Submit = function() {
        Buyers.Update(vm.buyer)
            .then(function() {
                $state.go('buyers', {}, {reload:true});
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function BuyerCreateController($exceptionHandler, $state, Buyers) {
    var vm = this;

    vm.Submit = function () {
        Buyers.Create(vm.buyer)
            .then(function() {
                $state.go('buyers', {}, {reload:true});
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

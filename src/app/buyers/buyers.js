angular.module( 'orderCloud' )

    .config( BuyerConfig )
    .controller( 'BuyerCtrl', BuyerController )
    .controller( 'BuyerEditCtrl', BuyerEditController )
    .controller( 'BuyerCreateCtrl', BuyerCreateController )

;

function BuyerConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.buyers', {
            url: '/buyers',
            templateUrl: 'buyers/templates/buyers.tpl.html',
            controller: 'BuyerCtrl',
            controllerAs: 'buyers',
            data: {
                componentName: 'Buyers'
            },
            resolve: {
                BuyerList: function(Buyers) {
                    return Buyers.List();
                }
            }
        })
        .state( 'base.buyerEdit', {
            url: '/buyers/:buyerid/edit',
            templateUrl: 'buyers/templates/buyerEdit.tpl.html',
            controller: 'BuyerEditCtrl',
            controllerAs: 'buyerEdit',
            resolve: {
                Buyer: function($stateParams, Buyers) {
                    return Buyers.Get($stateParams.buyerid);
                }
            }
        })
        .state( 'base.buyerCreate', {
            url: '/buyers/create',
            templateUrl: 'buyers/templates/buyerCreate.tpl.html',
            controller: 'BuyerCreateCtrl',
            controllerAs: 'buyerCreate'
        });
}

function BuyerController(BuyerList, Buyers) {
    var vm = this,
        page = 1;
    vm.list = BuyerList;
    vm.PagingFunction = PagingFunction;

    function PagingFunction() {
        page += 1;
        if (page <= vm.Buyers.Meta.TotalPages) {
            Buyers.List(null, page)
                .then(function(data) {
                    vm.Buyers.Meta = data.Meta;
                    vm.Buyers.Items = [].concat(vm.Buyers.Items, data.Items);
                });
        }
    }
}

function BuyerEditController($exceptionHandler, $state, Buyer, Buyers) {
    var vm = this;
    vm.buyer = Buyer;
    vm.buyerName = Buyer.Name;
    vm.Submit = saveBuyer;

    function saveBuyer() {
        Buyers.Update(vm.buyer)
            .then(function() {
                $state.go('^.buyers');
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function BuyerCreateController($exceptionHandler, $state, Buyers) {
    var vm = this;

    vm.Submit = BuyerCreate;

    function BuyerCreate() {
        Buyers.Create(vm.buyer)
            .then(function() {
                $state.go('^.buyers');
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

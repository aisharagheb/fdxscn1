angular.module( 'orderCloud' )

    .config ( GiftCardsConfig )
    .controller( 'GiftCardsCtrl', GiftCardsController )
    .controller( 'GiftCardCreateCtrl', GiftCardCreateController )
    .controller( 'GiftCardEditCtrl', GiftCardEditController )
    .factory( 'GiftCardFactory', GiftCardFactory )

;

function GiftCardsConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.giftCards', {
            url: '/giftCards',
            templateUrl: 'giftCards/templates/giftCards.tpl.html',
            controller: 'GiftCardsCtrl',
            controllerAs: 'giftCards',
            data: {componentName: 'Gift Cards'},
            resolve: {
                GiftCardList: function(GiftCards) {
                    return GiftCards.List();
                }
            }
        })
        .state( 'base.giftCardCreate', {
            url: '/giftCards/create',
            templateUrl: 'giftCards/templates/giftCardCreate.tpl.html',
            controller: 'GiftCardCreateCtrl',
            controllerAs: 'giftCardCreate'
        })
        .state( 'base.giftCardEdit', {
            url: '/giftCards/:giftCardid/edit',
            templateUrl: 'giftCards/templates/giftCardEdit.tpl.html',
            controller: 'GiftCardEditCtrl',
            controllerAs: 'giftCardEdit',
            resolve: {
                SelectedGiftCard: function($stateParams, GiftCards) {
                    return GiftCards.Get($stateParams.giftCardid);
                }
            }
        });
}

function GiftCardsController ( GiftCardList ) {
    var vm = this;
    vm.list = GiftCardList;
}

function GiftCardCreateController ( GiftCardFactory ) {
    var vm = this;
    vm.format = GiftCardFactory.dateFormat;
    vm.open1 = vm.open2 = false;
    vm.Submit = GiftCardFactory.Submit;
    vm.autoGen = GiftCardFactory.autoGenDefault;
    vm.createCode = GiftCardFactory.makeCode;
}

function GiftCardEditController ( SelectedGiftCard, GiftCardFactory ) {
    var vm = this;
    vm.format = GiftCardFactory.dateFormat;
    vm.open1 = vm.open2 = false;
    vm.giftCard = SelectedGiftCard;
    vm.giftCardName = SelectedGiftCard.Name;
    vm.Update = GiftCardFactory.Update;
    vm.Delete = GiftCardFactory.Delete;
}

function GiftCardFactory ( $state, GiftCards ) {
    return {
        dateFormat: 'MM/dd/yyyy',
        autoGenDefault: true,
        makeCode: function(bits) {
            bits = typeof  bits !== 'undefined' ? bits : 16;
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var code = "";
            for (var i = 0; i < bits; i += 1) {
                code += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return code;
        },
        Submit: function(giftCard) {
            GiftCards.Create(giftCard)
                .then(function() {
                    $state.go('^.giftCards')
                });
        },
        Update: function(giftCard) {
            if (giftCard.StartDate < giftCard.ExpirationDate) {
                GiftCards.Update(giftCard.ID, giftCard)
                    .then(function() {
                        $state.go('^.giftCards')
                    });
            }
        },
        Delete: function(giftCard) {
            GiftCards.Delete(giftCard.ID)
                .then(function() {
                    $state.go('^.giftCards')
                });
        }
    }
}

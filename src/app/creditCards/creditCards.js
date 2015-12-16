angular.module( 'orderCloud' )

    .config( CreditCardsConfig )
    .controller( 'CreditCardsCtrl', CreditCardsController )
    .controller( 'CreditCardEditCtrl', CreditCardEditController )
    .controller( 'CreditCardCreateCtrl', CreditCardCreateController )
    .controller( 'CreditCardAssignCtrl', CreditCardAssignController )

;

function CreditCardsConfig( $stateProvider ) {
    $stateProvider
        .state( 'creditCards', {
            parent: 'base',
            url: '/creditCards',
            templateUrl:'creditCards/templates/creditCards.tpl.html',
            controller:'CreditCardsCtrl',
            controllerAs: 'creditCards',
            data: {componentName: 'Credit Cards'},
            resolve: {
                CreditCardList: function(CreditCards) {
                    return CreditCards.List();
                }
            }
        })
        .state( 'creditCards.edit', {
            url: '/:creditCardid/edit',
            templateUrl:'creditCards/templates/creditCardEdit.tpl.html',
            controller:'CreditCardEditCtrl',
            controllerAs: 'creditCardEdit',
            resolve: {
                SelectedCreditCard: function($stateParams, CreditCards) {
                    return CreditCards.Get($stateParams.creditCardid);
                }
            }
        })
        .state( 'creditCards.create', {
            url: '/create',
            templateUrl:'creditCards/templates/creditCardCreate.tpl.html',
            controller:'CreditCardCreateCtrl',
            controllerAs: 'creditCardCreate'
        })
        .state( 'creditCards.assign', {
            url: '/:creditCardid/assign',
            templateUrl: 'creditCards/templates/creditCardAssign.tpl.html',
            controller: 'CreditCardAssignCtrl',
            controllerAs: 'creditCardAssign',
            resolve: {
                Buyer: function(Buyers) {
                    return Buyers.Get();
                },
                UserGroupList: function(UserGroups) {
                    return UserGroups.List(null, 1, 20);
                },
                AssignedUserGroups: function($stateParams, CreditCards) {
                    return CreditCards.ListAssignments($stateParams.creditCardid);
                },
                SelectedCreditCard: function($stateParams, CreditCards) {
                    return CreditCards.Get($stateParams.creditCardid);
                }
            }
        })
}

function CreditCardsController( CreditCardList ) {
    var vm = this;
    vm.list = CreditCardList;
}

function CreditCardEditController( $exceptionHandler, $state, SelectedCreditCard, CreditCards ) {
    var vm = this,
        creditcardid = SelectedCreditCard.ID;
    vm.creditCardName = SelectedCreditCard.ID;
    vm.creditCard = SelectedCreditCard;
    if(vm.creditCard.ExpirationDate != null){
        vm.creditCard.ExpirationDate = new Date(vm.creditCard.ExpirationDate);
    }
    vm.creditCard.Token = "token";

    vm.Submit = function() {
        var expiration = vm.creditCard.ExpirationDate;
        expiration.setMonth(expiration.getMonth() + 1);
        expiration.setDate(expiration.getDate() - 1);
        vm.creditCard.ExpirationDate = expiration;
        CreditCards.Update(creditcardid, vm.creditCard)
            .then(function() {
                $state.go('creditCards', {}, {reload:true});
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    };

    vm.Delete = function() {
        CreditCards.Delete(SelectedCreditCard.ID)
            .then(function() {
                $state.go('creditCards', {}, {reload:true})
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function CreditCardCreateController( $exceptionHandler, $state, CreditCards) {
    var vm = this;
    vm.creditCard = {};
    //TODO: stop faking the token
    vm.creditCard.Token = "token";
    vm.Submit = function() {
        var expiration = vm.creditCard.ExpirationDate;
        expiration.setMonth(expiration.getMonth() + 1);
        expiration.setDate(expiration.getDate() - 1);
        vm.creditCard.ExpirationDate = expiration;
        CreditCards.Create(vm.creditCard)
            .then(function() {
                $state.go('creditCards', {}, {reload:true})
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function CreditCardAssignController(Buyer, UserGroupList, AssignedUserGroups, SelectedCreditCard, CreditCards, Assignments, Paging) {
    var vm = this;
    vm.buyer = Buyer;
    vm.assignBuyer = false;
    vm.list = UserGroupList;
    vm.assignments = AssignedUserGroups;
    vm.creditCard = SelectedCreditCard;
    vm.saveAssignments = SaveAssignments;
    vm.pagingfunction = PagingFunction;

    function SaveFunc(ItemID) {
        return CreditCards.SaveAssignment({
            CreditCardID: vm.creditCard.ID,
            UserID: null,
            UserGroupID: ItemID
        });
    }

    function DeleteFunc(ItemID) {
        return CreditCards.DeleteAssignment(vm.creditCard.ID, null, ItemID);
    }

    function SaveAssignments() {
        return Assignments.saveAssignments(vm.list.Items, vm.assignments.Items, SaveFunc, DeleteFunc, 'UserGroupID');
    }

    function AssignFunc() {
        return CreditCards.ListAssignments(vm.creditCard.ID, null, null, null, vm.assignments.Meta.Page + 1, vm.assignments.Meta.PageSize);
    }

    function PagingFunction() {
        return Paging.paging(vm.list, 'UserGroups', vm.assignments, AssignFunc);
    }
}

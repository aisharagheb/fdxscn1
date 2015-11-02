angular.module( 'orderCloud' )

    .config( CreditCardsConfig )
    .controller( 'CreditCardsCtrl', CreditCardsController )
    .controller( 'CreditCardEditCtrl', CreditCardEditController )
    .controller( 'CreditCardCreateCtrl', CreditCardCreateController )
    .controller( 'CreditCardAssignCtrl', CreditCardAssignController )

;

function CreditCardsConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.creditCards', {
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
        .state( 'base.creditCardEdit', {
            url: '/creditCards/:creditCardid/edit',
            templateUrl:'creditCards/templates/creditCardEdit.tpl.html',
            controller:'CreditCardEditCtrl',
            controllerAs: 'creditCardEdit',
            resolve: {
                SelectedCreditCard: function($stateParams, CreditCards) {
                    return CreditCards.Get($stateParams.creditCardid);
                }
            }
        })
        .state( 'base.creditCardCreate', {
            url: '/creditCards/create',
            templateUrl:'creditCards/templates/creditCardCreate.tpl.html',
            controller:'CreditCardCreateCtrl',
            controllerAs: 'creditCardCreate'
        })
        .state( 'base.creditCardAssign', {
            url: '/creditCards/:creditCardid/assign',
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

function CreditCardsController( CreditCardList, $state ) {
    var vm = this;
    vm.list = CreditCardList;

    vm.goToEdit = function(id) {
        $state.go('^.creditCardEdit', {'creditCardid': id});
    };
    vm.goToAssignments = function(id) {
        $state.go('^.creditCardAssign', {'creditCardid': id});
    };
}

function CreditCardEditController( $state, SelectedCreditCard, CreditCards ) {
    var vm = this,
        creditcardid = SelectedCreditCard.ID;
    vm.creditCardName = SelectedCreditCard.CreditCardName;
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
                $state.go('^.creditCards')
            });
    };

    vm.Delete = function() {
        CreditCards.Delete(SelectedCreditCard.ID)
            .then(function() {
                $state.go('^.creditCards')
            });
    }
}

function CreditCardCreateController($state, CreditCards) {
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
                $state.go('^.creditCards')
            });
    }
}

function CreditCardAssignController(Buyer, UserGroupList, AssignedUserGroups, SelectedCreditCard, CreditCards) {
    var vm = this;
    vm.buyer = Buyer;
    vm.assignBuyer = false;
    vm.userGroups = UserGroupList;
    vm.assignedUserGroups = AssignedUserGroups;
    vm.creditCard = SelectedCreditCard;
    vm.saveAssignments = saveAssignments;

    function saveAssignments(form) {
        var assignmentObject = {};
        angular.forEach(vm.userGroups.Items, function(group, index) {
            if (form['assignCheckbox' + index].$dirty) {
                if (group.selected) {
                    assignmentObject = {UserID: null, UserGroupID: group.ID, CreditCardID: vm.creditCard.ID};
                    CreditCards.SaveAssignment(assignmentObject);
                    vm.assignedUserGroups.Items.push(assignmentObject);
                }
                else {
                    angular.forEach(vm.assignedUserGroups.Items, function(assignment, index) {
                        if (assignment.UserGroupID === group.ID) {
                            CreditCards.DeleteAssignment(vm.creditCard.ID, null, group.ID);
                            vm.assignedUserGroups.Items.splice(index, 1);
                            index = index - 1;
                        }
                    })
                }
            }
        });
    }
}

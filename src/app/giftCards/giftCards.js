angular.module( 'orderCloud' )

    .config ( GiftCardsConfig )
    .controller( 'GiftCardsCtrl', GiftCardsController )
    .controller( 'GiftCardCreateCtrl', GiftCardCreateController )
    .controller( 'GiftCardEditCtrl', GiftCardEditController )
    .controller( 'GiftCardAssignGroupCtrl', GiftCardAssignGroupController )
    .controller( 'GiftCardAssignUserCtrl', GiftCardAssignUserController )
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
                GiftCardList: function(SpendingAccounts) {
                    return SpendingAccounts.List(null, null, null, null, null, {'RedemptionCode': '*'});
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
                SelectedGiftCard: function($stateParams, SpendingAccounts) {
                    return SpendingAccounts.Get($stateParams.giftCardid);
                }
            }
        })
        .state( 'base.giftCardAssignGroup', {
            url: '/giftCards/:giftCardid/assign',
            templateUrl: 'giftCards/templates/giftCardAssignGroup.tpl.html',
            controller: 'GiftCardAssignGroupCtrl',
            controllerAs: 'giftCardAssign',
            resolve: {
                UserGroupList: function(UserGroups) {
                    return UserGroups.List();
                },
                AssignmentList: function($stateParams, SpendingAccounts) {
                    return SpendingAccounts.ListAssignments($stateParams.giftCardid, null, null, 'Group');
                },
                GiftCard: function($stateParams, SpendingAccounts) {
                    return SpendingAccounts.Get($stateParams.giftCardid);
                }
            }
        })
        .state( 'base.giftCardAssignUser', {
            url: '/giftCards/:giftCardid/assign/user',
            templateUrl: 'giftCards/templates/giftCardAssignUser.tpl.html',
            controller: 'GiftCardAssignUserCtrl',
            controllerAs: 'giftCardAssignUser',
            resolve: {
                UserList: function(Users) {
                    return Users.List();
                },
                AssignmentList: function($stateParams, SpendingAccounts) {
                    return SpendingAccounts.ListAssignments($stateParams.giftCardid, null, null, 'User');
                },
                GiftCard: function($stateParams, SpendingAccounts) {
                    return SpendingAccounts.Get($stateParams.giftCardid);
                }
            }
        });
}

function GiftCardsController ( GiftCardList, SpendingAccounts ) {
    var vm = this;
    vm.list = GiftCardList;
    vm.pagingfunction = PagingFunction;

    function PagingFunction() {
        if (vm.list.Meta.Page < vm.list.Meta.TotalPages) {
            SpendingAccounts.List(null, vm.list.Meta.Page + 1, vm.list.Meta.PageSize, null, null, {'RedemptionCode': '*'});
        }
    }
}

function GiftCardCreateController($state, $exceptionHandler, GiftCardFactory, SpendingAccounts) {
    var vm = this;
    vm.format = GiftCardFactory.dateFormat;
    vm.open1 = vm.open2 = false;
    vm.Submit = Submit;
    vm.autoGen = GiftCardFactory.autoGenDefault;
    vm.createCode = GiftCardFactory.makeCode;

    function Submit() {
        SpendingAccounts.Create(vm.giftcard)
            .then(function() {
                $state.go('^.giftCards')
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function GiftCardEditController($state, $exceptionHandler, SelectedGiftCard, GiftCardFactory, SpendingAccounts) {
    var vm = this,
        giftCardID = SelectedGiftCard.ID;
    vm.format = GiftCardFactory.dateFormat;
    vm.open1 = vm.open2 = false;
    vm.giftCard = SelectedGiftCard;
    vm.Update = Update;
    vm.Delete = Delete;

    function Update() {
        if (vm.giftCard.StartDate < vm.giftCard.EndDate) {
            SpendingAccounts.Update(giftCardID, vm.giftCard)
                .then(function() {
                    $state.go('base.giftCards')
                })
                .catch(function(ex) {
                    $exceptionHandler(ex);
                });
        }
    }

    function Delete() {
        SpendingAccounts.Delete(giftCardID)
            .then(function() {
                $state.go('base.giftCards')
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function GiftCardAssignGroupController($q, UserGroupList, AssignmentList, GiftCard, UserGroups, SpendingAccounts, Assignments) {
    var vm = this;
    vm.list = UserGroupList;
    vm.assignments = AssignmentList;
    vm.giftCard = GiftCard;
    vm.saveAssignments = SaveAssignments;
    vm.pagingfunction = PagingFunction;

    function SaveFunc(ItemID) {
        return SpendingAccounts.SaveAssignment({
            SpendingAccountID: vm.giftCard.ID,
            UserID: null,
            UserGroupID: ItemID,
            AllowExceed: false
        });
    }

    function DeleteFunc(ItemID) {
        return SpendingAccounts.DeleteAssignment(vm.giftCard.ID, null, ItemID);
    }

    function SaveAssignments() {
        return Assignments.saveAssignments(vm.list.Items, vm.assignments.Items, SaveFunc, DeleteFunc, 'UserGroupID');
    }

    function PagingFunction() {
        if (vm.list.Meta.Page < vm.list.Meta.PageSize) {
            var queue = [];
            var dfd = $q.defer();
            queue.push(UserGroups.List(null, vm.list.Meta.Page + 1, vm.list.Meta.PageSize, null, null, {'RedemptionCode': '*'}));
            if (vm.assignments.Meta.Page < vm.assignments.Meta.PageSize) {
                SpendingAccounts.ListAssignments(vm.giftCard.ID, null, null, 'Group', vm.list.Meta.Page + 1, vm.list.Meta.PageSize);
            }
            $q.all(queue).then(function(results) {
                dfd.resolve();
                vm.list.Meta = results[0].Meta;
                vm.list.Items = [].concat(vm.list.Items, results[0].Items);
                if (results[1]) {
                    vm.assignments.Meta = results[1].Meta;
                    vm.assignments.Items = [].concat(vm.assignments.Items, results[1].Items);
                }
            });
        }
    }
}

function GiftCardAssignUserController($q, UserList, AssignmentList, GiftCard, Users, SpendingAccounts, Assignments) {
    var vm = this;
    vm.list = UserList;
    vm.assignments = AssignmentList;
    vm.giftCard = GiftCard;
    vm.saveAssignments = SaveAssignments;
    vm.pagingfunction = PagingFunction;

    function SaveFunc(ItemID) {
        return SpendingAccounts.SaveAssignment({
            SpendingAccountID: vm.giftCard.ID,
            UserID: ItemID,
            UserGroupID: null,
            AllowExceed: false
        });
    }

    function DeleteFunc(ItemID) {
        return SpendingAccounts.DeleteAssignment(vm.giftCard.ID, ItemID, null);
    }

    function SaveAssignments() {
        return Assignments.saveAssignments(vm.list.Items, vm.assignments.Items, SaveFunc, DeleteFunc, 'UserID');
    }

    function PagingFunction() {
        if (vm.list.Meta.Page < vm.list.Meta.PageSize) {
            var queue = [];
            var dfd = $q.defer();
            queue.push(Users.List(null, vm.list.Meta.Page + 1, vm.list.Meta.PageSize, null, null, {'RedemptionCode': '*'}));
            if (vm.assignments.Meta.Page < vm.assignments.Meta.PageSize) {
                SpendingAccounts.ListAssignments(vm.giftCard.ID, null, null, 'User', vm.list.Meta.Page + 1, vm.list.Meta.PageSize);
            }
            $q.all(queue).then(function(results) {
                dfd.resolve();
                vm.list.Meta = results[0].Meta;
                vm.list.Items = [].concat(vm.list.Items, results[0].Items);
                if (results[1]) {
                    vm.assignments.Meta = results[1].Meta;
                    vm.assignments.Items = [].concat(vm.assignments.Items, results[1].Items);
                }
            });
        }
    }
}

function GiftCardFactory() {
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
        }
    }
}

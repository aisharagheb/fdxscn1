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
        .state( 'giftCards', {
            parent: 'base',
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
        .state( 'giftCards.edit', {
            url: '/:giftCardid/edit',
            templateUrl: 'giftCards/templates/giftCardEdit.tpl.html',
            controller: 'GiftCardEditCtrl',
            controllerAs: 'giftCardEdit',
            resolve: {
                SelectedGiftCard: function($stateParams, SpendingAccounts) {
                    return SpendingAccounts.Get($stateParams.giftCardid);
                }
            }
        })
        .state( 'giftCards.create', {
            url: '/create',
            templateUrl: 'giftCards/templates/giftCardCreate.tpl.html',
            controller: 'GiftCardCreateCtrl',
            controllerAs: 'giftCardCreate'
        })
        .state( 'giftCards.assignGroup', {
            url: '/:giftCardid/assign',
            templateUrl: 'giftCards/templates/giftCardAssignGroup.tpl.html',
            controller: 'GiftCardAssignGroupCtrl',
            controllerAs: 'giftCardAssign',
            resolve: {
                UserGroupList: function(UserGroups) {
                    return UserGroups.List();
                },
                AssignedUserGroups: function($stateParams, SpendingAccounts) {
                    return SpendingAccounts.ListAssignments($stateParams.giftCardid, null, null, 'Group');
                },
                SelectedGiftCard: function($stateParams, SpendingAccounts) {
                    return SpendingAccounts.Get($stateParams.giftCardid);
                }
            }
        })
        .state( 'giftCards.assignUser', {
            url: '/:giftCardid/assign/user',
            templateUrl: 'giftCards/templates/giftCardAssignUser.tpl.html',
            controller: 'GiftCardAssignUserCtrl',
            controllerAs: 'giftCardAssignUser',
            resolve: {
                UserList: function(Users) {
                    return Users.List();
                },
                AssignedUsers: function($stateParams, SpendingAccounts) {
                    return SpendingAccounts.ListAssignments($stateParams.giftCardid, null, null, 'User');
                },
                SelectedGiftCard: function($stateParams, SpendingAccounts) {
                    return SpendingAccounts.Get($stateParams.giftCardid);
                }
            }
        });
}

function GiftCardsController ( GiftCardList, SpendingAccounts, TrackSearch ) {
    var vm = this;
    vm.list = GiftCardList;
    vm.pagingfunction = PagingFunction;
    vm.searchfunction = Search;
    vm.searching = function() {
        return TrackSearch.GetTerm() ? true : false;
    };

    function PagingFunction() {
        if (vm.list.Meta.Page < vm.list.Meta.TotalPages) {
            SpendingAccounts.List(null, vm.list.Meta.Page + 1, vm.list.Meta.PageSize, null, null, {'RedemptionCode': '*'});
        }
    }

    function Search(searchTerm) {
        return SpendingAccounts.List(searchTerm, null, null, null, null, {'RedemptionCode': '*'});
    }
}

function GiftCardEditController($state, $exceptionHandler, SelectedGiftCard, GiftCardFactory, SpendingAccounts) {
    var vm = this,
        giftCardID = SelectedGiftCard.ID;
    vm.format = GiftCardFactory.dateFormat;
    vm.open1 = vm.open2 = false;
    vm.giftCard = SelectedGiftCard;
    vm.Submit = Submit;
    vm.Delete = Delete;
    vm.giftCard.AllowAsPaymentMethod = true;

    function Submit() {
        SpendingAccounts.Update(giftCardID, vm.giftCard)
            .then(function() {
                $state.go('giftCards', {}, {reload:true})
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }

    function Delete() {
        SpendingAccounts.Delete(giftCardID)
            .then(function() {
                $state.go('giftCards', {}, {reload:true})
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function GiftCardCreateController($state, $exceptionHandler, GiftCardFactory, SpendingAccounts) {
    var vm = this;
    vm.format = GiftCardFactory.dateFormat;
    vm.open1 = vm.open2 = false;
    vm.Submit = Submit;
    vm.autoGen = GiftCardFactory.autoGenDefault;
    vm.createCode = GiftCardFactory.makeCode;
    vm.giftCard = {};
    vm.giftCard.AllowAsPaymentMethod = true;

    function Submit() {
        SpendingAccounts.Create(vm.giftCard)
            .then(function() {
                $state.go('giftCards', {}, {reload:true})
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function GiftCardAssignGroupController($q, UserGroupList, AssignedUserGroups, SelectedGiftCard, UserGroups, SpendingAccounts, Assignments) {
    var vm = this;
    vm.list = UserGroupList;
    vm.assignments = AssignedUserGroups;
    vm.giftCard = SelectedGiftCard;
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

function GiftCardAssignUserController($q, UserList, AssignedUsers, SelectedGiftCard, Users, SpendingAccounts, Assignments) {
    var vm = this;
    vm.list = UserList;
    vm.assignments = AssignedUsers;
    vm.giftCard = SelectedGiftCard;
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

angular.module( 'orderCloud' )

    .config( PriceSchedulesConfig )
    .controller( 'PriceSchedulesCtrl', PriceSchedulesController )
    .controller( 'PriceScheduleEditCtrl', PriceScheduleEditController )
    .controller( 'PriceScheduleCreateCtrl', PriceScheduleCreateController )

;

function PriceSchedulesConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.priceSchedules', {
            url: '/priceSchedules',
            templateUrl:'priceSchedules/templates/priceSchedules.tpl.html',
            controller:'PriceSchedulesCtrl',
            controllerAs: 'priceSchedules',
            data: {componentName: 'Price Schedules'},
            resolve: {
                PriceScheduleList: function(PriceSchedules) {
                    return PriceSchedules.List();
                }
            }
        })
        .state( 'base.priceScheduleEdit', {
            url: '/priceSchedules/:priceScheduleid/edit',
            templateUrl:'priceSchedules/templates/priceScheduleEdit.tpl.html',
            controller:'PriceScheduleEditCtrl',
            controllerAs: 'priceScheduleEdit',
            resolve: {
                SelectedPriceSchedule: function($stateParams, PriceSchedules) {
                    return PriceSchedules.Get($stateParams.priceScheduleid);
                }
            }
        })
        .state( 'base.priceScheduleCreate', {
            url: '/priceSchedules/create',
            templateUrl:'priceSchedules/templates/priceScheduleCreate.tpl.html',
            controller:'PriceScheduleCreateCtrl',
            controllerAs: 'priceScheduleCreate'
        })
}

function PriceSchedulesController( PriceScheduleList ) {
    var vm = this;
    vm.list = PriceScheduleList;
}

function PriceScheduleEditController( $state, SelectedPriceSchedule, PriceSchedules, PriceBreak ) {
    var vm = this,
        priceScheduleid = SelectedPriceSchedule.ID;
    vm.priceScheduleName = SelectedPriceSchedule.PriceScheduleName;
    vm.priceSchedule = SelectedPriceSchedule;

    vm.addPriceBreak = function() {
        PriceBreak.addPriceBreak(vm.priceSchedule, vm.price, vm.quantity);
        vm.quantity = null;
        vm.price = null;
    }

    vm.deletePriceBreak = PriceBreak.deletePriceBreak;


    vm.Submit = function() {
        vm.priceSchedule = PriceBreak.setMinMax(vm.priceSchedule);
        PriceSchedules.Update(priceScheduleid, vm.priceSchedule)
            .then(function() {
                $state.go('^.priceSchedules')
            });
    };

    vm.Delete = function() {
        PriceSchedules.Delete(priceScheduleid)
            .then(function() {
                $state.go('^.priceSchedules')
            });
    }
}

function PriceScheduleCreateController( $state, PriceSchedules, PriceBreak) {
    var vm = this;
    vm.priceSchedule = {};
    vm.priceSchedule.RestrictedQuantity = false;
    vm.priceSchedule.PriceBreaks = new Array();

    vm.addPriceBreak = function() {
        PriceBreak.addPriceBreak(vm.priceSchedule, vm.price, vm.quantity);
        vm.quantity = null;
        vm.price = null;
    }

    vm.deletePriceBreak = PriceBreak.deletePriceBreak;


    vm.Submit = function() {
        vm.priceSchedule = PriceBreak.setMinMax(vm.priceSchedule);
        PriceSchedules.Create(vm.priceSchedule)
            .then(function() {
                $state.go('^.priceSchedules')
            });
    }
}

angular.module('orderCloud')
    .factory('PriceBreak', PriceBreakFactory);

function PriceBreakFactory () {
    var service = {
        addPriceBreak : addPriceBreak,
        setMinMax: setMinMax,
        deletePriceBreak: deletePriceBreak
    };

    function setMinMax(priceSchedule) {
            var quantities =  _.pluck(priceSchedule.PriceBreaks, 'Quantity');
            priceSchedule.MinQuantity = _.min(quantities);
        if (priceSchedule.RestrictedQuantity) {
            priceSchedule.MaxQuantity = _.max(quantities);
        }
        return priceSchedule;
    }

    function addPriceBreak(priceSchedule, price, quantity) {
        priceSchedule.PriceBreaks.push({Price: price, Quantity: quantity});
        return setMinMax(priceSchedule);
    }

    function deletePriceBreak(priceSchedule, index) {
        priceSchedule.PriceBreaks.splice(index, 1);
        return setMinMax(priceSchedule);
    }

    return service;
}

define([
    'ko',
    'Magento_Checkout/js/model/quote',
    'jquery',
    'Magento_Customer/js/model/customer',
    'uiRegistry'
], function (
    ko,
    quote,
    $,
    customer,
    uiRegistry
) {
    'use strict';

    var address = {
        country     : null,
        street      : null,
        postcode    : null,
        housenumber : null,
        firstname   : null,
        lastname    : null
    };

    /**
     * Collect the needed information from the quote
     */
    return ko.computed(function () {
        var shippingAddress = quote.shippingAddress();

        // Check specifically on street - we need one anyway, and it's to prevent undefined errors when searching for street[1]
        if (customer.isLoggedIn() && shippingAddress && shippingAddress.street) {
            var housenumber = shippingAddress.street[1];
            if (!housenumber && shippingAddress.street[0] !== undefined) {
                housenumber = shippingAddress.street[0].replace(/\D/g,'');
            }

            var tempAddress = {
                street: shippingAddress.street,
                postcode: shippingAddress.postcode,
                housenumber: housenumber,
                firstname: shippingAddress.firstname,
                lastname: shippingAddress.lastname,
                telephone: shippingAddress.telephone,
                country: shippingAddress.countryId
            };

            if (tempAddress.country && tempAddress.postcode && tempAddress.street !== undefined && tempAddress.street[0] && tempAddress.housenumber) {
                return tempAddress;
            }
        }

        // Country is required to determine which fields are used.
        uiRegistry.get('checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.country_id', function (countryField) {
            address.country = countryField.value();
        });

        var RegistryFields = [
            'checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.firstname',
            'checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.lastname',
            'checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.street.0'
        ];

        if ((address.country === 'NL' && window.checkoutConfig.shipping.postnl.is_postcodecheck_active) || (window.checkoutConfig.postcode !== undefined && window.checkoutConfig.postcode.postcode_active)) {
            RegistryFields.push('checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.postcode-field-group.field-group.postcode');
            RegistryFields.push('checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.postcode-field-group.field-group.housenumber');
        } else {
            RegistryFields.push('checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.postcode');
            uiRegistry.get('checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.street.1', function (houseNumberField) {
                address.housenumber = houseNumberField.value();
            });
        }

        uiRegistry.get(RegistryFields, function (firstnameField, lastnameField, streetFirstLine, postcodeField, houseNumberField) {
            if (houseNumberField !== undefined) {
                // The housenumber value could be empty, and could have been included in the first address line.
                address.housenumber = houseNumberField.value();
            }

            if (!address.housenumber && streetFirstLine.value() !== undefined) {
                address.housenumber = streetFirstLine.value().replace(/\D/g,'');
            }

            address.street = [streetFirstLine.value()];
            address.postcode = postcodeField.value();
            address.firstname = firstnameField.value();
            address.lastname = lastnameField.value();
        });

        // Some merchants disable the telephone field. Adding this to the previous part will stop the entire get function
        uiRegistry.get('checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.telephone', function (telephoneField) {
            address.telephone = telephoneField.value();
        });

        if (!address.country || !address.postcode || !address.street[0] || !address.housenumber) {
            return false;
        }

        var nlRegex = new RegExp('^[1-9][0-9]{3} ?[a-zA-Z]{2}$');
        // No regex required for BE, valid BE zipcodes are between 1000 and 9999.
        if ((address.country === 'NL' && !nlRegex.test(address.postcode)) ||
            (address.country === 'BE' && !(address.postcode >= 1000 && address.postcode <= 9999))) {
            return false;
        }

        return address;
    }.bind(this));
});

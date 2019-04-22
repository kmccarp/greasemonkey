// ==UserScript==
// @name         Amazon.com invoice amounts on order history
// @namespace    http://tampermonkey.net/
// @version      1.0.6
// @description  Display invoice amounts on the Amazon order history page. Useful for matching Amazon orders to transactions
// @author       Kevin McCarpenter
// @match        https://www.amazon.com/gp/*/order-history*
// @updateURL    https://raw.githubusercontent.com/kwcarpenter/greasemonkey/master/amazonInvoice.js
// @downloadURL  https://raw.githubusercontent.com/kwcarpenter/greasemonkey/master/amazonInvoice.js
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';


    var orderDetailsLinks = $('a.a-button-text').filter(function(index, element) {
        return $(element).attr('id').match(/Order-details_\d/);
    });


    orderDetailsLinks.each(function(index, link) {
        $.get($(link).attr('href')).done(function(orderDetailsResponse) {
            var initialResponseDOM = $.parseHTML(orderDetailsResponse);
            var invoiceLinks = $(initialResponseDOM).find('a.a-button-text').filter(function(index, element) {
                return $(element).text().match(/View or Print invoice/);
            });
            invoiceLinks.each(function(invoiceIndex, invoiceLink) {
                var costDiv = $('<div></div>');
                var costTitle = $('<span>Invoice costs: </span>');
                var costSpan = $('<span>Calculating</span>');
                $(costDiv).append(costTitle);
                $(costDiv).append(costSpan);

                // sorry.
                $(link).parent().parent().parent().parent().parent().parent().parent().parent().find('.a-row.shipment-top-row').append(costDiv);
                $.get($(invoiceLink).attr('href'))
                    .done(function(response) {
                    // find invoice values
                    var responseDom = $.parseHTML(response);
                    console.log(responseDom);
                    var shipments = $(responseDom).find('tr tr tr tr').filter(function(index, element) {
                        return $(element).text().match(/transaction/) && $(element).text().match(/\$\d+\.\d{2}/);
                    });

                    // add invoice values to order dom
                    var costSpanStr = '';
                    shipments.each(function(index, shipment) {
                        // shipments are broken up into transactions. We need the transactions, not the shipments.
                        var transactions = $(shipment).find('tr td').filter(function (index, element) {
                            console.log($(element));
                            return $(element).attr('align') == 'right';
                        });
                        transactions.each(function (index, transaction) {
                            var matches = /\$\d+\.\d{2}/g.exec($(transaction).text())
                            console.log(matches);
                            if (matches) {
                                for(var i = 0; i < matches.length; i++) {
                                    costSpanStr += (' ' + matches[i]);
                                }
                            }
                        });
                    });
                    costSpan.text(costSpanStr);
                })
                    .fail(function (error) {
                    console.log(error);
                });
            });
        });
    });

})();

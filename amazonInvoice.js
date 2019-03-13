// ==UserScript==
// @name         Amazon.com invoice amounts on order history
// @namespace    http://tampermonkey.net/
// @version      1.0.3
// @description  Display invoice amounts on the Amazon order history page. Useful for matching Amazon orders to transactions
// @author       Kevin McCarpenter (kcarp)
// @match        https://www.amazon.*/gp/*/order-history*
// @updateURL    https://jsbin.amazon.com/xabadotuq.user.js
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';


    var invoiceLinks = $('a.a-link-normal').filter(function(index, element) {
        return $(element).text() == 'Invoice';
    });

    invoiceLinks.each(function(index, link) {
        var costDiv = $('<span></span>');
        var costTitle = $('<span>Invoice costs: </span>');
        var costSpan = $('<span>Calculating</span>');
        $(costDiv).append(costTitle);
        $(costDiv).append(costSpan);
        $(link).parent().append(costDiv);
        $.get($(link).attr('href'))
        .done(function(response) {
            // find invoice values
            var responseDom = $.parseHTML(response);
            var shipments = $(responseDom).find('tr tr tr tr tr').filter(function(index, element) {
                return $(element).first('td').text().indexOf('Shipment') > 0;
            });

            // add invoice values to order dom
            var costSpanStr = '';
            shipments.each(function(index, shipment) {
                var matches = /\$\d+\.\d{2}/.exec($(shipment).text())
                console.log(matches);
                for(var i = 0; i < matches.length; i++) {
                    costSpanStr += (' ' + matches[i]);
                }
            });
            costSpan.text(costSpanStr);
        })
        .fail(function (error) {
            console.log(error);
        });
    });

})();

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/https', 'N/search'],

    function (currentRecord, https, search) {

        function fieldChanged(scriptContext) {

            if (scriptContext.fieldId === 'custpage_recordtype') {

                var transactionTypeName = scriptContext.currentRecord.getText({fieldId: 'custpage_recordtype'});
                var transactionNameField = scriptContext.currentRecord.getField({fieldId: 'custpage_recordname'});

                //TODO: Check to see if the current transaction type has changed
                transactionNameField.removeSelectOption({value: null});

                var transactionCodesByName = {
                    'Assembly Build': 'Build',
                    'Assembly Unbuild': 'Unbuild',
                    'Bill': 'VendBill',
                    'Bill CCard': 'VendCard',
                    'Bill Credit': 'VendCred',
                    'Bin Putaway Worksheet': 'BinWksht',
                    'Bin Transfer': 'BinTrnfr',
                    'Bill Payment': 'VendPymt',
                    'Cash Refund': 'CashRfnd',
                    'Cash Sale': 'CashSale',
                    'CCard Refund': 'CardRfnd',
                    'Check': 'Check',
                    'Commission': 'Commissn',
                    'Credit Card': 'CardChrg',
                    'Credit Memo': 'CustCred',
                    'Currency Revaluation': 'FxReval',
                    'Customer Deposit': 'CustDep',
                    'Customer Refund': 'CustRfnd',
                    'Deposit': 'Deposit',
                    'Deposit Application': 'DepAppl',
                    'Estimate': 'Estimate',
                    'Expense Report': 'ExpRept',
                    'Inventory Adjustment': 'InvAdjst',
                    'Inventory Count': 'InvCount',
                    'Inventory Distribution': 'InvDistr',
                    'Inventory Transfer': 'InvTrnfr',
                    'Inventory Worksheet': 'InvWksht',
                    'Invoice': 'CustInvc',
                    'Item Fulfillment': 'ItemShip',
                    'Item Receipt': 'ItemRcpt',
                    'Journal': 'Journal',
                    'Opportunity': 'Opprtnty',
                    'Payment': 'CustPymt',
                    'Purchase Order': 'PurchOrd',
                    'Quote': 'Estimate',
                    'Return Authorization': 'RtnAuth',
                    'Sales Order': 'SalesOrd',
                    'Sales Tax Payment': 'TaxPymt',
                    'Statement Charge': 'CustChrg',
                    'Transfer': 'Transfer',
                    'Transfer Order': 'TrnfrOrd',
                    'Vendor Return Authorization': 'VendAuth',
                    'Work Order': 'WorkOrd'
                };

                var filterExpression = [["mainline", "is", "T"], "AND", ["type", "is", transactionCodesByName[transactionTypeName]],];

                var dateColumn = search.createColumn({
                    name: 'trandate',
                    sort: search.Sort.ASC //We sort by ascending here since the focus() is put on the final entry in the list
                });

                var transactionNameColumn = search.createColumn({
                    name: 'transactionname'
                });

                var searchObject = search.create({
                    type: 'transaction',
                    columns: [dateColumn, transactionNameColumn],
                    filters: filterExpression
                });

                var searchResults = searchObject.run();

                searchResults.each(function (result) {

                    console.log(JSON.stringify(result));

                    var internalId = result.id;
                    var date = result.getValue(dateColumn); //Just used for filtering
                    var tranName = result.getValue(transactionNameColumn);

                    transactionNameField.insertSelectOption({
                        value: internalId,
                        text: tranName
                    })

                    //resultSet.each requires a return true statement to traverse all results
                    return true;
                });
            }

        }

        function renderPDF() {

            var thisRecord = currentRecord.get();
            var transactionInternalId = thisRecord.getValue({fieldId: 'custpage_recordname'})[0];
            var transactionTypeName = thisRecord.getText({fieldId: 'custpage_recordtype'})[0];
            var templateXML = thisRecord.getValue('custpage_editor');

            if (transactionInternalId == null || transactionInternalId == '' || transactionTypeName == null || transactionTypeName == '' || templateXML == null || templateXML == '') {
                alert('Please ensure the transaction type and record are selected and the template xml is not empty.');
                return;
            }

            console.log('template XML ' + templateXML);


            var requestBody = {
                "templateContent": templateXML,
                "transactionInternalId": transactionInternalId,
                "transactionTypeName": transactionTypeName
            };


            console.log('request body' + JSON.stringify(requestBody))

            var suiteletReponse = https.post({

                url: 'https://tstdrv1633051.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=872&deploy=1&compid=TSTDRV1633051&h=bdd9ae95294441d582b5',
                body: JSON.stringify(requestBody)

            });

            var pdfUrl = suiteletReponse.body;


            //SS2.0 does not allow for client scripts to update the value of an inline HTML field
            window.nlapiSetFieldValue('custpage_output', '<iframe src="' + pdfUrl + '#toolbar=0&view=Fit" height="800" width="800" title="RenderedPDF"></iframe>');

        }


        return {
            fieldChanged: fieldChanged,
            renderPDF: renderPDF,
        };

    });

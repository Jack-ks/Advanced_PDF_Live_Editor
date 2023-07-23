/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/file', 'N/http', 'N/record', 'N/render'],

    (file, http, record, render) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {

            if (scriptContext.request.method === 'POST') {

                //TODO: Handle null record types
                var recordTypesByRecordName =
                    {
                        'Assembly Build': record.Type.ASSEMBLY_BUILD,
                        'Assembly Unbuild': record.Type.ASSEMBLY_UNBUILD,
                        'Bill': record.Type.VENDOR_BILL,
                        'Bill CCard': record.Type.CREDIT_CARD_CHARGE,
                        'Bill Credit': record.Type.VENDOR_CREDIT,
                        'Bin Putaway Worksheet': record.Type.BIN_WORKSHEET,
                        'Bin Transfer': record.Type.BIN_TRANSFER,
                        'Bill Payment': record.Type.VENDOR_PAYMENT,
                        'Cash Refund': record.Type.CASH_REFUND,
                        'Cash Sale': record.Type.CASH_SALE,
                        'CCard Refund': record.Type.CASH_REFUND,
                        'Check': record.Type.CHECK,
                        'Commission': null,
                        'Credit Card': record.Type.CREDIT_CARD_CHARGE,
                        'Credit Memo': record.Type.CREDIT_MEMO,
                        'Currency Revaluation': record.Type.CURRENCY,
                        'Customer Deposit': record.Type.DEPOSIT,
                        'Customer Refund': record.Type.CUSTOMER_REFUND,
                        'Deposit': record.Type.DEPOSIT,
                        'Deposit Application': record.Type.DEPOSIT_APPLICATION,
                        'Estimate': record.Type.ESTIMATE,
                        'Expense Report': record.Type.EXPENSE_REPORT,
                        'Inventory Adjustment': record.Type.INVENTORY_ADJUSTMENT,
                        'Inventory Count': record.Type.INVENTORY_COUNT,
                        'Inventory Distribution': null,
                        'Inventory Transfer': record.Type.INVENTORY_TRANSFER,
                        'Inventory Worksheet': record.Type.BIN_WORKSHEET,
                        'Invoice': record.Type.INVOICE,
                        'Item Fulfillment': record.Type.ITEM_FULFILLMENT,
                        'Item Receipt': record.Type.ITEM_RECEIPT,
                        'Journal': record.Type.JOURNAL_ENTRY,
                        'Opportunity': record.Type.OPPORTUNITY,
                        'Payment': record.Type.VENDOR_PAYMENT,
                        'Purchase Order': record.Type.PURCHASE_ORDER,
                        'Quote': record.Type.ESTIMATE,
                        'Return Authorization': record.Type.RETURN_AUTHORIZATION,
                        'Sales Order': record.Type.SALES_ORDER,
                        'Sales Tax Payment': null,
                        'Statement Charge': null,
                        'Transfer': null,
                        'Transfer Order': record.Type.TRANSFER_ORDER,
                        'Vendor Return Authorization': record.Type.VENDOR_RETURN_AUTHORIZATION,
                        'Work Order': record.Type.WORK_ORDER
                    };

                var requestBody;

                if (scriptContext.request.body != null && scriptContext.request.body != '') {

                    requestBody = JSON.parse(scriptContext.request.body);
                }

                if (requestBody != null) {

                    try {

                        if (requestBody != null && requestBody != '') {

                            log.error({
                                title: 'requestBody',
                                details: JSON.stringify(requestBody)
                            });
                            log.error({
                                title: 'NS Record Type',
                                details: recordTypesByRecordName[requestBody.transactionTypeName].toString()
                            });

                            var templateRenderer = render.create();

                            templateRenderer.templateContent = requestBody.templateContent;

                            templateRenderer.addRecord('record', record.load({
                                type: recordTypesByRecordName[requestBody.transactionTypeName],
                                id: requestBody.transactionInternalId
                            }));

                            var pdfData = templateRenderer.renderAsPdf();

                            // var pdfData = render.transaction({
                            //     entityId: +requestBody.transactionInternalId,
                            //     printMode: render.PrintMode.PDF,
                            //     inCustLocale: true
                            // });

                            // log.error({
                            //     title: 'pdfData',
                            //     details: pdfData
                            // });
                        }

                    } catch (e) {

                        log.error({
                            title: 'Advanced PDF Renderer Error',
                            details: JSON.stringify(e)
                        })

                        var errorXmlStr = "<?xml version=\"1.0\"?>\n" +
                            "<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n" +
                            "<pdf>\n<body font-size=\"25pt\" align=\"middle\">Error:</body>\n</pdf>";

                        var errorMessage = escapeXml(e.message);

                        var errorMessageTextIndex = errorXmlStr.indexOf('Error:') + 6;

                        //Insert the caught Error into the PDF XML
                        errorXmlStr = errorXmlStr.slice(0, errorMessageTextIndex) + errorMessage + errorXmlStr.slice(errorMessageTextIndex)

                        log.error({
                            title: 'Advanced PDF Renderer Error XML string',
                            details: errorXmlStr
                        })

                        templateRenderer.templateContent = errorXmlStr;

                        templateRenderer.addCustomDataSource({
                            format: render.DataSource.OBJECT,
                            alias: 'JSON',
                            data: {}
                        });
                        var pdfData = templateRenderer.renderAsPdf();
                    }

                } else {// This is the inital PDF display. TODO: Fix this crappy code

                    log.error({
                        title: 'crappy code zone',
                        details: 'welcome'
                    });

                    var xmlStr = "<?xml version=\"1.0\"?>\n" +
                        "<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n" +
                        "<pdf>\n<body font-size=\"18\">Hello World!</body>\n</pdf>";


                    var templateRenderer = render.create();

                    templateRenderer.templateContent = xmlStr;

                    templateRenderer.addCustomDataSource({
                        format: render.DataSource.OBJECT,
                        alias: 'JSON',
                        data: {}
                    });
                    var pdfData = templateRenderer.renderAsPdf();
                }
                pdfData.name = 'jks_customerpickuplabelpdf';

                pdfData.folder = 2345; //suitescripts/jack_testing/jack_testing/pdf output

                var pdfFile = file.load(pdfData.save()); //the file.save() function returns the files internal id

                var pdfFileUrl = pdfFile.url;

                log.error({
                    title: 'pdfFileUrl',
                    details: pdfFileUrl
                });

                var fileUrl = 'https://tstdrv1633051.app.netsuite.com' + pdfFileUrl;

                log.error({
                    title: 'fileUrl',
                    details: fileUrl
                });

                scriptContext.response.write(fileUrl);
            }
        }

        function escapeXml(unsafe) {
            return unsafe.replace(/[<>&'"]/g, function (c) {
                switch (c) {
                    case '<':
                        return '&lt;';
                    case '>':
                        return '&gt;';
                    case '&':
                        return '&amp;';
                    case '\'':
                        return '&apos;';
                    case '\"':
                        return '&quot;';
                }
            });
        }

        return {onRequest}

    });

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/cache', 'N/ui/dialog', 'N/ui/message', 'N/ui/serverWidget', 'N/file', 'N/render', 'N/https'],

    (cache, dialogue, message, serverWidget, file, render, https) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        function onRequest(context) {
            if (context.request.method === 'GET') {

                try {

                    //TODO: Caching
                    //TODO: Make prettier
                    //TODO: Saving to existing advanced template
                    //TODO: Helpfull links, e.g current transaction record or Templte page, form page
                    //TODO: Get the account URL can do this via standard Javascript

                    var form = serverWidget.createForm({title: 'Advanced PDF Live Editor'});

                    form.clientScriptModulePath = 'SuiteScripts/Jack_Testing/AdvancedPDF_LiveEditor/Client/C_AdvancedPDFEditor.js';

                    var renderPdfButton = form.addButton({
                        id: 'renderPdf',
                        label: 'Render PDF',
                        functionName: 'renderPDF'
                    });

                    var getRecordButton = form.addButton({
                        id: 'getRecord',
                        label: 'Get Record',
                        functionName: 'displayGetRecordPrompt'
                    });

                    var recordDetailsFieldGroup = form.addFieldGroup({
                        id: 'recordDetails',
                        label: 'Transaction Details'
                    });

                    var editorFieldGroup = form.addFieldGroup({
                        id: 'editor',
                        label: 'Editor'
                    });


                    var pdfOutputFieldGroup = form.addFieldGroup({
                        id: 'pdfOutput',
                        label: 'PDF Output'
                    });

                    editorFieldGroup.isSingleColumn = true;
                    pdfOutputFieldGroup.isSingleColumn = true;

                    // Add the fields

                    var inlineHtmlField = form.addField({
                        id: 'custpage_html',
                        label: 'Html',
                        type: serverWidget.FieldType.INLINEHTML,
                    });

                    inlineHtmlField.label = 'html';

                    inlineHtmlField.defaultValue =
                        '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.2/codemirror.css" />' +
                        '<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.2/codemirror.js"></script>' +
                        '<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.2/mode/xml/xml.js"></script>' +
                        '<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.2/addon/selection/active-line.js"></script>' +
                        '<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.2/addon/edit/closetag.js"></script>' +
                        '<script>var editor = CodeMirror.fromTextArea(document.getElementById("custpage_editor"), {' +
                        '      lineNumbers: true,' +
                        'styleActiveLine: true,' +
                        'autoCloseTags: true,' +
                        '      mode: "xml"' +
                        '    });</script>';


                    var transactionTypeField = form.addField({
                        id: 'custpage_recordtype',
                        label: 'Transaction Type',
                        type: serverWidget.FieldType.MULTISELECT,
                        source: -100,                               //-100 = Transaction Type
                        container: 'recordDetails'
                    });

                    var transactionNameField = form.addField({
                        id: 'custpage_recordname',
                        label: 'Transaction Name',
                        type: serverWidget.FieldType.MULTISELECT,
                        container: 'recordDetails'
                    });


                    var editorField = form.addField({
                        id: 'custpage_editor',
                        label: 'Editor',
                        type: serverWidget.FieldType.LONGTEXT,
                        container: 'editor'
                    });

                    editorField.updateDisplaySize({
                        height: '48',
                        width: '120'
                    });
                    editorField.defaultValue = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">\n<pdf>\n  <head>\n  </head>\n  <body>\n  </body>\n</pdf>';

                    var outputField = form.addField({
                        id: 'custpage_output',
                        label: 'Output',
                        type: serverWidget.FieldType.INLINEHTML,
                        container: 'pdfOutput'
                    });

                    outputField.label = 'Output';

                    var suiteletReponse = https.post({
                        url: 'https://tstdrv1633051.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=872&deploy=1&compid=TSTDRV1633051&h=bdd9ae95294441d582b5',
                        body: null
                    });

                    log.error({
                        title: 'suiteletResponse',
                        details: JSON.stringify(suiteletReponse)
                    })

                    var pdfUrl = suiteletReponse.body;

                    outputField.defaultValue = '<iframe id="pdf_output_iframe" src="' + pdfUrl + '#toolbar=0&view=Fit" height="50%" width="570vw" title="RenderedPDF" style="position: absolute; margin-top: 25px;"></iframe>';

                    context.response.writePage(form);

                } catch (e) {

                    log.error({
                        title: 'Error rendering page',
                        details: JSON.stringify(e)
                    })
                }
            }
        }

        return {onRequest}

    });

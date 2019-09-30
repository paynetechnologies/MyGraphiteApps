// Document Scan
// Based On: DocumentScan -> ViewElement
(function (DocumentScan, window, document, Common, Cache, Events, Velocity, undefined) {

    // Private Variables
    var DWObject;
    var DocumentScanCount = 0;
    var DocumentScanHeight = 350;

    // Public Methods
    DocumentScan.Render = function (documentScan) {

        // Only one per page
        if (DocumentScanCount > 0) {
            return '';
        }
        DocumentScanCount++;

        // Set height
        if (Common.IsDefined(documentScan.Height)) {
            DocumentScanHeight = parseInt(documentScan.Height, 10);
        }

        // Initialize
        var documentScanMarkup = '<div data-namespace="DocumentScan" class="gtc-documentscan"' + ViewElement.RenderAttributes(documentScan);

        // On Click Save Event
        if (Common.IsEventViewElementDefined(documentScan.OnClickSave)) {
            // Data-ControllerPath/ActionName
            documentScanMarkup += ' data-clicksave=\'' + JSON.stringify(documentScan.OnClickSave) + '\'';
        }
        documentScanMarkup += '>';

        // Controls
        documentScanMarkup += '<div class="gtc-documentscan-controls"><div class="gtc-documentscan-control-item">';
        documentScanMarkup += '<fieldset class="gtc-fieldset gtc-fieldset-long" id="' + documentScan.Name + 'FieldSet"><ol class="gtc-fieldset-ol">';
        documentScanMarkup += '<li class="gtc-field"><label id="ScanSource-Label" class="gtc-label" for="ScanSource"><span data-translate="SelectSource">' + Common.TranslateKey('SelectSource') + '</span></label>';
        documentScanMarkup += '<span id="SpanRequiredScanSource" class="gtc-classSpanRequired gtc-classSpanRequiredYes">!</span>';
        documentScanMarkup += '<select data-namespace="SelectField" class="gtc-input-selectbox" name="ScanSource" value="" tabindex="1" id="ScanSource" aria-required="true" data-isfirstblank="Yes"><option selected="selected" value="">&nbsp;</option></select>';
        documentScanMarkup += '</li></ol></fieldset>';
        documentScanMarkup += '</div><div class="gtc-documentscan-control-item">';
        documentScanMarkup += '<button disabled="disabled" id="' + documentScan.Name + 'ScanButton" class="gtc-btn gtc-btn-button gtc-btn--basic gtc-btn--basic-active gtc-btn--size-default gtc-btn--size-block"><span id="' + documentScan.Name + 'ScanButtonTitle" class="gtc-button-title" data-translate="Scan">' + Common.TranslateKey('Scan') + '</span></button>';
        documentScanMarkup += '<button id="' + documentScan.Name + 'FullScreen" class="gtc-btn gtc-btn-button gtc-btn--basic gtc-btn--basic-passive gtc-btn--size-default gtc-btn--size-block"><i class="gtc-icon-styles fa fa-arrows-alt fa-lg"></i><span id="' + documentScan.Name + 'FullScreen" class="gtc-button-title gtc-sr-only" data-translate="FullScreen">' + Common.TranslateKey('FullScreen') + '</span></button>';
        documentScanMarkup += '<button disabled="disabled" id="' + documentScan.Name + 'Edit" class="gtc-btn gtc-btn-button gtc-btn--basic gtc-btn--basic-passive gtc-btn--size-default gtc-btn--size-block"><i class="gtc-icon-styles fa fa-pencil fa-lg"></i><span id="' + documentScan.Name + 'Edit" class="gtc-button-title gtc-sr-only" data-translate="Edit">' + Common.TranslateKey('Edit') + '</span></button>';
        documentScanMarkup += '<button disabled="disabled" id="' + documentScan.Name + 'Save" class="gtc-btn gtc-btn-button gtc-btn--basic gtc-btn--basic-active gtc-btn--size-default gtc-btn--size-block"><span id="' + documentScan.Name + 'Save" class="gtc-button-title" data-translate="Save">' + Common.TranslateKey('Save') + '</span></button>';
        documentScanMarkup += '</div></div>';
        documentScanMarkup += '<div id="dwtcontrolContainer"></div>';
        documentScanMarkup += '</div>';

        // Attach init event
        Events.One(document.body, 'configuredocumentscan', '#' + documentScan.Name,
            function () {
                var that = this;
                var isModal = Common.IsModal();

                // Scan Button
                Events.On(Common.Get(documentScan.Name + 'ScanButton'), 'click',
                    function () {
                        DocumentScan.AcquireImage();
                    }
                );

                // Load Dynamic Web Twain
                // Wait for modal to show before loading twain
                if (Common.IsModal()) {
                    Common.AttachVisibilityEvent(that.id,
                        function (event, eventData) {
                            if (eventData.Visible == true) {
                                DocumentScan.LoadDWObject(documentScan.Name);
                            }
                        }, null, null, 'No'
                    );
                }
                else {
                    DocumentScan.LoadDWObject(documentScan.Name);
                }

                // Full Screen
                Events.On(Common.Get(documentScan.Name + 'FullScreen'), 'click',
                    function () {
                        // Determine function call
                        var functionCall = "AddClass";
                        if (Common.HasClass(that, 'gtc-documentscan-fullscreen')) {
                            functionCall = "RemoveClass";
                        }

                        // Add/Remove necessary classes
                        Common[functionCall](that, 'gtc-documentscan-fullscreen');
                        if (isModal) {
                            Common[functionCall](Common.Query('.gtc-modal-dialog', null, true), 'gtc-modal-fullscreen');
                        }
                        else {
                            Common[functionCall](document.body, 'gtc-body-fullscreen');
                        }

                        // Resize
                        var waitTime = 0;
                        if (isModal) {
                            waitTime = 500;
                        }
                        setTimeout(
                            function () {
                                Events.Trigger(window, 'resize.onDocumentScanResize');
                            }, waitTime
                        );
                    }
                );

                // Edit
                Events.On(Common.Get(documentScan.Name + 'Edit'), 'click',
                    function () {
                        if (DWObject) {
                            if (DWObject.HowManyImagesInBuffer > 0) {
                                var isLoaded = DWObject.ShowImageEditor();
                                var modalTitlebar = Common.Query('.gtc-modal-titlebar', null, true);
                                if (isLoaded && Common.IsDefined(modalTitlebar)) {
                                    Common.AddClass(modalTitlebar, 'gtc-hide');
                                    var imageEditor = Common.Query(".D_ImageUIEditor");
                                    var closeButton = Common.Query('img[src$="close.png"]', imageEditor);
                                    if (Common.IsDefined(closeButton)) {
                                        Events.On(closeButton, 'click',
                                            function () {
                                                Common.RemoveClass(modalTitlebar, 'gtc-hide');
                                            }
                                        );
                                    }
                                }
                            }
                        }
                    }
                );

                // Save
                Events.On(Common.Get(documentScan.Name + 'Save'), 'click',
                    function () {
                        if (DWObject) {
                            if (DWObject.HowManyImagesInBuffer > 0) {
                                DWObject.SelectedImagesCount = DWObject.HowManyImagesInBuffer;
                                var index = 0, sourceCount = DWObject.SelectedImagesCount;
                                for ( ; index < sourceCount; index++) {
                                    DWObject.SetSelectedImageIndex(index,index);
                                }
                                DWObject.GetSelectedImagesSize(EnumDWT_ImageType.IT_PDF);
                                var imagedata = DWObject.SaveSelectedImagesToBase64Binary();
                                DocumentScan.OnClickSave(Common.Get(documentScan.Name), imagedata)
                            }
                        }
                    }
                );

                // On window resize
                var onResizeEndFunction = function (event) {
                    if (DWObject) {
                        DWObject.Width = Common.Width(Common.Get('dwtcontrolContainer'));
                    }
                };
                Common.AttachWindowResizingEvent(onResizeEndFunction, 'onDocumentScanResize');
            }
        );

        // Return markup
        return documentScanMarkup;

    };

    DocumentScan.OnClickSave = function (documentScan, base64Document) {

        // Initialize
        var onClickSaveParameters = [];

        // Get OnNodeSelectEvent object
        var onClickSaveEvent = JSON.parse(Common.GetAttr(documentScan, 'data-clicksave'));
        if (Common.IsDefined(onClickSaveEvent.UiParameters)) {
            onClickSaveParameters = onClickSaveParameters.concat(onClickSaveEvent.UiParameters);
        }

        // Serialize Form?
        if (Common.IsDefined(onClickSaveEvent.FormToSerialize)) {
            onClickSaveParameters = onClickSaveParameters.concat(Form.SerializeArray(Common.Get(onClickSaveEvent.FormToSerialize)));
        }

        // Add base64 document
        var base64DocumentParameter = {
            Name: 'Base64Scan',
            Value: base64Document,
            UiParameters: null
        };
        onClickSaveParameters = onClickSaveParameters.concat(base64DocumentParameter);

        // Execute View Behavior
        Common.ExecuteViewBehavior(onClickSaveEvent.ControllerPath + onClickSaveEvent.ActionName, onClickSaveParameters, Page.RunInstructions, documentScan);

    };

    DocumentScan.LoadDWObject = function (documentScanName) {

        Dynamsoft.WebTwainEnv.RegisterEvent('OnWebTwainReady',
            function () {
                DWObject = Dynamsoft.WebTwainEnv.GetWebTwain('dwtcontrolContainer');
                if (DWObject) {
                    DWObject.Width = Common.Width(Common.Get('dwtcontrolContainer'));
                    DWObject.Height = DocumentScanHeight;
                    var sourceDropdown = Common.Get('ScanSource');
                    var index = 0, sourceCount = DWObject.SourceCount;
                    for ( ; index < sourceCount; index++) {
                        sourceDropdown.options.add(new Option(DWObject.GetSourceNameItems(index), index));
                    }

                    // Setup required field event
                    Events.On(document.body, 'focusout.requiredField.' + documentScanName, '#ScanSource',
                        function (event) {
                            event.stopPropagation();
                            Field.UpdateRequiredStatus(event.target);
                        }
                    );

                    // Setup on change
                    Events.On(document.body, 'change.' + documentScanName, '#ScanSource',
                        function (event) {
                            var scanButton = Common.Get(documentScanName + 'ScanButton');
                            if (sourceDropdown.selectedIndex != 0) {
                                Common.RemoveAttr(scanButton, 'disabled');
                            }
                            else {
                                Common.SetAttr(scanButton, 'disabled', 'disabled');
                            }
                        }
                    );

                    // Trigger events for widget
                    GTC.TriggerEvent(sourceDropdown, 'widgetUpdateOptions');
                    GTC.TriggerEvent(sourceDropdown, 'widgetUpdateValue');
                    Field.UpdateRequiredStatus(sourceDropdown);


                    // Enable controls after scan
                    DWObject.RegisterEvent('OnPostAllTransfers',
                        function () {
                            if (DWObject) {
                                DWObject.CloseSource();
                                if (DWObject.HowManyImagesInBuffer > 0) {
                                    Common.RemoveAttr(Common.Get(documentScanName + 'Edit'), 'disabled');
                                    Common.RemoveAttr(Common.Get(documentScanName + 'Save'), 'disabled');
                                }
                            }
                        }
                    );

                    // Enable controls after scan
                    DWObject.RegisterEvent('OnTopImageInTheViewChanged',
                        function (sImageIndex) {
                            if (DWObject) {
                                DWObject.CurrentImageIndexInBuffer = sImageIndex;
                            }
                        }
                    );
                }
            }
        );
        Dynamsoft.WebTwainEnv.Load();

    };

    DocumentScan.AcquireImage = function () {

        if (DWObject) {
            var sourceDropdown = Common.Get('ScanSource');
            if (sourceDropdown.selectedIndex != 0) {
                DWObject.IfDisableSourceAfterAcquire = true;
                DWObject.SelectSourceByIndex(sourceDropdown.selectedIndex);
                DWObject.OpenSource();
                DWObject.IfShowUI = false;
                DWObject.IfShowIndicator = false;
                DWObject.IfAutomaticDeskew = true;
                DWObject.SetViewMode(1, 1)
                DWObject.AcquireImage();
            }
            else {
                sourceDropdown.focus();
            }
        }

    };

} (window.DocumentScan = window.DocumentScan || {}, window, document, Common, Cache, Events, Velocity));

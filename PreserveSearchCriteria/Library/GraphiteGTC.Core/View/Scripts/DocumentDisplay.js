/** 
 * @class DocumentDisplay
 * @classdesc Supports the DocumentDisplay View Element<br>
 *            Based On: ViewElement
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (DocumentDisplay, window, document, Common, Cache, Events, Velocity, undefined) {

    /**
     * @function DocumentDisplay.Render
     * @param {object} documentDisplay - The DocumentDisplay View Element in JSON format
     * @description Generates the HTML markup for the DocumentDisplay View Element 
     * @returns {string} HTML Markup of the DocumentDisplay View Element
     * @listens configuredocumentdisplay (id = <var>documentDisplayName</var>)
     * @listens click (id = <var>documentDisplayName</var>Maximize)
     */
    DocumentDisplay.Render = function (documentDisplay) {

        // Div<, Data-NameSpace@, TabIndex@, Class@, Id@, @Data-Height, Div>
        var documentDisplayMarkup = '<div class="gtc-documentdisplay" data-namespace="DocumentDisplay" data-configure="Pre"' + ViewElement.RenderAttributes(documentDisplay);
        var groupDocsMarkup = '<div class="gtc-documentdisplay-container" id="' + documentDisplay.Name + 'GroupDocs"';
        if (Common.IsDefined(documentDisplay.FileName)) {
            groupDocsMarkup += ' data-currentfile="' + documentDisplay.FileName + '"';
        }

        // Dimension styles
        var stylesMarkup = '';
        if (Common.IsDefined(documentDisplay.Dimension)) {
            // Height
            if (Common.IsDefined(documentDisplay.Dimension.Height)) {
                documentDisplayMarkup += ' data-height="' + documentDisplay.Dimension.Height + documentDisplay.Dimension.Scale + '"';
                stylesMarkup += 'height:' + documentDisplay.Dimension.Height + documentDisplay.Dimension.Scale + ';';
            }

            // Width
            if (Common.IsDefined(documentDisplay.Dimension.Width)) {
                documentDisplayMarkup += ' data-width="' + documentDisplay.Dimension.Width + documentDisplay.Dimension.Scale + '"';
                stylesMarkup += 'width:' + documentDisplay.Dimension.Width + documentDisplay.Dimension.Scale + ';';
            }

            // Add style attribute
            if (Common.IsNotEmptyString(stylesMarkup)) {
                stylesMarkup = ' style="' + stylesMarkup + '"';
            }
        }

        // Setup configuration
        if (!Common.IsPreview()) {
            Events.On(document.body, 'configuredocumentdisplay.' + documentDisplay.Name, '#' + documentDisplay.Name,
                function () {
                    // Show pinwheel
                    var that = this;
                    Common.ShowPinwheel(that);

                    // Get host and port
                    var url = window.location.protocol + '//' + window.location.hostname;
                    var port = window.location.port;
                    if (Common.IsDefined(port) && Common.IsNotEmptyString(port)) {
                        url += ':' + port;
                    }
                    url += '/';

                    // Build inserts that don't matter when they complete loading
                    var insertsMarkup = '<link rel="stylesheet" type="text/css" href="' + url + 'document-viewer/CSS/GetCss?name=bootstrap.css">';
                    insertsMarkup += '<link rel="stylesheet" type="text/css" href="' + url + 'document-viewer/CSS/GetCss?name=GroupdocsViewer.all.min.css">';
                    insertsMarkup += '<link rel="stylesheet" type="text/css" href="' + url + 'document-viewer/CSS/GetCss?name=jquery-ui-1.10.3.dialog.min.css">';
                    Common.InsertHTMLString(document.body, Common.InsertType.Append, insertsMarkup);

                    // Define function to complete initialization after scripts load
                    var completeInit = function () {

                        // Initialize GroupDocs
                        var isModal = Common.IsModal();
                        var showDownload = (documentDisplay.ShowDownloadButton == 'Yes') ? true : false;
                        var showPrint = (documentDisplay.ShowPrintButton == 'Yes') ? true : false;
                        var fileExists = Common.IsDefined(documentDisplay.FileName);
                        var $groupDocs = $(Common.Get(documentDisplay.Name + 'GroupDocs'));
                        var localizedStrings = null;
                        var thumbsImageBase64Encoded = null;
                        var calculatedHeight = 0;
                        var calculatedWidth = 0;
                        if (Common.IsDefined(documentDisplay.Dimension)) {
                            // Height
                            if (Common.IsDefined(documentDisplay.Dimension.Height)) {
                                calculatedHeight = documentDisplay.Dimension.Height;
                            }
                            else if (isModal) {
                                calculatedHeight = Common.Height(parent.window);
                            }

                            // Width
                            if (Common.IsDefined(documentDisplay.Dimension.Width)) {
                                calculatedWidth = documentDisplay.Dimension.Width;
                            }
                            else if (isModal) {
                                calculatedWidth = '100%';
                            }
                        }
                        else if (isModal) {
                            calculatedHeight = Common.Height(parent.window);
                            calculatedWidth = '100%';
                        }
                        $groupDocs.groupdocsViewer({
                            backgroundColor: null,
                            convertWordDocumentsCompletely: false,
                            currentSearchHighlightColor: null,
                            downloadPdfFile: true,
                            enableStandardErrorHandling: true,
                            fileDisplayName: null,
                            filePath: documentDisplay.FileName,
                            height: calculatedHeight,
                            ignoreDocumentAbsence: true,
                            initialZoom: 100,
                            jqueryFileDownloadCookieName: 'jqueryFileDownloadJSForGD',
                            loadAllPagesOnSearch: false,
                            localizedStrings: localizedStrings,
                            minimumImageWidth: 0,
                            onlyShrinkLargePages: false,
                            openThumbnails: false,
                            preloadPagesCount: 1,
                            preloadPagesOnBrowserSide: true,
                            preventTouchEventsBubbling: false,
                            printWithWatermark: false,
                            quality: 100,
                            searchForSeparateWords: false,
                            searchHighlightColor: null,
                            showDownload: showDownload,
                            showDownloadErrorsInPopup: false,
                            showFolderBrowser: false,
                            showHeader: true,
                            showImageWidth: false,
                            showOnePageInRow: false,
                            showPaging: true,
                            showPrint: showPrint,
                            showSearch: true,
                            showThumbnails: true,
                            showViewerStyleControl: false,
                            showZoom: true,
                            supportPageReordering: false,
                            supportPageRotation: true,
                            supportTextSelection: true,
                            thumbnailsContainerBackgroundColor: null,
                            thumbnailsContainerBorderRightColor: null,
                            thumbnailsContainerWidth: 0,
                            thumbsImageBase64Encoded: thumbsImageBase64Encoded,
                            toolbarBorderBottomColor: null,
                            toolbarButtonBorderColor: null,
                            toolbarButtonBorderHoverColor: null,
                            toolbarButtonsBoxShadowHoverStyle: null,
                            toolbarButtonsBoxShadowStyle: null,
                            toolbarInputFieldBorderColor: null,
                            treatPhrasesInDoubleQuotesAsExactPhrases: false,
                            useEmScaling: false,
                            useHtmlBasedEngine: false,
                            useHtmlThumbnails: false,
                            useImageBasedPrinting: true,
                            useInnerThumbnails: false,
                            usePdfPrinting: false,
                            usePngImagesForHtmlBasedEngine: false,
                            useRtl: false,
                            viewerStyle: 1,
                            watermarkColor: null,
                            watermarkFontSize: 0,
                            watermarkPosition: 'Diagonal',
                            watermarkText: null,
                            width: calculatedWidth,
                            zoomToFitHeight: false,
                            zoomToFitWidth: false
                        });

                        // Make responsive and cleanup file
                        $groupDocs.groupdocsViewer('on', 'documentLoadCompleted.groupdocs',
                            function () {
                                fileExists = true;
                                if (!isModal) {
                                    UpdateDimensions($groupDocs, fileExists);
                                }

                                // Remove pinwheel
                                Common.HidePinwheel(that);

                                // Modal size correct?
                                if (isModal) {
                                    Common.ResizeView(true);
                                }
                            }
                        );
                        if (!isModal) {
                            var onResizeEndFunction = function (event) {
                                UpdateDimensions($groupDocs, fileExists);
                            };
                            Common.AttachWindowResizingEvent(onResizeEndFunction, 'onDocumentDisplayResize');
                        }
                        window.onunload = function () {
                            // Cleanup the last file we loaded
                            var currentFile = Common.GetAttr($groupDocs[0], 'data-currentfile');
                            if (Common.IsDefined(currentFile)) {
                                CleanupFile(currentFile);
                            }
                        };

                        // Setup full screen toggle
                        var toolbar = Common.Query('[name=printAndDownloadToolbar]', $groupDocs[0]);
                        if (!showDownload && !showPrint) {
                            toolbar.style.display = 'block';
                        }
                        var fullscreenLink = Common.InsertHTMLString(toolbar, Common.InsertType.Append, '<a id="' + documentDisplay.Name + 'Maximize" class="new_head_tools_btn h_t_i_fullscreen fullscreen_button" data-tooltip="Full Screen" data-localize-tooltip="Full Screen"><i class="gtc-icon-styles fa fa-arrows-alt" style="color: white; margin: 7px 8px;"></i></a>', documentDisplay.Name + 'Maximize');
                        Events.On(fullscreenLink, 'click',
                            function () {
                                if (Common.HasClass(that, 'gtc-documentdisplay-fullscreen')) {
                                    Common.RemoveClass(that, 'gtc-documentdisplay-fullscreen');
                                    if (isModal) {
                                        Common.RemoveClass(Common.Query('.gtc-modal-iframe', null, true), 'gtc-modal-fullscreen');
                                    }
                                    if (!isModal) {
                                        UpdateDimensions($groupDocs, fileExists);
                                    }
                                    else {
                                        if (fileExists) {
                                            $groupDocs.groupdocsViewer('setZoom', 100);
                                        }
                                    }
                                }
                                else {
                                    Common.AddClass(that, 'gtc-documentdisplay-fullscreen');
                                    if (isModal) {
                                        Common.AddClass(Common.Query('.gtc-modal-iframe', null, true), 'gtc-modal-fullscreen');
                                    }
                                    if (fileExists) {
                                        var newZoom = Common.Width(window) * 100 / 950;
                                        $groupDocs.groupdocsViewer('setZoom', newZoom);
                                    }
                                }
                            }
                        );

                        // Handle removing pinwheel an resizing if no file was initially loaded
                        if (Common.IsNotDefined(documentDisplay.FileName)) {
                            if (!isModal) {
                                UpdateDimensions($groupDocs, fileExists);
                            }

                            // Remove pinwheel
                            Common.HidePinwheel(that);

                            // Modal size correct?
                            if (isModal) {
                                Common.ResizeView(true);
                            }
                        }

                    };

                    // Load scripts asynch in specific order with promises
                    InjectScript(url + 'document-viewer/GetScript?name=libs/jquery-1.9.1.min.js').then(
                        function () {
                            return InjectScript(url + 'document-viewer/GetScript?name=libs/jquery-ui-1.10.3.min.js');
                        }
                    ).then(
                        function () {
                            return InjectScript(url + 'document-viewer/GetScript?name=libs/knockout-3.2.0.js');
                        }
                    ).then(
                        function () {
                            return InjectScript(url + 'document-viewer/GetScript?name=libs/turn.min.js');
                        }
                    ).then(
                        function () {
                            return InjectScript(url + 'document-viewer/GetScript?name=libs/modernizr.2.6.2.Transform2d.min.js');
                        }
                    ).then(
                        function () {
                            InjectScript(url + 'document-viewer/GetScript?name=installableViewer.min.js').then(
                                function () {
                                    $.ui.groupdocsViewer.prototype.applicationPath = url;
                                    $.ui.groupdocsViewer.prototype.useHttpHandlers = false;
                                    InjectScript(url + 'document-viewer/GetScript?name=GroupdocsViewer.all.min.js').then(
                                        function () {
                                            completeInit();
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }

        // Div</>
        documentDisplayMarkup += '>';

        // Override some odd third party CSS that was causing issues
        documentDisplayMarkup += '<style>.gtc-documentdisplay-container .grpdx .input_search{width:160px;height:30px}.gtc-documentdisplay-container .grpdx .new_head_input{margin:10px 3px}</style>';

        // Div</>, Div</>, Div</>
        documentDisplayMarkup += groupDocsMarkup + stylesMarkup + '></div></div>';
        return documentDisplayMarkup;

    };

    /**
     * @function DocumentDisplay.Configure
     * @param {object} documentDisplay - The DocumentDisplay DOM element
     * @param {string} configureStage - Pre for Configuration before Translations or Post for Configuration after Translations
     * @description Called by Page.Configure after the dynamic HTML markup is added to the DOM
     * @fires configuredocumentdisplay (DocumentDisplay)
     */
    DocumentDisplay.Configure = function (documentDisplay, configureStage) {

        Events.Trigger(documentDisplay, 'configuredocumentdisplay');

    };

    /**
     * @function Column.UpdateValue
     * @param {object} documentDisplay - The DocumentDisplay DOM element
     * @param {string} fileName - The new file to display
     * @description Displayed a new file
     */
    DocumentDisplay.UpdateValue = function (documentDisplay, fileName) {

        Common.ShowPinwheel(documentDisplay);
        var groupDocs = Common.Get(documentDisplay.id + 'GroupDocs');
        var currentFile = Common.GetAttr(groupDocs, 'data-currentfile');
        $(groupDocs).groupdocsViewer('loadDocument', fileName);
        Common.SetAttr(groupDocs, 'data-currentfile', fileName);
        if (Common.IsDefined(currentFile)) {
            CleanupFile(currentFile);
        }
        Common.HidePinwheel(documentDisplay);

    };

    /**
     * @function DocumentDisplay.ShowPinwheel
     * @param {object} button - The DocumentDisplay DOM element
     * @description Shows Pinwheel on the View Element
     */
    DocumentDisplay.ShowPinwheel = function (documentDisplay) {

        Common.InsertHTMLString(document.body, Common.InsertType.Append, '<div class="gtc-pinwheel-overlay gtc-pinwheel-overlay-transparent" id="' + documentDisplay.id + 'PinwheelOverlay"></div>');
        SpinKit.Show(documentDisplay, 'FadingCircle');

    };

    /**
     * @function DocumentDisplay.HidePinwheel
     * @param {object} button - The DocumentDisplay DOM element
     * @description Hides Pinwheel on the View Element
     */
    DocumentDisplay.HidePinwheel = function (documentDisplay) {

        setTimeout(
            function () {
                SpinKit.Hide(documentDisplay);
                var pinwheelOverlay = Common.Get(documentDisplay.id + 'PinwheelOverlay');
                if (Common.IsDefined(pinwheelOverlay)) {
                    Common.Remove(pinwheelOverlay);
                }
            }, 600
        );

    };

    // Private Methods
    function InjectScript (url) {

        // Load a script and return a promise that resolves when script loaded
        var loadedPromise = Common.Promise();
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.onload = function(){
            loadedPromise.resolve();
        };
        script.src = url;
        document.body.appendChild(script);
        return loadedPromise.promise;

    };

    function CleanupFile (fileName) {

        var cleanupDocumentParameters = {
            fileName: fileName
        };

        // Make ajax request
        var requestObject = new XMLHttpRequest();
        requestObject.open('POST', '/File/RemoveDocumentFile', true);
        requestObject.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        requestObject.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                // Success!
            }
            else {
                Common.RequestErrorHandler(this, null, true);
            }
        };
        requestObject.onerror = function () {
            Common.RequestErrorHandler(this, null, true);
        };
        requestObject.send(JSON.stringify(cleanupDocumentParameters));

    };

    function UpdateDimensions ($groupDocs, fileExists) {

        var content = Common.Closest('#PageMainContent', $groupDocs[0]);
        if (Common.IsNotDefined(content)) {
            content = window;
        }
        var paddingLeft = parseFloat(Common.GetStyle(content, 'paddingLeft'));
        var paddingRight = parseFloat(Common.GetStyle(content, 'paddingRight'));
        var newWidth = Common.Width(content);
        if (Common.IsNumeric(paddingLeft)) {
            newWidth = newWidth - paddingLeft;
        }
        if (Common.IsNumeric(paddingRight)) {
            newWidth = newWidth - paddingRight;
        }
        var newHeight = Common.Height(content);
        $groupDocs.groupdocsViewer('setWidth', newWidth);
        if (fileExists) {
            var newZoom = newWidth * 100 / 950;
            $groupDocs.groupdocsViewer('setZoom', newZoom);
        }
        $groupDocs.groupdocsViewer('setHeight', newHeight);

    };

} (window.DocumentDisplay = window.DocumentDisplay || {}, window, document, Common, Cache, Events, Velocity));

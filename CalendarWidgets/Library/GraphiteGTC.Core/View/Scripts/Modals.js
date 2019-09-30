// Modals Namespace
(function (Modals, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Variables
    Modals.ModalTypes = {
        Confirmation: 0,
        Error: 1,
        Warning: 2,
        Success: 3
    };

    Modals.ModalResult = {
        Yes: 0,
        No: 1,
        Ok: 2
    };

    Modals.ErrorCodes = {
        AuthorizationError: 401,
        ConcurrencyError: 409,
        SessionExpirationError: 498
    };

    // Private Variables
    var modalMessagePopupExists = false;

    // Public Methods
    Modals.ShowModalDialog = function (modalName, modalUrl, modalLinkId) {

        // Test for iframe support (508 Compliance)
        var insertContent = modalName;
        var iframeTest = document.createElement('iframe');
        if (!iframeTest) {
            insertContent = 'This browser doesn\'t seem to support iframes. <a id="' + modalName + 'IframeFail" alt="' + modalName + '" href="' + modalUrl + '">Click here</a> to view page.';
        }

        // Set Current Context as Parent Context of Modal Dialog
        Common.SetStorage('ParentContext', Common.GetStorage('CurrentContext'));

        // Build Modal
        var divOverlay = '<div id="' + modalName + 'Overlay" class="gtc-modal-overlay"></div>';
        var divModal = '<div id="' + modalName + '" class="gtc-modal-container">';
        divModal += '<iframe title="' + modalName + '" name="Iframe' + modalName + '" class="gtc-modal-iframe" id="Iframe' + modalName + '" scrolling="no" height="100%" width="100%">' + insertContent + '</iframe>';
        divModal += '</div>';

        // Insert pinwheel in case modal needs adjustments after showing
        var divPinwheelOverlay = '<div id="PinwheelModalOverlay" class="gtc-pinwheel-overlay gtc-pinwheel-overlay-transparent"></div>';
        Common.InsertHTMLString(document.body, Common.InsertType.Append, divPinwheelOverlay);
        SpinKit.Show(Common.Get('PinwheelModalOverlay'));
        var removeModalPinwheel = function () {
            Velocity(Common.Get('PinwheelModalOverlay'), 'fadeOut', 'slow',
                function () {
                    Common.Remove(this[0]);
                }
            );
        };

        // Attach Modal to DOM
        Common.InsertHTMLString(document.body, Common.InsertType.Append, divOverlay);
        Common.InsertHTMLString(document.body, Common.InsertType.Append, divModal);
        // Cache modal object
        var modalInstance = Common.Get(modalName);

        // Wait for complete modal view loading
        Events.On(document, 'modalviewloadingcomplete', { ModalName: modalName, ModalElement: modalInstance }, OnModalViewLoadingComplete);

        // Initialize modal dialog
        Widgets.modal(modalInstance,
            {
                minHeight: false,
                minWidth: false,
                maxHeight: false,
                maxWidth: false,
                width: false,
                dialogClass: 'gtc-modal-dialog',
                autoOpen: false,
                open: function () {
                    // Add class for screen printing when modal is open
                    Common.AddClass(Common.Get('DivPage'), 'gtc-modal-open');

                    // Hide BackToTop
                    var backToTop = Common.Get('QuickBackToTopDiv');
                    if (Common.IsDefined(backToTop) && Common.IsVisible(backToTop)) {
                        Velocity(backToTop, 'fadeOut', 'slow');
                        Common.SetAttr(backToTop, 'data-modalhidden', 'true');
                    }

                    // Transfer from clicked element to modal
                    setTimeout(
                        function () {
                            Common.Transfer(Common.Get(modalLinkId), Common.Get(modalName), 'gtc-modal-border-transfer gtc-page-theme-border', 700);
                            var lastModalBorder = Common.QueryAll('.gtc-modal-border-transfer');
                            lastModalBorder = lastModalBorder[lastModalBorder.length - 1];
                            if (Common.IsDefined(lastModalBorder)) {
                                Common.AddClass(lastModalBorder, 'gtc-modal-border-transfer-background');
                            }
                        }, 200
                    );
                },
                afterOpen: function () {
                    // Custom event to let anything interested know modal is visible
                    Events.Trigger(document, 'modalvisible');

                    // Remove pinwheel
                    removeModalPinwheel();
                },
                beforeClose: function () {
                    setTimeout(
                        function () {
                            // Transfer from modal to clicked element
                            var modalCache = Common.Get(modalName);
                            var modalLinkCache = Common.Get(modalLinkId);
                            if (Common.IsDefined(modalCache) && Common.IsDefined(modalLinkCache)) {
                                Common.Transfer(modalCache, modalLinkCache, 'gtc-modal-border-transfer gtc-page-theme-border', 700);
                                var lastModalBorder = Common.QueryAll('.gtc-modal-border-transfer');
                                lastModalBorder = lastModalBorder[lastModalBorder.length - 1];
                                if (Common.IsDefined(lastModalBorder)) {
                                    Common.AddClass(lastModalBorder, 'gtc-modal-border-transfer-background');
                                }
                            }
                        }, 1
                    );

                    // Show BackToTop
                    var backToTop = Common.Get('QuickBackToTopDiv');
                    if (Common.IsDefined(backToTop) && Common.IsDefined(Common.GetAttr(backToTop, 'data-modalhidden'))) {
                        Velocity(backToTop, 'fadeIn', 'slow');
                        Common.RemoveAttr(backToTop, 'data-modalhidden');
                    }
                },
                close: function () {
					// Remove any modalvisible events an element may have attached to parent document
					Events.Off(document, 'modalvisible');

                    // Trigger ModalCloseComplete
                    window.parent.Events.Trigger(parent.document, 'modalclosecomplete', { ModalLinkId: modalLinkId });

                    // Remove class for screen printing when modal is open
                    Common.RemoveClass(Common.Get('DivPage'), 'gtc-modal-open');

                    // Cleanup widget. Don't want old elements hanging about
                    var that = this;
                    var modalIFrameCache = Common.Query('.gtc-modal-iframe');
                    var cleanUpModalFunction = function () {
                        if (Common.GetBrowser()[0] == 'IE') {
                            // IE is why we cant have nice things!!! Focus bug fix.
                            modalIFrameCache.src = 'about:blank';
                        }

                        // Empty element
                        if (that.nodeType === 1) {
                            // Get all elements inside element to be removed and clean up their data and events as well
                            // INFO: getElementsByTagName is MUCH faster in this context than querySelectorAll (NodeList - live vs static)
                            Cache.CleanElementData(that.getElementsByTagName('*'));
                        }
                        that.textContent = '';

                        // Cleanup
                        Widgets.modal(that, 'destroy');
                        Common.Remove(Common.Get(modalName));
                        Common.RemoveClass(document.body, 'gtc-body-removescroll');
                        Common.RemoveClass(document.body, 'gtc-body-fullscreen');
                        Common.Remove(Common.Query('.gtc-modal-scrollcontainer'));
                    };
                    var closeModalFirstPromise = Cache.Get(modalIFrameCache, 'CloseModalFirstPromise');
                    if (Common.IsDefined(closeModalFirstPromise)) {
                        Cache.Remove(modalIFrameCache, 'CloseModalFirstPromise');
                        var cleanupModalPromise = Common.Promise();
                        Cache.Set(modalIFrameCache, 'CleanupModalPromise', cleanupModalPromise);
                        cleanupModalPromise.promise.then(
                            function () {
                                cleanUpModalFunction();
                            }
                        );
                        closeModalFirstPromise.resolve();
                    }
                    else {
                        // If a modal and refreshing view dont destroy modal or we lose the timeout context and we have a race condition
                        var onRefreshIgnoreModalDestroy = Cache.Get(modalIFrameCache, 'OnRefreshIgnoreModalDestroy');
                        if (onRefreshIgnoreModalDestroy == true) {
                            Cache.Remove(modalIFrameCache, 'OnRefreshIgnoreModalDestroy');
                        }
                        else {
                            cleanUpModalFunction();
                        }
                    }
                    Common.DetachWindowResizingEvent('onModalResize');
                    Velocity(Common.Get(modalName + 'Overlay'), 'fadeOut', 550,
                        function () {
                            Common.Remove(this[0]);
                        }
                    );
                }
            }
        );

        // Wrap for scrolling
        var wrapper = Common.GenerateHTML('<div class="gtc-modal-scrollcontainer"></div>');
        Common.Wrap(modalInstance.parentNode, wrapper);

        // Cache iFrame
        var iframeCache = Common.Get('Iframe' + modalName);

        // Wait for jquery ui to wrap iframe before giving iframe src url (Can cause multiple server requests if not)
        Common.SetAttr(iframeCache, 'src', modalUrl);

        // On modal load - Update title, calculate size, show, cleanup
        Events.One(iframeCache, 'load',
            function () {
                var modalElement = Common.Get(modalName);

                // Add custom class and close link to title bar
                var modalTitleBar = Common.Query('.gtc-ui-dialog-titlebar', modalElement.parentNode);
                Common.AddClass(modalTitleBar, 'gtc-modal-titlebar');
                Common.InsertHTMLString(modalTitleBar, Common.InsertType.Append, '<a class="gtc-modal-close">Close</a>');
                Events.On(Common.Query('.gtc-modal-close', modalTitleBar), 'click', Modals.AbortModalDialog);

                // Get modal sizes
                var modalBody = Common.Query('body', window.parent.Common.Get('Iframe' + modalName).contentDocument);
                Widgets.modal(modalElement, 'option', { height: 'auto' });

                // Add Modal classing
                Common.AddClass(modalBody, 'gtc-modal-body');

                // Show modal overlay
                Velocity(Common.Get(modalName + 'Overlay'), { opacity: .5 }, { duration: 'slow', display: 'block',
                    complete: function () {
                        Common.AddClass(window.parent.document.body, 'gtc-body-removescroll');
                        Common.AddClass(window.parent.document.body, 'gtc-body-fullscreen');
                        var scrollContainerStyle = Common.Query('.gtc-modal-scrollcontainer', window.parent.document).style;
                        scrollContainerStyle.overflowX = 'hidden';
                        scrollContainerStyle.overflowY = 'scroll';
                    }
                });
            }
        );

    };

    Modals.DetermineModalDialogWidth = function (modalBody) {

        // Initialize
        var className = 'gtc-modal-medium';

        // Find Rich Text Editors
        var richTextEditor = Common.QueryAll('.gtc-editor-container', modalBody);
        if (richTextEditor.length > 0) {
            className = 'gtc-modal-large';
            return className;
        }

        // Find Fieldsets
        var allFieldSets = Common.QueryAll('.gtc-fieldset', modalBody);
        var fieldSets = Common.FilterElementArray(fieldSets, '.gtc-fieldset:not(.gtc-fieldset-long)');
        if (fieldSets.length == 1) {
            className = 'gtc-modal-small';
        }
        else if (fieldSets.length == 2) {
            className = 'gtc-modal-medium';
        }
        else if (fieldSets.length > 2) {
            // If more than 2 set large and return. No need to check anything else.
            className = 'gtc-modal-large';
            return className;
        }

        // Find Other FieldSet Types
        var longFieldSets = Common.FilterElementArray(fieldSets, '.gtc-fieldset-long');
        if (longFieldSets.length > 0) {
            className = 'gtc-modal-medium';
        }

        // Find CoupledFieldSets
        var coupledFieldSets = Common.QueryAll('.gtc-coupledfieldset', modalBody);
        if (coupledFieldSets.length > 0) {
            // If at least 1 set large and return. No need to check anything else.
            className = 'gtc-modal-large';
            return className;
        }

        // Find MultiSelect Panels and Display Panels
        var displayPanels = Common.QueryAll('.gtc-displaypanel', modalBody);
        var multiSelectPanels = Common.QueryAll('.gtc-multiselectpanel', modalBody);
        if (displayPanels.length > 0 || multiSelectPanels.length > 0) {
            className = 'gtc-modal-medium';
        }

        // Find MultiSelect Details and Display Details
        var displayDetails = Common.QueryAll('.gtc-displaydetail', modalBody);
        var multiSelectDetails = Common.QueryAll('.gtc-multiselectdetail', modalBody);
        if (displayDetails.length > 0 || multiSelectDetails.length > 0) {
            className = 'gtc-modal-medium';
        }

        // Find Progress Polls and Progress Bars
        var progressPoll = Common.QueryAll('.gtc-progresspoll', modalBody);
        var progressBar = Common.QueryAll('.gtc-progressbar', modalBody);
        if (progressPoll.length > 0) {
            className = 'gtc-modal-medium';
        }
        else if (progressBar.length > 0 && className != 'gtc-modal-medium') {
            className = 'gtc-modal-small';
        }

        // Find Tab Header
        var tabHeader = Common.QueryAll('.gtc-tabheader', modalBody);
        if (tabHeader.length > 0) {
            // Find Tab Buttons
            var tabButtons = Common.QueryAll('.gtc-tabbutton', modalBody);
            if (tabButtons.length > 3) {
                // If 4 or more set large and return. No need to check anything else.
                className = 'gtc-modal-large';
                return className;
            }
            else {
                className = 'gtc-modal-medium';
            }
        }

        // Find Card Panels
        var cardPanel = Common.QueryAll('.gtc-card-panel', modalBody);
        if (cardPanel.length > 0) {
            className = 'gtc-modal-medium';
        }

        // Find Drag Drop Panels
        var dragDropPanels = Common.QueryAll('.gtc-dragdroppanel', modalBody);
        if (dragDropPanels.length > 0) {
            var isLarge = false, dragDropPanel, index = 0, length = dragDropPanel.length;
            for ( ; index < length; index++) {
                dragDropPanel = dragDropPanels[index];
                if (Common.HasClass(dragDropPanel, 'gtc-dragdroppanel-inline')) {
                    // If drag drop set large and return. No need to check anything else.
                    className = 'gtc-modal-large';
                    isLarge = true;
                    break;
                }
            }
            if (isLarge) {
                return className;
            }
            else {
                className = 'gtc-modal-medium';
            }
        }

        // Find Rearrange Panels
        var rearrangePanel = Common.QueryAll('.gtc-rearrangepanel', modalBody);
        if (rearrangePanel.length > 0) {
            className = 'gtc-modal-medium';
        }

        // Find Trees
        var trees = Common.QueryAll('.gtc-tree-container', modalBody);
        if (trees.length > 0) {
            // TODO: Determine if user defined styling is being added (Dimension)
            className = 'gtc-modal-medium';
        }

        // Find Display Areas
        var displayAreas = Common.QueryAll('.gtc-displayarea', modalBody);
        if (displayAreas.length > 0) {
            // TODO: Determine if user defined styling is being added (Dimension, Padding, Margins)
            className = 'gtc-modal-medium';
        }

        // Find Document Displays
        var documentDisplays = Common.QueryAll('.gtc-documentdisplay', modalBody);
        if (documentDisplays.length > 0) {
            className = 'gtc-modal-large';
        }

        // Find Document Scans
        var documentScans = Common.QueryAll('.gtc-documentscan', modalBody);
        if (documentScans.length > 0) {
            className = 'gtc-modal-large';
        }

        // File Downloads
        var fileDownloads = Common.QueryAll('.gtc-filedownload', modalBody);
        if (fileDownloads.length > 0) {
            className = 'gtc-modal-large';
        }

        // Return class
        return className;

    };

    Modals.AbortModalDialog = function () {

        var modalIFrame = Common.Query('.gtc-modal-iframe', null, true);
        var closeButtons = Common.QueryAllVisible('.gtc-btn-closebutton', modalIFrame.contentWindow.document.body);
        if (closeButtons.length > 0) {
            GTC.TriggerEvent(closeButtons[0], 'click');
        }
        else {
            Modals.CloseModalDialog();
        }

    };

    Modals.CloseModalDialog = function () {

        // Set Current Context from Parent Context
        Common.SetStorage('CurrentContext', Common.GetStorage('ParentContext'));
        Common.RemoveStorage('ParentContext');

        // Close Modal
        window.parent.Widgets.modal(Common.Closest('.gtc-modal-container', Common.Query('.gtc-modal-iframe', null, true)), 'close');

    };

    Modals.CenterHiddenDiv = function (element) {

        var parentWindow = window.parent;
        var elementStyle = element.style;
        elementStyle.visibility = 'hidden';
        elementStyle.display = 'block';
        var newTop = (Common.Height(parentWindow) - Common.Height(element)) / 2;
        var newLeft = (Common.Width(parentWindow) - Common.Width(element)) / 2;
        elementStyle.top = newTop + 'px';
        elementStyle.left = newLeft + 'px';
        elementStyle.display = 'none';
        elementStyle.visibility = '';

    };

    Modals.ShowModalMessageDialog = function (messageType, messageTitle, messageBody, modalCallback) {

        var message = {
            Type: messageType,
            Title: messageTitle,
            Body: messageBody
        };
        Modals.ShowMessageDialog(message, modalCallback);

    };

    Modals.ShowMessageDialog = function (confirmationMessage, callbackFunction) {

        if (modalMessagePopupExists == false) {
            modalMessagePopupExists = true;

            // Get parent context
            var context = window.parent;

            // Create array to track DOMs that need tab handling
            var documents = [top.document];

            // Check for modal and add to array and remove events
            var iFrame = Common.Query('.gtc-modal-iframe', top.document);
            if (Common.IsDefined(iFrame)) {
                documents.push(iFrame.contentDocument);
                RemoveModalTabbingEvents(iFrame);
            }

            // Handle tabbing
            Events.On(documents, 'keydown.ConfirmationTabbing',
                function (event) {
                    // Are we tabbing?
                    if (event.keyCode !== GTC.Keyboard.Tab) {
                        return;
                    }

                    // Get confirmation popup buttons
                    var confirmationButtons = context.Common.QueryAll('.gtc-modal-message-btn');
                    var length = confirmationButtons.length;
                    if (length > 0) {
                        if (length == 1) {
                            confirmationButtons[0].focus();
                        }
                        else {
                            if (context.document.activeElement == confirmationButtons[0]) {
                                confirmationButtons[1].focus();
                            }
                            else {
                                confirmationButtons[0].focus();
                            }
                        }
                        event.preventDefault();
                    }
                }
            );

            // Build Modal
            var divModalOverlay = '<div id="ModalMessagePopupOverlay" class="gtc-modal-overlay gtc-modal-overlay-message"></div>';
            var divMessageModal = '<div role="dialog" id="ModalMessagePopup" class="gtc-modal-message"><span class="gtc-sr-only" data-translate="BeginningOfContent508">' + Common.TranslateKey('BeginningOfContent508', context) + '</span>';
            divMessageModal += '<a class="gtc-modal-close"></a><div class="gtc-modal-';
            switch (confirmationMessage.Type) {
                case Modals.ModalTypes.Confirmation:
                    divMessageModal += 'confirmation';
                    break;
                case Modals.ModalTypes.Error:
                    divMessageModal += 'error';
                    break;
                case Modals.ModalTypes.Warning:
                    divMessageModal += 'warning';
                    break;
                case Modals.ModalTypes.Success:
                    divMessageModal += 'check';
                    break;
                default:
                    divMessageModal += 'systemerror';
                    break;
            }
            divMessageModal += '-image"></div>';

            // Set up Title, Body and Buttons (if NOT System Error)
            if (confirmationMessage.Type >= 0) {
                divMessageModal += '<div><span><strong>' + Common.TranslateKey(confirmationMessage.Title, context) + '</strong><br/><br/>' + Common.TranslateKey(confirmationMessage.Body, context) + '</span>';
                if (confirmationMessage.Type == Modals.ModalTypes.Confirmation) {
                    divMessageModal += '<a tabindex="0" class="gtc-btn gtc-btn--size-default gtc-modal-message-btn gtc-btn--basic-active" id="ModalMessageYesButton" data-modalresult="' + Modals.ModalResult.Yes + '">' + Common.TranslateKey('Yes', context) + '</a>';
                    divMessageModal += '<a tabindex="0" class="gtc-btn gtc-btn--size-default gtc-modal-message-btn gtc-btn--basic-passive" id="ModalMessageNoButton" data-modalresult="' + Modals.ModalResult.No + '">' + Common.TranslateKey('No', context) + '</a>';
                }
                else {
                    divMessageModal += '<a tabindex="0" class="gtc-btn gtc-btn--size-default gtc-modal-message-btn gtc-btn--basic-active" id="ModalMessageOkButton" data-modalresult="' + Modals.ModalResult.Ok + '">' + Common.TranslateKey('OK', context) + '</a>';
                }
                divMessageModal += '</div>';
            }
            divMessageModal += '<span class="gtc-sr-only" data-translate="EndOfContent508">' + Common.TranslateKey('EndOfContent508', context) + '</span></div>';

            // Add Modal to Body
            var parentBody = context.document.body;
            Common.InsertHTMLString(parentBody, Common.InsertType.Append, divModalOverlay);
            Common.InsertHTMLString(parentBody, Common.InsertType.Append, divMessageModal);

            // Compensate for scroll
            var modalMessagePopup = context.Common.Get('ModalMessagePopup');
            var messageStyle = modalMessagePopup.style;
            messageStyle.visibility = 'hidden';
            messageStyle.display = 'block';
            var scrollTop = ((Common.Height(context) / 2) - (Common.Height(modalMessagePopup) / 2)) + context.pageYOffset;
            messageStyle.visibility = '';
            messageStyle.display = '';
            messageStyle.top = scrollTop + 'px';

            // Setup Button (if NOT System Error)
            if (confirmationMessage.Type >= 0) {
                context.Widgets.uibutton(context.Common.QueryAll('.gtc-modal-message-btn'));
            }

            // Show Modal
            Velocity(context.Common.Get('ModalMessagePopupOverlay'), { opacity: .5 }, { duration: 'slow', display: 'block' });
            Velocity(modalMessagePopup, 'fadeIn', 'slow');

            // Handle Close Click
            context.Events.On(context.Common.QueryAll('.gtc-modal-close, .gtc-modal-message-btn'), 'click',
                function (event) {
                    var modalResult = Common.GetAttr(this, 'data-modalresult');
                    Velocity(modalMessagePopup, 'fadeOut', 'slow',
                        function () {
                            Common.Remove(modalMessagePopup);

                            // Remove tabbing events
                            Events.Off(documents, 'keydown.ConfirmationTabbing');

                            // If modal exists put tabbing back the way it was
                            if (Common.IsDefined(iFrame)) {
                                iFrame.contentWindow.focus();
                                AttachModalTabbingEvents(iFrame);
                            }

                            // Release semaphore
                            modalMessagePopupExists = false;
                        }
                    );
                    Velocity(Common.Get('ModalMessagePopupOverlay', true), 'fadeOut', 'slow',
                        function () {
                            Common.Remove(this[0]);
                        }
                    );
                    if (Common.IsFunction(callbackFunction)) {
                        callbackFunction(modalResult);
                    }
                }
            );
        }

    };

    Modals.ShowModalErrorDialog = function (xhrResponse) {

        // Remove any pinwheels being displayed
        Common.Remove(Common.QueryAll('.gtc-spinkit, .gtc-pinwheel-overlay', null, true));
        Common.Remove(Common.QueryAll('.gtc-spinkit, .gtc-pinwheel-overlay'));

        // Convert to JSON
        var errorObject = JSON.parse(xhrResponse);

        // Build Modal
        var divErrorOverlay = '<div id="ErrorModalOverlay" class="gtc-modal-overlay gtc-modal-overlay-error" style="display:block;"></div>';
        var divErrorModal = '<div role="dialog" id="ErrorModal" class="gtc-modal-error"><span class="gtc-sr-only" data-translate="BeginningOfContent508">BeginningOfContent508</span>';
        divErrorModal += '<a class="gtc-modal-close"></a>';
        divErrorModal += '<div class="gtc-modal-error-image"><img data-translate="[alt]SystemError" alt="SystemError" src="/Content/thirdParty/' + Common.GetAttr(document.body, 'data-group') + '/skins/' + Common.GetAttr(document.body, 'data-theme').toLowerCase() + '/images/BackgroundSadCloud.png" /></div>';

        // Parse Error Objects
        var firstErrorObject;
        var stackTrace = '<div id="StackTraceDiv" class="gtc-modal-error-details" style="height: 0px;"><code class="gtc-modal-error-stacktrace"><pre>';
        if(Common.IsDefined(errorObject.ErrorDisplayDetails)){
            var object, index = 0, length = errorObject.ErrorDisplayDetails.length;
            for ( ; index < length; index++) {
                object = errorObject.ErrorDisplayDetails[index];
                if (index == 0) {
                    firstErrorObject = object;
                }
                stackTrace += '<strong>[' + object.Name + ': ' + object.Message + ']</strong>\r\n' + object.StackTrace + '\r\n\r\n';
            }
        }
        stackTrace += '</pre></code></div>';
        divErrorModal += '<div class="gtc-modal-error-message"><h1 data-translate="SystemError">SystemError</h1>';
        divErrorModal += '<h2 data-translate="PleaseSpeakToYourSystemAdministrator">PleaseSpeakToYourSystemAdministrator</h2>';
        if(Common.IsDefined(firstErrorObject)){
            divErrorModal += '<h3>' + firstErrorObject.Message + '</h3>';
            if(Common.IsDefined(firstErrorObject.FullName)){
                divErrorModal += '<p><span data-translate="ExceptionDetails">ExceptionDetails</span>' + firstErrorObject.FullName + ': ' + firstErrorObject.Message + '</p>';
                divErrorModal += '<a id="StackTraceAnchor" class="gtc-btn gtc-btn--size-default gtc-btn--basic-passive"><i class="gtc-icon-styles fa fa-code"></i><span data-translate="Details">Details</span></a>';
                divErrorModal += '</div>' + stackTrace + '<span class="gtc-sr-only" data-translate="EndOfContent508">EndOfContent508</span>';
            }
        }
        divErrorModal += '</div>';

        // Translate Page
        Common.TranslatePage(false);

        // Show Modal
        var parentBody = window.parent.document.body;
        Common.InsertHTMLString(parentBody, Common.InsertType.Append, divErrorOverlay);
        Common.InsertHTMLString(parentBody, Common.InsertType.Append, divErrorModal);

        // Compensate for scroll
        var parentWindow = window.parent;
        var modalErrorPopup = Common.Get('ErrorModal', true);
        var modalErrorStyle = modalErrorPopup.style;
        modalErrorStyle.visibility = 'hidden';
        modalErrorStyle.display = 'block';
        modalErrorStyle.height = '100%';
        var fullScreenSize = Common.Height(modalErrorPopup, true) - 20;
        modalErrorStyle.height = '';
        var scrollTop = ((Common.Height(parentWindow) / 2) - (Common.Height(modalErrorPopup) / 2)) + parentWindow.pageYOffset;
        modalErrorStyle.visibility = '';
        modalErrorStyle.display = '';
        modalErrorStyle.top = scrollTop + 'px';

        // Show Stack trace
        var originalErrorSize = Common.Height(modalErrorPopup, true);
        var originalTop = Common.GetStyle(modalErrorPopup, 'top');
        var paddingBottom = parseInt(Common.GetStyle(modalErrorPopup, 'paddingBottom').replace('px', ''), 10);
        var stackTraceAnchor = Common.Get('StackTraceAnchor', true);
        if(Common.IsDefined(stackTraceAnchor)){
            Events.On(Common.Get('StackTraceAnchor', true), 'click',
                function () {
                    var stackTraceDiv = Common.Get('StackTraceDiv', true);
                    if (Common.HasClass(stackTraceDiv, 'open')) {
                        Velocity(modalErrorPopup, { 'top': originalTop, 'height': originalErrorSize + 'px' });
                        Common.RemoveClass(stackTraceDiv, 'open');
                        Velocity(stackTraceDiv, { 'height': '0' });
                    }
                    else {
                        var imageSize = Common.Height(Common.Query('.gtc-modal-error-image', modalErrorPopup), true) + 20;
                        var messageSize = Common.Height(Common.Query('.gtc-modal-error-message', modalErrorPopup), true) + 20;
                        var largerSize = (imageSize >= messageSize) ? imageSize : messageSize;
                        Velocity(modalErrorPopup, { 'top': parentWindow.pageYOffset + 10 + 'px', 'height': fullScreenSize + 'px' });
                        Common.AddClass(stackTraceDiv, 'open');
                        var newHeight = fullScreenSize - largerSize - paddingBottom;
                        Velocity(stackTraceDiv, { 'height': newHeight + 'px' });
                    }
                }
            );
        }

        // Handle resize
        var onResizeEndFunction = function (event) {
            // Recalculate all values for proper sizing on screen window change
            var stackTraceDiv = Common.Get('StackTraceDiv', true);
            Common.RemoveClass(stackTraceDiv, 'open');
            stackTraceDiv.style.height = '0px';
            Common.RemoveAttr(modalErrorPopup, 'style');
            var modalErrorStyle = modalErrorPopup.style;
            modalErrorStyle.visibility = 'hidden';
            modalErrorStyle.display = 'block';
            modalErrorStyle.height = '100%';
            fullScreenSize = Common.Height(modalErrorPopup, true) - 20;
            modalErrorStyle.height = '';
            var scrollTop = ((Common.Height(parentWindow) / 2) - (Common.Height(modalErrorPopup) / 2)) + parentWindow.pageYOffset;
            modalErrorStyle.visibility = '';
            modalErrorStyle.display = '';
            modalErrorStyle.top = scrollTop + 'px';
            originalErrorSize = Common.Height(modalErrorPopup, true);
            originalTop = Common.GetStyle(modalErrorPopup, 'top');
        };
        Common.AttachWindowResizingEvent(onResizeEndFunction, 'onErrorModalResize');

        // Handle Close Click
        Events.On(Common.Query('.gtc-modal-close', modalErrorPopup), 'click',
            function () {
                Common.DetachWindowResizingEvent('onErrorModalResize');
                Common.Remove(modalErrorPopup);
                Common.Remove(Common.Get('ErrorModalOverlay', true));
            }
        );

    };

    Modals.ShowExceptionDialog = function (xhr) {

        // Parse response
        var response = null;
        if (Common.IsDefined(xhr.response)) {
            response = JSON.parse(xhr.response);
        }

        // Build Modal
        var divModalOverlay = '<div id="ModalExceptionDialogOverlay" class="gtc-modal-overlay gtc-modal-overlay-error"></div>';
        var divMessageModal = '<div role="dialog" id="ModalExceptionDialog" class="gtc-modal-exceptiondialog"><span class="gtc-sr-only" data-translate="BeginningOfContent508">' + Common.TranslateKey('BeginningOfContent508') + '</span>';
        divMessageModal += '<a id="ModalExceptionDialogCloseButton" class="gtc-modal-close"></a>';

        // Set up Title, Body and Buttons
        if (xhr.status == Modals.ErrorCodes.AuthorizationError) {
            divMessageModal += '<div class="gtc-modal-exceptiondialog-permissiondenied"><span data-translate="PermissionDenied" class="gtc-sr-only">' + Common.TranslateKey('PermissionDenied') + '</span></div>';
            if (Common.IsDefined(response) && response.LoadPreviousPage == 'Yes') {
                divMessageModal += '<a class="gtc-btn gtc-btn--size-default gtc-modal-exceptiondialog-btn gtc-btn--basic-active" id="ModalExceptionDialogBackButton">Back</a>';
            }
            divMessageModal += '<a class="gtc-btn gtc-btn--size-default gtc-modal-exceptiondialog-btn gtc-btn--basic-passive" id="ModalExceptionDialogLogoutButton">Logout</a>';
        }
        else if (xhr.status == Modals.ErrorCodes.ConcurrencyError) {
            divMessageModal += '<div class="gtc-modal-exceptiondialog-concurrencyerror"><span data-translate="ConcurrencyError" class="gtc-sr-only">' + Common.TranslateKey('ConcurrencyError') + '</span></div>';
            divMessageModal += '<a class="gtc-btn gtc-btn--size-default gtc-modal-exceptiondialog-btn gtc-btn--basic-active" id="ModalExceptionDialogReloadButton">Reload</a>';
        }
        else if (xhr.status == Modals.ErrorCodes.SessionExpirationError) {
            divMessageModal += '<div class="gtc-modal-exceptiondialog-sessionexpired"><span data-translate="SessionExpired" class="gtc-sr-only">' + Common.TranslateKey('SessionExpired') + '</span></div>';
            divMessageModal += '<a class="gtc-btn gtc-btn--size-default gtc-modal-exceptiondialog-btn gtc-btn--basic-active" id="ModalExceptionDialogLoginButton">Login</a>';
            Common.ClearSessionToken();
        }
        divMessageModal += '<span class="gtc-sr-only" data-translate="EndOfContent508">' + Common.TranslateKey('EndOfContent508') + '</span></div>';

        // Add Modal to Body
        var parentBody = window.parent.document.body;
        Common.InsertHTMLString(parentBody, Common.InsertType.Append, divModalOverlay);
        Common.InsertHTMLString(parentBody, Common.InsertType.Append, divMessageModal);

        // Setup Button
        Widgets.uibutton(Common.QueryAll('.gtc-modal-exceptiondialog-btn'));

        // Center
        var modalExceptionDialog = Common.Get('ModalExceptionDialog', true);
        var modalExceptionDialogOverlay = Common.Get('ModalExceptionDialogOverlay', true);
        Modals.CenterHiddenDiv(modalExceptionDialog);

        // Show Modal
        Velocity(modalExceptionDialogOverlay, { opacity: .5 }, { duration: 'slow', display: 'block' });
        Velocity(modalExceptionDialog, 'fadeIn', 'slow');

        // Remove any pinwheels being displayed
        Common.Remove(Common.QueryAll('.gtc-spinkit, .gtc-pinwheel-overlay', null, true));
        Common.Remove(Common.QueryAll('.gtc-spinkit, .gtc-pinwheel-overlay'));

        // Handle Close Click
        Events.On(Common.QueryAll('.gtc-modal-exceptiondialog-btn, .gtc-modal-close', modalExceptionDialog), 'click',
            function (event) {
                var buttonId = this.id;
                Velocity(modalExceptionDialog, 'fadeOut', 'slow',
                    function () {
                        var timeoutRedirect;
                        switch (buttonId) {
                            case 'ModalExceptionDialogBackButton':
                                Common.CloseRefreshView();
                                break;
                            case 'ModalExceptionDialogReloadButton':
                                Common.RefreshView();
                                break;
                            case 'ModalExceptionDialogCloseButton':
                                if (xhr.status == Modals.ErrorCodes.AuthorizationError) {
                                    if (Common.IsDefined(response) && response.LoadPreviousPage == 'Yes') {
                                        Common.CloseRefreshView();
                                    }
                                }
                                else if (xhr.status == Modals.ErrorCodes.ConcurrencyError) {
                                    Common.RefreshView();
                                }
                                else {
                                    Common.ClearStorage();
                                    if (Common.IsDefined(response) && Common.IsNotEmptyString(response.TimeoutRedirect)) {
                                        timeoutRedirect = response.TimeoutRedirect;
                                        if (Common.IsDefined(timeoutRedirect)) {
                                            window.parent.location.href = timeoutRedirect;
                                        }
                                    }
                                }
                                break;
                            case 'ModalExceptionDialogLogoutButton':
                            case 'ModalExceptionDialogLoginButton':
                                Common.ClearStorage();
                                if (Common.IsDefined(response) && Common.IsNotEmptyString(response.TimeoutRedirect)) {
                                    timeoutRedirect = response.TimeoutRedirect;
                                    if (Common.IsDefined(timeoutRedirect)) {
                                        window.parent.location.href = timeoutRedirect;
                                    }
                                }
                                break;
                        }
                        Common.Remove(modalExceptionDialog);
                    }
                );
                Velocity(modalExceptionDialogOverlay, 'fadeOut', 'slow',
                    function () {
                        Common.Remove(modalExceptionDialogOverlay);
                    }
                );
            }
        );

    };

    // Private Methods
    function ResizeModal (modalName, centerModal, animateResizing, callBackFunction) {

        // Initialize
        var addedPinwheel = false;
        if (window.parent.Common.QueryAll('.gtc-spinkit').length == 0) {
            Common.ShowPinwheel(null, false, true);
            addedPinwheel = true;
        }
        var centeringStep = null;

        // Get deferred object for callback promise
        var callbackPromise = Common.Promise();

        // Get modal, body and sizes, add class to stop something else from resizing modal
        var modal = window.parent.Common.Get(modalName);
        if (Common.IsNotDefined(modal)) {
            return;
        }
        var modalScroll = Common.Closest('.gtc-modal-scrollcontainer', modal);
        var modalIframe = Common.Query('.gtc-modal-iframe', modal);
        var modalBody = Common.Query('body', modalIframe.contentDocument);
        Common.AddClass(modalBody, 'gtc-modal-resizing');
        var displayCache = '';
        var modalParent = modal.parentNode;
        var modalParentStyle = modalParent.style;
        if (animateResizing != true) {
            displayCache = Common.GetStyle(modalParent, 'display');
            modalParentStyle.zIndex = '-1000';
            modalParentStyle.display = 'block';
        }

        // TODO: Do we need to include titlebar height?
        var newHeight = Common.Height(modalBody, true);

        // Handle modals that need scrolling
        var positionObject = { my: 'center', at: 'center', of: modalScroll };
        if (newHeight > Common.Height(window)) {
            positionObject = { my: 'top', at: 'top', of: modalScroll };
        }
        else {
            var documentDisplay = Common.Query('.gtc-documentdisplay', modalBody);
            if (Common.IsDefined(documentDisplay)) {
                positionObject = { my: 'top', at: 'top', of: modalScroll };
                var documentHeight = Common.GetAttr(documentDisplay, 'data-height');
                if (Common.IsDefined(documentHeight)) {
                    // TODO: Add em, pt and % conversions
                    newHeight += parseInt(documentHeight, 10) + 200;
                }
                else {
                    newHeight += Common.Height(parent.window) + 200;
                }
            }
        }

        if (animateResizing == true) {
            // Add centering step function if needed
            if (centerModal == true) {
                centeringStep = function () {
                    Widgets.modal(modal, 'option', 'position', positionObject);
                };
            }

            // Start modal animations
            Velocity(modal,
                {
                    height: newHeight
                },
                250,
                function () {
                    Common.RemoveClass(modalBody, 'gtc-modal-resizing');
                    if (addedPinwheel) {
                        Common.HidePinwheel();
                    }
                    callbackPromise.resolve();
                }
            );

            // Start dialog widget animations
            Velocity(Widgets.modal(modal, 'widget'),
                {
                    height: newHeight
                },
                {
                    duration: 250,
                    progress: centeringStep
                }
            );
        }
        else {
            // Update new modal sizes
            modal.style.height = newHeight + 'px';

            // Create dialog options
            var dialogOptions = {
                height: newHeight
            };

            // Add centering if modal centering is needed
            if (centerModal == true) {
                dialogOptions.position = positionObject;
            }

            // Update modal
            Widgets.modal(modal, 'option', dialogOptions);

            // Resolve promise
            callbackPromise.resolve();
            Common.RemoveClass(modalBody, 'gtc-modal-resizing');
            if (addedPinwheel) {
                Common.HidePinwheel();
            }
        }

        // If callback exists, call after animations are done
        if (Common.IsFunction(callBackFunction)) {
            callbackPromise.promise.then(
                function () {
                    callBackFunction();
                }
            );
        }
        if (animateResizing != true) {
            modalParentStyle.display = displayCache;
            modalParentStyle.zIndex = '';
        }

    };

    function AttachModalTabbingEvents (iFrame) {

        // Stop tabbing from leaving modal
        Events.On(Common.Query('.gtc-modal-overlay', top.document), 'click.ModalTabbing focus.ModalTabbing focusin.ModalTabbing',
            function (event) {
                iFrame.focus();
                event.preventDefault();
                event.stopPropagation();
            }
        );
        Events.On(iFrame.contentDocument, 'keydown.ModalTabbing',
            function (event) {
                // Stop modals from tabbing out of themselves

                // Are we tabbing?
                if (event.keyCode !== GTC.Keyboard.Tab) {
                    return;
                }

                // Find all elements in modal
                var allBody = Common.QueryAll('*:not(#SkipToMainContent508)', this);

                // For each element, is it tabbable and find lowest and highest tabIndex in all elements
                var tabbables = [], tabbable, lowest, highest, index = 0, length = allBody.length;
                for ( ; index < length; index++) {
                    tabbable = allBody[index];
                    if (Common.IsTabbable(tabbable)) {
                        tabbables.push(tabbable);
                        if (tabbable.tabIndex > 0) {
                            if (Common.IsNotDefined(lowest) || lowest.tabIndex > tabbable.tabIndex) {
                                lowest = tabbable;
                            }
                            if (Common.IsNotDefined(highest) || highest.tabIndex < tabbable.tabIndex) {
                                highest = tabbable;
                            }
                        }
                    }
                }

                // Find first and last elements in document flow
                var first = tabbables[0];
                var last = tabbables[tabbables.length - 1];

                // Find if first and last was defined with tabIndex and does not match document flow
                if (Common.IsDefined(lowest) && first != lowest) {
                    first = lowest;
                }
                if (Common.IsDefined(highest) && last != highest) {
                    last = highest;
                }

                // Determine direction of tabbing and if it needs to set focus
                if (event.target === last && !event.shiftKey) {
                    first.focus();
                    event.preventDefault();
                }
                else if (event.target === first && event.shiftKey) {
                    last.focus();
                    event.preventDefault();
                }
            }
        );

    };

    function RemoveModalTabbingEvents (iFrame) {

        Events.Off(Common.Query('.gtc-modal-overlay', top.document), 'click.ModalTabbing focus.ModalTabbing focusin.ModalTabbing');
        Events.Off(iFrame.contentDocument, 'keydown.ModalTabbing');

    };

    function OnModalViewLoadingComplete (event) {
        Events.Off(document, 'modalviewloadingcomplete');

        // Determine if we should force modal width
        var modalBody = Common.Query('body', window.parent.Common.Get('Iframe' + event.data.ModalName).contentDocument);
        if (!Common.CheckMedia('Mobile')) {
            var modalSizeOverride = Common.GetAttr(modalBody, 'data-modalsize');
            if (Common.IsDefined(modalSizeOverride) && modalSizeOverride.toLowerCase() != 'auto') {
                Common.AddClass(event.data.ModalElement.parentNode, 'gtc-modal-' + modalSizeOverride.toLowerCase());
            }
            else {
                var modalSizingClass = Modals.DetermineModalDialogWidth(modalBody);
                Common.AddClass(event.data.ModalElement.parentNode, modalSizingClass);
            }
        }

        // Find real height (For now cant find a better way than timeout)
        setTimeout(
            function () {
                var iFrame = Common.Query('.gtc-modal-iframe', top.document);
                ResizeModal(event.data.ModalName, true, false, null);

                // Setup Animated resize event
                Events.On(iFrame, 'resizemodal',
                    function () {
                        ResizeModal(event.data.ModalName, true, true, null);
                    }
                );

                // Stop tabbing from leaving modal
                AttachModalTabbingEvents(iFrame);

                // Show modal
                Widgets.modal(event.data.ModalElement, 'open');

                var onResizeEndFunction = function (resizeEndEvent) {
                    ResizeModal(resizeEndEvent.data.ModalName, true, false, null);
                    if (resizeEndEvent.data.ModalElement && resizeEndEvent.data.ModalElement.parentNode) {
                        resizeEndEvent.data.ModalElement.parentNode.style.display = 'block';
                    }
                };
                Common.AttachWindowResizingEvent(onResizeEndFunction, 'onModalResize', { ModalName: event.data.ModalName, ModalElement: event.data.ModalElement });
            }, 100
        );
    };

} (window.Modals = window.Modals || {}, window, document, Common, Cache, Events, Velocity));

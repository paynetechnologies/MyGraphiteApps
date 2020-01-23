// Page
(function (Page, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Variables
    Page.Images = 0;
    Page.LoadedImages = 0;

    // Private Variables
    var isSetEnvironmentRunning = false;

    // Public Methods : Page Setup
    Page.Setup = function (pageName, isFirstPage) {

        // First Page?
        if (isFirstPage) {
            // Get Theme, SpinKit and Language
            var theme = Common.GetAttr(document.body, 'data-theme');
            var language = Common.GetLanguage();
            var spinKit = SpinKit.Setup();

            // Clear Session Data
            Common.ClearStorage();

            // Reset Theme, Language, SpinKit and SessionToken
            Common.SetStorage('CurrentTheme', theme);
            Common.SetStorage('CurrentLanguage', language);
            Common.SetStorage("CurrentSpinKit", spinKit);
            Common.SetSessionToken(null);
        }

        // Set Context
        Common.SetStorage('CurrentContext', pageName);

        // Handle QueryString Parameters - from a permalink?
        if (QueryString.ParametersExist()) {
            QueryString.CreateOnLoadParameters(pageName);
        }

        // Get OnLoad
        var onLoadParameters = JSON.parse(Common.GetStorage(pageName));
        if (Common.IsNotDefined(onLoadParameters)) {
            Common.SetStorage(pageName, null);
        }

        // Execute View Behavior
        Common.ExecuteViewBehavior('/' + pageName + '/OnLoadView', onLoadParameters, ProcessOnLoadView);

    };

    Page.Render = function (page) {

        // Set and Translate Title
        var pageTitle = Common.TranslateKey(page.Title) || '';
        document.title = pageTitle;
        Common.SetAttr(document.getElementsByTagName('title')[0], 'data-translate', pageTitle);

        // Light or dark color?
        var addClass = '';
        if (Common.IsDefined(page.Color)) {
            addClass = Colors.IsDarkColor(page.Color) ? ' gtc-theme-dark' : ' gtc-theme-light';
        }

        // Initialize
        var pageMarkup = '<div class="gtc-page' + addClass + '" id="DivPage" data-namespace="Page" data-istransparent="';
        if (page.IsTransparent == 'Yes') {
            pageMarkup += 'true">';
        }
        else {
            pageMarkup += 'false">';
        }

        // Page theme classes
        if (Common.IsDefined(page.Color)) {
            RenderThemeClasses(page);
        }

        // Header
        if (Common.IsDefined(page.Header)) {
            pageMarkup += Header.Render(page.Header);
        }

        // Content
        if (Common.IsDefined(page.Content)) {
            pageMarkup += Content.Render(page.Content, page.Region);
        }

        // Footer
        if (Common.IsDefined(page.Footer)) {
            pageMarkup += Footer.Render(page.Footer);
        }

        // Slide Panel
        if (Common.IsDefined(window['SlidePanel']) && SlidePanel.Markup.length > 0) {
            var index = 0, length = SlidePanel.Markup.length;
            for ( ; index < length; index++) {
                pageMarkup += SlidePanel.Markup[index];
            }
        }

        // Div</>
        pageMarkup += '</div>';
        return pageMarkup;

    };

    Page.Configure = function (page, configureStage) {

        // Configure Elements with data-configure
        var viewElements = Common.QueryAll('[data-configure="' + configureStage + '"]');
        if (viewElements.length > 0) {
            var viewElement, index = 0, length = viewElements.length;
            for ( ; index < length; index++) {
                viewElement = viewElements[index];
                var namespace = window[Common.GetAttr(viewElement, 'data-namespace')];
                namespace.Configure(viewElement);
            }
        }

        // Special Configuration (Pre Translations)
        if (configureStage == 'Pre') {
            // Labels
            ConfigureLabelFocus(page);

            // Tooltips
            ConfigureTooltips(page);
            if (!Common.IsModal()) {
                // When not modal attach event to reconfigure tooltips on parent from page instructions
                Events.On(document.body, 'reconfiguretooltipsfrommodal',
                    function () {
                        ConfigureTooltips(page);
                    }
                );
            }

            // Trigger Additional Configuration
            TriggerAdditionalConfiguration(false);
        }

    };
    
    Page.SetPageHeight = function (onParent) {

        // Initialize
        var pageContent = Common.Get('PageContent');
        var header = Common.Get('PageHeader');
        var footer = Common.Get('PageFooter');

        // Do nothing when inside modals
        if (Common.IsModal() && onParent !== true) {
            return;
        }

        // Do nothing when no content
        if (Common.IsNotDefined(pageContent)) {
            return;
        }

        // Check for header or footer and get height values
        if (header || footer) {
            // Check for header and set value as margin to pageContent
            if (header && header.hasAttribute('data-header-sticky')) {
                var headerHeight = header.offsetHeight;
                pageContent.style.marginTop = headerHeight + 'px';
            }

            // Check for footer and set value as margin to pageContent
            if (footer && footer.hasAttribute('data-footer-sticky')) {
                var footerHeight = footer.offsetHeight;
                pageContent.style.marginBottom = footerHeight + 'px';
            }
        }

    };

    // Public Methods : Page Instructions
    Page.RunInstructions = function (pageInstructionData, requestingElement) {

        // Set SessionToken
        Common.SetSessionToken(pageInstructionData.SessionToken);

        // Update Timeout
        Common.RefreshTimeout();

        // Process Instructions or Validations
        if (pageInstructionData.UiValidation.ContainsError == 'Yes') {
            Validation.DisplayValidations(pageInstructionData.UiValidation, requestingElement, false);
        }
        else if (Common.IsDefined(pageInstructionData.PageInstructions)) {
            // Cleanup any displayed validations
            Validation.RemoveValidations();

            // Warnings exist?
            var warningsExist = false;
            if (pageInstructionData.UiValidation.ContainsError == 'No' && pageInstructionData.UiValidation.ValidationExists == 'Yes') {
                warningsExist = true;
            }

            // Do we have a navigate instruction and should we run it first?
            var navigateInstruction = null;
            var closingModalFirst = false;
            var closingModalPromise = null;
            var isModal = Common.IsModal();
            if (isModal) {
                Common.AddClass(document.body, 'gtc-modal-resizing');
            }
            navigateInstruction = Common.FilterArray(pageInstructionData.PageInstructions,
                function (pageInstruction) {
                    return pageInstruction.Type == 'NavigateInstruction';
                }
            );
            if (navigateInstruction.length > 0) {
                navigateInstruction = navigateInstruction[0];

                // Only run complete instructions if parent is not being refreshed and is not going to a new page
                if (isModal && ((navigateInstruction.Action == 'CloseView' && navigateInstruction.Instruction != 'CloseRefresh') || (navigateInstruction.Action == 'SetEnvironment' && navigateInstruction.Instruction == 'All' && Common.IsDefined(navigateInstruction.Theme)))) {
                    closingModalPromise = Common.Promise();
                    window.parent.Cache.Set(Common.Query('.gtc-modal-iframe', null, true), 'CloseModalFirstPromise', closingModalPromise);
                    closingModalFirst = true;
                    closingModalPromise.promise.then(
                        function () {
                            CompleteWarningValidationsWithNoErrors(pageInstructionData.UiValidation, warningsExist, true);
                            CompletePageInstructions(pageInstructionData.PageInstructions, navigateInstruction, closingModalFirst, requestingElement);
                        }
                    );
                }

                // Only setup NotificationsOnLoad if parent is being refreshed or going to a new page
                if (navigateInstruction.Instruction == 'CloseRefresh' || navigateInstruction.Action == 'ShowView') {
                    var notifications = [], pageInstruction, index = 0, length = pageInstructionData.PageInstructions.length;
                    for ( ; index < length; index++) {
                        pageInstruction = pageInstructionData.PageInstructions[index];
                        if (pageInstruction.Type == 'NotificationInstruction') {
                            notifications.push(pageInstruction);
                        }
                    }
                    if (notifications.length > 0) {
                        Common.SetStorage('NotificationsOnLoad', JSON.stringify(notifications));
                    }
                    if (warningsExist) {
                        Common.SetStorage('WarningsOnLoad', JSON.stringify(pageInstructionData.UiValidation));
                    }
                    if (isModal) {
                        // If a modal and refreshing view dont destroy modal or we lose the timeout context and we have a race condition
                        window.parent.Cache.Set(Common.Query('.gtc-modal-iframe', null, true), 'OnRefreshIgnoreModalDestroy', true);
                    }
                }
                RunNavigateInstruction(navigateInstruction, requestingElement);
            }
            else {
                if (!closingModalFirst) {
                    CompleteWarningValidationsWithNoErrors(pageInstructionData.UiValidation, warningsExist, false);
                }
                CompletePageInstructions(pageInstructionData.PageInstructions, navigateInstruction, closingModalFirst, requestingElement);
            }
        }

    };

    Page.RunNotificationInstructions = function (pageInstructions) {

        // Caution: This method cannot be private since it must be accessed from parent context

        var context = window.parent;
        var notificationContainer = Common.Get('NotificationContainer', true);
        if (Common.IsNotDefined(notificationContainer)) {
            var fragment = Common.GenerateFragment('<div id="NotificationContainer" class="gtc-notification-container"></div>');

            // Insert into parent document
            context.document.body.appendChild(fragment);
            notificationContainer = Common.Get('NotificationContainer', true);
        }

        var pageInstruction, index = 0, length = pageInstructions.length;
        for ( ; index < length; index++) {
            pageInstruction = pageInstructions[index];

            // Build HTML Markup
            var uniqueId = 'GTC' + context.Common.GenerateUniqueID();
            var backgroundImage = '';
            if (Common.IsDefined(pageInstruction.BackgroundImage)) {
                var resourcePath = Common.BuildResourcePath(pageInstruction.BackgroundImage);
                var image = new Image();
                image.onload = function () {
                    backgroundImage = ' style="';
                    var imageWidth = image.naturalWidth;
                    var imageHeight = image.naturalHeight;
                    if (imageWidth > 299) {
                        backgroundImage += 'width:' + imageWidth + 'px;';
                    }
                    if (imageHeight > 99) {
                        backgroundImage += 'height:' + imageHeight + 'px;';
                    }
                    backgroundImage += 'background-image:url(' + resourcePath + ');"';
                    CompleteNotificationInstruction(pageInstruction, backgroundImage, notificationContainer, uniqueId, context);
                };
                image.src = resourcePath;
            }
            else {
                CompleteNotificationInstruction(pageInstruction, backgroundImage, notificationContainer, uniqueId, context);
            }
        }

        // Cleanup notifications
        context.Common.AttachObservationEvent('NotificationContainer',
            function (event, eventData) {
                if (context.Common.IsEmptyElement(this)) {
                    context.Common.DetachObservationEvent(eventData);
                    context.Common.Remove(this);
                }
            }, window.parent, null, null,
            {
                attributes: false,
                subtree: false,
                childList: true,
                characterData: false,
                attributeOldValue: false,
                characterDataOldValue: false
            }
        );

    };

    Page.UpdateSetting = function (page, settingKey, uiParameters) {

        if (settingKey == 'Currency') {
            var currentCurrency = {
                Id: '',
                Code: '',
                Symbol: '',
                MinorUnits: ''
            };
            var uiParameter, index = 0, length = uiParameters.length;
            for ( ; index < length; index++) {
                uiParameter = uiParameters[index];
                switch (uiParameter.Name) {
                    case 'Id':
                        currentCurrency.Id = uiParameter.Value;
                        break;
                    case 'Code':
                        currentCurrency.Code = uiParameter.Value;
                        break;
                    case 'Symbol':
                        currentCurrency.Symbol = uiParameter.Value;
                        break;
                    case 'MinorUnits':
                        currentCurrency.MinorUnits = uiParameter.Value;
                        break;
                }
            }
            Common.SetStorage('CurrentCurrency', JSON.stringify(currentCurrency));
        }

    };

    // Private Methods
    function ProcessOnLoadView (onLoadViewModel) {

        // Set Session Token
        if (Common.IsDefined(onLoadViewModel.SessionToken)) {
            Common.SetSessionToken(onLoadViewModel.SessionToken);
        }

        // Set timeout?
        if (Common.IsDefined(onLoadViewModel.SessionTokenTimeout) && onLoadViewModel.SessionTokenTimeout != -1) {
            Common.CreateTimeout(onLoadViewModel.SessionTokenTimeout, onLoadViewModel.TimeoutRedirect, onLoadViewModel.AuthenticationMode);
        }

        // Set (User defined) Session Storage Variables
        if (Common.IsDefined(onLoadViewModel.View.StorageItems) && onLoadViewModel.View.StorageItems.length > 0) {
            SetUserDefinedStorage(onLoadViewModel.View.StorageItems);
        }

        // Build Page HTML
        var pageHtml = Page.Render(onLoadViewModel.View);

        // 508 Compliance
        pageHtml = '<a id="SkipToMainContent508" class="gtc-sr-only gtc-sr-only-focusable" href="#PageMainContent" data-translate="SkipToMainContent">' + Common.TranslateKey('SkipToMainContent') + '</a>' + pageHtml;

        // Insert into DOM
        var bodyObject = document.body;
        var contentDiv = document.createElement('div');
        contentDiv.innerHTML = pageHtml;
        bodyObject.insertBefore(contentDiv, bodyObject.firstChild);

        // Configure Page (Stage - Pre Translations)
        Page.Configure(onLoadViewModel.View, 'Pre');

        // Notifications OnLoad / Translate Validations
        Events.One(document.body, 'translationsloaded',
            function () {
                // Display Stored Notifcations
                DisplayStoredNotifcations(onLoadViewModel);

                // Display Validations
                DisplayValidations(onLoadViewModel);

                // Display Notifications from server
                DisplayServerNotifcations(onLoadViewModel);

                // Configure Page (Stage - Post Translations)
                Page.Configure(onLoadViewModel.View, 'Post');
            }
        );

        // Translate page
        Common.TranslatePage(false);

        // Page resizing?
        var onResizeEndFunction = function (event) {
            Page.SetPageHeight();
        };
        Common.AttachWindowResizingEvent(onResizeEndFunction, 'onWindowResize');

        // Is View a Modal? Let anything interested know modal loading is complete
        if (Common.IsModal()) {
            var timing = 0;
            if (Common.GetBrowser()[0] == 'IE') {
                timing = 100;
            }
            setTimeout(
                function () {
                    window.parent.Events.Trigger(parent.document, 'modalviewloadingcomplete');
                }, timing
            );
        }

        // Set Page Height/Margins
        Page.SetPageHeight();
    };

    function SetUserDefinedStorage (storageItems) {

        var storageItem, index = 0, length = storageItems.length;
        for ( ; index < length; index++) {
            storageItem = storageItems[index];
            Common.SetStorage(storageItem.Name, storageItem.Value);
        }

    };

    function ConfigureLabelFocus (page) {

        // Classes of elements that need focus events for label focus
        var inputClasses = 'input,'
                         + 'select,'
                         + '.gtc-input-notefield,'
                         + '.gtc-ui-slider-handle,'
                         + '.gtc-sliderfield-input-textbox';

        // Classes to check against for fields that need a little help finding their label
        var contextClasses = '.gtc-coupledfieldset,'
                           + '.gtc-ui-slider-handle,'
                           + '.gtc-sliderfield-input-textbox,'
                           + '.gtc-switchmask-text';

        // Find elements and attach events.
        var inputs = Common.QueryAll(inputClasses);
        var inputsNoSwitchMaskCheck = Common.FilterElementArray(inputs, ':not(.gtc-classInputSwitchMaskFieldCheck)');
        Events.On(inputsNoSwitchMaskCheck, 'focusin',
            function (event) {
                var labelFor = Common.GetAttr(this, 'data-checkboxgroup');
                if (Common.IsNotDefined(labelFor)) {
                    labelFor = this.name;
                }
                var label = Common.Query('.gtc-label[for="' + labelFor + '"]');
                if (Common.IsDefined(Common.Closest(contextClasses, this))) {
                    label = Common.Query('.gtc-label', Common.Closest('li', this));
                }
                if (Common.IsDefined(label)) {
                    if (Cache.Get(label, 'focused') != true) {
                        Cache.Set(label, 'focused', true);
                        Common.AddClass(label, 'gtc-label-focused');
                    }
                }
            }
        );
        Events.On(inputs, 'focusout',
            function (event) {
                var labelFor = Common.GetAttr(this, 'data-checkboxgroup');
                if (Common.IsNotDefined(labelFor)) {
                    labelFor = this.name;
                }
                var label = Common.Query('.gtc-label[for="' + labelFor + '"]');
                if (Common.IsDefined(Common.Closest(contextClasses, this))) {
                    label = Common.Query('.gtc-label', Common.Closest('li', this));
                }
                if (Common.IsDefined(label)) {
                    Common.RemoveClass(label, 'gtc-label-focused');
                    Cache.Set(label, 'focused', false);
                }
            }
        );

    };

    function ConfigureTooltips (page) {

        // Label Tooltips
        var labelTooltips = Common.QueryAll('.gtc-label-tooltip:not(.gtc-label-tooltip-init)');
        Common.AddClassToElements(labelTooltips, 'gtc-label-tooltip-init');
        Events.On(labelTooltips, 'click',
            function () {
                var that = this;
                Widgets.tooltip(that, {
                    tooltipClass: 'gtc-label-tooltip-style',
                    items: '[data-tooltip]',
                    content: function () {
                        return Common.GetAttr(this, 'data-tooltip');
                    },
                    close: function (event, ui) {
                        Widgets.tooltip(that, 'destroy');
                    },
                    position: {
                        my: 'center bottom-20',
                        at: 'center top',
                        using: function (position, positionData) {
                            var thisStyle = this.style;
                            thisStyle.top = position.top + 'px';
                            thisStyle.left = position.left + 'px';
                            var horizontal = 'center';
                            if (position.left == 0) {
                                horizontal = 'left';
                            }
                            else if (position.left + Common.Width(this) == Common.Width(window)) {
                                horizontal = 'right';
                            }
                            var newDiv = Common.Create('div', null, 'gtc-tooltip-arrow ' + positionData.vertical + ' ' + horizontal);
                            this.appendChild(newDiv);
                        }
                    }
                });
                Widgets.tooltip(that, 'open');
            }
        );

        // Link Tooltips
        var linkTooltips = Common.QueryAll('.gtc-link-tooltip:not(.gtc-link-tooltip-init)');
        Common.AddClassToElements(linkTooltips, 'gtc-link-tooltip-init');
        Widgets.tooltip(linkTooltips, {
            tooltipClass: 'gtc-label-tooltip-style',
            items: '[data-tooltip]',
            content: function () {
                return Common.GetAttr(this, 'data-tooltip');
            },
            delayedShow: 500,
            position: {
                my: 'center bottom-20',
                at: 'center top',
                using: function (position, positionData) {
                    var thisStyle = this.style;
                    thisStyle.top = position.top + 'px';
                    thisStyle.left = position.left + 'px';
                    var horizontal = 'center';
                    if (position.left == 0) {
                        horizontal = 'left';
                    }
                    else if (position.left + Common.Width(this) == Common.Width(window)) {
                        horizontal = 'right';
                    }
                    var newDiv = Common.Create('div', null, 'gtc-tooltip-arrow ' + positionData.vertical + ' ' + horizontal);
                    this.appendChild(newDiv);
                }
            }
        });

        // Tab Text Overflow Tooltips
        var tabButtonTooltips = Common.QueryAll('.gtc-tabbutton-link:not(.gtc-tabbutton-link-tooltip-init)');
        Common.AddClassToElements(tabButtonTooltips, 'gtc-tabbutton-link-tooltip-init');
        if (tabButtonTooltips.length > 0) {
            Events.Trigger(tabButtonTooltips, 'configuretabbutton');
        }

    };

    function DisplayValidations (onLoadViewModel) {

        var onLoadWarningsExist = false;
        var onLoadWarnings = JSON.parse(Common.GetStorage('WarningsOnLoad'));
        if (Common.IsDefined(onLoadWarnings)) {
            onLoadWarningsExist = true;
            Common.RemoveStorage('WarningsOnLoad');
        }
        if (onLoadViewModel.UiValidation.ValidationExists == 'Yes') {
            if (onLoadWarningsExist) {
                // If onload errors exist and onload warnings put warnings in front since they came first
                for (var index = onLoadWarnings.UiValidationResults.length; i-- > 0; ) {
                    onLoadViewModel.UiValidation.UiValidationResults.unshift(onLoadWarnings.UiValidationResults[index]);
                }
            }
            Validation.DisplayValidations(onLoadViewModel.UiValidation, null, true);
        }
        else if (onLoadWarningsExist) {
            CompleteWarningValidationsWithNoErrors(onLoadWarnings, onLoadWarningsExist, true);
        }

    };

    function DisplayStoredNotifcations (onLoadViewModel) {

        var onLoadNotifications = JSON.parse(Common.GetStorage('NotificationsOnLoad'));
        if (Common.IsDefined(onLoadNotifications)) {
            Common.RemoveStorage('NotificationsOnLoad');
            window.parent.Page.RunNotificationInstructions(onLoadNotifications);
        }

    };

    function DisplayServerNotifcations (onLoadViewModel) {

        if (Common.IsDefined(onLoadViewModel.NotificationInstructions) && onLoadViewModel.NotificationInstructions.length > 0) {
            window.parent.Page.RunNotificationInstructions(onLoadViewModel.NotificationInstructions);
        }

    };

    function CompleteWarningValidationsWithNoErrors (uiValidation, warningsExist, displayOnParent) {

        var context = window;
        if (displayOnParent) {
            context = window.parent;
        }
        if (warningsExist) {
            context.Validation.DisplayValidations(uiValidation, null, false);
        }

    };

    function RenderThemeClasses (page) {

        var themeColor = Colors.ProcessValue(page.Color, false, null);
        var singleGradientColor = Common.IsArray(themeColor) ? themeColor[0] : themeColor;
        var themeColorOpacity = Colors.ProcessValue(page.Color, true, .5);
        var colorCss = Colors.ColorCSS(themeColor);

        var styleMarkup = '';
        styleMarkup += '<style>';
        styleMarkup += ' .gtc-page-theme-color { ';
        styleMarkup += colorCss;
        styleMarkup += ' }';
        styleMarkup += ' .gtc-page-theme-background { ';
        styleMarkup += Colors.BackgroundCSS(themeColor);
        styleMarkup += ' }';
        styleMarkup += ' .gtc-page-theme-background-opacity { ';
        styleMarkup += Colors.BackgroundCSS(themeColorOpacity);
        styleMarkup += ' }';
        styleMarkup += ' .gtc-page-theme-border-top { ';
        styleMarkup += Colors.BorderColorCSS(singleGradientColor, 'top');
        styleMarkup += ' }';
        styleMarkup += ' .gtc-page-theme-border-bottom { ';
        styleMarkup += Colors.BorderColorCSS(singleGradientColor, 'bottom');
        styleMarkup += ' }';
        styleMarkup += ' .gtc-page-theme-border { ';
        styleMarkup += Colors.BorderColorCSS(singleGradientColor);
        styleMarkup += ' }';
        styleMarkup += ' .gtc-input-radio-selected:after { ';
        styleMarkup += 'background: ' + singleGradientColor + ';';
        styleMarkup += 'border-color: ' + singleGradientColor + ';';
        styleMarkup += ' }';
        styleMarkup += ' .gtc-input-checkbox-selected:after { ';
        styleMarkup += 'border-color: ' + singleGradientColor + ';';
        styleMarkup += ' }';
        var gradientLighterValue = Colors.ChangeLuminosity(singleGradientColor, .2);
        var gradientCss = Colors.BackgroundCSS([gradientLighterValue, singleGradientColor]);
        styleMarkup += ' .gtc-page-theme-gradient { ';
        styleMarkup += gradientCss;
        styleMarkup += ' }';
        var gradientDarkerValue = Colors.ChangeLuminosity(singleGradientColor, .1);
        var gradientDarkestValue = Colors.ChangeLuminosity(singleGradientColor, -.05);
        styleMarkup += ' .gtc-page-theme-gradient:hover { ';
        styleMarkup += Colors.BackgroundCSS([gradientDarkerValue, gradientDarkestValue]);
        styleMarkup += ' }';
        styleMarkup += ' .gtc-page-theme-active-select-option { ';
        styleMarkup += gradientCss;
        styleMarkup += ' }';
        styleMarkup += ' .gtc-tree .gtc-node { ';
        styleMarkup += colorCss;
        styleMarkup += ' }';
        styleMarkup += '</style>';

    };

    function CompletePageInstructions (pageInstructions, navigateInstruction, closingModalFirst, requestingElement) {

        // Initialize promises and notifications array
        var promises = [];
        var notifications = [];

        // Initialize Context object
        var parentContext = {
            Exists: false
        };

        // Begin Page Instructions
        var pageInstruction, index = 0, length = pageInstructions.length;
        for ( ; index < length; index++) {
            pageInstruction = pageInstructions[index];
            switch (pageInstruction.Type) {
                case 'ContentInstruction':
                    RunContentInstruction(pageInstruction, promises, parentContext);
                    break;
                case 'DisplayInstruction':
                    RunDisplayInstruction(pageInstruction, promises, parentContext);
                    break;
                case 'DownloadInstruction':
                    RunDownloadInstruction(pageInstruction);
                    break;
                case 'NavigateInstruction':
                    if (closingModalFirst == false) {
                        navigateInstruction = pageInstruction;
                    }
                    break;
                case 'NotificationInstruction':
                    notifications.push(pageInstruction);
                    break;
                case 'ValueInstruction':
                    RunValueInstruction(pageInstruction, promises, parentContext);
                    break;
            }
        }

        if (notifications.length > 0 && ((Common.IsNotDefined(navigateInstruction) || navigateInstruction.length == 0) || (Common.IsDefined(navigateInstruction) && navigateInstruction.Instruction != 'CloseRefresh'))) {
            window.parent.Page.RunNotificationInstructions(notifications);
        }
        else if (notifications.length > 0 && (Common.IsDefined(navigateInstruction) || navigateInstruction.length > 0)) {
            Common.SetStorage('NotificationsOnLoad', JSON.stringify(notifications));
        }

        // Define completion function to reset page height, resize modal and run navigate instruction
        var completionFunction = function () {
            TriggerAdditionalConfiguration(false);
            ReconfigureFormElements(false);
            Page.SetPageHeight();
            Common.RetranslatePage();
            ConfigureTooltips();
            if (Common.IsModal() && parentContext.Exists == true) {
                TriggerAdditionalConfiguration(true);
                ReconfigureFormElements(true);
                Page.SetPageHeight(true);
                window.parent.Events.Trigger(window.parent.document.body, 'translateparent');
                window.parent.Events.Trigger(window.parent.document.body, 'reconfiguretooltipsfrommodal');
            }

            // Let anyone interested know page instructions are complete
            Events.Trigger(document.body, 'pageinstructionscomplete');
            if (window.parent != window.top) {
                window.parent.Events.Trigger(top.document.body, 'pageinstructionscomplete');
            }

            // Resize modal if needed
            var iFrameModal = window.parent.Common.Query('.gtc-modal-iframe');
            if (Common.IsModal() && closingModalFirst == false && (Common.IsNotDefined(navigateInstruction) || navigateInstruction.length == 0)) {
                window.parent.Events.Trigger(iFrameModal, 'resizemodal');
            }
            else {
                Common.RemoveClass(document.body, 'gtc-modal-resizing');
            }

            // Clean up modal?
            var cleanupModalPromise = Cache.Get(iFrameModal, 'CleanupModalPromise');
            if (Common.IsDefined(cleanupModalPromise)) {
                cleanupModalPromise.resolve();
            }

            // Navigate if instruction exists
            if (closingModalFirst == false && Common.IsDefined(navigateInstruction)) {
                RunNavigateInstruction(navigateInstruction, requestingElement);
            }
        };

        // TODO: find a better way than timeout although nothing else seems to work (even promises)
        // because of javascripts asynchronous ways. So give time for promises in callbacks to collect
        setTimeout(
            function () {
                if (promises.length > 0) {
                    var allPromise = Promise.all(promises);
                    allPromise.then(
                        function () {
                            completionFunction();
                        }
                    );
                }
                else {
                    completionFunction();
                }
            }, 1000
        );

    };

    function RunNavigateInstruction (navigateInstruction, requestingElement) {

        switch (navigateInstruction.Action) {
            case 'CloseView':
                RunNavigateInstructionCloseView(navigateInstruction);
                break;
            case 'SetEnvironment':
                RunNavigateInstructionSetEnvironment(navigateInstruction);
                break;
            case 'ShowView':
                RunNavigateInstructionShowView(navigateInstruction, '_self');
                break;
            case 'ShowView - NewWindow':
                RunNavigateInstructionShowView(navigateInstruction, '_blank');
                break;
            case 'ShowModal':
                RunNavigateInstructionShowModal(navigateInstruction, requestingElement);
                break;
        }

    };

    function RunContentInstruction (contentInstruction, promises, parentContext) {

        // If Id exists update ContainerName
        if (Common.IsDefined(contentInstruction.Id)) {
            contentInstruction.ContainerName += Common.SanitizeToken(contentInstruction.Id);
        }

        // Element
        var element;
        if (contentInstruction.Context == 'Parent') {
            element = Common.Get(contentInstruction.ContainerName, true);
            parentContext.Exists = true;
        }
        else {
            element = Common.Get(contentInstruction.ContainerName);
        }
        if (Common.IsNotDefined(element)) {
            return;
        }

        // Namespace
        var namespace;
        if (contentInstruction.Context == 'Parent') {
            namespace = window.top.window[Common.GetAttr(element, 'data-namespace')];
        }
        else {
            namespace = window[Common.GetAttr(element, 'data-namespace')];
        }

        // Process Content Instruction
        var functionName = contentInstruction.Action + contentInstruction.Instruction;
        var functionCall = namespace[functionName];
        functionCall(element, contentInstruction.ViewElements, promises, contentInstruction.Context);

    };

    function RunDisplayInstruction (displayInstruction, promises, parentContext) {

        switch (displayInstruction.Action) {
            case 'Hide':
            case 'Show':
                RunDisplayInstructionShowHide(displayInstruction, promises, parentContext);
                break;
            case 'Lock':
                RunDisplayInstructionLock(displayInstruction, promises, parentContext);
                break;
            case 'Opacity':
                RunDisplayInstructionOpacity(displayInstruction, promises, parentContext);
                break;
            case 'Unlock':
                RunDisplayInstructionUnlock(displayInstruction, promises, parentContext);
                break;
        }

    };

    function RunDownloadInstruction (downloadInstruction) {

        var files = downloadInstruction.Files;
        if (Common.IsDefined(files)) {
            var fileData, blob, index = 0, length = files.length;
            for ( ; index < length; index++) {
                fileData = files[index];

                // Convert data
                blob = Common.Base64ToBlob(fileData.Content, fileData.Type);

                // Download blob
                Common.ExecuteBlobDownload(blob, fileData.Name);
            }
        }

    };

    function RunValueInstruction (valueInstruction, promises, parentContext) {

        // If Id exists update ElementName
        if (Common.IsDefined(valueInstruction.Id)) {
            valueInstruction.ElementName += Common.SanitizeToken(valueInstruction.Id);
        }

        // Element
        var element, isRadioArray = false;
        if (valueInstruction.Context == 'Parent') {
            element = Common.Get(valueInstruction.ElementName, true);
            parentContext.Exists = true;
        }
        else {
            element = Common.Get(valueInstruction.ElementName);
        }
        if (Common.IsNotDefined(element)) {
            if (valueInstruction.Context == 'Parent') {
                element = Common.QueryAll('input[name="' + valueInstruction.ElementName + '"]', null, true);
                parentContext.Exists = true;
            }
            else {
                element = Common.QueryAll('input[name="' + valueInstruction.ElementName + '"]');
            }
            if (element.length == 0) {
                if (valueInstruction.Instruction == 'EventParameters') {
                    element = document.body;
                }
                else {
                    return;
                }
            }
            else {
                isRadioArray = true;
            }
        }

        // Namespace
        var namespace;
        if (valueInstruction.Instruction == 'EventParameters' || valueInstruction.Instruction == 'EventPath') {
            namespace = window['EventElement'];
        }
        else if (valueInstruction.Instruction == 'Mask') {
            namespace = window['MaskField'];
        }
        else {
            if (isRadioArray) {
                namespace = window[Common.GetAttr(element[0], 'data-namespace')];
            }
            else {
                namespace = window[Common.GetAttr(element, 'data-namespace')];
            }
        }
        
        // Set Function Call
        var functionName = 'Update' + valueInstruction.Instruction;
        var functionCall = namespace[functionName];
        
        // Handle RadioField/CheckboxField and EventParameters
        if (valueInstruction.Instruction == 'EventParameters' || valueInstruction.Instruction == 'EventPath') {
            if (isRadioArray == false && Common.GetAttr(element, 'data-namespace') == 'CheckboxField') {
                element = Common.QueryAll('input', element);
                isRadioArray = true;
            }
            if (isRadioArray) {
                var index = 0, length = element.length;
                for ( ; index < length; index++) {
                    functionCall(element[index], valueInstruction.Value, valueInstruction.UiParameters);
                }
            }
            else {
                functionCall(element, valueInstruction.Value, valueInstruction.UiParameters);
            }
        }
        else {
            // Update Element
            if (Common.IsDefined(valueInstruction.UiParameters) && Common.IsDefined(valueInstruction.Value)) {
                functionCall(element, valueInstruction.Value, valueInstruction.UiParameters, promises, valueInstruction.Context);
            }
            else if (Common.IsDefined(valueInstruction.UiParameters)) {
                functionCall(element, valueInstruction.UiParameters, promises, valueInstruction.Context);
            }
            else if (Common.IsDefined(valueInstruction.Value)) {
                functionCall(element, valueInstruction.Value, promises, valueInstruction.Context);
            }
        }

    };

    function TriggerAdditionalConfiguration (onParent) {

        // Initialize
        var windowContext = window;
        var queryContext = Common.QueryAll;
        if (onParent == true) {
            windowContext = window.parent;
            queryContext = windowContext.Common.QueryAll;
        }
        var body = queryContext('body');

        // Mobile Navigation
        var mobileNav = queryContext('.gtc-mobile-nav-btn');
        if (mobileNav.length > 0) {
            windowContext.Events.Trigger(mobileNav, 'configuremobilemenu');
        }

        // Image Slider
        if (queryContext('.gtc-image-slider').length > 0) {
            windowContext.Events.Trigger(body, 'configureimageslider');
        }

        // Drag Drop Panel
        if (queryContext('.gtc-dragdroppanel').length > 0) {
            windowContext.Events.Trigger(body, 'configuredragdroppanel');
        }

        // Rearrange Panel
        if (queryContext('.gtc-rearrangepanel').length > 0) {
            windowContext.Events.Trigger(body, 'configurerearrangepanel');
        }

        // Progress Poll
        if (queryContext('.gtc-progresspoll').length > 0) {
            windowContext.Events.Trigger(body, 'configureprogresspoll');
        }

        // Progress Bar
        if (queryContext('.gtc-progressbar').length > 0) {
            windowContext.Events.Trigger(body, 'configureprogressbar');
        }

        // Responsive Tables
        if (queryContext('.gtc-table').length > 0) {
            windowContext.Events.Trigger(body, 'configureresponsivetable');
        }

        // Rich Text Editor
        if (queryContext('.gtc-editor-editablearea').length > 0) {
            windowContext.Events.Trigger(body, 'configurerichtexteditor');
        }

        // Rich Text Display/Item
        if (queryContext('.gtc-richtextdisplay').length > 0 || queryContext('.gtc-richtextdisplayitem').length > 0) {
            windowContext.Events.Trigger(body, 'configureinlineeditor');
        }

        // Progress Display Item
        if (queryContext('.gtc-progressdisplayitem').length > 0) {
            windowContext.Events.Trigger(body, 'configureprogressdisplayitem');
        }

        // Floating Menu
        if (queryContext('.gtc-floatingmenu').length > 0) {
            windowContext.Events.Trigger(body, 'configurefloatingmenu');
        }

        // Breadcrumb
        if (queryContext('.gtc-breadcrumb').length > 0) {
            windowContext.Events.Trigger(body, 'configurebreadcrumb');
        }

        // Back To Top
        windowContext.Events.Trigger(body, 'configurebacktotop');

        // Images
        windowContext.Events.Trigger(body, 'configureimages');

    };

    function ReconfigureFormElements (onParent) {

        // Initialize
        var windowContext = window;
        var queryContext = Common.QueryAll;
        if (onParent == true) {
            windowContext = window.parent;
            queryContext = windowContext.Common.QueryAll;
        }

        // Switchbox
        var switchboxes = queryContext('.gtc-input-switchbox:not([data-widgetinitialized="true"])');
        if (switchboxes.length > 0) {
            windowContext.Widgets.switchbox(switchboxes, { OnText: 'Yes', OffText: 'No' });
        }

    };

    function RunNavigateInstructionCloseView (navigateInstruction) {

        if (navigateInstruction.Instruction == 'CloseRefresh') {
            Common.CloseRefreshView();
        }
        else {
            Common.CloseView();
        }

    };

    function RunNavigateInstructionSetEnvironment (navigateInstruction) {

        if (isSetEnvironmentRunning) {
            return;
        }
        isSetEnvironmentRunning = true;

        var divPage = Common.Get('DivPage', true);
        Velocity(divPage, { 'opacity': 0 }, 'slow',
            function () {
                // Close modal
                if (Common.IsModal()) {
                    Common.CloseView();
                }

                // Get Current Settings
                var currentSetting = {
                    Language: Common.GetStorage('CurrentLanguage'),
                    Theme: Common.GetStorage('CurrentTheme')
                };

                // Set Language and Translate page
                if (currentSetting.Language != navigateInstruction.Language) {
                    Events.One(document.body, 'translationsloaded',
                        function () {
                            var viewElements = Common.QueryAll('[data-configure="Post"]');
                            if (viewElements.length > 0) {
                                var viewElement, index = 0, length = viewElements.length;
                                for ( ; index < length; index++) {
                                    viewElement = viewElements[index];
                                    var namespace = window[Common.GetAttr(viewElement, 'data-namespace')];
                                    if (Common.IsDefined(namespace) && Common.IsFunction(namespace.Translate)) {
                                        namespace.Translate(viewElement);
                                    }
                                }
                            }
                        }
                    );
                    Common.SetStorage('CurrentLanguage', navigateInstruction.Language);
                    Common.TranslatePage(true);
                }

                // Set Theme and Load Theme
                if (currentSetting.Theme != navigateInstruction.Theme) {
                    Common.SetStorage('CurrentTheme', navigateInstruction.Theme);
                    Common.ApplyTheme(true);
                }

                // Reset Page Height
                Page.SetPageHeight();

                // Bring it back
                Velocity(divPage, 'reverse',
                    function () {
                        Common.RemoveOpacity(divPage);
                        isSetEnvironmentRunning = false;
                    }
                );
            }
        );

    };

    function RunNavigateInstructionShowView (navigateInstruction, target) {

        // Set User language
        if (Common.IsDefined(navigateInstruction.Language) && navigateInstruction.Language.length > 0) {
            Common.SetStorage('CurrentLanguage', navigateInstruction.Language);
        }

        // Set User theme
        if (Common.IsDefined(navigateInstruction.Theme) && navigateInstruction.Theme.length > 0) {
            Common.SetStorage('CurrentTheme', navigateInstruction.Theme);
        }

        // Set OnLoadEvent object
        var pageName = navigateInstruction.Instruction.replace('/Content/', '').replace('/', '').replace('.html', '');
        Common.SetStorage(pageName, JSON.stringify(navigateInstruction.UiParameters));

        // Find correct context
        var windowContext = window;
        if (Common.IsModal()) {
            windowContext = window.parent;
        }

        // Check if we are going to the same place
        var sameUrl = false;
        if (windowContext.location.pathname == navigateInstruction.Instruction) {
            sameUrl = true;
        }

        // Update breadcrumb
        var breadcrumbNamespace = windowContext['Breadcrumb'];
        if (Common.IsDefined(breadcrumbNamespace)) {
            if (navigateInstruction.Instruction == Common.GetStorage('BreadcrumbHomeView')) {
                breadcrumbNamespace.ClearBreadcrumbData();
            }
            else if (sameUrl == false) {
                var control = windowContext.Common.Create('a', 'GTC' + Common.GenerateUniqueID());
                breadcrumbNamespace.UpdateBreadcrumbData(control, navigateInstruction.Instruction, pageName, navigateInstruction.UiParameters);
            }
        }

        // Goto next Page
        if (Common.IsModal()) {
            window.parent.location.href = navigateInstruction.Instruction;
        }
        else {
            if (target == '_blank') {
                var newWindow = window.open(navigateInstruction.Instruction, '_blank');
            }
            else {
                location.href = navigateInstruction.Instruction;
            }
        }

    };

    function RunNavigateInstructionShowModal (navigateInstruction, requestingElement) {

        // Set User language
        if (Common.IsDefined(navigateInstruction.Language) && navigateInstruction.Language.length > 0) {
            Common.SetStorage('CurrentLanguage', navigateInstruction.Language);
        }

        // Set User theme
        if (Common.IsDefined(navigateInstruction.Theme) && navigateInstruction.Theme.length > 0) {
            Common.SetStorage('CurrentTheme', navigateInstruction.Theme);
        }

        // Set OnLoadEvent object
        var modalName = navigateInstruction.Instruction.replace('/Content/', '').replace('/', '').replace('.html', '');
        Common.SetStorage(modalName, JSON.stringify(navigateInstruction.UiParameters));

        // Open Modal
        Modals.ShowModalDialog(modalName, navigateInstruction.Instruction, requestingElement.id);

    };

    function RunDisplayInstructionShowHide (displayInstruction, promises, parentContext) {

        if (Common.IsDefined(displayInstruction.ElementNameList)) {
            // Initialize
            var onParent = false, functionCall;
            var element, index = 0, length = displayInstruction.ElementNameList.length;

            // Determine context
            if (displayInstruction.Context == 'Parent') {
                onParent = true;
                parentContext.Exists = true;
            }

            // Get correct function call
            if (displayInstruction.Action == 'Show') {
                functionCall = CompleteDisplayInstructionShow;
            }
            else {
                functionCall = CompleteDisplayInstructionHide;
            }

            // For each element, find it and show or hide
            for ( ; index < length; index++) {
                element = Common.Get(displayInstruction.ElementNameList[index], onParent);
                if (Common.IsDefined(element)) {
                    functionCall(element, displayInstruction.Instruction, promises);
                }
            }
        }

    };

    function RunDisplayInstructionLock (displayInstruction, promises, parentContext) {

        if (Common.IsDefined(displayInstruction.ElementNameList)) {
            var onParent = false, elementName, index = 0, length = displayInstruction.ElementNameList.length;

            // Determine context
            if (displayInstruction.Context == 'Parent') {
                onParent = true;
                parentContext.Exists = true;
            }

            // Run instructions
            for ( ; index < length; index++) {
                elementName = displayInstruction.ElementNameList[index];
                if (displayInstruction.Instruction == 'radio') {
                    var radios = Common.QueryAll('input[name=' + elementName + ']', null, onParent);
                    Widgets[displayInstruction.Instruction](radios, 'DisableControl');
                }
                else if (displayInstruction.Instruction == 'checkbox') {
                    var checkboxes = Common.QueryAll('input[data-checkboxgroup=' + elementName + ']', null, onParent);
                    Widgets[displayInstruction.Instruction](checkboxes, 'DisableControl');
                }
                else if (displayInstruction.Instruction == 'tab') {
                    TabButton.DisableControl(Common.Get(elementName, onParent));
                }
                else if (displayInstruction.Instruction == 'calendar') {
                    DateField.Lock(Common.Get(elementName, onParent), onParent);
                }
                else if (displayInstruction.Instruction == 'secure') {
                    SecureField.Lock(Common.Get(elementName, onParent));
                }
                else if (displayInstruction.Instruction == 'multiselectpanel') {
                    MultiSelectPanel.Lock(Common.Get(elementName, onParent));
                }
                else if (displayInstruction.Instruction == 'link') {
                    Link.Disable(Common.Get(elementName, onParent));
                }
                else {
                    var element = Common.Get(elementName, onParent);
                    Widgets[displayInstruction.Instruction](element, 'DisableControl');
                }
            }
        }

    };

    function RunDisplayInstructionOpacity (displayInstruction, promises, parentContext) {

        if (Common.IsDefined(displayInstruction.ElementNameList)) {
            if (Common.IsDefined(displayInstruction.Instruction)) {
                var onParent = false, index = 0, length = displayInstruction.ElementNameList.length;

                // Determine context
                if (displayInstruction.Context == 'Parent') {
                    onParent = true;
                    parentContext.Exists = true;
                }

                // Run instructions
                for ( ; index < length; index++) {
                    var animationPromise = Common.Promise();
                    promises.push(animationPromise.promise);

                    // For loops have no scope! Give it some. (IIFE)
                    (function (elementName, instruction, animationPromise, onParent) {

                        var element = Common.Get(elementName, onParent);
                        if (Common.IsHidden(element)) {
                            var currentOpacity = element.style.opacity;
                            if (currentOpacity == '0' || Common.IsEmptyString(currentOpacity)) {
                                element.style.opacity = 0;
                                element.style.display = '';
                            }
                        }
                        Velocity(element, { opacity: instruction }, 'slow',
                            function () {
                                if (instruction == '1') {
                                    element.style.opacity = '';
                                }
                                animationPromise.resolve();
                            }
                        );

                    }(displayInstruction.ElementNameList[index], displayInstruction.Instruction, animationPromise, onParent));
                }
            }
        }

    };

    function RunDisplayInstructionUnlock (displayInstruction, promises, parentContext) {

        if (Common.IsDefined(displayInstruction.ElementNameList)) {
            var onParent = false, elementName, index = 0, length = displayInstruction.ElementNameList.length;

            // Determine context
            if (displayInstruction.Context == 'Parent') {
                onParent = true;
                parentContext.Exists = true;
            }

            // Run instructions
            for ( ; index < length; index++) {
                elementName = displayInstruction.ElementNameList[index];
                if (displayInstruction.Instruction == 'radio') {
                    var radios = Common.QueryAll('input[name=' + elementName + ']', null, onParent);
                    Widgets[displayInstruction.Instruction](radios, 'EnableControl');
                }
                else if (displayInstruction.Instruction == 'checkbox') {
                    var checkboxes = Common.QueryAll('input[data-checkboxgroup=' + elementName + ']', null, onParent);
                    Widgets[displayInstruction.Instruction](checkboxes, 'EnableControl');
                }
                else if (displayInstruction.Instruction == 'tab') {
                    TabButton.EnableControl(Common.Get(elementName, onParent));
                }
                else if (displayInstruction.Instruction == 'calendar') {
                    DateField.Unlock(Common.Get(elementName, onParent), onParent);
                }
                else if (displayInstruction.Instruction == 'secure') {
                    SecureField.Unlock(Common.Get(elementName, onParent));
                }
                else if (displayInstruction.Instruction == 'multiselectpanel') {
                    MultiSelectPanel.Unlock(Common.Get(elementName, onParent));
                }
                else if (displayInstruction.Instruction == 'link') {
                    Link.Enable(Common.Get(elementName, onParent));
                }
                else {
                    var element = Common.Get(elementName, onParent);
                    Widgets[displayInstruction.Instruction](element, 'EnableControl');
                }
            }
        }

    };

    function CompleteDisplayInstructionShow (element, animationType, promises) {

        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Initialize
        var rowElement = null;

        // Cache element style
        var elementStyle = element.style;

        // Clear opacity to avoid show issues
        if (elementStyle.opacity == '0') {
            elementStyle.display = 'none';
            elementStyle.opacity = '';
        }

        // If sidePanel open, else do nothing if element is visibile else show it
        if (Common.HasClass(element, 'gtc-slidepanel')) {
            SlidePanel.ShowHide(element, 'Show');
        }
        else if (Common.IsVisible(element)) {
            animationPromise.resolve();
        }
        else {
            if (element.tagName == 'TR') {
                rowElement = element;
                Common.Wrap(rowElement, Common.GenerateHTML('<div style="display:none;"></div>'));
                elementStyle.display = '';
                animationPromise.promise.then(
                    function () {
                        Common.Unwrap(rowElement);
                    }
                );
                element = rowElement.parentNode;
            }
            switch (animationType) {
                case 'Slide':
                    Velocity(element, 'slideDown', {
                            duration: 400,
                            complete: function () {
                                PostInstructionConfiguration(element);
                                animationPromise.resolve();
                            },
                            display: ''
                        }
                    );
                    break;
                case 'SlideLeft':
                    Common.Slide(element, 'show', 'left', 600,
                        function () {
                            PostInstructionConfiguration(element);
                            animationPromise.resolve();
                        }
                    );
                    break;
                case 'SlideRight':
                    Common.Slide(element, 'show', 'right', 600,
                        function () {
                            PostInstructionConfiguration(element);
                            animationPromise.resolve();
                        }
                    );
                    break;
                case 'Fade':
                    Velocity(element, 'fadeIn', 400,
                        function () {
                            element.style.opacity = null;
                            PostInstructionConfiguration(element);
                            animationPromise.resolve();
                        }
                    );
                    break;
                case 'ShowRightCoupledFields':
                    CoupledFieldSet.ShowRightFields(element);
                    animationPromise.resolve();
                    break;
                default:
                    elementStyle.display = '';
                    PostInstructionConfiguration(element);
                    animationPromise.resolve();
                    break;
            }
        }

    };

    function CompleteDisplayInstructionHide (element, animationType, promises) {

        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);
        var rowElement = null;
        if (Common.IsHidden(element)) {
            animationPromise.resolve();
        }
        else if (Common.HasClass(element, 'gtc-slidepanel')) {
            SlidePanel.ShowHide(element, 'Hide');
        }
        else {
            if (element.tagName == 'TR') {
                rowElement = element;
                animationPromise.promise.then(
                    function () {
                        rowElement.style.display = 'none';
                        Common.Unwrap(rowElement);
                    }
                );
                Common.Wrap(rowElement, Common.GenerateHTML('<div></div>'));
                element = rowElement.parentNode;
            }
            switch (animationType) {
                case 'Slide':
                    Velocity(element, 'slideUp', 600,
                        function () {
                            animationPromise.resolve();
                        }
                    );
                    break;
                case 'SlideLeft':
                    Common.Slide(element, 'hide', 'left', 600,
                        function () {
                            animationPromise.resolve();
                        }
                    );
                    break;
                case 'SlideRight':
                    Common.Slide(element, 'hide', 'right', 600,
                        function () {
                            animationPromise.resolve();
                        }
                    );
                    break;
                case 'Fade':
                    Velocity(element, 'fadeOut', 600,
                        function () {
                            element.style.display = 'none';
                            element.style.opacity = '';
                            animationPromise.resolve();
                        }
                    );
                    break;
                case 'HideRightCoupledFields':
                    CoupledFieldSet.HideRightFields(element);
                    animationPromise.resolve();
                    break;
                default:
                    element.style.display = 'none';
                    animationPromise.resolve();
                    break;
            }
        }

    };

    function PostInstructionConfiguration(element) {

        var namespace = window[Common.GetAttr(element, 'data-namespace')];
        if (Common.IsDefined(namespace) && Common.IsFunction(namespace.PostInstructionConfiguration)) {
            namespace.PostInstructionConfiguration(element);
        }

    };

    function CompleteNotificationInstruction (pageInstruction, backgroundImage, notificationContainer, uniqueId, context) {

        var extraClass = '';
        if (pageInstruction.Action == 'ShowNag') {
            extraClass = 'gtc-notification-nag ';
        }
        var notificationMarkup = '<div id="' + uniqueId + '" class="' + extraClass + 'gtc-notification ' + pageInstruction.Instruction + '"' + backgroundImage + '>';
        if (window.parent.Common.IsDefined(pageInstruction.Icon)) {
            notificationMarkup += '<div class="gtc-notification-icon gtc-page-theme-color">' + context.Icon.Render(pageInstruction.Icon) + '</div>';
        }
        notificationMarkup += '<div class="gtc-notification-message">';
        notificationMarkup += '<h2 class="gtc-page-theme-color" data-translate="' + pageInstruction.Title + '">' + Common.TranslateKey(pageInstruction.Title, context) + '</h2>';
        notificationMarkup += '<p data-translate="' + pageInstruction.Message + '">' + Common.TranslateKey(pageInstruction.Message, context) + '</p>';
        notificationMarkup += '</div></div>';

        // Insert into NotificationContainer (Prepend so newest notifications are first)
        notificationContainer.insertBefore(Common.GenerateFragment(notificationMarkup), notificationContainer.firstChild);

        // Get display time and inserted element
        var displayTime = 5;
        if (context.Common.IsDefined(pageInstruction.Duration) && context.Common.IsNotEmptyString(pageInstruction.Duration) && !context.isNaN(pageInstruction.Duration) && context.parseInt(pageInstruction.Duration, 10) > 0) {
            displayTime = context.parseInt(pageInstruction.Duration, 10) * 1000;
        }
        var notification = Common.Get(uniqueId, true);

        // Display
        var timerId = null;
        switch (pageInstruction.Instruction) {
            case 'Fade':
                context.Velocity(notification, 'fadeIn', 'slow',
                    function () {
                        timerId = context.setTimeout(
                            function () {
                                context.Velocity(notification, 'fadeOut', 'slow',
                                    function () {
                                        context.Common.Remove(notification);
                                    }
                                );
                            }, displayTime
                        );
                    }
                );
                break;
            case 'Slide':
                context.Velocity(notification, 'slideDown', 'slow',
                    function () {
                        timerId = context.setTimeout(
                            function () {
                                context.Velocity(notification, 'slideUp', 'slow',
                                    function () {
                                        context.Common.Remove(notification);
                                    }
                                );
                            }, displayTime
                        );
                    }
                );
                break;
            case 'SlideLeft':
                context.Velocity(notification, 'transition.slideLeftBigIn',
                    function () {
                        timerId = context.setTimeout(
                            function () {
                                context.Velocity(notification, 'transition.slideLeftBigOut',
                                    function () {
                                        context.Common.Remove(notification);
                                    }
                                );
                            }, displayTime
                        );
                    }
                );
                break;
            case 'SlideRight':
                context.Velocity(notification, 'transition.slideRightBigIn',
                    function () {
                        timerId = context.setTimeout(
                            function () {
                                context.Velocity(notification, 'transition.slideRightBigOut',
                                    function () {
                                        context.Common.Remove(notification);
                                    }
                                );
                            }, displayTime
                        );
                    }
                );
                break;
            default:
                notification.style.display = 'block';
                timerId = context.setTimeout(
                    function () {
                        notification.style.display = 'none';
                        context.Common.Remove(notification);
                    }, displayTime
                );
                break;
        }

        // Setup on click close
        notification.addEventListener('click',
            function () {
                context.clearTimeout(timerId);
                context.Velocity(notification, 'slideUp', 200,
                    function () {
                        context.Common.Remove(notification);
                    }
                );
            }
        );

    };

} (window.Page = window.Page || {}, window, document, Common, Cache, Events, Velocity));

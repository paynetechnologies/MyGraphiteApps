// Page Url Button
// Based On: PageUrlButton -> Button -> Link -> ViewElement
(function (PageUrlButton, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    PageUrlButton.Render = function (pageUrlButton) {

        // 508 Compliance
        if (Common.IsNotDefined(pageUrlButton.Title)) {
            pageUrlButton.Title = pageUrlButton.Name;
            pageUrlButton.ScreenReaderOnly = true;
        }

        // Button<, TabIndex@, Class@, Id@, Data-ControllerPath/ActionName@, Wire OnClick!
        var className = Link.RenderClassing(pageUrlButton, 'btn');
        var pageUrlButtonMarkup = '<button data-namespace="PageUrlButton" class="' + className + '"' + ViewElement.RenderAttributes(pageUrlButton) + EventElement.AttachEvent(pageUrlButton.Name, 'click', pageUrlButton.OnClick, PageUrlButton.OnClick);

        // Translations, Tooltip, 508 Compliance, Confirmation
        pageUrlButtonMarkup += Button.RenderAttributes(pageUrlButton);

        // Build current page url
        var url = window.location.protocol + '//' + window.location.hostname;
        var port = window.location.port;
        if (Common.IsDefined(port) && Common.IsNotEmptyString(port)) {
            url += ':' + port;
        }
        url += window.location.pathname;
        var currentContext = Common.GetStorage('CurrentContext');
        if (Common.IsDefined(currentContext) && Common.IsNotEmptyString(currentContext)) {
            var queryString = QueryString.GenerateOnLoad(currentContext);
            if (Common.IsNotEmptyString(queryString) && queryString != '?') {
                url += queryString;
            }
        }
        pageUrlButtonMarkup += ' data-pageurl="' + url + '"';

        // Button>
        pageUrlButtonMarkup += ' type="button">';

        // Icon
        if (Common.IsDefined(pageUrlButton.Icon)) {
            pageUrlButtonMarkup += Icon.Render(pageUrlButton.Icon, false);
        }

        // Attach Key
        if (Common.IsDefined(pageUrlButton.AttachedKey)) {
            GTC.AttachKey(pageUrlButton.Name, pageUrlButton.AttachedKey);
        }

        // Link Text
        pageUrlButtonMarkup += Link.RenderTitle(pageUrlButton, 'button');

        // Button</>
        pageUrlButtonMarkup += '</button>';

        // Add copy to clipboard?
        pageUrlButtonMarkup += '<input style="position:absolute;left:-9999px;" id="' + pageUrlButton.Name + 'UrlField" type="url" />';
        Events.On(document.body, 'click.' + pageUrlButton.Name, '#' + pageUrlButton.Name, { ButtonName: pageUrlButton.Name }, CopyToClipboard);

        // Return
        return pageUrlButtonMarkup;

    };

    PageUrlButton.OnClick = function (event) {

        // Initialize
        event.preventDefault();
        event.stopPropagation();
        var onClickParameters = [
            {
                Name: 'PageUrl',
                Value: Common.GetAttr(this, 'data-pageurl'),
                UiParameters: null
            }
        ];

        // Call OnClick
        Button.CompleteConfirmation(this, onClickParameters);

    };

    PageUrlButton.UpdateTitle = function (pageUrlButton, newTitle, promises, context) {

        Link.UpdateTitle(pageUrlButton, newTitle, promises, context);

    };

    PageUrlButton.ShowPinwheel = function (pageUrlButton) {

        SpinKit.Show(pageUrlButton, 'FadingCircle');

    };

    PageUrlButton.HidePinwheel = function (pageUrlButton) {

        SpinKit.Hide(pageUrlButton);

    };

    // Private Methods
    function CopyToClipboard (event) {

        var buttonId = event.data.ButtonName;
        var pageButton = Common.Get(buttonId);
        var urlField = Common.Get(buttonId + 'UrlField');
        urlField.value = Common.GetAttr(pageButton, 'data-pageurl')
        urlField.select();

        // Try/Catch for Firefox which throws error unless given access through app settings
        try {
            document.execCommand('copy');
        }
        catch (exception) {
            console.log('Firefox needs special permissions through it\'s application settings to allow clipboard access. Please contact your system administrator.')
        }

    };

} (window.PageUrlButton = window.PageUrlButton || {}, window, document, Common, Cache, Events, Velocity));

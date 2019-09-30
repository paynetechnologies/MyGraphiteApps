// Download Button
// Based On: DownloadButton -> Button -> Link -> ViewElement
(function (DownloadButton, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    DownloadButton.Render = function (downloadButton) {

        // 508 Compliance
        if (Common.IsNotDefined(downloadButton.Title)) {
            downloadButton.Title = downloadButton.Name;
            downloadButton.ScreenReaderOnly = true;
        }

        // Button<, TabIndex@, Class@, Id@, Data-ControllerPath/ActionName@, Wire OnClick!
        var className = Link.RenderClassing(downloadButton, 'btn');
        var downloadButtonMarkup = '<a data-namespace="DownloadButton" class="' + className + '"' + ViewElement.RenderAttributes(downloadButton) + EventElement.AttachEvent(downloadButton.Name, 'click', downloadButton.OnClick, DownloadButton.OnClick);

        if (Common.IsDefined(downloadButton.FilePath)) {
            downloadButtonMarkup += ' href="' + downloadButton.FilePath + '"';
        }
        else if (Common.IsDefined(downloadButton.FileContent)) {
            Events.On(document.body, 'click.' + downloadButton.Name, '#' + downloadButton.Name,
                function () {
                    // Convert data
                    var blob = Common.Base64ToBlob(downloadButton.FileContent, downloadButton.FileType);

                    // Download blob
                    Common.ExecuteBlobDownload(blob, downloadButton.FileName);
                }
            );
        }

        // Translations, Tooltip, 508 Compliance, Confirmation
        downloadButtonMarkup += Button.RenderAttributes(downloadButton);

        // Button>
        downloadButtonMarkup += '>';

        // Icon
        if (Common.IsDefined(downloadButton.Icon)) {
            downloadButtonMarkup += Icon.Render(downloadButton.Icon, false);
        }

        // Attach Key
        if (Common.IsDefined(downloadButton.AttachedKey)) {
            GTC.AttachKey(downloadButton.Name, downloadButton.AttachedKey);
        }

        // Link Text
        downloadButtonMarkup += Link.RenderTitle(downloadButton, 'button');

        // Button</>
        downloadButtonMarkup += '</a>';
        return downloadButtonMarkup;

    };

    DownloadButton.OnClick = function (event) {

        // Initialize
        event.preventDefault();
        event.stopPropagation();
        var onClickParameters = [];

        // Call OnClick
        Button.CompleteConfirmation(this, onClickParameters);

    };

    DownloadButton.UpdateTitle = function (downloadButton, newTitle, promises, context) {

        Link.UpdateTitle(downloadButton, newTitle, promises, context);

    };

    DownloadButton.ShowPinwheel = function (downloadButton) {

        SpinKit.Show(downloadButton, 'FadingCircle');

    };

    DownloadButton.HidePinwheel = function (downloadButton) {

        SpinKit.Hide(downloadButton);

    };

} (window.DownloadButton = window.DownloadButton || {}, window, document, Common, Cache, Events, Velocity));

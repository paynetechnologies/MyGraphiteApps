// ImageLink
// Based On: ImageLink -> Hyperlink -> Link -> ViewElement
(function (ImageLink, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    ImageLink.Render = function (imageLink) {

        var className = '';
        if (Common.IsDefined(imageLink.Tooltip)) {
            className = ' gtc-tooltip gtc-link-tooltip';
        }

        // Form to send?
        var formToSend = '';
        if (Common.IsDefined(imageLink.FormToSerialize)) {
            formToSend = ' data-formtoserialize="' + imageLink.FormToSerialize + '"';
        }

        // Anchor<, TabIndex@, Class@, Id@, Href@, Data-OnLoad@
        var imageLinkMarkup = '<a data-namespace="ImageLink"' + formToSend + ' class="gtc-link gtc-img-link' + className + '"' + ViewElement.RenderAttributes(imageLink) + Navigation.RenderAttributes(imageLink.Navigation);

        // Data-Translate@, Data-Tooltip@
        if (Common.IsDefined(imageLink.Tooltip)) {
            imageLinkMarkup += ' data-translate="[data-tooltip]' + imageLink.Tooltip + '"';
            imageLinkMarkup += ' data-tooltip="' + Common.TranslateKey(imageLink.Tooltip) + '"';
        }

        // Target@
        if (Common.IsDefined(imageLink.Target)) {
            imageLinkMarkup += ' target="' + imageLink.Target + '"';
        }

        // Anchor>
        imageLinkMarkup += '>';

        // Alt@ and Title
        if (Common.IsNotDefined(imageLink.Title)) {
            // 508 Compliance
            imageLink.Title = imageLink.Name;
        }

        // Build image or add title when no image source
        if (Common.IsDefined(imageLink.ImageSource)) {
            Page.Images++;
            var source = Common.BuildResourcePath(imageLink.ImageSource);
            imageLinkMarkup += '<img id="' + imageLink.Name + 'Image"';
            imageLinkMarkup += ' alt="' + Common.TranslateKey(imageLink.Title) + '"';
            imageLinkMarkup += ' data-translate="[alt]' + imageLink.Title + '"';

            // Image dimension
            if (Common.IsDefined(imageLink.Dimension)) {
                if (Common.IsDefined(imageLink.Dimension.Height)) {
                    imageLinkMarkup += ' height="' + imageLink.Dimension.Height + '"';
                }
                if (Common.IsDefined(imageLink.Dimension.Width)) {
                    imageLinkMarkup += ' width="' + imageLink.Dimension.Width + '"';
                }
            }
            imageLinkMarkup += ' />';

            // Onload images to properly calculate height
            Events.One(document.body, 'configureimages',
                function () {
                    var image = Common.Get(imageLink.Name + 'Image');
                    Events.On(image, 'load',
                        function () {
                            Page.LoadedImages++;
                            if (Page.Images == Page.LoadedImages) {
                                Page.SetPageHeight();
                            }
                        }
                    );
                    image.src = source;
                }
            );
        }
        else {
            // Title
            imageLinkMarkup += '<span';

            // Translations
            imageLinkMarkup += ' data-translate="' + imageLink.Title + '"';

            // Title</>
            imageLinkMarkup += '>' + Common.TranslateKey(imageLink.Title) + '</span>';
        }

        // Wire Click!
        Link.WireClick(imageLink);

        // Anchor</>
        imageLinkMarkup += '</a>';

        // Return markup
        return imageLinkMarkup;

    };

} (window.ImageLink = window.ImageLink || {}, window, document, Common, Cache, Events, Velocity));

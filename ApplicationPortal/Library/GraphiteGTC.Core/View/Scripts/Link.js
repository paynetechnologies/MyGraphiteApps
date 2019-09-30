// Link
// Based On: Link -> ViewElement
(function (Link, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Link.Render = function (link) {

        var linkNameSpace = window[link.Type];
        ViewElement.TestExists(link.Type, linkNameSpace);
        return linkNameSpace.Render(link);

    };

    Link.WireClick = function(link, subSelector) {

        // Sanity Check
        if (Common.IsNotDefined(subSelector)) {
            subSelector = '';
        }

        // Sanity Check
        if (Common.IsNotDefined(link.Name) || link.Name.length <= 0) {
            if (Common.IsDefined(window.console)) {
                console.log('Warning[' + link.Type + ' - ' + link.Title + ']: Must provide the Name attribute to wire an default action');
            }
        }
        else {
            // Wire Click!
            var eventTrigger = 'click';
            if (Common.CheckMedia('Mobile') || Common.CheckMedia('Tablet')) {
                Touch.InitializeTouchEvents();
                eventTrigger = 'tap';
            }
            Events.On(document.body, eventTrigger + '.' + link.Name, '#' + link.Name + subSelector,
                function (event) {
                    event.preventDefault();
                    var that = this;
                    Common.SetOnLoadEvent(that, false, false);
                    var linkTarget = Common.GetAttr(that, 'target');
                    var linkRef = Common.GetAttr(that, 'href');
                    if (linkTarget == '_blank') {
                        var newWindow = window.open(linkRef, linkTarget);
                    }
                    else {
                        Events.One(document, 'showPinwheelComplete',
                            function () {
                                document.location = linkRef;
                            }
                        );
                        Common.ShowPinwheel(null, true);
                    }
                }
            );
        }

    };

    // Common function used by most elements that inherit from link
    Link.UpdateTitle = function (link, newTitle, promises, context) {

        // Get deferred object for animation
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Initialize
        var onParent = context == 'Parent';
        var title = Common.Get(link.id + 'Title', onParent);
        var updateTitleFunction = function () {
            title.textContent = Common.TranslateKey(newTitle);
            Common.SetAttr(title, 'data-translate', newTitle);
            Common.SetAttr(title, 'alt', newTitle);
        };
        if (Common.IsHidden(link)) {
            updateTitleFunction();
            animationPromise.resolve();
        }
        else {
            // Animate
            Velocity(title, { 'opacity': 0 }, 'slow',
                function () {
                    updateTitleFunction();
                    Velocity(title, 'reverse',
                        function () {
                            Common.RemoveOpacity(title);
                            animationPromise.resolve();
                        }
                    );
                }
            );
        }

    };

    // Common function used by most elements that inherit from link
    Link.Enable = function (link) {

        Common.RemoveClass(link, 'gtc-btn--is-disabled');

    };

    // Common function used by most elements that inherit from link
    Link.Disable = function (link) {

        Common.AddClass(link, 'gtc-btn--is-disabled');

    };

    // Common function used by most elements that inherit from link
    Link.RenderAttributes = function (link) {

        // Initialize
        var linkMarkup = '';
        var translationAttribute = '';

        // Tooltip
        if (Common.IsDefined(link.Tooltip)) {
            translationAttribute += '[data-tooltip]' + link.Tooltip + ';';
            linkMarkup += ' data-tooltip="' + Common.TranslateKey(link.Tooltip) + '"';
        }

        // 508 Compliance
        if (Common.IsDefined(link.Title)) {
            translationAttribute += '[alt]' + link.Title + ';';
            linkMarkup += ' alt="' + Common.TranslateKey(link.Title) + '"';
        }

        // Translations
        if (Common.IsNotEmptyString(translationAttribute)) {
            linkMarkup += ' data-translate="' + translationAttribute + '"';
        }
        return linkMarkup;

    };

    // Common function used by most elements that inherit from button
    Link.RenderClassing = function (link, type) {

        // var className = 'gtc-link';
        var className = 'gtc-' + type;
        if (Common.IsDefined(link.Type)) {
            className += ' gtc-' + type + '-' + link.Type.toLowerCase();
        }
        if (Common.IsDefined(link.ButtonStyle)) {
            className += ' gtc-btn--' + link.ButtonStyle.toLowerCase();
        }
        if (Common.IsDefined(link.ButtonStyle) && Common.IsDefined(link.ButtonType)) {
            className += ' gtc-btn--' + link.ButtonStyle.toLowerCase() + '-' + link.ButtonType.toLowerCase();
        }
        if (Common.IsDefined(link.Size)) {
            className += ' gtc-btn--size-' + link.Size.toLowerCase();
        }
        if (link.IsPill == 'Yes') {
            className += ' gtc-btn--pill';
        }
        if (link.FullWidth == 'Yes') {
            className += ' gtc-btn--size-block';
        }
        if (link.IsWide == 'Yes') {
            className += ' gtc-btn--size-wide';
        }
        if (link.IsDisabled == 'Yes') {
            className += ' gtc-btn--is-disabled';
        }
        if (Common.IsDefined(link.Tooltip)) {
            className += ' gtc-tooltip gtc-link-tooltip';
        }
        return className;

    };

    // Common function used by most elements that inherit from link
    Link.RenderTitle = function (link, type) {

        var linkMarkup = '';
        var linkTitleClass = ' class="gtc-' + type + '-title';
        if (link.ScreenReaderOnly == true) {
            linkTitleClass += ' gtc-sr-only';
        }
        linkTitleClass += '"';
        linkMarkup = '<span id="' + link.Name + 'Title"' + linkTitleClass + ' data-translate="' + link.Title + '">' + Common.TranslateKey(link.Title) + '</span>';
        return linkMarkup;

    };

} (window.Link = window.Link || {}, window, document, Common, Cache, Events, Velocity));

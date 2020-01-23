// Expandable Display
// Based On: ExpandableDisplay -> ContainerElement -> ViewElement
(function (ExpandableDisplay, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    ExpandableDisplay.Render = function (expandableDisplay) {

        // Div<, TabIndex@, Class@, Id@, Div>
        var expandableDisplayMarkup = '<div class="gtc-expandabledisplay" data-namespace="ExpandableDisplay"';

        // Id?
        if (Common.IsDefined(expandableDisplay.Id)) {
            // View Model
            var viewModel = {
                Name: expandableDisplay.Name,
                Value: expandableDisplay.Id
            };

            // Update name to be unique
            expandableDisplay.Name += Common.SanitizeToken(expandableDisplay.Id);

            // Data-ViewModel@
            expandableDisplayMarkup += ' data-viewmodel=\'' + JSON.stringify(viewModel) + '\'';
        }
        expandableDisplayMarkup += ViewElement.RenderAttributes(expandableDisplay) + '><div class="gtc-expandabledisplay-titlebar">';

        // Is Open?
        var expanded = 'false';
        var displayStyle = '';
        var expandedClass = '';
        var rotateClass = '';
        if (expandableDisplay.IsOpen == 'Yes') {
            expanded = 'true';
            displayStyle = ' style="display:block;"';
            expandedClass = ' gtc-expanded';
            rotateClass = ' fa-rotate-180';
        }

        // H3<>, Title, H3</>
        if (Common.IsDefined(expandableDisplay.Title)) {
            expandableDisplayMarkup += '<h3 id="' + expandableDisplay.Name + 'Title" class="gtc-page-theme-color"';

            // Translations
            expandableDisplayMarkup += ' data-translate="' + expandableDisplay.Title + '"';
            expandableDisplayMarkup += '>' + Common.TranslateKey(expandableDisplay.Title) + '</h3>';
        }
        expandableDisplayMarkup += '<a role="button" id="' + expandableDisplay.Name + '-ExpandLink" class="gtc-expandabledisplay-expand"><i class="gtc-expandabledisplay-expandable-icon gtc-icon-styles fa fa-arrow-circle-down' + rotateClass + '"></i></a></div>';

        // Visible Element
        expandableDisplayMarkup += '<div class="gtc-expandabledisplay-visibleelement">';
        if (Common.IsDefined(expandableDisplay.VisibleElement)) {

            // Render View Element
            var viewElementNamespace = window[expandableDisplay.VisibleElement.Type];
            var cellType = (expandableDisplay.CellElement) ? expandableDisplay.CellElement.Type : '';
            ViewElement.TestExists(expandableDisplay.VisibleElement.Type, viewElementNamespace, cellType);
            expandableDisplayMarkup += viewElementNamespace.Render(expandableDisplay.VisibleElement);
        }
        expandableDisplayMarkup += '</div>';

        // Render Expandable Elements
        expandableDisplayMarkup += '<div aria-expanded="' + expanded + '"' + displayStyle + ' id="' + expandableDisplay.Name + '-ExpandSection" class="gtc-expandabledisplay-expandableelements' + expandedClass + '">';
        expandableDisplayMarkup += ContainerElement.RenderElements(expandableDisplay);
        expandableDisplayMarkup += '</div>';

        // Attach Expand Link Event
        Events.On(document.body, 'click.' + expandableDisplay.Name + '-ExpandLink', '#' + expandableDisplay.Name + '-ExpandLink',
            function () {
                var expandableDisplayExpandSection = Common.Get(expandableDisplay.Name + '-ExpandSection');
                if (Common.HasClass(expandableDisplayExpandSection, 'gtc-expanded')) {
                    Velocity(expandableDisplayExpandSection, 'slideUp', 500,
                        function () {
                            Page.SetPageHeight();
                        }
                    );
                    Common.SetAttr(expandableDisplayExpandSection, 'aria-expanded', 'false');
                    Common.RemoveClass(expandableDisplayExpandSection, 'gtc-expanded');
                    Common.RemoveClass(Common.Query('.gtc-expandabledisplay-expandable-icon', this), 'fa-rotate-180');
                }
                else {
                    Velocity(expandableDisplayExpandSection, 'slideDown', 500,
                        function () {
                            Page.SetPageHeight();
                        }
                    );
                    Common.SetAttr(expandableDisplayExpandSection, 'aria-expanded', 'true');
                    Common.AddClass(expandableDisplayExpandSection, 'gtc-expanded');
                    Common.AddClass(Common.Query('.gtc-expandabledisplay-expandable-icon', this), 'fa-rotate-180');
                }
            }
        );

        // Div</>
        expandableDisplayMarkup += '</div>';
        return expandableDisplayMarkup;

    };

    ExpandableDisplay.UpdateTitle = function (expandableDisplay, updatedTitle, promises, context) {

        var onParent = context == 'Parent';
        var title = Common.Get(expandableDisplay.id + 'Title', onParent);
        var updateTitleFunction = function () {
            title.textContent = Common.TranslateKey(updatedTitle);
            Common.SetAttr(title, 'data-translate', updatedTitle);
        };
        if (Common.IsHidden(expandableDisplay)) {
            updateTitleFunction();
        }
        else {
            // Get deferred object for animation
            var animationPromise = Common.Promise();
            promises.push(animationPromise.promise);

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

    ExpandableDisplay.RemoveElement = function (expandableDisplay, promises) {

        // Get deferred object for animation
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Parent Panel?
        var expandablePanel = Common.Closest('.gtc-expandablepanel', expandableDisplay);

        // Animate
        Velocity(expandableDisplay, 'slideUp', 600,
            function () {
                Common.Remove(expandableDisplay);
                ExpandablePanel.UpdateDisplayNoItems(expandablePanel, promises);
                animationPromise.resolve();
            }
        );

    };

    ExpandableDisplay.ReplaceElement = function (expandableDisplay, viewElements, promises) {

        // Animation Promise
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Remove delegated events before building HTML which will attach delegated events with same id!
        Cache.CleanDelegatedElementsData(expandableDisplay);

        // Build Markup
        var expandableDisplayMarkup = '';
        if (Common.IsDefined(viewElements)) {
            var viewElement, index = 0, length = viewElements.length;
            for ( ; index < length; index++) {
                viewElement = viewElements[index];
                viewElement.IsDisplayed = 'No';
                var namespace = window[viewElement.Type.toString()];
                expandableDisplayMarkup += namespace.Render(viewElement);
            }
        }

        // Replace
        Velocity(expandableDisplay, 'slideUp', 'slow',
            function () {
                Common.InsertHTMLString(expandableDisplay, Common.InsertType.After, expandableDisplayMarkup);
                var insertedDisplay = expandableDisplay.nextElementSibling;
                Velocity(insertedDisplay, 'slideDown', 'slow',
                    function () {
                        animationPromise.resolve();
                    }
                );

                // Remove expandable display and cleanup cache but ignore delegated events since they were already removed and reattached with same id!
                Common.Remove(expandableDisplay, false, true);
            }
        );

    };

} (window.ExpandableDisplay = window.ExpandableDisplay || {}, window, document, Common, Cache, Events, Velocity));

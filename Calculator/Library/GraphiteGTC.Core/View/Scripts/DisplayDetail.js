// Display Detail
// Based On: DisplayDetail -> ViewElement
(function (DisplayDetail, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    DisplayDetail.Render = function (displayDetail) {

        // Build class name
        var className = 'gtc-displaydetail';
        if (Common.IsDefined(displayDetail.ImageSource)) {
            className += ' gtc-displaydetail-image';
        }
        if (displayDetail.DisplayDetailType == 'SingleItem') {
            displayDetail.DisplayItemsPerLine = 1;
            displayDetail.IsExpandable = 'No';
            className += ' gtc-displaydetail-inline';
        }
        else if (displayDetail.IsExpandable == 'Yes') {
            className += ' gtc-displaydetail-expands';
        }

        // Is Open?
        var expanded = 'false';
        var displayStyle = '';
        var expandedClass = '';
        var rotateClass = '';
        if (displayDetail.IsExpandable == 'Yes' && displayDetail.IsOpen == 'Yes') {
            expanded = 'true';
            displayStyle = ' style="display:block;"';
            expandedClass = ' gtc-displaydetail-expandable-open';
            rotateClass = ' fa-rotate-270';
        }

        // Div@, TabIndex@, Class@, Id@, Div>
        var displayDetailMarkup = '<div data-namespace="DisplayDetail" class="' + className + ' gtc-columns-' + displayDetail.DisplayItemsPerLine;
        if (Common.IsDefined(displayDetail.DisplayDetailType)) {
            displayDetailMarkup += ' gtc-displaydetail-' + displayDetail.DisplayDetailType.toLowerCase();
        }
        displayDetailMarkup += expandedClass + '"';

        // Image Click
        if (Common.IsDefined(displayDetail.ImageSource) && Common.IsDefined(displayDetail.OnImageClick)) {
            displayDetailMarkup += ' data-imageclick=\'' + JSON.stringify(displayDetail.OnImageClick) + '\'';
        }

        // UiParameters
        if (Common.IsDefined(displayDetail.UiParameters)) {
            displayDetailMarkup += ' data-uiparameters=\'' + JSON.stringify(displayDetail.UiParameters) + '\'';
        }

        // Display Items Per Line
        displayDetailMarkup += ' data-displayitemsperline="' + displayDetail.DisplayItemsPerLine + '"';

        // Id?
        var viewModelId = null;
        if (Common.IsDefined(displayDetail.Id)) {
            // View Model
            var viewModel = {
                Name: displayDetail.Name,
                Value: displayDetail.Id
            };

            // Update name to be unique
            viewModelId = Common.SanitizeToken(displayDetail.Id);
            displayDetail.Name += viewModelId;

            // Data-ViewModel@
            displayDetailMarkup += ' data-viewmodel=\'' + JSON.stringify(viewModel) + '\'';
        }
        displayDetailMarkup += ViewElement.RenderAttributes(displayDetail) + '>';

        // Title
        if (Common.IsDefined(displayDetail.Title)) {
            displayDetailMarkup += '<h3 id="' + displayDetail.Name + 'Title" class="gtc-page-theme-color" data-translate="' + displayDetail.Title + '">' + Common.TranslateKey(displayDetail.Title) + '</h3>';
        }

        // Div<>
        displayDetailMarkup += '<div class="gtc-displaydetail-body">';

        // Image Source
        if (Common.IsDefined(displayDetail.ImageSource)) {
            var imageSource = "";
            var dataImage = (Common.IsDefined(displayDetail.ImageSource) && displayDetail.ImageSource.indexOf('data:') == 0) ? true : false;
            if (dataImage) {
                imageSource = displayDetail.ImageSource;
            }
            else {
                imageSource = Common.BuildResourcePath(displayDetail.ImageSource);
            }
            displayDetailMarkup += '<img class="gtc-displaydetail-image" id="' + displayDetail.Name + 'Image" src="' + imageSource + '"';

            // Image Click
            if (Common.IsEventViewElementDefined(displayDetail.OnImageClick)) {
                Events.On(document.body, 'click.' + displayDetail.Name + 'Image', '#' + displayDetail.Name + 'Image', DisplayDetail.OnImageClick);
                displayDetailMarkup += ' style="cursor:pointer"';
            }
            displayDetailMarkup += ' />';
        }

        // Display Items
        if (Common.IsDefined(displayDetail.DisplayItems)) {
            // Find length of items
            var displayItemCount = displayDetail.DisplayItems.length;
            var itemsPerLineInt = parseInt(displayDetail.DisplayItemsPerLine, 10);
            var itemSpanInt = 0;

            // Count spans and cache index
            var itemSpanCount = 0;
            var lastUnrenderedIndex = null;

            // Ol<>
            displayDetailMarkup += '<div class="gtc-displaydetail-content"><ol class="gtc-displaydetail-row">';

            // Display Fields
            var displayItem, displayItemIndex = 0, displayItemNamespace;
            for ( ; displayItemIndex < displayItemCount; displayItemIndex++) {
                displayItem = displayDetail.DisplayItems[displayItemIndex];
                itemSpanInt = parseInt(displayItem.ItemSpan, 10);

                // Expandable?
                if (displayDetail.IsExpandable == 'Yes' && itemSpanCount >= itemsPerLineInt) {
                    lastUnrenderedIndex = displayItemIndex;
                    break;
                }

                // Stop item spans greater than items per line or apply row spans
                if (displayItem.SpanRow == 'Yes' || displayDetail.DisplayDetailType == 'SingleItem' || itemSpanInt > itemsPerLineInt) {
                    displayItem.ItemSpan = displayDetail.DisplayItemsPerLine;
                }

                // Give Rich Text Display Items unique ids for initialization
                if (displayItem.Type == 'RichTextDisplayItem' && Common.IsDefined(viewModelId)) {
                    // Update name to be unique
                    displayItem.Name += viewModelId;
                }

                // Build Display Item
                displayItemNamespace = window[displayItem.Type.toString()];
                displayDetailMarkup += displayItemNamespace.Render(displayItem, displayDetail);

                // Add to item span count
                itemSpanCount += itemSpanInt;

                // Append Line?
                if (displayItem.AppendLine == 'Yes' && displayItemCount != displayItemIndex + 1) {
                    displayDetailMarkup += '</ol><ol class="gtc-displaydetail-row">';
                }
            }

            // Ol</>, Div</>
            displayDetailMarkup += '</ol></div>';

            // Add expandable section and wire slide
            if (displayDetail.IsExpandable == 'Yes') {
                displayDetailMarkup += '<div aria-expanded="' + expanded + '" class="gtc-displaydetail-expandable"' + displayStyle + '><ol class="gtc-displaydetail-row">';
                if (Common.IsDefined(lastUnrenderedIndex)) {
                    var index = lastUnrenderedIndex, length = displayDetail.DisplayItems.length;
                    for ( ; index < length; index++) {
                        displayItem = displayDetail.DisplayItems[index];
                        displayItemNamespace = window[displayItem.Type.toString()];

                        // Stop item spans greater than items per line or apply row spans
                        if (displayItem.SpanRow == 'Yes' || itemSpanInt > itemsPerLineInt) {
                            displayItem.ItemSpan = displayDetail.DisplayItemsPerLine;
                        }

                        // Give Rich Text Display Items unique ids for initialization
                        if (displayItem.Type == 'RichTextDisplayItem' && Common.IsDefined(viewModelId)) {
                            // Update name to be unique
                            displayItem.Name += viewModelId;
                        }

                        // Render
                        displayDetailMarkup += displayItemNamespace.Render(displayItem, displayDetail);

                        // Append Line?
                        if (displayItem.AppendLine == 'Yes' && displayDetail.DisplayItems.length != index + 1) {
                            displayDetailMarkup += '</ol><ol class="gtc-displaydetail-row">';
                        }
                    }
                }
                displayDetailMarkup += '</ol></div>';

                Events.On(document.body, 'click.' + displayDetail.Name, '#' + displayDetail.Name,
                    function (event) {
                        var eventTarget = event.target;
                        if (!Common.HasClass(eventTarget, 'gtc-displaydetail-footer') && !Common.HasClass(eventTarget, 'gtc-displaydetail-image') && Common.IsNotDefined(Common.Closest('.gtc-displaydetail-footer', eventTarget))) {
                            event.preventDefault();
                            var displayDetailExpandable = Common.Query('.gtc-displaydetail-expandable', this);
                            if (Common.IsDefined(Common.QueryAll('.gtc-displaydetail-column', displayDetailExpandable))) {
                                if (Common.IsHidden(displayDetailExpandable)) {
                                    Velocity(displayDetailExpandable, 'slideDown', 'slow',
                                        function () {
                                            Page.SetPageHeight();
                                        }
                                    );
                                    Common.AddClass(Common.Query('.gtc-displaydetail-expandable-icon', this), 'fa-rotate-270');
                                    Common.AddClass(this, 'gtc-displaydetail-expandable-open');
                                    Common.SetAttr(displayDetailExpandable, 'aria-expanded', 'true');
                                }
                                else {
                                    Velocity(displayDetailExpandable, 'slideUp', 'slow',
                                        function () {
                                            Page.SetPageHeight();
                                        }
                                    );
                                    Common.RemoveClass(Common.Query('.gtc-displaydetail-expandable-icon', this), 'fa-rotate-270');
                                    Common.RemoveClass(this, 'gtc-displaydetail-expandable-open');
                                    Common.SetAttr(displayDetailExpandable, 'aria-expanded', 'false');
                                }
                            }
                        }
                    }
                );

                // 508 Compliance - Focus In/Focus Out
                Events.On(document.body, 'focusin.' + displayDetail.Name, '#' + displayDetail.Name,
                    function (event) {
                        Events.On(document, 'keyup.' + displayDetail.Name,
                            function (keyupEvent) {
                                var pressedKeyCode = (keyupEvent.keyCode ? keyupEvent.keyCode : keyupEvent.which);
                                if (pressedKeyCode == GTC.Keyboard.Enter) {
                                    var element = Common.Get(displayDetail.Name);
                                    Events.Trigger(element, 'click');
                                }
                            }
                        );
                    }
                );
                Events.On(document.body, 'focusout.' + displayDetail.Name, '#' + displayDetail.Name,
                    function (event) {
                        Events.Off(document, 'keyup.' + displayDetail.Name);
                    }
                );
            }
        }

        // Div</>
        if (displayDetail.IsExpandable == 'Yes') {
            displayDetailMarkup += '<i class="gtc-displaydetail-expandable-icon gtc-icon-styles fa fa-share fa-rotate-90' + rotateClass + '"></i>';
        }
        displayDetailMarkup += '</div>';

        // Links
        if (Common.IsDefined(displayDetail.Links) && displayDetail.Links.length > 0) {
            // Div<>
            displayDetailMarkup += '<div class="gtc-displaydetail-footer">';

            // Links
            var link, index = 0, length = displayDetail.Links.length;
            for ( ; index < length; index++) {
                link = displayDetail.Links[index];

                // Id?
                if (Common.IsDefined(displayDetail.Id)) {
                    // Update name to be unique
                    link.Name += Common.SanitizeToken(displayDetail.Id);
                }

                // Li<>, Anchor, Li</>
                displayDetailMarkup += Link.Render(link);
            }

            // Div</>
            displayDetailMarkup += '</div>';
        }

        // Div</>
        displayDetailMarkup += '</div>';

        // Return markup
        return displayDetailMarkup;

    };

    DisplayDetail.OnImageClick = function (event) {

        // Initialize
        var displayDetail = Common.Closest('.gtc-displaydetail', this);
        var onClickParameters = [];

        // Get OnClickEvent object
        var onClickEvent = JSON.parse(Common.GetAttr(displayDetail, 'data-imageclick'));
        if (Common.IsDefined(onClickEvent.UiParameters)) {
            onClickParameters = onClickParameters.concat(onClickEvent.UiParameters);
        }

        // Serialize Form?
        if (Common.IsDefined(onClickEvent.FormToSerialize)) {
            onClickParameters = onClickParameters.concat(Form.SerializeArray(Common.Get(onClickEvent.FormToSerialize)));
        }

        // Execute View Behavior
        Common.ExecuteViewBehavior(onClickEvent.ControllerPath + onClickEvent.ActionName, onClickParameters, Page.RunInstructions, displayDetail);

    };

    DisplayDetail.UpdateImage = function (displayDetail, value, promises, context) {

        // Initialize
        var onParent = context == 'Parent';
        var displayDetailId = displayDetail.id;
        var image = Common.Get(displayDetailId + 'Image', onParent);
        var imageResource;
        var dataImage = (value.indexOf('data:') == 0) ? true : false;
        if (!dataImage) {
            imageResource = Common.BuildResourcePath(value);
        }
        else {
            imageResource = value;
        }

        // Update Image
        Velocity(image, { 'opacity': 0 }, 'slow',
            function () {
                image.src = imageResource;
                Velocity(image, 'reverse', Common.RemoveOpacity);
            }
        );

    };

    DisplayDetail.UpdateValues = function (displayDetail, uiParameters, promises, context) {

        if (Common.IsDefined(uiParameters)) {
            var displayItem, uiParameter, index = 0, length = uiParameters.length;
            for ( ; index < length; index++) {
                uiParameter = uiParameters[index];

                // DisplayItem
                displayItem = Common.Query('#' + uiParameter.Name, displayDetail);

                // Dynamic Rich Text?
                if (Common.IsNotDefined(displayItem)) {
                    // Build display detail object
                    var viewModel = JSON.parse(Common.GetAttr(displayDetail, 'data-viewmodel'));
                    if (Common.IsDefined(viewModel)) {
                        var viewModelId = Common.SanitizeToken(viewModel.Value);
                        displayItem = Common.Query('#' + uiParameter.Name + viewModelId, displayDetail);
                    }
                }

                // Namespace (DisplayItem, CurrencyDisplayItem or EditableDisplayItem)
                var namespace = window[Common.GetAttr(displayItem, 'data-namespace')];
                namespace.UpdateValue(displayItem, uiParameter.Value, promises, context);
            }
        }

    };

    DisplayDetail.UpdateColors = function (displayDetail, uiParameters, promises) {

        if (Common.IsDefined(uiParameters)) {
            var displayItem, uiParameter, index = 0, length = uiParameters.length;
            for ( ; index < length; index++) {
                uiParameter = uiParameters[index];

                // DisplayItem
                displayItem = Common.Query('#' + uiParameter.Name, displayDetail);

                // Dynamic Rich Text?
                if (Common.IsDefined(displayItem)) {
                    // Build display detail object
                    var viewModel = JSON.parse(Common.GetAttr(displayDetail, 'data-viewmodel'));
                    if (Common.IsDefined(viewModel)) {
                        var viewModelId = Common.SanitizeToken(viewModel.Value);
                        displayItem = Common.Query('#' + uiParameter.Name + viewModelId, displayDetail);
                    }
                }

                // Namespace (DisplayItem, CurrencyDisplayItem or EditableDisplayItem)
                var namespace = window[Common.GetAttr(displayItem, 'data-namespace')];
                namespace.UpdateColor(displayItem, uiParameter.Value, promises);
            }
        }

    };

    DisplayDetail.ReplaceContent = function (displayDetail, viewElements) {

        // Build Markup
        var displayDetailVisibleMarkup = '';
        var displayDetailExpandableMarkup = '';
        var displayItemsPerLine = parseInt(Common.GetAttr(displayDetail, 'data-displayitemsperline'), 10);

        // Build display detail object
        var viewModelId = null;
        var displayDetailObj = {
            Name: displayDetail.id
        };
        var viewModel = JSON.parse(Common.GetAttr(displayDetail, 'data-viewmodel'));
        if (Common.IsDefined(viewModel)) {
            displayDetailObj.Id = viewModel.Value;
            viewModelId = Common.SanitizeToken(viewModel.Value);
        }

        // Clean delegated events on elements being removed before building HTML which will attach delegated events with same id!
        // Only on children elements since this is replace content.
        var displayDetailContent = Common.Query('.gtc-displaydetail-content', displayDetail);
        var displayDetailExpandable = Common.Query('.gtc-displaydetail-expandable', displayDetail);
        Cache.CleanDelegatedElementsData(displayDetailContent, true);
        if (Common.IsDefined(displayDetailExpandable)) {
            Cache.CleanDelegatedElementsData(displayDetailExpandable, true);
        }

        // Display Items
        if (Common.IsDefined(viewElements) && viewElements.length > 0) {
            // Find length of items
            var displayItemCount = viewElements.length;

            // Count spans and cache index
            var itemSpanCount = 0;
            var lastUnrenderedIndex = null;

            // Ol<>
            displayDetailVisibleMarkup += '<ol class="gtc-displaydetail-row">';

            // Display Fields
            var displayItem, displayItemIndex = 0, itemSpanInt, displayItemNamespace;
            for ( ; displayItemIndex < displayItemCount; displayItemIndex++) {
                displayItem = viewElements[displayItemIndex];
                itemSpanInt = parseInt(displayItem.ItemSpan, 10);

                // Expandable?
                if (Common.HasClass(displayDetail, 'gtc-displaydetail-expands') && itemSpanCount >= displayItemsPerLine) {
                    lastUnrenderedIndex = displayItemIndex;
                    break;
                }

                // Stop item spans greater than items per line or apply row spans
                if (displayItem.SpanRow == 'Yes' || Common.HasClass(displayDetail, 'gtc-displaydetail-inline') || itemSpanInt > displayItemsPerLine) {
                    displayItem.ItemSpan = displayItemsPerLine;
                }

                // Give Rich Text Display Items unique ids
                if (displayItem.Type == 'RichTextDisplayItem' && Common.IsDefined(viewModelId)) {
                    // Update name to be unique
                    displayItem.Name += viewModelId;
                }

                // Build Display Item
                displayItemNamespace = window[displayItem.Type.toString()];
                displayDetailVisibleMarkup += displayItemNamespace.Render(displayItem, displayDetailObj);

                // Add to item span count
                itemSpanCount += itemSpanInt;

                // Append Line?
                if (displayItem.AppendLine == 'Yes' && displayItemCount != displayItemIndex + 1) {
                    displayDetailVisibleMarkup += '</ol><ol class="gtc-displaydetail-row">';
                }
            }

            // Ol</>
            displayDetailVisibleMarkup += '</ol>';

            // Add expandable section and wire slide
            if (Common.HasClass(displayDetail, 'gtc-displaydetail-expands')) {
                displayDetailExpandableMarkup += '<ol class="gtc-displaydetail-row">';
                if (Common.IsDefined(lastUnrenderedIndex)) {
                    var index = lastUnrenderedIndex, length = viewElements.length;
                    for ( ; index < length; index++) {
                        displayItem = viewElements[index];
                        displayItemNamespace = window[displayItem.Type.toString()];
                        itemSpanInt = parseInt(displayItem.ItemSpan, 10);

                        // Stop item spans greater than items per line or apply row spans
                        if (displayItem.SpanRow == 'Yes' || itemSpanInt > displayItemsPerLine) {
                            displayItem.ItemSpan = displayItemsPerLine;
                        }

                        // Give Rich Text Display Items unique ids
                        if (displayItem.Type == 'RichTextDisplayItem' && Common.IsDefined(viewModelId)) {
                            // Update name to be unique
                            displayItem.Name += viewModelId;
                        }

                        // Render
                        displayDetailExpandableMarkup += displayItemNamespace.Render(displayItem, displayDetailObj);

                        // Append Line?
                        if (displayItem.AppendLine == 'Yes' && viewElements.length != index + 1) {
                            displayDetailExpandableMarkup += '</ol><ol class="gtc-displaydetail-row">';
                        }
                    }
                }
                displayDetailExpandableMarkup += '</ol>';
            }
        }

        // Replace Content
        if (Common.IsDefined(displayDetailContent)) {
            Common.Remove(displayDetailContent.children);
        }
        if (Common.IsDefined(displayDetailExpandable)) {
            Common.Remove(displayDetailExpandable.children);
        }
        displayDetailContent.appendChild(Common.GenerateFragment(displayDetailVisibleMarkup));
        if (Common.HasClass(displayDetail, 'gtc-displaydetail-expands')) {
            displayDetailExpandable.appendChild(Common.GenerateFragment(displayDetailExpandableMarkup));
        }

    };

    DisplayDetail.ReplaceElement = function (displayDetail, viewElements, promises) {

        // Animation Promise
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Remove delegated events before building HTML which will attach delegated events with same id!
        Cache.CleanDelegatedElementsData(displayDetail);

        // Build Markup
        var displayDetailMarkup = '';
        if (Common.IsDefined(viewElements)) {
            var viewElement;
            index = 0;
            length = viewElements.length;
            for ( ; index < length; index++) {
                viewElement = viewElements[index];
                viewElement.IsDisplayed = 'No';
                var displayDetailNamespace = window[viewElement.Type.toString()];
                displayDetailMarkup += displayDetailNamespace.Render(viewElement);
            }
        }

        // Replace
        Velocity(displayDetail, 'slideUp', 'slow',
            function () {
                Common.InsertHTMLString(displayDetail, Common.InsertType.After, displayDetailMarkup);
                var insertedDetail = displayDetail.nextElementSibling;
                Velocity(insertedDetail, 'slideDown', 'slow',
                    function () {
                        animationPromise.resolve();
                    }
                );

                // Remove display detail and cleanup cache but ignore delegated events since they were already removed and reattached with same id!
                Common.Remove(displayDetail, false, true);
            }
        );

    };

    DisplayDetail.AppendContent = function (displayDetail, viewElements) {

        // Build Content
        var displayDetailMarkup = BuildContent(displayDetail, viewElements);

        // Append Content
        Common.InsertHTMLString(Common.Query('.gtc-displaydetail-content', displayDetail).lastChild, Common.InsertType.Append, displayDetailMarkup);

    };

    DisplayDetail.PrependContent = function (displayDetail, viewElements) {

        // Build Content
        var displayDetailMarkup = BuildContent(displayDetail, viewElements);

        // Prepend Content
        Common.InsertHTMLString(Common.Query('.gtc-displaydetail-content', displayDetail).lastChild, Common.InsertType.Prepend, displayDetailMarkup);

    };

    DisplayDetail.RemoveElement = function (displayDetail, promises) {

        // Get deferred object for animation
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Parent Panel?
        var displayPanel = Common.Closest('.gtc-displaypanel', displayDetail);

        // Animate
        Velocity(displayDetail, 'slideUp', 600,
            function () {
                Common.Remove(displayDetail);
                DisplayPanel.UpdateDisplayNoItems(displayPanel, promises);
                animationPromise.resolve();
            }
        );

    };

    DisplayDetail.UpdateTitle = function (displayDetail, updatedTitle, promises, context) {

        var onParent = context == 'Parent';
        var title = Common.Get(displayDetail.id + 'Title', onParent);
        var updateTitleFunction = function () {
            title.textContent = Common.TranslateKey(updatedTitle);
            Common.SetAttr(title, 'data-translate', updatedTitle);
        };
        if (Common.IsHidden(displayDetail)) {
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

    DisplayDetail.ShowPinwheel = function (displayDetail) {
    };

    DisplayDetail.HidePinwheel = function (displayDetail) {
    };

    // Private Methods
    function BuildContent (displayDetail, viewElements) {

        // Build display detail object
        var viewModelId = null;
        var detailObject = {
            Name: displayDetail.id
        };
        var viewModel = JSON.parse(Common.GetAttr(displayDetail, 'data-viewmodel'));
        if (Common.IsDefined(viewModel)) {
            detailObject.Id = viewModel.Value;
            viewModelId = Common.SanitizeToken(viewModel.Value);
        }

        // Build Markup
        var displayDetailMarkup = '';
        var displayItem, displayItemIndex = 0, length = viewElements.length;
        for ( ; displayItemIndex < length; displayItemIndex++) {
            displayItem = viewElements[displayItemIndex];

            // Give Rich Text Display Items unique ids
            if (displayItem.Type == 'RichTextDisplayItem' && Common.IsDefined(viewModelId)) {
                // Update name to be unique
                displayItem.Name += viewModelId;
            }

            // Display Item
            var displayItemNamespace = window[displayItem.Type.toString()];
            displayDetailMarkup += displayItemNamespace.Render(displayItem, detailObject);
            if (displayItem.AppendLine == 'Yes' && viewElements.length != displayItemIndex + 1) {
                displayDetailMarkup += '</ol><ol class="gtc-displaydetail-row">';
            }
        }
        return displayDetailMarkup;

    };

} (window.DisplayDetail = window.DisplayDetail || {}, window, document, Common, Cache, Events, Velocity));

// MultiSelect Detail
// Based On: MultiSelectDetail -> DisplayDetail -> ViewElement
(function (MultiSelectDetail, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    MultiSelectDetail.Render = function (multiSelectDetail) {

        // Build class name
        var className = 'gtc-multiselectdetail';
        if (Common.IsDefined(multiSelectDetail.ImageSource)) {
            className += ' gtc-multiselectdetail-image';
        }
        if (multiSelectDetail.DisplayDetailType == 'SingleItem') {
            multiSelectDetail.DisplayItemsPerLine = 1;
            multiSelectDetail.IsExpandable = 'No';
            className += ' gtc-multiselectdetail-inline';
        }
        else if (multiSelectDetail.IsExpandable == 'Yes') {
            className += ' gtc-multiselectdetail-expands';
        }

        var expanded = 'false';
        var displayStyle = '';
        var expandedClass = '';
        var rotateClass = '';
        if (multiSelectDetail.IsExpandable == 'Yes' && multiSelectDetail.IsOpen == 'Yes') {
            expanded = 'true';
            displayStyle = ' style="display:block;"';
            expandedClass = ' gtc-multiSelectDetail-expandable-open';
            rotateClass = ' fa-rotate-270';
        }

        // Div@, TabIndex@, Class@, Id@, Div>
        var selectableId = Common.SanitizeToken(multiSelectDetail.Id);
        if (Common.IsEmptyString(selectableId)) {
            selectableId = multiSelectDetail.Name;
        }
        var multiSelectDetailMarkup = '<div data-namespace="MultiSelectDetail" data-selectableid="' + selectableId + '" class="' + className + ' gtc-columns-' + multiSelectDetail.DisplayItemsPerLine;
        if (Common.IsDefined(multiSelectDetail.DisplayDetailType)) {
            multiSelectDetailMarkup += ' gtc-multiselectdetail-' + multiSelectDetail.DisplayDetailType.toLowerCase();
        }
        multiSelectDetailMarkup += expandedClass + '"';

        // UiParameters
        if (Common.IsDefined(multiSelectDetail.UiParameters)) {
            multiSelectDetailMarkup += ' data-uiparameters=\'' + JSON.stringify(multiSelectDetail.UiParameters) + '\'';
        }

        // Display Items Per Line
        multiSelectDetailMarkup += ' data-displayitemsperline="' + multiSelectDetail.DisplayItemsPerLine + '"';

        // Id?
        var viewModelId = null;
        if (Common.IsDefined(multiSelectDetail.Id) || Common.IsDefined(multiSelectDetail.Name)) {
            // View Model
            var viewModel = {
                Name: multiSelectDetail.Name,
                Value: multiSelectDetail.Id
            };

            // Update name to be unique
            viewModelId = Common.SanitizeToken(multiSelectDetail.Id);
            multiSelectDetail.Name += viewModelId;

            // Data-ViewModel@
            multiSelectDetailMarkup += ' data-viewmodel=\'' + JSON.stringify(viewModel) + '\'';
        }
        multiSelectDetailMarkup += ViewElement.RenderAttributes(multiSelectDetail) + '>';

        // Title
        if (Common.IsDefined(multiSelectDetail.Title)) {
            multiSelectDetailMarkup += '<h3 id="' + multiSelectDetail.Name + 'Title" class="gtc-page-theme-color" data-translate="' + multiSelectDetail.Title + '">' + Common.TranslateKey(multiSelectDetail.Title) + '</h3>';
        }

        // Div<>
        multiSelectDetailMarkup += '<div data-entityname="' + multiSelectDetail.EntityName + '" data-selectablename="' + multiSelectDetail.Name + '" class="gtc-multiselectdetail-body">';

        // Image Source
        if (Common.IsDefined(multiSelectDetail.ImageSource)) {
            multiSelectDetailMarkup += '<img src="' + Common.BuildResourcePath(multiSelectDetail.ImageSource) + '" />';
        }

        // Display Items
        if (Common.IsDefined(multiSelectDetail.DisplayItems)) {
            // Find length of items
            var displayItemCount = multiSelectDetail.DisplayItems.length;
            var itemsPerLineInt = parseInt(multiSelectDetail.DisplayItemsPerLine, 10);

            // Count spans and cache index
            var itemSpanCount = 0;
            var lastUnrenderedIndex = null;

            // Div<>
            multiSelectDetailMarkup += '<div class="gtc-multiselectdetail-input">';

            // Label<, For@, Display, Input<, @Data-NameSpace, @Data-FieldType
            multiSelectDetailMarkup += '<label role="checkbox" class="gtc-input-checkbox" for="' + multiSelectDetail.Name + 'MultiSelectCheckbox"><input data-namespace="CheckboxField"';

            // Data-CheckboxGroup@, @Name
            multiSelectDetailMarkup += ' data-checkboxgroup="' + multiSelectDetail.Name + 'Group" name="' + multiSelectDetail.Name + 'MultiSelectCheckbox"';

            // Checked@, Value@
            if (multiSelectDetail.IsChecked == 'Yes') {
                multiSelectDetailMarkup += ' checked="checked"';
            }

            // @TabIndex, @Class, @Id, @Type
            multiSelectDetailMarkup += ' tabindex="' + multiSelectDetail.FocusIndex + '" class="gtc-multiselectdetail-multiselectcheckbox" id="' + multiSelectDetail.Name + 'MultiSelectCheckbox" type="checkbox" /></label>';

            // Div</>
            multiSelectDetailMarkup += '</div>';

            // Ol<>
            multiSelectDetailMarkup += '<div class="gtc-multiselectdetail-content"><ol class="gtc-multiselectdetail-row">';

            // Display Fields
            var displayItem, displayItemIndex = 0, itemSpanInt;
            for ( ; displayItemIndex < displayItemCount; displayItemIndex++) {
                displayItem = multiSelectDetail.DisplayItems[displayItemIndex];
                itemSpanInt = parseInt(displayItem.ItemSpan, 10);

                // Expandable?
                if (multiSelectDetail.IsExpandable == 'Yes' && itemSpanCount >= itemsPerLineInt) {
                    lastUnrenderedIndex = displayItemIndex;
                    break;
                }

                // Stop item spans greater than items per line or apply row spans
                if (displayItem.SpanRow == 'Yes' || multiSelectDetail.DisplayDetailType == 'SingleItem' || itemSpanInt > itemsPerLineInt) {
                    displayItem.ItemSpan = multiSelectDetail.DisplayItemsPerLine;
                }

                // Give Rich Text Display Items unique ids for initialization
                if (displayItem.Type == 'RichTextDisplayItem' && Common.IsDefined(viewModelId)) {
                    // Update name to be unique
                    displayItem.Name += viewModelId;
                }

                // Build Display Item
                var displayItemNamespace = window[displayItem.Type.toString()];
                multiSelectDetailMarkup += displayItemNamespace.Render(displayItem, multiSelectDetail);

                // Add to item span count
                itemSpanCount += itemSpanInt;

                // Append Line?
                if (displayItem.AppendLine == 'Yes' && displayItemCount != displayItemIndex + 1) {
                    multiSelectDetailMarkup += '</ol><ol class="gtc-multiselectdetail-row">';
                }
            }

            // Ol</>
            multiSelectDetailMarkup += '</ol>';

            // Add expandable section and wire slide
            if (multiSelectDetail.IsExpandable == 'Yes') {
                multiSelectDetailMarkup += '<div aria-expanded="false" class="gtc-multiselectdetail-expandable"><ol class="gtc-multiselectdetail-row">';
                if (Common.IsDefined(lastUnrenderedIndex)) {
                    var index = lastUnrenderedIndex, length = multiSelectDetail.DisplayItems.length;
                    for ( ; index < length; index++) {
                        var displayItem = multiSelectDetail.DisplayItems[index];
                        var displayItemNamespace = window[displayItem.Type.toString()];
                        itemSpanInt = parseInt(displayItem.ItemSpan, 10);

                        // Stop item spans greater than items per line or apply row spans
                        if (displayItem.SpanRow == 'Yes' || itemSpanInt > itemsPerLineInt) {
                            displayItem.ItemSpan = multiSelectDetail.DisplayItemsPerLine;
                        }

                        // Give Rich Text Display Items unique ids for initialization
                        if (displayItem.Type == 'RichTextDisplayItem' && Common.IsDefined(viewModelId)) {
                            // Update name to be unique
                            displayItem.Name += viewModelId;
                        }

                        // Render
                        multiSelectDetailMarkup += displayItemNamespace.Render(displayItem, multiSelectDetail);

                        // Append Line?
                        if (displayItem.AppendLine == 'Yes' && multiSelectDetail.DisplayItems.length != index + 1) {
                            multiSelectDetailMarkup += '</ol><ol class="gtc-multiselectdetail-row">';
                        }
                    }
                }
                multiSelectDetailMarkup += '</ol></div>';

                // Attach click event to expand multiselect deatail
                Events.On(document.body, 'click.' + multiSelectDetail.Name, '#' + multiSelectDetail.Name,
                    function (event) {
                        var eventTarget = event.target;
                        if (!Common.HasClass(eventTarget, 'gtc-multiselectdetail-footer') && Common.IsNotDefined(Common.Closest('.gtc-multiselectdetail-footer', eventTarget))) {
                            event.preventDefault();
                            var displayDetailExpandable = Common.Query('.gtc-multiselectdetail-expandable', this);
                            if (Common.IsDefined(Common.QueryAll('.gtc-multiselectdetail-column', displayDetailExpandable))) {
                                if (Common.IsHidden(displayDetailExpandable)) {
                                    Velocity(displayDetailExpandable, 'slideDown', 'slow',
                                        function () {
                                            Page.SetPageHeight();
                                        }
                                    );
                                    Common.AddClass(Common.Query('.gtc-multiselectdetail-expandable-icon', this), 'fa-rotate-270');
                                    Common.AddClass(this, 'gtc-multiselectdetail-expandable-open');
                                    Common.SetAttr(displayDetailExpandable, 'aria-expanded', 'true');
                                }
                                else {
                                    Velocity(displayDetailExpandable, 'slideUp', 'slow',
                                        function () {
                                            Page.SetPageHeight();
                                        }
                                    );
                                    Common.RemoveClass(Common.Query('.gtc-multiselectdetail-expandable-icon', this), 'fa-rotate-270');
                                    Common.RemoveClass(this, 'gtc-multiselectdetail-expandable-open');
                                    Common.SetAttr(displayDetailExpandable, 'aria-expanded', 'false');
                                }
                            }
                        }
                    }
                );
            }
        }

        // I</>
        if (multiSelectDetail.IsExpandable == 'Yes') {
            multiSelectDetailMarkup += '<i class="gtc-multiselectdetail-expandable-icon gtc-icon-styles fa fa-share fa-rotate-90' + rotateClass + '"></i>';
        }

        // Div</>, Div</>
        multiSelectDetailMarkup += '</div></div>';

        // Links
        if (Common.IsDefined(multiSelectDetail.Links) && multiSelectDetail.Links.length > 0) {
            // Div<>
            multiSelectDetailMarkup += '<div class="gtc-multiselectdetail-footer">';

            // Links
            var link, index = 0, length = multiSelectDetail.Links.length;
            for ( ; index < length; index++) {
                link = multiSelectDetail.Links[index];

                // Id?
                if (Common.IsDefined(multiSelectDetail.Id)) {
                    // Update name to be unique
                    link.Name += Common.SanitizeToken(multiSelectDetail.Id);
                }

                // Li<>, Anchor, Li</>
                multiSelectDetailMarkup += Link.Render(link);
            }

            // Div</>
            multiSelectDetailMarkup += '</div>';
        }

        // Div</>
        multiSelectDetailMarkup += '</div>';

        // Return markup
        return multiSelectDetailMarkup;

    };

    MultiSelectDetail.UpdateValues = function (displayDetail, uiParameters, promises) {

        if (Common.IsDefined(uiParameters)) {
            var uiParameter, index = 0, length = uiParameters.length;
            for ( ; index < length; index++) {
                uiParameter = uiParameters[index];

                // DisplayItem
                var displayItem = Common.Query('#' + uiParameter.Name, displayDetail);

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
                namespace.UpdateValue(displayItem, uiParameter.Value, promises);
            }
        }

    };

    MultiSelectDetail.UpdateColors = function (displayDetail, uiParameters, promises) {

        if (Common.IsDefined(uiParameters)) {
            var uiParameter, index = 0, length = uiParameters.length;
            for ( ; index < length; index++) {
                uiParameter = uiParameters[index];

                // DisplayItem
                var displayItem = Common.Query('#' + uiParameter.Name, displayDetail);

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

    MultiSelectDetail.ReplaceContent = function (displayDetail, viewElements) {

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
        var displayDetailContent = Common.Query('.gtc-multiselectdetail-content', displayDetail);
        var displayDetailExpandable = Common.Query('.gtc-multiselectdetail-expandable', displayDetail);
        Cache.CleanDelegatedElementsData(displayDetailContent, true);
        Cache.CleanDelegatedElementsData(displayDetailExpandable, true);

        // Display Items
        if (Common.IsDefined(viewElements) && viewElements.length > 0) {
            // Find length of items
            var displayItemCount = viewElements.length;

            // Count spans and cache index
            var itemSpanCount = 0;
            var lastUnrenderedIndex = null;

            // Ol<>
            displayDetailVisibleMarkup += '<ol class="gtc-multiselectdetail-row">';

            // Display Fields
            var displayItem, displayItemIndex = 0, itemSpanInt;
            for ( ; displayItemIndex < displayItemCount; displayItemIndex++) {
                displayItem = viewElements[displayItemIndex];
                itemSpanInt = parseInt(displayItem.ItemSpan, 10);

                // Expandable?
                if (Common.HasClass(displayDetail, 'gtc-multiselectdetail-expands') && itemSpanCount >= displayItemsPerLine) {
                    lastUnrenderedIndex = displayItemIndex;
                    break;
                }

                // Stop item spans greater than items per line or apply row spans
                if (displayItem.SpanRow == 'Yes' || Common.HasClass(displayDetail, 'gtc-multiselectdetail-inline') || itemSpanInt > displayItemsPerLine) {
                    displayItem.ItemSpan = displayItemsPerLine;
                }

                // Give Rich Text Display Items unique ids
                if (displayItem.Type == 'RichTextDisplayItem' && Common.IsDefined(viewModelId)) {
                    // Update name to be unique
                    displayItem.Name += viewModelId;
                }

                // Build Display Item
                var displayItemNamespace = window[displayItem.Type.toString()];
                displayDetailVisibleMarkup += displayItemNamespace.Render(displayItem, displayDetailObj);

                // Add to item span count
                itemSpanCount += itemSpanInt;

                // Append Line?
                if (displayItem.AppendLine == 'Yes' && displayItemCount != displayItemIndex + 1) {
                    displayDetailVisibleMarkup += '</ol><ol class="gtc-multiselectdetail-row">';
                }
            }

            // Ol</>
            displayDetailVisibleMarkup += '</ol>';

            // Add expandable section and wire slide
            if (Common.HasClass(displayDetail, 'gtc-multiselectdetail-expands')) {
                displayDetailExpandableMarkup += '<ol class="gtc-multiselectdetail-row">';
                if (Common.IsDefined(lastUnrenderedIndex)) {
                    var index = lastUnrenderedIndex, length = viewElements.length;
                    for ( ; index < length; index++) {
                        var displayItem = viewElements[index];
                        var displayItemNamespace = window[displayItem.Type.toString()];
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
                            displayDetailExpandableMarkup += '</ol><ol class="gtc-multiselectdetail-row">';
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
        if (Common.HasClass(displayDetail, 'gtc-multiselectdetail-expands')) {
            displayDetailExpandable.appendChild(Common.GenerateFragment(displayDetailExpandableMarkup));
        }

    };

    MultiSelectDetail.ReplaceElement = function (displayDetail, viewElements, promises) {

        // Animation Promise
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Remove delegated events before building HTML which will attach delegated events with same id!
        Cache.CleanDelegatedElementsData(displayDetail);

        // Build Markup
        var displayDetailMarkup = '';
        if (Common.IsDefined(viewElements)) {
            var viewElement;
            index = 0, length = viewElements.length;
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
                var multiSelectPanel = Common.Closest('.gtc-multiselectpanel', insertedDetail);
                Widgets.multiselect(multiSelectPanel, 'IntializeNewDetails');

                // Remove display detail and cleanup cache but ignore delegated events since they were already removed and reattached with same id!
                Common.Remove(displayDetail, false, true);
            }
        );

    };

    MultiSelectDetail.AppendContent = function (displayDetail, viewElements) {

        // Build Content
        var displayDetailMarkup = BuildContent(displayDetail, viewElements);

        // Append Content
        Common.InsertHTMLString(Common.Query('.gtc-multiselectdetail-content', displayDetail).lastChild, Common.InsertType.Append, displayDetailMarkup);

    };

    MultiSelectDetail.PrependContent = function (displayDetail, viewElements) {

        // Build Content
        var displayDetailMarkup = BuildContent(displayDetail, viewElements);

        // Prepend Content
        Common.InsertHTMLString(Common.Query('.gtc-multiselectdetail-content', displayDetail).lastChild, Common.InsertType.Prepend, displayDetailMarkup);

    };

    MultiSelectDetail.RemoveElement = function (displayDetail, promises) {

        // Get deferred object for animation
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Animate
        Velocity(displayDetail, 'slideUp', 600,
            function () {
                Common.Remove(displayDetail);
                animationPromise.resolve();
            }
        );

    };

    MultiSelectDetail.UpdateTitle = function (displayDetail, updatedTitle, promises, context) {

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

    function BuildContent(displayDetail, viewElements) {

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
        var displayDetailMarkup = '', displayItem, displayItemIndex = 0, length = viewElements.length;
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
                displayDetailMarkup += '</ol><ol class="gtc-multiselectdetail-row">';
            }
        }
        return displayDetailMarkup;

    };

} (window.MultiSelectDetail = window.MultiSelectDetail || {}, window, document, Common, Cache, Events, Velocity));

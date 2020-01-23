/** 
 * @class DragDropPanel
 * @classdesc Supports the DragDropPanel View Element<br>
 *            Based On: ViewElement > RearrangePanel
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (DragDropPanel, window, document, Common, Cache, Events, Velocity, undefined) {

    // Private Variables
    var drakes = {};

    /**
     * @function DragDropPanel.Render
     * @param {object} dragDropPanel - The DragDropPanel View Element in JSON format
     * @description Generates the HTML markup for the DragDropPanel View Element 
     * @returns {string} HTML Markup of the DragDropPanel View Element
     * @listens configuredragdroppanel (body)
     */
    DragDropPanel.Render = function (dragDropPanel) {

        var extraClass = '';
        if (dragDropPanel.IsInline == 'Yes') {
            extraClass += ' gtc-dragdroppanel-inline';
        }

        // Div<, TabIndex@, Class@, Id@, Div>
        var dragDropPanelMarkup = '<div class="gtc-dragdroppanel' + extraClass + '" data-removeondrop="' + dragDropPanel.RemoveOnDrop + '" data-namespace="DragDropPanel"' + ViewElement.RenderAttributes(dragDropPanel);

        // Variable Name
        if (Common.IsDefined(dragDropPanel.VariableName)) {
            dragDropPanelMarkup += ' data-variablename="' + dragDropPanel.VariableName + '"';
        }

        // One way?
        dragDropPanelMarkup += ' data-isoneway="' + dragDropPanel.IsOneWay + '"';

        // Events
        if (Common.IsEventViewElementDefined(dragDropPanel.OnDrop)) {
            // Data-ControllerPath/ActionName
            dragDropPanelMarkup += ' data-drop=\'' + JSON.stringify(dragDropPanel.OnDrop) + '\'';
        }
        if (Common.IsEventViewElementDefined(dragDropPanel.OnRemove)) {
            // Data-ControllerPath/ActionName
            dragDropPanelMarkup += ' data-remove=\'' + JSON.stringify(dragDropPanel.OnRemove) + '\'';
        }
        dragDropPanelMarkup += '><div class="gtc-dragdroppanel-block">';

        // Selected Title
        if (Common.IsDefined(dragDropPanel.SelectedTitle)) {
            dragDropPanelMarkup += '<h2 class="gtc-page-theme-color" data-translate="' + dragDropPanel.SelectedTitle + '">' + Common.TranslateKey(dragDropPanel.SelectedTitle) + '</h2>';
        }

        // Div<>
        dragDropPanelMarkup += '<div id="' + dragDropPanel.Name + '-Selected" class="gtc-dragdroppanel-selected gtc-cfscroll-y';

        // One way?
        var onewayClass = ' gtc-dragdroppanel-oneway';
        if (dragDropPanel.IsOneWay == 'No') {
            onewayClass = '';
            dragDropPanelMarkup += ' gtc-dragdroppanel-selectable';
        }
        dragDropPanelMarkup += '">';

        // Selected Items
        if (Common.IsDefined(dragDropPanel.SelectedItems)) {
            var index = 0, length = dragDropPanel.SelectedItems.length;
            for ( ; index < length; index++) {
                dragDropPanelMarkup += DragDropItem.Render(dragDropPanel.SelectedItems[index], dragDropPanel.VariableName);
            }
        }

        // Div</>, Div</>, Div<>
        dragDropPanelMarkup += '</div></div><div class="gtc-dragdroppanel-block">';

        // Unselected Title
        if (Common.IsDefined(dragDropPanel.Title)) {
            dragDropPanelMarkup += '<h2 class="gtc-page-theme-color" data-translate="' + dragDropPanel.Title + '">' + Common.TranslateKey(dragDropPanel.Title) + '</h2>';
        }

        // Div<>
        dragDropPanelMarkup += '<div id="' + dragDropPanel.Name + '-Unselected" class="gtc-dragdroppanel-unselected gtc-dragdroppanel-selectable gtc-cfscroll-y' + onewayClass + '">';

        // Items
        if (Common.IsDefined(dragDropPanel.DragDropItems)) {
            var index = 0, length = dragDropPanel.DragDropItems.length;
            for ( ; index < length; index++) {
                dragDropPanelMarkup += DragDropItem.Render(dragDropPanel.DragDropItems[index], dragDropPanel.VariableName);
            }
        }

        // Div</>
        dragDropPanelMarkup += '</div>';

        // Configure Dropping
        ConfigureDroppable(dragDropPanel);

        // Div</>, Div</>
        dragDropPanelMarkup += '</div></div>';
        return dragDropPanelMarkup;

    };

    /**
     * @function DragDropPanel.OnDrop
     * @param {object} dragDropPanel - The DragDropPanel DOM element
     * @param {object} dragDropItem - The DragDropItem DOM element
     * @description This method is called when a DragDropItem is dropped onto a DragDropPanel
     */
    DragDropPanel.OnDrop = function (dragDropPanel, dragDropItem) {

        // Initialize
        var onDropParameters = [];

        // Get OnDropEvent object
        var onDropEvent = JSON.parse(Common.GetAttr(dragDropPanel, 'data-drop'));
        if (Common.IsDefined(onDropEvent.UiParameters)) {
            onDropParameters = onDropParameters.concat(onDropEvent.UiParameters);
        }

        if (Common.IsDefined(dragDropItem)) {
            // Setup Ui Parameter
            var droppedItemParameter = [
                {
                    Name: Common.GetAttr(dragDropItem, 'data-variablename'),
                    Value: Common.GetAttr(dragDropItem, 'data-id'),
                    UiParameters: null
                }
            ];

            // Add dropped item
            onDropParameters = onDropParameters.concat(droppedItemParameter);
        }

        // Execute View Behavior
        Common.ExecuteViewBehavior(onDropEvent.ControllerPath + onDropEvent.ActionName, onDropParameters, Page.RunInstructions, dragDropPanel);

    };

    /**
     * @function DragDropPanel.OnRemove
     * @param {object} dragDropPanel - The DragDropPanel DOM element
     * @param {object} dragDropItem - The DragDropItem DOM element
     * @description This method is called when a DragDropItem is removed from a DragDropPanel
     */
    DragDropPanel.OnRemove = function (dragDropPanel, dragDropItem) {

        // Initialize
        var onRemoveParameters = [];

        // Get OnRemoveEvent object
        var onRemoveEvent = JSON.parse(Common.GetAttr(dragDropPanel, 'data-remove'));
        if (Common.IsDefined(onRemoveEvent.UiParameters)) {
            onRemoveParameters = onRemoveParameters.concat(onRemoveEvent.UiParameters);
        }

        if (Common.IsDefined(dragDropItem)) {
            // Setup Ui Parameter
            var removedItemParameter = [
                {
                    Name: Common.GetAttr(dragDropItem, 'data-variablename'),
                    Value: Common.GetAttr(dragDropItem, 'data-id'),
                    UiParameters: null
                }
            ];

            // Add removed item
            onRemoveParameters = onRemoveParameters.concat(removedItemParameter);
        }

        // Execute View Behavior
        Common.ExecuteViewBehavior(onRemoveEvent.ControllerPath + onRemoveEvent.ActionName, onRemoveParameters, Page.RunInstructions, dragDropPanel);

    };

    /**
     * @function DragDropPanel.ReplaceContent
     * @param {object} dragDropPanel - The DragDropPanel DOM element
     * @param {object[]} viewElements -  An array that contains one or more DragDropItem View Elements in JSON format
     * @description Replaces a set of DragDropItems in the DragDropPanel
     */
    DragDropPanel.ReplaceContent = function (dragDropPanel, viewElements) {

        // Initialize needed elements
        var dragDropPanelUnselected = Common.Get(dragDropPanel.id + '-Unselected');
        var dragDropPanelSelected = Common.Get(dragDropPanel.id + '-Selected');

        // Remove all drag drop items
        Common.Remove(Common.QueryAll('.gtc-dragdropitem', dragDropPanelUnselected));
        Common.Remove(Common.QueryAll('.gtc-dragdropitem', dragDropPanelSelected));

        // Append new content
        DragDropPanel.AppendContent(dragDropPanel, viewElements);

    };

    /**
     * @function DragDropPanel.AppendContent
     * @param {object} dragDropPanel - The DragDropPanel DOM element
     * @param {object[]} viewElements -  An array that contains one or more DragDropItem View Elements in JSON format
     * @description Appends a set of DragDropItems in the DragDropPanel
     */
    DragDropPanel.AppendContent = function (dragDropPanel, viewElements) {

        // Sanity Check
        if (Common.IsNotDefined(viewElements) || viewElements.length == 0) {
            return;
        }

        // Build Markup
        var dragDropPanelUnselectedMarkup = '';
        var dragDropPanelSelectedMarkup = '';
        var dragDropItem, index = 0, length = viewElements.length;
        for ( ; index < length; index++) {
            dragDropItem = viewElements[index];
            dragDropItem.IsDisplayed = 'No';
            var generatedMarkup = DragDropItem.Render(dragDropItem, Common.GetAttr(dragDropPanel, 'data-variablename'));
            if (dragDropItem.IsSelected == 'Yes') {
                dragDropPanelSelectedMarkup += generatedMarkup;
            }
            else {
                dragDropPanelUnselectedMarkup += generatedMarkup;
            }
        }

        // Initialize needed elements
        var dragDropPanelUnselected = Common.Get(dragDropPanel.id + '-Unselected');
        var dragDropPanelSelected = Common.Get(dragDropPanel.id + '-Selected');

        // Append Content
        if (Common.IsNotEmptyString(dragDropPanelUnselectedMarkup)) {
            Common.InsertHTMLString(dragDropPanelUnselected, Common.InsertType.Append, dragDropPanelUnselectedMarkup);
        }
        if (Common.IsNotEmptyString(dragDropPanelSelectedMarkup)) {
            Common.InsertHTMLString(dragDropPanelSelected, Common.InsertType.Append, dragDropPanelSelectedMarkup);
        }

        // Get newly added items
        var allItems = Common.QueryAll('.gtc-dragdropitem', dragDropPanel), allAddedItems = [], index = 0, length = allItems.length;
        for ( ; index < length; index++) {
            if (Common.IsHidden(allItems[index])) {
                allAddedItems.push(allItems[index]);
            }
        }

        // Configure Selected
        var removeOnDrop = Common.GetAttr(dragDropPanel, 'data-removeondrop') == 'Yes' ? true: false;
        var addedSelectedItems = Common.QueryAllHidden('.gtc-dragdropitem', dragDropPanelSelected);
        for ( ; index < length; index++) {
            Common.AddClass(Common.Query('[data-namespace]', addedSelectedItems[index]), 'gtc-dropped-item');
        }
        Events.On(addedSelectedItems, 'mouseenter',
            function () {
                Velocity(Common.Query('.gtc-dragdropitem-remove', this), 'fadeIn', 500);
            }
        );
        Events.On(addedSelectedItems, 'mouseleave',
            function () {
                Velocity(Common.Query('.gtc-dragdropitem-remove', this), 'fadeOut', 500);
            }
        );
        index = 0, length = addedSelectedItems.length;
        var removeLinks = [];
        for ( ; index < length; index++) {
            var element = Common.Query('.gtc-dragdropitem-remove', addedSelectedItems[index]);
            if (element) {
                removeLinks.push(element);
            }
        }
        if (removeLinks.length > 0) {
            Events.On(removeLinks, 'click',
                function () {
                    var dragDropItem = Common.Closest('.gtc-dragdropitem', this);

                    // Kick off custom remove event
                    if (Common.HasAttr(dragDropPanel, 'data-remove')) {
                        DragDropPanel.OnRemove(dragDropPanel, dragDropItem);
                    }

                    // Handle on remove
                    if (removeOnDrop) {
                        Velocity(this, 'fadeOut', 500);
                        Events.Off(this, 'click');
                        Events.Off(dragDropItem, 'mouseenter');
                        Events.Off(dragDropItem, 'mouseleave');
                        Velocity(dragDropItem, 'fadeOut', 500,
                            function () {
                                dragDropPanelUnselected.appendChild(dragDropItem);
                                Common.RemoveClass(Common.Query('.gtc-dropped-item', dragDropItem), 'gtc-dropped-item');
                                Velocity(dragDropItem, 'fadeIn', 500);
                            }
                        );
                    }
                }
            );
        }

        // Display new content
        Velocity(allAddedItems, 'fadeIn', { duration: 'slow', display: '' });

    };

    /**
     * @function DragDropPanel.ShowPinwheel
     * @param {object} dragDropPanel - The DragDropPanel DOM element
     * @description Shows Pinwheel on the View Element
     */
    DragDropPanel.ShowPinwheel = function (dragDropPanel) {
    };

    /**
     * @function DragDropPanel.HidePinwheel
     * @param {object} dragDropPanel - The DragDropPanel DOM element
     * @description Hides Pinwheel on the View Element
     */
    DragDropPanel.HidePinwheel = function (dragDropPanel) {
    };

    // Private Methods
    function ConfigureDroppable (dragDropPanelObject) {

        Events.One(document.body, 'configuredragdroppanel',
            function () {
                var drakeOptions = {
                    revertOnSpill: true,
                    moves: function (element, container, handle) {
                        if (Common.HasClass(element, 'gtc-dragdropitem')) {
                            return true;
                        }
                        return false;
                    },
                    accepts: function (element, target, source, sibling) {
                        if (Common.HasClass(element, 'gtc-dragdropitem') && !Common.HasClass(target, 'gtc-dragdroppanel-oneway')) {
                            return true;
                        }
                        return false;
                    }
                };
                var removeOnDrop = false;
                if (dragDropPanelObject.RemoveOnDrop != 'Yes') {
                    removeOnDrop = true;
                    drakeOptions.copy = true;
                }
                var drake = dragula(drakeOptions);
                var dragDropPanel = Common.Get(dragDropPanelObject.Name);
                var dragDropPanelUnselected = Common.Get(dragDropPanelObject.Name + '-Unselected');
                var dragDropPanelSelected = Common.Get(dragDropPanelObject.Name + '-Selected');
                drake.containers.push(dragDropPanelUnselected);
                drake.containers.push(dragDropPanelSelected);
                drake.on('drop',
                    function (element, container, source) {
                        // Stop dropped elements from being redropped
                        if (container === source) {
                            return;
                        }
                        if (container.id == dragDropPanelObject.Name + '-Unselected') {
                            Events.Off(element, 'mouseenter');
                            Events.Off(element, 'mouseleave');
                            return;
                        }

                        // Kick off custom drop event
                        if (Common.HasAttr(dragDropPanel, 'data-drop')) {
                            DragDropPanel.OnDrop(dragDropPanel, element);
                        }

                        // Setup removing items from selected panel if needed
                        if (dragDropPanelObject.RemoveOnDrop == 'Yes') {
                            Common.AddClass(Common.Query('[data-namespace]', element), 'gtc-dropped-item');
                            Events.On(element, 'mouseenter',
                                function () {
                                    Velocity(Common.Query('.gtc-dragdropitem-remove', this), 'fadeIn', 500);
                                }
                            );
                            Events.On(element, 'mouseleave',
                                function () {
                                    Velocity(Common.Query('.gtc-dragdropitem-remove', this), 'fadeOut', 500);
                                }
                            );
                            Events.On(Common.Query('.gtc-dragdropitem-remove', element), 'click',
                                function () {
                                    Velocity(this, 'fadeOut', 500);
                                    Events.Off(this, 'click');
                                    var dragDropItem = this.parentNode;

                                    // Kick off custom remove event
                                    if (Common.HasAttr(dragDropPanel, 'data-remove')) {
                                        DragDropPanel.OnRemove(dragDropPanel, dragDropItem);
                                    }
                                    Events.Off(dragDropItem, 'mouseenter');
                                    Events.Off(dragDropItem, 'mouseleave');
                                    Velocity(dragDropItem, 'fadeOut', 500,
                                        function () {
                                            dragDropPanelUnselected.appendChild(dragDropItem);
                                            Common.RemoveClass(Common.Query('.gtc-dropped-item', dragDropItem), 'gtc-dropped-item');
                                            Velocity(dragDropItem, 'fadeIn', { duration: 500, display: '' });
                                        }
                                    );
                                }
                            );
                        }
                    }
                );
                drakes[dragDropPanelObject.Name] = drake;

                // Setup selected items if they exist
                var selectedDroppedItems = Common.QueryAll('.gtc-dragdropitem', dragDropPanelSelected);
                if (selectedDroppedItems.length > 0) {
                    var selectedItemIndex = 0, selectedItemsLength = selectedDroppedItems.length;
                    for ( ; selectedItemIndex < length; selectedItemIndex++) {
                        Common.AddClass(Common.Query('[data-namespace]', selectedDroppedItems[selectedItemIndex]), 'gtc-dropped-item');
                    }
                    Events.On(selectedDroppedItems, 'mouseenter',
                        function () {
                            Velocity(Common.Query('.gtc-dragdropitem-remove', this), 'fadeIn', 500);
                        }
                    );
                    Events.On(selectedDroppedItems, 'mouseleave',
                        function () {
                            Velocity(Common.Query('.gtc-dragdropitem-remove', this), 'fadeOut', 500);
                        }
                    );
                    var selectedDroppedItemsRemove = Common.QueryAll('.gtc-dragdropitem-remove', dragDropPanelSelected);
                    Events.On(selectedDroppedItemsRemove, 'click',
                        function () {
                            var dragDropItem = this.parentNode;

                            // Kick off custom remove event
                            if (Common.HasAttr(dragDropPanel, 'data-remove')) {
                                DragDropPanel.OnRemove(dragDropPanel, dragDropItem);
                            }

                            // Handle on remove
                            if (removeOnDrop) {
                                Velocity(this, 'fadeOut', 500);
                                Events.Off(this, 'click');
                                Events.Off(dragDropItem, 'mouseenter');
                                Events.Off(dragDropItem, 'mouseleave');
                                Velocity(dragDropItem, 'fadeOut', 500,
                                    function () {
                                        dragDropPanelUnselected.appendChild(dragDropItem);
                                        Common.RemoveClass(Common.Query('.gtc-dropped-item', dragDropItem), 'gtc-dropped-item');
                                        Velocity(dragDropItem, 'fadeIn', { duration: 500, display: '' });
                                    }
                                );
                            }
                        }
                    );
                }
            }
        );

    };

} (window.DragDropPanel = window.DragDropPanel || {}, window, document, Common, Cache, Events, Velocity));

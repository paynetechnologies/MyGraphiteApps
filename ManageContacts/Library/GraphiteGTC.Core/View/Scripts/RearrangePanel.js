// Rearrange Panel
// Based On: RearrangePanel -> ViewElement
(function (RearrangePanel, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    RearrangePanel.Render = function (rearrangePanel) {

        // Div<, TabIndex@, Class@, Id@, Div>
        var rearrangePanelMarkup = '<div class="gtc-rearrangepanel" data-namespace="RearrangePanel"' + ViewElement.RenderAttributes(rearrangePanel);

        // Variable Name
        if (Common.IsDefined(rearrangePanel.VariableName)) {
            rearrangePanelMarkup += ' data-variablename="' + rearrangePanel.VariableName + '"';
        }

        // Events
        if (Common.IsEventViewElementDefined(rearrangePanel.OnDrop)) {
            // Data-ControllerPath/ActionName
            rearrangePanelMarkup += ' data-drop=\'' + JSON.stringify(rearrangePanel.OnDrop) + '\'';
        }
        if (Common.IsEventViewElementDefined(rearrangePanel.OnDragLast)) {
            // Data-ControllerPath/ActionName
            rearrangePanelMarkup += ' data-draglast=\'' + JSON.stringify(rearrangePanel.OnDragLast) + '\'';
        }
        rearrangePanelMarkup += '>';

        // Draggable Title
        if (Common.IsDefined(rearrangePanel.Title)) {
            rearrangePanelMarkup += '<h2 class="gtc-page-theme-color" data-translate="' + rearrangePanel.Title + '">' + Common.TranslateKey(rearrangePanel.Title) + '</h2>';
        }

        // Div<>
        rearrangePanelMarkup += '<div id="' + rearrangePanel.Name + '-Draggable" class="gtc-rearrangepanel-draggable gtc-rearrangepanel-selectable gtc-cfscroll-y">';

        // Items
        if (Common.IsDefined(rearrangePanel.DragDropItems)) {
            var index = 0, length = rearrangePanel.DragDropItems.length;
            for ( ; index < length; index++) {
                rearrangePanelMarkup += DragDropItem.Render(rearrangePanel.DragDropItems[index], rearrangePanel.VariableName);
            }
        }

        // Div</>
        rearrangePanelMarkup += '</div>';

        // Configure dragging
        ConfigureDraggable(rearrangePanel.Name);

        // Div</>
        rearrangePanelMarkup += '</div>';

        // Return markup
        return rearrangePanelMarkup;

    };

    RearrangePanel.Drop = function (element, container, source) {

        var hasDrop = Common.HasAttr(container, 'data-drop');
        if (hasDrop) {
            RearrangePanel.OnDrop(container, element);
            if (namespace == 'RearrangePanel') {
                var hasDragLast = Common.HasAttr(source, 'data-draglast');
                if (hasDragLast) {
                    if (Common.IsNotDefined(Common.Query('.gtc-dragdropitem', source))) {
                        RearrangePanel.OnDragLast(source);
                    }
                }
            }
        }

    };

    RearrangePanel.OnDrop = function (rearrangePanel, dragDropItem) {

        // Initialize
        var onDropParameters = [];

        // Get OnDropEvent object
        var onDropEvent = JSON.parse(Common.GetAttr(rearrangePanel, 'data-drop'));
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
        Common.ExecuteViewBehavior(onDropEvent.ControllerPath + onDropEvent.ActionName, onDropParameters, Page.RunInstructions, this);

    };

    RearrangePanel.OnDragLast = function (rearrangePanel) {

        // Initialize
        var onDragLastParameters = [];

        // Get OnDragLastEvent object
        var onDragLastEvent = JSON.parse(Common.GetAttr(rearrangePanel, 'data-draglast'));
        if (Common.IsDefined(onDragLastEvent.UiParameters)) {
            onDragLastParameters = onDragLastParameters.concat(onDragLastEvent.UiParameters);
        }

        // Execute View Behavior
        Common.ExecuteViewBehavior(onDragLastEvent.ControllerPath + onDragLastEvent.ActionName, onDragLastParameters, Page.RunInstructions, this);

    };

    RearrangePanel.UpdateTitle = function (rearrangePanel, updatedTitle, promises, context) {

        var onParent = context == 'Parent';
        var title = Common.Query('h2', rearrangePanel);
        var updateTitleFunction = function () {
            title.textContent = Common.TranslateKey(updatedTitle);
            Common.SetAttr(title, 'data-translate', updatedTitle);
        };
        if (Common.IsHidden(rearrangePanel)) {
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

    RearrangePanel.ReplaceContent = function (rearrangePanel, viewElements, promises) {

        var rearrangePanelContainer = Common.Get(rearrangePanel.id + '-Draggable');
        if (Common.IsNotDefined(rearrangePanelContainer) && (Common.IsNotDefined(viewElements) || viewElements.length == 0)) {
            return;
        }
        else {
            // Get deferred object for animation
            var animationPromise = Common.Promise();
            promises.push(animationPromise.promise);

            // Update and animate
            var replaceContentFunction = function () {
                // Remove old content
                var elementIndex = drake.containers.indexOf(rearrangePanelContainer);
                if (elementIndex > -1) {
                    drake.containers.splice(elementIndex, 1);
                }
                Common.Remove(rearrangePanelContainer);

                // Build new content
                var rearrangePanelMarkup = '<div id="' + rearrangePanel.id + '-Draggable" class="gtc-rearrangepanel-draggable gtc-rearrangepanel-selectable">';
                var index = 0, length = viewElements.length;
                for ( ; index < length; index++) {
                    rearrangePanelMarkup += DragDropItem.Render(viewElements[index], Common.GetAttr(rearrangePanel, 'data-variablename'));
                }
                rearrangePanelMarkup += '</div>';

                // Add new Content
                Common.InsertHTMLString(rearrangePanel, Common.InsertType.Append, rearrangePanelMarkup);
                Common.RetranslatePage();
                Velocity(rearrangePanel, 'slideDown', 'slow',
                    function () {
                        // Configure dragging
                        ConfigureDraggable(rearrangePanel.id);

                        // Trigger configuration
                        Events.Trigger(document.body, 'configurerearrangepanel');
                        animationPromise.resolve();
                    }
                );

                // TODO: Is this needed? Page instruction complete should handle setting page height
                Page.SetPageHeight();
            };

            // Hidden?
            if (Common.IsHidden(rearrangePanel)) {
                Velocity(rearrangePanel, 'slideUp', 'slow', replaceContentFunction);
            }
            else {
                replaceContentFunction();
            }
        }

    };

    // Private Methods
    function ConfigureDraggable (rearrangePanelName) {

        Events.One(document.body, 'configurerearrangepanel',
            function () {
                var draggablePanel = Common.Get(rearrangePanelName + '-Draggable');
                drake.containers.push(draggablePanel);
            }
        );

    };

    // Private Variables
    // One drake to rule them(RearrangePanels) all
    var drake = null;
    if (window['dragula']) {
        drake = dragula({
            moves: function (element, container, handle) {
                if (Common.HasClass(element, 'gtc-dragdropitem')) {
                    return true;
                }
                return false;
            },
            accepts: function (element, target, source, sibling) {
                if (Common.HasClass(element, 'gtc-dragdropitem')) {
                    return true;
                }
                return false;
            }
        }).on('drop', RearrangePanel.Drop);
    }

} (window.RearrangePanel = window.RearrangePanel || {}, window, document, Common, Cache, Events, Velocity));

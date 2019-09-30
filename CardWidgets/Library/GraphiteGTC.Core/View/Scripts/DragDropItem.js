// Drag Drop Item
// Based On: DragDropItem -> ViewElement
(function (DragDropItem, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    DragDropItem.Render = function (dragDropItem, variableName) {

        // Id
        if (Common.IsDefined(dragDropItem.Id)) {
            dragDropItem.Name += Common.SanitizeToken(dragDropItem.Id);
        }

        // Div<, TabIndex@, Class@, Id@, Div>
        var dragDropItemMarkup = '<div draggable="true" class="gtc-dragdropitem" data-namespace="DragDropItem"' + ViewElement.RenderAttributes(dragDropItem);

        // Id
        if (Common.IsDefined(dragDropItem.Id)) {
            dragDropItemMarkup += 'data-id="' + dragDropItem.Id + '"';
        }

        // Variable Name
        if (Common.IsDefined(variableName)) {
            dragDropItemMarkup += 'data-variablename="' + variableName + '"';
        }
        dragDropItemMarkup += '>';

        // Remove
        dragDropItemMarkup += '<a class="gtc-dragdropitem-remove"><i class="gtc-icon-styles fa fa-minus-circle"></i></a>';

        // Item
        if (Common.IsDefined(dragDropItem.Item)) {
            var viewElementNamespace = window[dragDropItem.Item.Type];
            ViewElement.TestExists(dragDropItem.Item.Type, viewElementNamespace);
            dragDropItemMarkup += viewElementNamespace.Render(dragDropItem.Item);
        }

        // Div</>
        dragDropItemMarkup += '</div>';
        return dragDropItemMarkup;

    };

    DragDropItem.RemoveElement = function (dragDropItem, promises) {

        // Get deferred object for animation
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Animate
        Velocity(dragDropItem, 'fadeOut', 'slow',
            function () {
                Common.Remove(dragDropItem);
                animationPromise.resolve();
            }
        );

    };

} (window.DragDropItem = window.DragDropItem || {}, window, document, Common, Cache, Events, Velocity));

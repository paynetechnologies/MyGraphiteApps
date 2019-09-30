// Item List
// Based On: ItemList -> ViewElement
(function (ItemList, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    ItemList.Render = function (itemList) {

        // List Tag
        var listTag = 'ul';
        if (itemList.Ordered == 'Yes') {
            listTag = 'ol';
        }

        // Div<, TabIndex@, Class@, Id@, Div>
        var itemListMarkup = '<div data-ordered="' + itemList.Ordered + '" class="gtc-itemlist gtc-itemlist-' + itemList.ItemListType.toLowerCase() + '" data-namespace="ItemList"' + ViewElement.RenderAttributes(itemList) + '>';

        // Title
        if (Common.IsDefined(itemList.Title)) {
            itemListMarkup += '<h3 class="gtc-page-theme-color" data-translate="' + itemList.Title + '">' + Common.TranslateKey(itemList.Title) + '</h3>';
        }

        // ListTag<>
        itemListMarkup += '<' + listTag + '>';

        // ListItems
        if (Common.IsDefined(itemList.ListItems)) {
            var index = 0, length = itemList.ListItems.length;
            for ( ; index < length; index++) {
                itemListMarkup += '<li>' + HtmlText.Render(itemList.ListItems[index]) + '</li>';
            }
        }

        // ListTag</>, Div</>
        itemListMarkup += '</' + listTag + '></div>';

        // Return markup
        return itemListMarkup;

    };

    ItemList.ReplaceContent = function (itemList, viewElements, promises) {

        // Get deferred object for animation
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Update and animate
        var listType = Common.GetAttr(itemList, 'data-ordered') == 'Yes' ? 'ol' : 'ul';
        var listObject = Common.Query(listType, itemList);
        if (Common.IsDefined(listObject)) {
            if (Common.IsHidden(listObject)) {
                ReplaceItems(listObject, viewElements, false, animationPromise);
            }
            else {
                Velocity(listObject, 'slideUp', 'slow').then(
                    function (event) {
                        ReplaceItems(listObject, viewElements, true, animationPromise);
                    }
                );
            }
        }
    };

    function ReplaceItems(listObject, viewElements, animate, animationPromise) {

        // Remove List
        Common.Remove(Common.QueryAll('li', listObject));

        // Render new items and append
        if (Common.IsDefined(viewElements)) {
            var itemListMarkup = '';
            var listItem, index = 0, length = viewElements.length;
            for ( ; index < length; index++) {
                listItem = viewElements[index];
                itemListMarkup += '<li  data-translate="' + listItem.TextString + '">' + Common.TranslateKey(listItem.TextString) + '</li>';
            }
            Common.InsertHTMLString(listObject, Common.InsertType.Append, itemListMarkup);
            Common.RetranslatePage();
            if (animate) {
                Velocity(listObject, 'slideDown', 'slow',
                    function () {
                        animationPromise.resolve();
                    }
                );
            }
            else {
                animationPromise.resolve();
            }
        }

    };

} (window.ItemList = window.ItemList || {}, window, document, Common, Cache, Events, Velocity));

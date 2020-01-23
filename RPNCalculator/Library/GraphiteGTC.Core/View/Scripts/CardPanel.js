/** 
 * @class CardPanel
 * @classdesc Supports the CardPanel View Element<br>
 *            Based On: ViewElement
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (CardPanel, window, document, Common, Cache, Events, Velocity, undefined) {

    /**
     * @function CardPanel.Render
     * @param {object} cardPanel - The CardPanel View Element in JSON format
     * @description Generates the HTML markup for the CardPanel View Element 
     * @returns {string} HTML Markup of the CardPanel View Element
     */
    CardPanel.Render = function (cardPanel) {

        // Div<, TabIndex@, Class@, Id@, Div>
        var cardPanelMarkup = '<div class="gtc-card-panel" data-namespace="CardPanel"' + ViewElement.RenderAttributes(cardPanel);

        // On Add Event
        if (Common.IsEventViewElementDefined(cardPanel.OnAdd)) {
            // Data-ControllerPath/ActionName
            cardPanelMarkup += ' data-add=\'' + JSON.stringify(cardPanel.OnAdd) + '\'';
        }
        cardPanelMarkup += '>';

        // Dimension
        var dimensionClass = '';
        var hasFixedHeight = false;
        var dimensionStyle = StyleHelper.BuildDimensionStyle(cardPanel.Dimension);
        if (Common.IsDefined(dimensionStyle) && Common.IsOneDefined([dimensionStyle.Height, dimensionStyle.Width])) {
            var styleClass = 'gtc-card-panel-' + cardPanel.Name.toLowerCase();
            cardPanelMarkup += '<style>.' + styleClass + ' {';
            if (Common.IsDefined(dimensionStyle.Height)) {
                cardPanelMarkup += 'height:' + dimensionStyle.Height;
                if (cardPanel.Dimension.Scale != '%') {
                    hasFixedHeight = true;
                }
            }
            cardPanelMarkup += '}</style>';
            dimensionClass = ' gtc-card-panel-background ' + styleClass;
        }

        // Header Area
        cardPanelMarkup += '<div class="gtc-card-panel-header">';

        // Title
        if (Common.IsDefined(cardPanel.Title)) {
            cardPanelMarkup += '<h2 id="' + cardPanel.Name + 'Title" class="gtc-page-theme-color" data-translate="' + cardPanel.Title + '">' + Common.TranslateKey(cardPanel.Title) + '</h2>';
        }

        // Links
        if (Common.IsDefined(cardPanel.Links) && cardPanel.Links.length > 0) {
            cardPanelMarkup += '<div class="gtc-card-panel-links">';

            // Links
            var link, index = 0, length = cardPanel.Links.length;
            for ( ; index < length; index++) {
                link = cardPanel.Links[index];

                // Id?
                if (Common.IsDefined(cardPanel.Id)) {
                    // Update name to be unique
                    link.Name += Common.SanitizeToken(cardPanel.Id);
                }

                // Li<>, Anchor, Li</>
                cardPanelMarkup += Link.Render(link);
            }
            cardPanelMarkup += '</div>';
        }

        // Close Header Area
        cardPanelMarkup += '</div>';

        // Cards container
        var scrollClass = '';
        if (hasFixedHeight) {
            scrollClass = ' gtc-cfscroll-y';
        }
        cardPanelMarkup += '<div id="' + cardPanel.Name + '-container" class="gtc-card-panel-body' + dimensionClass + ' gtc-columns-' + cardPanel.CardsPerLine + scrollClass + '">';

        // Cards
        var cardType = 'Default';
        if (Common.IsDefined(cardPanel.Cards)) {
            var card, index = 0, length = cardPanel.Cards.length;
            for ( ; index < length; index++) {
                card = cardPanel.Cards[index];
                cardPanelMarkup += Card.Render(card);
            }
        }

        // Div</>
        cardPanelMarkup += '</div></div>';
        return cardPanelMarkup;

    };

    /**
     * @function CardPanel.ReplaceContent
     * @param {object} cardPanel - The CardPanel DOM element
     * @param {object[]} viewElements -  An array that contains one or more Card View Elements in JSON format
     * @param {object[]} promises - An array of promises that is used to know when all Page Instructions are completed
     * @description Replaces a set of Cards to the CardPanel
     */
    CardPanel.ReplaceContent = function (cardPanel, viewElements, promises) {

        var cardPanelContainer = Common.Get(cardPanel.id + '-container');
        var foundCards = Common.QueryAll('.gtc-card:not(.gtc-card-add-new)', cardPanelContainer);
        if (foundCards.length == 0 && (Common.IsNotDefined(viewElements) || viewElements.length == 0)) {
            return;
        }
        else {
            var animationPromise = Common.Promise();
            promises.push(animationPromise.promise);
            var replaceContentFunction = function () {
                // TODO: Find a way during Common.Remove to find elements that have delegated events but no event data cache themselves!
                var i = 0, foundLength = foundCards.length;
                for ( ; i < foundLength; i++) {
                    Cache.CleanDelegatedElementsData(foundCards[i]);
                }
                Common.Remove(foundCards);
                if (Common.IsDefined(viewElements)) {
                    var cardMarkup = '';
                    var card, index = 0, length = viewElements.length;
                    for ( ; index < length; index++) {
                        card = viewElements[index];
                        cardMarkup += Card.Render(card);
                    }
                    var addNewCard = Common.Query('.gtc-card-add-new');
                    cardPanelContainer.appendChild(Common.GenerateFragment(cardMarkup));
                    if (Common.IsHidden(cardPanel)) {
                        Velocity(cardPanel, 'slideDown', 'slow',
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
            if (Common.IsVisible(cardPanel)) {
                Velocity(cardPanel, 'slideUp', 'slow', replaceContentFunction);
            }
            else {
                replaceContentFunction();
            }
        }

    };

    /**
     * @function CardPanel.UpdateTitle
     * @param {object} cardPanel - The CardPanel DOM element
     * @param {string} updatedTitle - The new Title of the CardPanel
     * @param {object[]} promises - An array of promises that is used to know when all Page Instructions are completed
     * @param {string} context - Current or Parent View
     * @description Updates the Title of the CardPanel
     */
    CardPanel.UpdateTitle = function (cardPanel, updatedTitle, promises, context) {

        // Get deferred object for animation
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Initialize
        var onParent = context == 'Parent';
        var title = Common.Get(cardPanel.id + 'Title', onParent);
        var updateTitleFunction = function () {
            title.textContent = Common.TranslateKey(updatedTitle);
            Common.SetAttr(title, 'data-translate', updatedTitle);
        };
        if (Common.IsHidden(cardPanel)) {
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

} (window.CardPanel = window.CardPanel || {}, window, document, Common, Cache, Events, Velocity));

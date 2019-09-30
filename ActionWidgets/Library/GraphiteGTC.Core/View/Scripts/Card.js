/** 
 * @class Card
 * @classdesc Supports the Card View Element<br>
 *            Based On: ViewElement
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (Card, window, document, Common, Cache, Events, Velocity, undefined) {

    /**
     * @function Card.Render
     * @param {object} card - The Card View Element in JSON format
     * @description Generates the HTML markup for the Card View Element 
     * @returns {string} HTML Markup of the Card View Element
     * @listens click/tap (body)
     * @listens focusin (id = <var>cardName</var>)
     * @listens focusout (id = <var>cardName</var>)
     * @listens focusin (id = <var>cardName</var>FlipFromFrontLink)
     * @listens focusout (id = <var>cardName</var>FlipFromFrontLink)
     * @listens focusin (id = <var>cardName</var>FlipFromBackLink)
     * @listens focusout (id = <var>cardName</var>FlipFromBackLink)
     * @listens click (id = <var>cardName</var>FlipFromFrontLink)
     * @listens click (id = <var>cardName</var>FlipFromBackLink)
     */
    Card.Render = function (card) {

        // Id?
        if (Common.IsDefined(card.Id)) {
            // Update Id to be unique
            card.Name += Common.SanitizeToken(card.Id);
        }

        // Need flip structuring?
        var hasFlip = Common.IsDefined(card.FlipElement);
        var extraClassing = ' gtc-text-' + card.TextAlignment.toLowerCase();
        var extraFlipAttribute = ' data-card-flippable="false"';
        var extraImageAttribute = '';
        var roleAttribute = '';
        if (hasFlip) {
            extraClassing += ' gtc-card-flippable';
            extraFlipAttribute = ' data-card-flippable="true"';
        }
        if (Common.IsDefined(card.ImageSource)) {
            extraImageAttribute = ' data-image-position="' + card.ImagePosition.toLowerCase() + '"';
        }
        if (Common.IsEventViewElementDefined(card.OnClick)) {
            roleAttribute = ' role="button"';
        }

        // Div<, TabIndex@, Class@, Id@, Div>
        var cardMarkup = '<div class="gtc-card' + extraClassing + '"' + extraFlipAttribute + ' data-namespace="Card"' + roleAttribute + ViewElement.RenderAttributes(card);

        // Wire OnClick!
        if (Common.IsEventViewElementDefined(card.OnClick)) {
            // Data-ControllerPath/ActionName
            cardMarkup += ' data-click=\'' + JSON.stringify(card.OnClick) + '\'';
            var eventType = 'click';
            if (Common.CheckMedia('Mobile') || Common.CheckMedia('Tablet')) {
                eventType = 'tap';
                Touch.InitializeTouchEvents();
            }
            Events.On(document.body, eventType + '.' + card.Name, '#' + card.Name, Card.OnClick);

            // 508 Compliance - Focus In/Focus Out
            Events.On(document.body, 'focusin.' + card.Name, '#' + card.Name,
                function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    Events.On(document, 'keyup.' + card.Name,
                        function (keyupEvent) {
                            keyupEvent.preventDefault();
                            keyupEvent.stopPropagation();
                            var pressedKeyCode = (keyupEvent.keyCode ? keyupEvent.keyCode : keyupEvent.which);
                            if (pressedKeyCode == GTC.Keyboard.Enter) {
                                document.activeElement.blur();
                                var element = Common.Get(card.Name);
                                Events.Trigger(element, 'click');
                            }
                        }
                    );
                }
            );
            Events.On(document.body, 'focusout.' + card.Name, '#' + card.Name,
                function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    Events.Off(document, 'keyup.' + card.Name);
                }
            );
        }
        cardMarkup += '>';
        if (hasFlip) {
            cardMarkup += '<div class="gtc-card-flip-container">';
        }
        cardMarkup += '<div class="gtc-card-front"' + extraImageAttribute + '>';

        // Image
        if (Common.IsDefined(card.ImageSource)) {
            cardMarkup += '<div class="gtc-card-image"><img src="' + Common.BuildResourcePath(card.ImageSource) + '" /></div>';
        }

        // If title or descriptipn add content div
        if (Common.IsDefined(card.Title) || Common.IsDefined(card.Description)) {

            // Card Content
            cardMarkup += '<div id="' + card.Name + 'Content" class="gtc-card-content">';

            // Title
            if (Common.IsDefined(card.Title)) {
                cardMarkup += '<h3 id="' + card.Name + 'Title" class="gtc-page-theme-color" data-translate="' + card.Title + '">' + Common.TranslateKey(card.Title) + '</h3>';
            }

            // Description
            if (Common.IsDefined(card.Description)) {
                cardMarkup += '<p id="' + card.Name + 'Description" data-translate="' + card.Description + '">' + Common.TranslateKey(card.Description) + '</p>';
            }

            // Close Card Content
            cardMarkup += '</div>';
        }

        // Badge
        var badgeInt = parseInt(card.Badge, 10);
        if (Common.IsDefined(card.Badge) && Common.IsNotEmptyString(card.Badge) && (isNaN(card.Badge) || badgeInt > 1)) {
            var badgeClass = 'gtc-card-badge gtc-page-theme-background';
            if (!isNaN(card.Badge)) {
                if (badgeInt > 9) {
                    badgeClass += ' gtc-card-badge-doubledigit';
                }
                else {
                    badgeClass += ' gtc-card-badge-singledigit';
                }
            }
            cardMarkup += '<div class="' + badgeClass + '"><span class="gtc-card-badge-title">' + card.Badge + '</span></div>';
        }

        // Links
        if (Common.IsDefined(card.Links) && card.Links.length > 0) {
            // Div<>
            cardMarkup += '<div class="gtc-card-links">';

            // Links
            var link, index = 0, length = card.Links.length;
            for ( ; index < length; index++) {
                link = card.Links[index];

                // Id?
                if (Common.IsDefined(card.Id)) {
                    // Update Id to be unique
                    link.Name += Common.SanitizeToken(card.Id);
                }

                // Li<>, Anchor, Li</>
                cardMarkup += Link.Render(link);
            }

            // Div</>
            cardMarkup += '</div>';
        }

        // Front Element
        if (Common.IsDefined(card.FrontElement)) {
            cardMarkup += '<div class="gtc-card-front-element">';
            var frontElementNamespace = window[card.FrontElement.Type];
            ViewElement.TestExists(card.FrontElement.Type, frontElementNamespace);
            cardMarkup += frontElementNamespace.Render(card.FrontElement);
            cardMarkup += '</div>';
        }

        // Add flip button
        if (hasFlip) {
            cardMarkup += '<a id="' + card.Name + 'FlipFromFrontLink" class="gtc-card-flip-button"';
            if (card.FocusIndex > 0) {
                cardMarkup += ' tabindex="' + card.FocusIndex + '"';
            }
            cardMarkup += '><i class="gtc-icon-styles fa fa-retweet"></i><span class="gtc-sr-only" translate="FlipToBack">FlipToBack</span></a>';

            // 508 Compliance - Focus In/Focus Out
            Events.On(document.body, 'focusin.' + card.Name + 'FlipFromFrontLink', '#' + card.Name + 'FlipFromFrontLink',
                function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    Events.On(document, 'keyup.' + card.Name + 'FlipFromFrontLink',
                        function (keyupEvent) {
                            keyupEvent.preventDefault();
                            keyupEvent.stopPropagation();
                            var pressedKeyCode = (keyupEvent.keyCode ? keyupEvent.keyCode : keyupEvent.which);
                            if (pressedKeyCode == GTC.Keyboard.Enter) {
                                document.activeElement.blur();
                                var element = Common.Get(card.Name + 'FlipFromFrontLink');
                                Events.Trigger(element, 'click');
                                Common.Get(card.Name + 'FlipFromBackLink').focus();
                            }
                        }
                    );
                }
            );
            Events.On(document.body, 'focusout.' + card.Name + 'FlipFromFrontLink', '#' + card.Name + 'FlipFromFrontLink',
                function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    Events.Off(document, 'keyup.' + card.Name + 'FlipFromFrontLink');
                }
            );
        }

        // Div</>, Div</>
        cardMarkup += '</div>';

        // Add flip element
        if (hasFlip) {
            cardMarkup += '<div class="gtc-card-back">';
            var viewElementNamespace = window[card.FlipElement.Type];
            ViewElement.TestExists(card.FlipElement.Type, viewElementNamespace);
            cardMarkup += viewElementNamespace.Render(card.FlipElement);
            cardMarkup += '<a id="' + card.Name + 'FlipFromBackLink" class="gtc-card-flip-button"';
            if (card.FocusIndex > 0) {
                cardMarkup += ' tabindex="' + card.FocusIndex + '"';
            }
            cardMarkup += '><i class="gtc-icon-styles fa fa-retweet"></i><span class="gtc-sr-only" translate="FlipToFront">FlipToFront</span></a>';
            cardMarkup += '</div>';

            // 508 Compliance - Focus In/Focus Out
            Events.On(document.body, 'focusin.' + card.Name + 'FlipFromBackLink', '#' + card.Name + 'FlipFromBackLink',
                function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    Events.On(document, 'keyup.' + card.Name + 'FlipFromBackLink',
                        function (keyupEvent) {
                            keyupEvent.preventDefault();
                            keyupEvent.stopPropagation();
                            var pressedKeyCode = (keyupEvent.keyCode ? keyupEvent.keyCode : keyupEvent.which);
                            if (pressedKeyCode == GTC.Keyboard.Enter) {
                                document.activeElement.blur();
                                var element = Common.Get(card.Name + 'FlipFromBackLink');
                                Events.Trigger(element, 'click');
                                Common.Get(card.Name + 'FlipFromFrontLink').focus();
                            }
                        }
                    );
                }
            );
            Events.On(document.body, 'focusout.' + card.Name + 'FlipFromBackLink', '#' + card.Name + 'FlipFromBackLink',
                function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    Events.Off(document, 'keyup.' + card.Name + 'FlipFromBackLink');
                }
            );

            // Add events
            Events.On(document.body, 'click.' + card.Name + 'FlipFromFrontLink', '#' + card.Name + 'FlipFromFrontLink',
                function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    Common.AddClass(Common.Closest('.gtc-card-flip-container', this), 'gtc-flipped');
                }
            );
            Events.On(document.body, 'click.' + card.Name + 'FlipFromBackLink', '#' + card.Name + 'FlipFromBackLink',
                function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    Common.RemoveClass(Common.Closest('.gtc-card-flip-container', this), 'gtc-flipped');
                }
            );
        }
        if (hasFlip) {
            cardMarkup += '</div>';
        }
        cardMarkup += '</div>';

        // Return markup
        return cardMarkup;

    };

    /**
     * @function Card.OnClick
     * @param {event} event - A DOM click Event
     * @description Calls the OnClick<i>Card</i> Behavior of the Card in the CardPanel
     */
    Card.OnClick = function (event) {

        event.preventDefault();
        event.stopPropagation();
        if (Common.IsNotDefined(Common.Closest('.gtc-card-links', event.target))) {
            // Initialize
            var onClickParameters = [];

            // Get OnClickEvent object
            var onClickEvent = JSON.parse(Common.GetAttr(this, 'data-click'));
            if (Common.IsDefined(onClickEvent.UiParameters)) {
                onClickParameters = onClickParameters.concat(onClickEvent.UiParameters);
            }

            // Serialize Form?
            if (Common.IsDefined(onClickEvent.FormToSerialize)) {
                onClickParameters = onClickParameters.concat(Form.SerializeArray(Common.Get(onClickEvent.FormToSerialize)));
            }

            // Execute View Behavior
            Common.ExecuteViewBehavior(onClickEvent.ControllerPath + onClickEvent.ActionName, onClickParameters, Page.RunInstructions, this);
        }

    };

    /**
     * @function Card.ShowPinwheel
     * @param {object} card - The Card DOM element
     * @description Shows Pinwheel on the View Element
     */
    Card.ShowPinwheel = function (card) {

        SpinKit.Show(card, 'FadingCircle');

    };

    /**
     * @function Card.HidePinwheel
     * @param {object} card - The Card DOM element
     * @description Hides Pinwheel on the View Element
     */
    Card.HidePinwheel = function (card) {

        setTimeout(
            function () {
                SpinKit.Hide(card);
            }, 1000
        );

    };

    /**
     * @function Card.UpdateTitle
     * @param {object} card - The Card DOM element
     * @param {string} updatedTitle - The new Title of the card
     * @param {object[]} promises - An array of promises that is used to know when all Page Instructions are completed
     * @param {string} context - Current or Parent View
     * @description Updates the Title of the Card<br>
     *              One of the most confusing update title functions since chance some html may not exist
     */
    Card.UpdateTitle = function (card, updatedTitle, promises, context) {

        // Get deferred object for animation/work
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Initialize
        var isHidden = Common.IsHidden(card);
        var onParent = context == 'Parent';
        var title = Common.Get(card.id + 'Title', onParent);

        // Insert title if it didnt exist
        if (Common.IsNotDefined(title)) {

            // First check if content is there and insert content if it didnt exist
            InsertContent(card);

            // Now handle title
            var titleMarkup = '<h3 id="' + card.id + 'Title" class="gtc-page-theme-color" data-translate=""></h3>';
            var content = Common.Get(card.id + 'Content', onParent);
            Common.InsertHTMLString(content, Common.InsertType.Prepend, titleMarkup);
            title = Common.Get(card.id + 'Title', onParent);
        }

        // Define title update and translation update function
        var updateTitleFunction = function () {
            title.textContent = Common.TranslateKey(updatedTitle);
            Common.SetAttr(title, 'data-translate', updatedTitle);
        };

        // Update or animate
        if (isHidden) {
            updateTitleFunction();
            animationPromise.resolve();
        }
        else {
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

    /**
     * @function Card.UpdateBadge
     * @param {object} card - The Card DOM element
     * @param {string} value - The new value of the badge on the card
     * @description Updates the badge of the Card<br>
     */
    Card.UpdateBadge = function (card, value) {

        var cardBadge = Common.Query('.gtc-card-badge', card);
        var valueInt = parseInt(value, 10);
        if (Common.IsNotDefined(cardBadge)) {
            var badgeClass = 'gtc-card-badge gtc-page-theme-background';
            if (!isNaN(value)) {
                if (valueInt > 9) {
                    badgeClass += ' gtc-card-badge-doubledigit';
                }
                else {
                    badgeClass += ' gtc-card-badge-singledigit';
                }
            }
            var badgeMarkup = '<div style="display: none;" class="' + badgeClass + '"><span>' + value + '</span></div>';
            card.appendChild(Common.GenerateFragment(badgeMarkup));
            cardBadge = Common.Query('.gtc-card-badge', card);
            Velocity(cardBadge, 'fadeIn', 'slow');
        }
        else {
            Velocity(cardBadge, { 'opacity': 0 }, 'slow',
                function () {
                    if (!isNaN(value)) {
                        Common.RemoveClasses(this[0], 'gtc-card-badge-singledigit gtc-card-badge-doubledigit');
                        if (valueInt > 9) {
                            Common.AddClass(this[0], 'gtc-card-badge-doubledigit');
                        }
                        else if (valueInt == 1) {
                            Common.Remove(this[0]);
                            return;
                        }
                        else {
                            Common.AddClass(this[0], 'gtc-card-badge-singledigit');
                        }
                    }
                    Common.Query('.gtc-card-badge-title', this[0]).textContent = value;
                    Velocity(this[0], 'reverse', Common.RemoveOpacity);
                }
            );
        }

    };

    // Private Methods
    function InsertContent (card) {

        var content = Common.Query('.gtc-card-content', card);
        if (Common.IsNotDefined(content)) {
            var cardFront = Common.Query('.gtc-card-front', card);
            var cardImage = Common.Query('.gtc-card-image', cardFront);
            var contentMarkup = '<div id="' + card.id + 'Content" class="gtc-card-content"></div>';
            if (Common.IsNotDefined(cardImage)) {
                Common.InsertHTMLString(cardFront, Common.InsertType.Append, contentMarkup);
            }
            else {
                Common.InsertHTMLString(cardImage, Common.InsertType.After, contentMarkup);
            }
        }

    };

} (window.Card = window.Card || {}, window, document, Common, Cache, Events, Velocity));

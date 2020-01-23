// Rating Display Item
// Based On: DisplayItem -> ViewElement
(function (RatingDisplayItem, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    RatingDisplayItem.Render = function (ratingDisplayItem, displayDetail) {

        var className = '';
        if (Common.IsDefined(ratingDisplayItem.ItemSpan)) {
            className = ' gtc-columns-' + ratingDisplayItem.ItemSpan;
        }

        // Li<, TabIndex@, Class@, Id@
        var ratingDisplayItemMarkup = '<li data-namespace="RatingDisplayItem" class="gtc-displaydetail-column' + className + '"' + ViewElement.RenderAttributes(ratingDisplayItem) + EventElement.AttachEvent(ratingDisplayItem.Name, 'click', ratingDisplayItem.OnClick, RatingDisplayItem.OnClick);

        // Li>
        ratingDisplayItemMarkup += '>';

        // Color/Cursor
        if (Common.IsDefined(ratingDisplayItem.TextColor) || Common.IsEventViewElementDefined(ratingDisplayItem.OnClick)) {
            ratingDisplayItemMarkup += '<style>';
            ratingDisplayItemMarkup += '#' + displayDetail.Name + ' #' + ratingDisplayItem.Name + ' > .gtc-displaydetail-ratingitem { ';
            if (Common.IsDefined(ratingDisplayItem.TextColor)) {
                ratingDisplayItemMarkup += 'color: ' + Colors.ProcessValue(ratingDisplayItem.TextColor, false, null) + ';';
            }
            if (Common.IsEventViewElementDefined(ratingDisplayItem.OnClick)) {
                ratingDisplayItemMarkup += 'cursor:pointer;';
            }
            ratingDisplayItemMarkup += ' }';
            ratingDisplayItemMarkup += '</style>';
        }

        // Label
        if (Common.IsDefined(ratingDisplayItem.Label) && ratingDisplayItem.Label.length > 0) {
            // Span<>, Label, Span</>
            ratingDisplayItemMarkup += '<span class="gtc-displaydetail-item-head"';

            // Translations and Label masking
            var dateRegex = new RegExp(/\/Date\((-?\d+)\)\//gi);
            var isDate = dateRegex.test(ratingDisplayItem.Label);
            if (!isDate) {
                ratingDisplayItemMarkup += ' data-translate="' + ratingDisplayItem.Label + '"';
            }
            if (isDate && Common.IsDefined(ratingDisplayItem.Mask)) {
                var formatResult = Mask.Format(ratingDisplayItem.Label, Mask.BuildMaskingOptions(ratingDisplayItem.Mask));
                ratingDisplayItemMarkup += '>' + formatResult.Text + '</span>';
            }
            else {
                ratingDisplayItemMarkup += '>' + Common.TranslateKey(ratingDisplayItem.Label) + '</span>';
            }
        }

        // Sanity Check
        ratingDisplayItem.Value = (Common.IsNotDefined(ratingDisplayItem.Value)) ? '' : parseInt(ratingDisplayItem.Value, 10);

        // Stars
        ratingDisplayItemMarkup += '<div class="gtc-displaydetail-ratingitem">';
        var ratingValue = 0;
        if (Common.IsDefined(ratingDisplayItem.Value)) {
            var ratingValue = parseInt(ratingDisplayItem.Value, 10);
        }
        var index = 1;
        for ( ; index <= 5; index++) {
            if (index <= ratingValue) {
                ratingDisplayItemMarkup += '<span data-star="' + index + '" class="fa fa-star"></span>';
            }
            else {
                ratingDisplayItemMarkup += '<span data-star="' + index + '" class="fa fa-star-o"></span>';
            }
        }
        ratingDisplayItemMarkup += '</div>';

        // Li</>
        ratingDisplayItemMarkup += '</li>';
        return ratingDisplayItemMarkup;

    };

    RatingDisplayItem.OnClick = function (event) {

        // Initialize
        var ratingDisplayItem = Common.Closest('.gtc-displaydetail-column', this);
        var starClicked = Common.GetAttr(event.target, "data-star");
        var onClickParameters = [
                {
                    Name: 'RatingStars',
                    Value: starClicked,
                    UiParameters: null
                }
            ];

        // Get OnClickEvent object
        var onClickEvent = JSON.parse(Common.GetAttr(ratingDisplayItem, 'data-click'));
        if (Common.IsDefined(onClickEvent.UiParameters)) {
            onClickParameters = onClickParameters.concat(onClickEvent.UiParameters);
        }

        // Update Stars
        var promises = [];
        UpdateStars(ratingDisplayItem, starClicked, promises, 'fast');

        // Execute View Behavior
        Common.ExecuteViewBehavior(onClickEvent.ControllerPath + onClickEvent.ActionName, onClickParameters, Page.RunInstructions, ratingDisplayItem);

    };

    RatingDisplayItem.UpdateValue = function (ratingDisplayItem, fieldValue, promises) {

        // Sanity Check
        fieldValue = (Common.IsNotDefined(fieldValue)) ? '' : fieldValue;

        // Set Value
        UpdateStars(ratingDisplayItem, fieldValue, promises, 'slow');

    };

    // Private Methods
    function UpdateStars (ratingDisplayItem, fieldValue, promises, speed) {

        // Animation hide promise
        var animationHidePromise = Common.Promise();
        promises.push(animationHidePromise.promise);

        // Update Stars
        var ratingSpanDiv = Common.Query('.gtc-displaydetail-ratingitem', ratingDisplayItem);
        Velocity(ratingSpanDiv, { 'opacity': 0 }, speed,
            function () {
                // Animation Setup
                var animationPromise = Common.Promise();
                promises.push(animationPromise.promise);

                // Stars
                var ratingValue = 0;
                if (Common.IsDefined(fieldValue)) {
                    var ratingValue = parseInt(fieldValue, 10);
                }
                var startSpans = Common.QueryAll('span', ratingSpanDiv);
                var index = 1;
                for ( ; index <= 5; index++) {
                    Common.RemoveClasses(startSpans[index-1], 'fa-star fa-star-o');
                    if (index <= ratingValue) {
                        Common.AddClass(startSpans[index-1], 'fa-star');
                    }
                    else {
                        Common.AddClass(startSpans[index-1], 'fa-star-o');
                    }
                }

                // Animation Completion
                Velocity(ratingSpanDiv, 'reverse',
                    function () {
                        Common.RemoveOpacity(ratingSpanDiv);
                        animationHidePromise.resolve();
                        animationPromise.resolve();
                    }
                );
            }
        );

    };

} (window.RatingDisplayItem = window.RatingDisplayItem || {}, window, document, Common, Cache, Events, Velocity));

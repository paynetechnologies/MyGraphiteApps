// Label
(function (Label, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Label.RenderLabel = function (label, fieldName) {

        var className = '';
        if (Common.IsDefined(label.ExtraClassing)) {
            className += ' ' + label.ExtraClassing;
        }

        // 508 Compliance
        if (label.ScreenReaderOnly == true) {
            className += ' gtc-sr-only';
        }

        // Label<
        var labelMarkup = '<label id="' + fieldName + '-Label" class="gtc-label' + className + '"';

        // For@, Label>, Span<>
        labelMarkup += ' for="' + fieldName + '"><span';

        // Translations
        if (Common.IsDefined(label.TextString)) {
            labelMarkup += ' data-translate="' + label.TextString + '"';
        }

        // Span>, Label, Span</>
        labelMarkup += '>' + Common.TranslateKey(label.TextString) + '</span>';

        // Label</>
        labelMarkup += '</label>';

        // Tooltip
        if (Common.IsDefined(label.Tooltip)) {
            labelMarkup += '<a class="gtc-tooltip gtc-label-tooltip" data-translate="[data-tooltip]' + label.Tooltip + '" data-tooltip="' + Common.TranslateKey(label.Tooltip) + '"></a>';
        }
        return labelMarkup;

    };

    Label.UpdateLabel = function (label, labelValue, promises, context, isHidden) {

        // Get deferred object for animation
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Initialize
        var labelSpan = label.firstChild;
        var updateLabelFunction = function () {
            labelSpan.textContent = Common.TranslateKey(labelValue);
            Common.SetAttr(labelSpan, 'data-translate', labelValue);
        };
        if (isHidden) {
            updateLabelFunction();
            animationPromise.resolve();
        }
        else {
            // Animate
            Velocity(labelSpan, { 'opacity': 0 }, 'slow',
                function () {
                    updateLabelFunction();
                    Velocity(labelSpan, 'reverse',
                        function () {
                            Common.RemoveOpacity(labelSpan);
                            animationPromise.resolve();
                        }
                    );
                }
            );
        }

    };

} (window.Label = window.Label || {}, window, document, Common, Cache, Events, Velocity));

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

} (window.Label = window.Label || {}, window, document, Common, Cache, Events, Velocity));

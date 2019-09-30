// Paragraph
// Based On: Paragraph -> ViewElement
(function (Paragraph, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Paragraph.Render = function (paragraph) {

        // Sanity Check
        if (Common.IsNotDefined(paragraph)) {
            return '';
        }

        // Paragraph<, TabIndex@, Class@, Id@, Paragraph>
        var paragraphMarkup = '<p class="gtc-paragraph" data-namespace="Paragraph"' + ViewElement.RenderAttributes(paragraph);

        // Translations
        if (Common.IsDefined(paragraph.TextString)) {
            paragraphMarkup += ' data-translate="' + paragraph.TextString + '"';
        }
        paragraphMarkup += '>';

        // Paragraph
        paragraphMarkup += Common.TranslateKey(paragraph.TextString);

        // Paragraph</>
        paragraphMarkup += '</p>';

        // Return markup
        return paragraphMarkup;

    };

} (window.Paragraph = window.Paragraph || {}, window, document, Common, Cache, Events, Velocity));

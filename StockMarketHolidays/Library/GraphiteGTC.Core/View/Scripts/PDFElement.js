// PDFElement
// Based On: PDFElement -> ViewElement
(function (PDFElement, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    PDFElement.Render = function (pdfElement) {

        // Div<, Data-NameSpace@, TabIndex@, Class@, Id@, @Data-Height, Div>
        var pdfElementMarkup = '<div class="gtc-pdfelement" data-namespace="PDFElement"' + ViewElement.RenderAttributes(pdfElement);

        // object<
        var pdfSource = null;
        var isBase64 = (Common.IsDefined(pdfElement.PDFData) && pdfElement.PDFData.indexOf('data:') == 0) ? true : false;
        if (!isBase64) {
            if (Common.IsDefined(pdfElement.PDFData)) {
                pdfSource = Common.BuildResourcePath(pdfElement.PDFData);
            }
        }
        else {
            pdfSource = pdfElement.PDFData;
        }
        var objectElementMarkup = '<object class="gtc-pdfelement-embed" type="application/pdf" data="' + pdfSource + '"';

        // Dimension styles
        if (Common.IsDefined(pdfElement.Dimension)) {
            if (Common.IsDefined(pdfElement.Dimension.Height)) {
                pdfElementMarkup += ' data-height="' + pdfElement.Dimension.Height + '"';
                objectElementMarkup += ' height="' + pdfElement.Dimension.Height + '"';
            }
            if (Common.IsDefined(pdfElement.Dimension.Width)) {
                pdfElementMarkup += ' data-width="' + pdfElement.Dimension.Width + '"';
                objectElementMarkup += ' width="' + pdfElement.Dimension.Width + '"';
            }
            else {
                objectElementMarkup += ' width="100%"';
            }
        }
        else {
            objectElementMarkup += ' width="100%"';
        }

        // object</>
        pdfElementMarkup += '>';
        objectElementMarkup += '></object>';

        // Div</>
        pdfElementMarkup += objectElementMarkup + '</div>';
        return pdfElementMarkup;

    };

    PDFElement.UpdateValue = function (element, pdfData) {

        // Get embed Element
        var embedElement = Common.Query('.gtc-pdfelement-embed', element);

        // Build PDF Source
        var pdfSource = null;
        var isBase64 = (Common.IsDefined(pdfData) && pdfData.indexOf('data:') == 0) ? true : false;
        if (!isBase64) {
            if (Common.IsDefined(pdfData)) {
                pdfSource = Common.BuildResourcePath(pdfData);
            }
        }
        else {
            pdfSource = pdfData;
        }

        // Build and Set embed Markup
        var embedElementMarkup = '<embed width="' + Common.GetAttr(element, 'data-width') + '" height="' + Common.GetAttr(element, 'data-height') + '" type="application/pdf" src="' + pdfSource + '"></embed>';
        Common.InsertHTMLString(embedElement, Common.InsertType.After, embedElementMarkup);
        Common.Remove(embedElement);

    };

} (window.PDFElement = window.PDFElement || {}, window, document, Common, Cache, Events, Velocity));

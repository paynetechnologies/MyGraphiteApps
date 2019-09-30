/** 
 * @class DisplayArea
 * @classdesc Supports the DisplayArea View Element<br>
 *            Based On: ViewElement > ContainerElement
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (DisplayArea, window, document, Common, Cache, Events, Velocity, undefined) {

    /**
     * @function DisplayArea.Render
     * @param {object} displayArea - The DisplayArea View Element in JSON format
     * @description Generates the HTML markup for the DisplayArea View Element 
     * @returns {string} HTML Markup of the DisplayArea View Element
     */
    DisplayArea.Render = function (displayArea) {

        // Div<, NameSpace@
        var displayAreaMarkup = '<div data-namespace="DisplayArea"';

        // Class@, Id@
        displayAreaMarkup += ' class="gtc-displayarea ' + GenerateClassNames(displayArea) + '"' + ViewElement.RenderAttributes(displayArea) + '>';

        // Base Style
        var displayAreaBaseStyle = BuildDisplayAreaBaseStyle(displayArea);
        displayAreaMarkup += DisplayAreaStyle.RenderStyle(displayAreaBaseStyle, 'base', displayArea.Name);

        // Override Styles
        displayAreaMarkup += DisplayAreaStyle.RenderStyle(displayArea.OverrideForDesktop, 'desktop', displayArea.Name);
        displayAreaMarkup += DisplayAreaStyle.RenderStyle(displayArea.OverrideForLaptop, 'laptop', displayArea.Name);
        displayAreaMarkup += DisplayAreaStyle.RenderStyle(displayArea.OverrideForMobile, 'mobile', displayArea.Name);
        displayAreaMarkup += DisplayAreaStyle.RenderStyle(displayArea.OverrideForTablet, 'tablet', displayArea.Name);

        // DisplayArea
        displayAreaMarkup += ContainerElement.RenderElements(displayArea, (displayArea.DisableAutoGrid == 'Yes'), false, true);

        // Div</>
        displayAreaMarkup += '</div>';
        return displayAreaMarkup;

    };

    // Private Methods
    function GenerateClassNames (displayArea) {

        // Initialize
        var classSuffix = displayArea.Name.toLowerCase();

        // Styling Classes
        var classNames = 'gtc-displayarea-base-' + classSuffix;
        if (Common.IsDefined(displayArea.OverrideForDesktop)) {
            classNames += ' gtc-displayarea-desktop-' + classSuffix;
        }
        if (Common.IsDefined(displayArea.OverrideForLaptop)) {
            classNames += ' gtc-displayarea-laptop-' + classSuffix;
        }
        if (Common.IsDefined(displayArea.OverrideForMobile)) {
            classNames += ' gtc-displayarea-mobile-' + classSuffix;
        }
        if (Common.IsDefined(displayArea.OverrideForTablet)) {
            classNames += ' gtc-displayarea-tablet-' + classSuffix;
        }

        // Gridding Class
        classNames += ' gtc-displayarea-';
        if (displayArea.DisableAutoGrid == 'Yes') {
            classNames += 'nogrid';
        }
        else {
            classNames += 'grid';
        }
        return classNames;

    };

    function BuildDisplayAreaBaseStyle (displayArea) {

        var displayAreaBaseStyle = {
            Background: displayArea.Background,
            Border: displayArea.Border,
            Dimension: displayArea.Dimension,
            DisplayType: displayArea.DisplayType,
            Font: displayArea.Font,
            IsContentCentered: displayArea.IsContentCentered,
            Layer: displayArea.Layer,
            Margin: displayArea.Margin,
            Maximum: displayArea.Maximum,
            Minimum: displayArea.Minimum,
            Opacity: displayArea.Opacity,
            Overflow: displayArea.Overflow,
            Padding: displayArea.Padding,
            Position: displayArea.Position,
            RoundedCorner: displayArea.RoundedCorner,
            Shadow: displayArea.Shadow,
            VerticalAlignment: displayArea.VerticalAlignment
        };
        return displayAreaBaseStyle;

    };

} (window.DisplayArea = window.DisplayArea || {}, window, document, Common, Cache, Events, Velocity));

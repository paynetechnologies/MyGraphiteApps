/** 
 * @class ContainerElement
 * @classdesc Supports the ContainerElement View Element<br>
 *            Based On: ViewElement
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (ContainerElement, window, document, Common, Cache, Events, Velocity, undefined) {

    /**
     * @function ContainerElement.RenderElements
     * @param {object} containerElement - The ContainerElement View Element in JSON format
     * @param {boolean} disableGridding - Disable Flexbox griding? 
     * @param {boolean} isElementPack - Is this ContainerElement an ElementPack?
     * @param {boolean} isDisplayArea - Is this ContainerElement a DisplayArea?
     * @description Generates the HTML markup for a Container View Element 
     * @returns {string} HTML Markup of the Container View Element
     */
    ContainerElement.RenderElements = function (containerElement, disableGridding, isElementPack, isDisplayArea) {

        // Intitialize
        var containerElementMarkup = '';

        // Do view elements exist?
        if (Common.IsDefined(containerElement.ViewElements)) {

            // Initialize variables for responsive grids
            var currentGridStartingIndex, calculatedGrid, currentIterationMarkup, currentGridType;
            var inGridIteration = false;

            // Iterate over view elements
            var viewElement, viewElementIndex = 0, length = containerElement.ViewElements.length;
            for ( ; viewElementIndex < length; viewElementIndex++) {
                viewElement = containerElement.ViewElements[viewElementIndex];

                // If not in grid iteration reset markup, cache current index, find number of contiguous same typed elements
                if (!inGridIteration) {
                    inGridIteration = true;
                    currentIterationMarkup = '';
                    currentGridStartingIndex = viewElementIndex;

                    // If DisplayArea, grid in line regardless of type else grid by same types
                    if (isDisplayArea == true) {
                        currentGridType = containerElement.Type.toLowerCase() + '-children';
                        calculatedGrid = length;
                    }
                    else {
                        currentGridType = viewElement.Type.toLowerCase();
                        calculatedGrid = CalculateGridSize(containerElement.ViewElements.slice(currentGridStartingIndex), viewElement.Type);
                    }
                }

                // Set element pack children to have same display as element pack (if hidden)
                if (isElementPack == true && containerElement.IsDisplayed == 'No') {
                    viewElement.IsDisplayed = 'No';
                }

                // Get view element namespace and check for existing render
                var viewElementNamespace = window[viewElement.Type];
                ViewElement.TestExists(viewElement.Type, viewElementNamespace);

                // Render Element
                currentIterationMarkup += viewElementNamespace.Render(viewElement);

                // Check if we need to start a new container
                if (inGridIteration && viewElementIndex == currentGridStartingIndex + calculatedGrid - 1) {
                    // Do not wrap an ElementPack base object with grid or when gridding disabled
                    if (viewElement.Type != 'ElementPack' && disableGridding != true) {
                        currentIterationMarkup = '<section class="gtc-grid-container gtc-grid-items-' + calculatedGrid + ' gtc-type-' + currentGridType + '">' + currentIterationMarkup + '</section>';
                    }
                    containerElementMarkup += currentIterationMarkup;
                    inGridIteration = false;
                }
            }

            // Fallback to not lose any generated code
            if (Common.IsEmptyString(containerElementMarkup) && Common.IsDefined(currentIterationMarkup) && Common.IsNotEmptyString(currentIterationMarkup)) {
                containerElementMarkup += currentIterationMarkup;
            }
        }

        // Return markup
        return containerElementMarkup;

    };

    // Private Methods
    function CalculateGridSize (viewElements, viewElementType) {

        // Initialize
        var gridSize = 0;

        // Iterate over items
        var index = 0, length = viewElements.length;
        for ( ; index < length; index++) {
            // Only include matching types in dynamic gridding, new element type starts new grid container
            if (viewElements[index].Type == viewElementType) {
                gridSize++;
            }
            else {
                break;
            }
        }
        return gridSize;

    };

} (window.ContainerElement = window.ContainerElement || {}, window, document, Common, Cache, Events, Velocity));

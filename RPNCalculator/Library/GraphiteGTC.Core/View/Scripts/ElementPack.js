/** 
 * @class ElementPack
 * @classdesc Supports the ElementPack View Element<br>
 *            Based On: ViewElement > ContainerElement
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (ElementPack, window, document, Common, Cache, Events, Velocity, undefined) {

    /**
     * @function ElementPack.Render
     * @param {object} elementPack - The ElementPack View Element in JSON format
     * @description Generates the HTML markup for the ElementPack View Element 
     * @returns {string} HTML Markup of the ElementPack View Element
     */
    ElementPack.Render = function (elementPack) {

        var elementPackMarkup = '';
        if (Common.IsDefined(elementPack.ViewElements)) {
            elementPackMarkup += ContainerElement.RenderElements(elementPack, false, true);
        }
        return elementPackMarkup;

    };

} (window.ElementPack = window.ElementPack || {}, window, document, Common, Cache, Events, Velocity));

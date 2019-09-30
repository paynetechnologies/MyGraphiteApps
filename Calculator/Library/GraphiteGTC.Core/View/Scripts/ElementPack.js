// Element Pack
// Based On: ElementPack -> ContainerElement -> ViewElement
(function (ElementPack, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    ElementPack.Render = function (elementPack) {

        var elementPackMarkup = '';
        if (Common.IsDefined(elementPack.ViewElements)) {
            elementPackMarkup += ContainerElement.RenderElements(elementPack, false, true);
        }
        return elementPackMarkup;

    };

} (window.ElementPack = window.ElementPack || {}, window, document, Common, Cache, Events, Velocity));

// Slide
// Based On: Slide -> ContainerElement -> ViewElement
(function (Slide, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Slide.Render = function (slide) {

        // Li<, TabIndex@, Class@, Id@, Li>
        var slideMarkup = '<li class="gtc-slider-item" data-namespace="Slide"' + ViewElement.RenderAttributes(slide) + '>';

        // Render Container ViewElements
        slideMarkup += ContainerElement.RenderElements(slide, true);

        // Li</>
        slideMarkup += '</li>';
        return slideMarkup;

    };

} (window.Slide = window.Slide || {}, window, document, Common, Cache, Events, Velocity));

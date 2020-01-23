// Slider
// Based On: Slider -> ViewElement
(function (Slider, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Slider.Render = function (slider) {

        // Div<, TabIndex@, Class@, Id@, Div>
        var sliderMarkup = '<div class="gtc-slider" data-namespace="Slider" data-configure="Pre"' + ViewElement.RenderAttributes(slider);

        // Can Swipe
        if (slider.CanSwipe == 'Yes') {
            sliderMarkup += ' data-canswipe="Yes"';
        }
        sliderMarkup += '>';

        // Data-Translate@, Title
        if (Common.IsDefined(slider.Title)) {
            sliderMarkup += '<h3 data-translate="' + slider.Title + '">' + Common.TranslateKey(slider.Title) + '</h3>';
        }

        // Previous Anchor
        sliderMarkup += '<div class="gtc-slider-previous"><a><i class="gtc-icon-styles fa fa-arrow-circle-o-left" alt="' + Common.TranslateKey('Previous') + '" data-translate="[alt]Previous"></i></a></div>';

        // Ul<>
        sliderMarkup += '<ul class="gtc-slider-body">';

        // Slides
        if (Common.IsDefined(slider.Slides)) {
            var slide, index = 0, length = slider.Slides.length;
            for ( ; index < length; index++) {
                slide = slider.Slides[index];
                if (index == 0 && slide.IsDisplayed == 'No') {
                    continue;
                }
                sliderMarkup += Slide.Render(slide);
            }
        }

        // Ul</>
        sliderMarkup += '</ul>';

        // Next Anchor
        sliderMarkup += '<div class="gtc-slider-next"><a><i class="gtc-icon-styles fa fa-arrow-circle-o-right" alt="' + Common.TranslateKey('Next') + '" data-translate="[alt]Next"></i></a></div>';

        // Div</>
        sliderMarkup += '</div>';
        return sliderMarkup;

    };

    Slider.Configure = function (silder, configureStage) {

        Widgets.sliderbar(silder, { ItemsVisible: 7, ClassSlideOn: 'gtc-slider-arrow-on', AnimationWidth: '133px' });

    };

    Slider.PostInstructionConfiguration = function (slider) {

        Widgets.sliderbar(slider, 'Reinitialize');

    };

} (window.Slider = window.Slider || {}, window, document, Common, Cache, Events, Velocity));

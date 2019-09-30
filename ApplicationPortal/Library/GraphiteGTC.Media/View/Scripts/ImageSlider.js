// Image Slider
// Based On: ImageSlider -> ViewElement
(function (ImageSlider, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    ImageSlider.Render = function (imageSlider) {

        // Attach animation to interval
        if (Common.IsDefined(imageSlider.Images)) {
            var animationInterval = parseInt(imageSlider.TransitionDelay, 10) * 1000;
            var intervalId = setInterval(
                function () {
                    var currentIndex = parseInt(Common.GetAttr(Common.Get(imageSlider.Name), 'data-currentindex'), 10);
                    var nextIndex = currentIndex + 1;
                    AnimateImages(currentIndex, nextIndex, false);
                },
                animationInterval
            );
        }

        // Max-Height?
        var styleMarkup = '';
        var hasMaxHeight = false;
        if (Common.IsDefined(imageSlider.MaxHeight)) {
            styleMarkup += '<style>';
            styleMarkup += ' #' + imageSlider.Name + ' {';
            styleMarkup += ' max-height:' + imageSlider.MaxHeight + 'px;';
            styleMarkup += ' }';
            styleMarkup += '</style>';
            hasMaxHeight = true;
        }

        // Div<, Class@, Id@, Div>
        var imageSliderMarkup = styleMarkup + '<div class="gtc-image-slider" data-namespace="ImageSlider"' + ViewElement.RenderAttributes(imageSlider) + ' data-currentindex="0" data-intervalid="' + intervalId + '" data-transitiondelay="' + animationInterval + '" data-transition="' + imageSlider.Transition + '"><ul>';
        var dotsHtmlMarkup = '';
        if (Common.IsDefined(imageSlider.Images)) {
            dotsHtmlMarkup = '<ol class="gtc-classOlDots">';
            var imageSlide, index = 0, length = imageSlider.Images.length;
            for ( ; index < length; index++) {
                imageSlide = imageSlider.Images[index];
                imageSliderMarkup += '<li class="gtc-image-slide" data-namespace="ImageSlide"  style="';
                if (index > 0) {
                    imageSliderMarkup += ' display: none;';
                }
                imageSliderMarkup += '"';
                if (index == length - 1) {
                    imageSliderMarkup += ' data-lastimage="true"';
                }
                imageSliderMarkup += '><img class="gtc-img-responsive" src="' + Common.BuildResourcePath(imageSlide.Source) + '"';

                // Alt@
                if (Common.IsDefined(imageSlide.Title)) {
                    imageSliderMarkup += ' alt="' + Common.TranslateKey(imageSlide.Title) + '"';
                    imageSliderMarkup += ' data-translate="[alt]' + imageSlide.Title + '"';
                }
                imageSliderMarkup += ' /></li>';
                dotsHtmlMarkup += '<li class="gtc-classLiDot' + (index < 1 ? ' gtc-active' : '') + '"></li>';
            }
            dotsHtmlMarkup += '</ol>';
        }
        imageSliderMarkup += '</ul>' + dotsHtmlMarkup + '</div>';

        // Window resize
        if (!hasMaxHeight) {
            var onResizeEndFunction = function (event) {
                var imageSlider = Common.Get(event.data.ImageSliderName);
                Common.SetAttr(imageSlider, 'data-newheight', 'true');
                var currentIndex = parseInt(Common.GetAttr(imageSlider, 'data-currentindex'), 10);
                var nextIndex = currentIndex + 1;
                var intervalId = Common.GetAttr(imageSlider, 'data-intervalid');
                clearInterval(intervalId);
                AnimateImages(currentIndex, nextIndex, false);
                intervalId = setInterval(
                    function () {
                        var timerCurrentIndex = parseInt(Common.GetAttr(imageSlider, 'data-currentindex'), 10);
                        var timerNextIndex = timerCurrentIndex + 1;
                        AnimateImages(timerCurrentIndex, timerNextIndex, false);
                    },
                    parseInt(Common.GetAttr(imageSlider, 'data-transitiondelay'), 10)
                );
                Common.SetAttr(imageSlider, 'data-intervalid', intervalId);
                var pageContent = Common.Get('PageContent');
                var windowHeight = Common.Height(window);
                var height = windowHeight - (Common.Height(Common.Get('PageHeader')) || 0) - (Common.Height(Common.Get('PageFooter')) || 0) - (parseInt(Common.GetStyle(pageContent, 'padding-top'), 10) || 0) - (parseInt(Common.GetStyle(pageContent, 'padding-bottom'), 10) || 0);
                if (isNaN(height) == false) {
                    imageSlider.style.height = height + 'px';
                }
                else {
                    imageSlider.style.height = windowHeight + 'px';
                }
            };
            Common.AttachWindowResizingEvent(onResizeEndFunction, 'onImageSliderResize', { ImageSliderName: imageSlider.Name });
        }

        // Attach Dot Click
        Events.On(document.body, 'click.' + imageSlider.Name, '.gtc-classLiDot',
            function () {
                var imageSliderObject = Common.Get(imageSlider.Name);
                var intervalId = Common.GetAttr(imageSliderObject, 'data-intervalid');
                var currentIndex = parseInt(Common.GetAttr(imageSliderObject, 'data-currentindex'), 10);
                var nextIndex = Common.GetIndex(this);
                if (currentIndex != nextIndex) {
                    clearInterval(intervalId);
                    AnimateImages(currentIndex, nextIndex, true);
                    intervalId = setInterval(
                        function () {
                            var timerCurrentIndex = parseInt(Common.GetAttr(imageSliderObject, 'data-currentindex'), 10);
                            var timerNextIndex = timerCurrentIndex + 1;
                            AnimateImages(timerCurrentIndex, timerNextIndex, false);
                        },
                        parseInt(Common.GetAttr(imageSliderObject, 'data-transitiondelay'), 10)
                    );
                    Common.SetAttr(imageSliderObject, 'data-intervalid', intervalId);
                }
            }
        );

        // configureimageslider event: Setup configuring of height (triggered from Page.Configure)
        if (!hasMaxHeight && !Common.CheckMedia('Mobile')) {
            Events.One(document.body, 'configureimageslider',
                function (event) {
                    setTimeout(
                        function () {
                            var pageContent = Common.Get('PageContent');
                            var windowHeight = Common.Height(window);
                            var height = windowHeight - (Common.Height(Common.Get('PageHeader')) || 0) - (Common.Height(Common.Get('PageFooter')) || 0) - (parseInt(Common.GetStyle(pageContent, 'padding-top'), 10) || 0) - (parseInt(Common.GetStyle(pageContent, 'padding-bottom'), 10) || 0);
                            if (isNaN(height) == false) {
                                Common.Get(imageSlider.Name).style.height = height + 'px';
                            }
                            else {
                                Common.Get(imageSlider.Name).style.height = windowHeight + 'px';
                            }
                        }, 100
                    );
                }
            );
        }
        return imageSliderMarkup;

    };

    // Private Methods
    function AnimateImages(currentImageIndex, nextImageIndex, wasDotClicked) {

        var imageSlider = Common.Query('.gtc-image-slider');
        var slides = Common.QueryAll('.gtc-image-slide');
        var currentSlide = slides[currentImageIndex];
        if (!wasDotClicked && Common.GetAttr(currentSlide, 'data-lastimage') == 'true') {
            nextImageIndex = 0;
        }
        var nextSlide = slides[nextImageIndex];
        Common.SetAttr(imageSlider, 'data-currentindex', Common.GetIndex(nextSlide));
        var contentWidth = Common.Width(currentSlide.parentNode);
        var currentSlideWidth = Common.Width(currentSlide);
        var currentSlideStyle = currentSlide.style;
        currentSlideStyle.width = currentSlideWidth + 'px';
        currentSlideStyle.position = 'absolute';
        currentSlideStyle.display = 'inline-block';
        var nextSlideStyle = currentSlide.style;
        nextSlideStyle.width = currentSlideWidth + 'px';
        nextSlideStyle.position = 'absolute';

        if (Common.GetAttr(imageSlider, 'data-newheight') == 'true') {
            var height = Common.Height(Common.Query('img', currentSlide));
            imageSlider.style.height = height + 'px';
            Common.RemoveAttr(imageSlider, 'data-newheight');
        }

        // Update Dots
        var activeDot = Common.Query('.gtc-classLiDot.gtc-active', imageSlider);
        Common.RemoveClass(activeDot, 'gtc-active');
        var allDots = Common.QueryAll('.gtc-classLiDot', imageSlider);
        Common.AddClass(allDots[Common.GetIndex(nextSlide)], 'gtc-active');

        // Move new image right after current image and slide
        var animationType = Common.GetAttr(imageSlider, 'data-transition');
        if (animationType == 'Slide') {
            if (currentImageIndex < nextImageIndex) {
                nextSlideStyle.left = contentWidth + 'px';
                nextSlideStyle.display = 'inline-block';
                Velocity(currentSlide, { 'left': '-=' + contentWidth + 'px' }, 'slow',
                    function () {
                        currentSlideStyle.display = 'none';
                    }
                );
                Velocity(nextSlide, { 'left': '-=' + contentWidth + 'px' }, 'slow');
            }
            else {
                nextSlideStyle.left = '-' + contentWidth + 'px';
                nextSlideStyle.display = 'inline-block';
                Velocity(currentSlide, { 'left': '+=' + contentWidth + 'px' }, 'slow',
                    function () {
                        currentSlideStyle.display = 'none';
                    }
                );
                Velocity(nextSlide, { 'left': '+=' + contentWidth + 'px' }, 'slow');
            }
        }
        else if (animationType == 'Fade') {
            Velocity(currentSlide, 'fadeOut', 'slow',
                function () {
                    Velocity(nextSlide, 'fadeIn', 'slow');
                }
            );
        }
        else if (animationType == 'FadeAsOne') {
            Velocity(currentSlide, 'fadeOut', 1500,
                function () {
                    currentSlideStyle.width = '';
                    currentSlideStyle.position = '';
                }
            );
            Velocity(nextSlide, 'fadeIn', 1500,
                function () {
                    nextSlideStyle.width = '';
                    nextSlideStyle.position = '';
                }
            );
        }
        else if (animationType == 'FadeSlideCorner') {
            Velocity(currentSlide, 'transition.swoopOut');
            Velocity(nextSlide, 'transition.swoopIn');
        }
        else if (animationType == 'FadeSlide') {
            if (currentImageIndex < nextImageIndex) {
                Velocity(currentSlide, 'transition.slideLeftBigOut');
                Velocity(nextSlide, 'transition.slideRightBigIn');
            }
            else {
                Velocity(currentSlide, 'transition.slideRightBigOut');
                Velocity(nextSlide, 'transition.slideLeftBigIn');
            }
        }

    };

} (window.ImageSlider = window.ImageSlider || {}, window, document, Common, Cache, Events, Velocity));

// Slider Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var SliderWidget = {

        // Options
        options: {
            ItemsVisible: undefined,
            AnimationWidth: undefined,
            ClassSlideOn: 'gtc-slider-arrow-on',
            ClassSlideOff: 'gtc-slider-arrow-off',
            InitialViewIndex: undefined,
            SlidesInAnimation: undefined,
            IsSlideCountOff: false
        },

        // Public Methods
        AddScrollbar: function () {

            this._addScrollbar();

        },

        Reinitialize: function () {

            this._reinitialize();

        },

        // Private Methods
        _setInitialViewIndex: function (index) {

            var elementToSlideTo = Common.Query('ul li', this.element)[index];
            var intAnimationWidth = parseInt(this.options.AnimationWidth.replace('px', ''), 10);
            var slideClickTimes = Common.Position(elementToSlideTo).left / intAnimationWidth;
            Common.Query('ul', this.element).style.left = '-' + (slideClickTimes * intAnimationWidth) + 'px';
            this.Counters.LeftLiItem += slideClickTimes;
            this.Counters.RightLiItem += slideClickTimes;
            if (this.Counters.LeftLiItem > slideClickTimes) {
                this._bindSlideLeft();
            }
            if (this.Counters.RightLiItem >= this.Counters.TotalLiItems) {
                this._unbindSlideRight();
            }

        },

        _unbindSlideLeft: function () {

            var sliderPrevious = Common.Query('.gtc-slider-previous', this.element);
            Common.RemoveClass(sliderPrevious, this.options.ClassSlideOn);
            Common.AddClass(sliderPrevious, this.options.ClassSlideOff);
            var anchor = Common.Query('a', sliderPrevious);
            Events.Off(anchor, 'mouseenter');
            Events.Off(anchor, 'mouseleave');
            Events.Off(anchor, 'click');
            this.Counters.LeftClickBound = false;

        },

        _unbindSlideRight: function () {

            var sliderNext = Common.Query('.gtc-slider-next', this.element);
            Common.RemoveClass(sliderNext, this.options.ClassSlideOn);
            Common.AddClass(sliderNext, this.options.ClassSlideOff);
            var anchor = Common.Query('a', sliderNext);
            Events.Off(anchor, 'mouseenter');
            Events.Off(anchor, 'mouseleave');
            Events.Off(anchor, 'click');
            this.Counters.RightClickBound = false;

        },

        _bindSlideLeft: function () {

            if (!this.Counters.LeftClickBound) {
                // Initialize
                var thisWidget = this;
                var sliderPrevious = Common.Query('.gtc-slider-previous', this.element);
                var anchor = Common.Query('a', sliderPrevious);
                Common.RemoveClass(sliderPrevious, thisWidget.options.ClassSlideOff);

                // Hover
                Events.On(anchor, {
                    mouseenter: function () {
                        Common.AddClass(sliderPrevious, thisWidget.options.ClassSlideOn);
                    },
                    mouseleave: function () {
                        Common.RemoveClass(sliderPrevious, thisWidget.options.ClassSlideOn);
                    }
                });

                // Click
                thisWidget.Counters.LeftClickBound = true;
                Events.On(anchor, 'click',
                    function (event) {
                        thisWidget.options.AnimationWidth = Common.Width(Common.QueryAllVisible('li', thisWidget.element)[0], true);
                        thisWidget.options.SlidesInAnimation = thisWidget._calculateSlidesInAnimation();
                        thisWidget.options.ItemsVisible = thisWidget.options.SlidesInAnimation;
                        var slideDecrease = thisWidget.options.SlidesInAnimation;
                        if (thisWidget.Counters.LeftLiItem - thisWidget.options.SlidesInAnimation < 1 && thisWidget.options.IsSlideCountOff) {
                            slideDecrease = thisWidget.Counters.LeftLiItem - 1;
                            thisWidget.options.IsSlideCountOff = false;
                        }
                        Velocity(Common.Query('ul', thisWidget.element), { left: '+=' + (thisWidget.options.AnimationWidth * slideDecrease) + 'px' }, 500);
                        thisWidget.Counters.LeftLiItem -= slideDecrease;
                        thisWidget.Counters.RightLiItem -= slideDecrease;
                        if (thisWidget.Counters.RightLiItem < thisWidget.Counters.TotalLiItems) {
                            thisWidget._bindSlideRight();
                        }
                        if (thisWidget.Counters.LeftLiItem <= thisWidget.options.SlidesInAnimation && !thisWidget.options.IsSlideCountOff) {
                            thisWidget._unbindSlideLeft();
                        }
                        event.stopPropagation();
                    }
                );
            }
        },

        _bindSlideRight: function () {

            if (!this.Counters.RightClickBound) {
                // Initialize
                var thisWidget = this;
                var sliderNext = Common.Query('.gtc-slider-next', this.element);
                var anchor = Common.Query('a', sliderNext);
                Common.RemoveClass(sliderNext, thisWidget.options.ClassSlideOff);

                // Hover
                Events.On(anchor, {
                    mouseenter: function () {
                        Common.AddClass(sliderNext, thisWidget.options.ClassSlideOn);
                    },
                    mouseleave: function () {
                        Common.RemoveClass(sliderNext, thisWidget.options.ClassSlideOn);
                    }
                });

                // Click
                thisWidget.Counters.RightClickBound = true;
                Events.On(anchor, 'click',
                    function (event) {
                        thisWidget.options.AnimationWidth = Common.Width(Common.QueryAllVisible('li', thisWidget.element)[0], true);
                        thisWidget.options.SlidesInAnimation = thisWidget._calculateSlidesInAnimation();
                        thisWidget.options.ItemsVisible = thisWidget.options.SlidesInAnimation;
                        var slideIncrease = thisWidget.options.SlidesInAnimation;
                        if (thisWidget.Counters.TotalLiItems - thisWidget.Counters.RightLiItem < thisWidget.options.SlidesInAnimation) {
                            slideIncrease = thisWidget.Counters.TotalLiItems - thisWidget.Counters.RightLiItem;
                            thisWidget.options.IsSlideCountOff = true;
                        }
                        Velocity(Common.Query('ul', thisWidget.element), { left: '-=' + (thisWidget.options.AnimationWidth * slideIncrease) + 'px' }, 500);
                        thisWidget.Counters.LeftLiItem += slideIncrease;
                        thisWidget.Counters.RightLiItem += slideIncrease;
                        if (thisWidget.Counters.LeftLiItem > 0) {
                            thisWidget._bindSlideLeft();
                        }
                        if (thisWidget.Counters.RightLiItem >= thisWidget.Counters.TotalLiItems) {
                            thisWidget._unbindSlideRight();
                        }
                        event.stopPropagation();
                    }
                );
            }

        },

        _configureSwipping: function () {

            // Initialize
            var thisWidget = this;

            // Previous
            if (thisWidget.TouchConfigured != true) {
                Touch.InitializeTouchEvents();
                var anchorPrevious = Common.Query('a', Common.Query('.gtc-slider-previous', this.element));
                var anchorNext = Common.Query('a', Common.Query('.gtc-slider-next', this.element));
                Events.On(thisWidget.element, 'swiperight',
                    function (event) {
                        event.preventDefault();
                        Events.Trigger(anchorPrevious, 'click');
                    }
                );

                // Next
                Events.On(thisWidget.element, 'swipeleft',
                    function (event) {
                        event.preventDefault();
                        Events.Trigger(anchorNext, 'click');
                    }
                );
            }

        },

        _calculateSlidesInAnimation: function () {

            // Initialize
            var thisWidget = this;
            var slidesInAnimation = 0;

            // Find visible slides in view
            var sliderNextPosition = Common.Position(Common.Query('.gtc-slider-next', this.element));
            var visibleSlides = Common.QueryAllVisible('li', thisWidget.element);
            var slide, index = 0, length = visibleSlides.length;
            for ( ; index < length; index++) {
                slide = visibleSlides[index];
                if (Common.Position(slide).left + Common.Width(slide) < sliderNextPosition.left) {
                    slidesInAnimation++;
                }
                else {
                    break;
                }
            }
            return slidesInAnimation;

        },

        _reinitialize: function () {

            // Initialize
            var thisWidget = this;

            // Initialize data attributes
            thisWidget.options.AnimationWidth = Common.Width(Common.QueryAllVisible('li', thisWidget.element)[0], true);
            thisWidget.options.SlidesInAnimation = thisWidget._calculateSlidesInAnimation();
            thisWidget.options.ItemsVisible = thisWidget.options.SlidesInAnimation;

            // Data
            thisWidget.Counters = {
                TotalLiItems: 0,
                LeftLiItem: 0,
                RightLiItem: 0,
                RightClickBound: false,
                LeftClickBound: false
            };

            // Initialize Counters
            thisWidget.Counters.TotalLiItems = Common.QueryAllVisible('li', thisWidget.element).length;
            thisWidget.Counters.LeftLiItem = 1;
            thisWidget.Counters.RightLiItem = thisWidget.Counters.TotalLiItems;
            if (thisWidget.Counters.RightLiItem > thisWidget.options.ItemsVisible) {
                thisWidget.Counters.RightLiItem = thisWidget.options.ItemsVisible;
            }
            thisWidget.Counters.RightClickBound = false;
            thisWidget.Counters.LeftClickBound = false;

            // Set sliders off
            Common.AddClass(Common.Query('.gtc-slider-previous', this.element), thisWidget.options.ClassSlideOff);
            Common.AddClass(Common.Query('.gtc-slider-next', this.element), thisWidget.options.ClassSlideOff);

            // Check if sliding needed
            if (thisWidget.Counters.TotalLiItems > thisWidget.options.ItemsVisible) {
                // Initialize Right Slide
                thisWidget._bindSlideRight();

                // If sliding needed and canswipe, initialize swiping
                if (Common.GetAttr(thisWidget.element, 'data-canswipe') == 'Yes') {
                    thisWidget._configureSwipping();
                    thisWidget.TouchConfigured = true;
                }
            }

            // Reset slider
            thisWidget._unbindSlideLeft();
            Common.Query('ul', thisWidget.element).style.left = '0px';

        },

        _addScrollbar: function () {

            // Initialize
            var thisWidget = this;

            // Add scroll class
            Common.AddClasses(thisWidget.element, 'gtc-cfscroll-y gtc-cfscroll-x');

        },

        _init: function () {
        },

        _create: function () {

            // Initialize
            var thisWidget = this;

            // Initialize data attributes
            thisWidget.options.AnimationWidth = Common.Width(Common.QueryAllVisible('li', thisWidget.element)[0], true);
            thisWidget.options.SlidesInAnimation = thisWidget._calculateSlidesInAnimation();
            thisWidget.options.ItemsVisible = thisWidget.options.SlidesInAnimation;

            // Data
            thisWidget.Counters = {
                TotalLiItems: 0,
                LeftLiItem: 0,
                RightLiItem: 0,
                RightClickBound: false,
                LeftClickBound: false
            };

            // Initialize Counters
            thisWidget.Counters.TotalLiItems = Common.QueryAllVisible('li', thisWidget.element).length;
            thisWidget.Counters.LeftLiItem = 1;
            thisWidget.Counters.RightLiItem = thisWidget.Counters.TotalLiItems;
            if (thisWidget.Counters.RightLiItem > thisWidget.options.ItemsVisible) {
                thisWidget.Counters.RightLiItem = thisWidget.options.ItemsVisible;
            }
            thisWidget.Counters.RightClickBound = false;
            thisWidget.Counters.LeftClickBound = false;

            // Set sliders off
            Common.AddClass(Common.Query('.gtc-slider-previous', this.element), thisWidget.options.ClassSlideOff);
            Common.AddClass(Common.Query('.gtc-slider-next', this.element), thisWidget.options.ClassSlideOff);

            // Check if sliding needed
            if (thisWidget.Counters.TotalLiItems > thisWidget.options.ItemsVisible) {
                // Initialize Right Slide
                thisWidget._bindSlideRight();

                // If sliding needed and canswipe, initialize swiping
                if (Common.GetAttr(thisWidget.element, 'data-canswipe') == 'Yes') {
                    thisWidget._configureSwipping();
                    thisWidget.TouchConfigured = true;
                }
            }

            // Move initial index into view
            if (thisWidget.options.InitialViewIndex) {
                thisWidget._setInitialViewIndex(thisWidget.options.InitialViewIndex);
            }

            if (Common.CheckMedia('Mobile')) {
                thisWidget._addScrollbar();
                Events.On(document, 'mobilesliderscrollbar',
                    function () {
                        thisWidget._addScrollbar();
                    }
                );
            }

        }

    };

    WidgetFactory.Register('gtc.sliderbar', SliderWidget);

} (window, document, Common, Cache, Events, Velocity));

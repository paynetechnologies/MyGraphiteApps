// Image Gallery Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var ImageGalleryWidget = {

        // Options
        options: {
            SelectedImageId: null,
            ImageArray: null,
            ClassSlideLeftOn: 'gtc-classImageGallerySlideLeftOn',
            ClassSlideRightOn: 'gtc-classImageGallerySlideRightOn',
            ClassSlideLeftOff: 'gtc-classImageGallerySlideLeftOff',
            ClassSlideRightOff: 'gtc-classImageGallerySlideRightOff',
            TotalSlides: 0,
            CurrentSlide: 0,
            CurrentSelectedSlideImageId: null,
            RightClickBound: false,
            LeftClickBound: false
        },

        // Public Methods

        // Private Methods
        _attachThumbnailClicks: function () {

            var thisWidget = this;
            Events.On(Common.QueryAll('.gtc-classDivThumbnailImages img'), 'click',
                function (event) {
                    var clickedImage = this;
                    var lastImage = Common.Query('.gtc-classDivThumbnailImages .gtc-classLiSelectedImageShadow');
                    var selectedImage = Common.Get(thisWidget.options.SelectedImageId);
                    if (Common.GetAttr(this, 'src') != Common.GetAttr(selectedImage, 'src')) {
                        var clickedImageParent = clickedImage.parentNode;
                        thisWidget.options.CurrentSelectedSlideImageId = clickedImageParent.id;
                        Common.RemoveClass(lastImage, 'gtc-classLiSelectedImageShadow');
                        Common.AddClass(clickedImageParent, 'gtc-classLiSelectedImageShadow');
                        Velocity(selectedImage, { 'opacity': 0 }, 'fast',
                            function () {
                                Common.SetAttr(selectedImage, 'src', Common.GetAttr(clickedImage, 'src'));
                                Velocity(selectedImage, { 'opacity': 1 }, 'fast',
                                    function () {
                                        selectedImage.style.opacity = '';
                                    }
                                );
                            }
                        );
                        Common.Transfer(clickedImageParent, Common.Get(thisWidget.options.SelectedImageId).parentNode, 'gtc-modal-border-transfer gtc-page-theme-border', 400);
                        var lastModalBorder = Common.QueryAll('.gtc-modal-border-transfer');
                        lastModalBorder = lastModalBorder[lastModalBorder.length - 1];
                        if (Common.IsDefined(lastModalBorder)) {
                            lastModalBorderStyle = lastModalBorder.style;
                            lastModalBorderStyle.backgroundImage = 'url(' + Common.GetAttr(clickedImage, 'src') + ')';
                            lastModalBorderStyle.backgroundSize = 'cover';
                            lastModalBorderStyle.opacity = '0.5';
                            lastModalBorderStyle.borderRadius = '5px';
                        }
                    }
                }
            );

        },

        _attachSelectedImageClick: function () {

            var thisWidget = this;
            Events.On(Common.Get(thisWidget.options.SelectedImageId), 'click',
                function (event) {
                    Common.InsertHTMLString(document.body, Common.InsertType.Append, '<div class="gtc-classSelectedImageFullDisplayOverlay"></div>');
                    Common.InsertHTMLString(document.body, Common.InsertType.Append, '<div class="gtc-classSelectedImageFullDisplay"><img src="' + Common.GetAttr(this, 'src') + '" /></div>');
                    var selectedFullDisplay = Common.Query('.gtc-classSelectedImageFullDisplay');
                    var selectedFullDisplayOverlay = Common.Query('.gtc-classSelectedImageFullDisplayOverlay');
                    Modals.CenterHiddenDiv(selectedFullDisplay);
                    Velocity(selectedFullDisplayOverlay, 'fadeIn', 'slow');
                    Velocity(selectedFullDisplay, 'fadeIn', 'slow');
                    Events.On(Common.QueryAll('.gtc-classSelectedImageFullDisplay, .gtc-classSelectedImageFullDisplayOverlay'), 'click',
                        function () {
                            Velocity(selectedFullDisplay, 'fadeOut', 'slow',
                                function () {
                                    Common.Remove(selectedFullDisplay);
                                }
                            );
                            Velocity(selectedFullDisplayOverlay, 'fadeOut', 'slow',
                                function () {
                                    Common.Remove(selectedFullDisplayOverlay);
                                }
                            );
                        }
                    );
                }
            );

        },

        _attachThumbnailHover: function () {

            var thisWidget = this;
            var thumbnailSlider = Common.Query('.gtc-classDivThumbnailSlider');

        },

        _unbindSlideLeft: function () {

            var thisWidget = this;
            var previousAnchor = Common.Query('.gtc-classDivPrevious a');
            Events.Off(previousAnchor, 'hover');
            Events.Off(previousAnchor, 'click');
            Common.RemoveClass(previousAnchor, thisWidget.options.ClassSlideLeftOn);
            Common.AddClass(previousAnchor, thisWidget.options.ClassSlideLeftOff);
            thisWidget.options.LeftClickBound = false;

        },

        _unbindSlideRight: function () {

            var thisWidget = this;
            var nextAnchor = Common.Query('.gtc-classDivNext a');
            Events.Off(nextAnchor, 'hover');
            Events.Off(nextAnchor, 'click');
            Common.RemoveClass(nextAnchor, thisWidget.options.ClassSlideRightOn);
            Common.AddClass(nextAnchor, thisWidget.options.ClassSlideRightOff);
            thisWidget.options.RightClickBound = false;

        },

        _bindSlideLeft: function () {

            var thisWidget = this;
            if (!thisWidget.options.LeftClickBound) {
                var previousAnchor = Common.Query('.gtc-classDivPrevious a');
                Common.RemoveClass(previousAnchor, thisWidget.options.ClassSlideLeftOff);

                // Hover
                Events.On(previousAnchor, 'mouseenter',
                    function () {
                        Common.AddClass(previousAnchor, thisWidget.options.ClassSlideLeftOn);
                    }
                );
                Events.On(previousAnchor, 'mouseleave',
                    function () {
                        Common.RemoveClass(previousAnchor, thisWidget.options.ClassSlideLeftOn);
                    }
                );

                // Click
                thisWidget.options.LeftClickBound = true;
                Events.On(previousAnchor, 'click',
                    function (event) {
                        var nextSlide = thisWidget.options.ImageArray[thisWidget.options.CurrentSlide - 1];
                        var currentDivSlide = Common.Get('DivThumbnailSlide' + thisWidget.options.CurrentSlide);
                        thisWidget.options.CurrentSlide = thisWidget.options.CurrentSlide - 1;
                        var nextSlideHtmlMarkup = '<div style="display: none;" id="DivThumbnailSlide' + thisWidget.options.CurrentSlide + '" class="gtc-classDivThumbnailImages"><ul>';
                        for (var topIndex = 0; topIndex < nextSlide.Top.length; topIndex++) {
                            var newLiTopImageId = 'LiSlide' + thisWidget.options.CurrentSlide + 'Top' + topIndex;
                            nextSlideHtmlMarkup += '<li';
                            if (thisWidget.options.CurrentSelectedSlideImageId == newLiTopImageId) {
                                nextSlideHtmlMarkup += ' class="gtc-classLiSelectedImageShadow"';
                            }
                            nextSlideHtmlMarkup += ' id="' + newLiTopImageId + '"><img src="' + Common.BuildResourcePath(nextSlide.Top[topIndex].Source) + '"/></li>';
                        }
                        if (nextSlide.Top.length < 3) {
                            for (var topPaddingIndex = 0; topPaddingIndex < 3; topPaddingIndex++) {
                                nextSlideHtmlMarkup += '<li></li>';
                            }
                        }
                        nextSlideHtmlMarkup += '</ul><ul>';
                        for (var bottomIndex = 0; bottomIndex < nextSlide.Bottom.length; bottomIndex++) {
                            var newLiBottomImageId = 'LiSlide' + thisWidget.options.CurrentSlide + 'Bottom' + bottomIndex;
                            nextSlideHtmlMarkup += '<li';
                            if (thisWidget.options.CurrentSelectedSlideImageId == newLiBottomImageId) {
                                nextSlideHtmlMarkup += ' class="gtc-classLiSelectedImageShadow"';
                            }
                            nextSlideHtmlMarkup += ' id="' + newLiBottomImageId + '"><img src="' + Common.BuildResourcePath(nextSlide.Bottom[bottomIndex].Source) + '"/></li>';
                        }
                        if (nextSlide.Bottom.length < 3) {
                            for (var bottomPaddingIndex = 0; bottomPaddingIndex < 3; bottomPaddingIndex++) {
                                nextSlideHtmlMarkup += '<li></li>';
                            }
                        }
                        nextSlideHtmlMarkup += '</ul></div>';
                        Common.InsertHTMLString(Common.Query('.gtc-classDivPrevious'), Common.InsertType.After, nextSlideHtmlMarkup);
                        Velocity(currentDivSlide, 'fadeOut', 500,
                            function () {
                                Common.Remove(currentDivSlide);
                                Velocity(Common.Get('DivThumbnailSlide' + thisWidget.options.CurrentSlide), 'fadeIn', 500,
                                    function () {
                                        thisWidget._attachThumbnailClicks();
                                    }
                                );
                            }
                        );
                        if (thisWidget.options.CurrentSlide == 0 && thisWidget.options.LeftClickBound) {
                            thisWidget._unbindSlideLeft();
                        }
                        if (thisWidget.options.ImageArray.length > thisWidget.options.CurrentSlide + 1 && !thisWidget.options.RightClickBound) {
                            thisWidget._bindSlideRight();
                        }
                    }
                );
            }

        },

        _bindSlideRight: function () {

            var thisWidget = this;
            if (!thisWidget.options.RightClickBound) {
                var nextAnchor = Common.Query('.gtc-classDivNext a');
                Common.RemoveClass(nextAnchor, thisWidget.options.ClassSlideRightOff);

                // Hover
                Events.On(nextAnchor, 'mouseenter',
                    function () {
                        Common.AddClass(nextAnchor, thisWidget.options.ClassSlideRightOn);
                    }
                );
                Events.On(nextAnchor, 'mouseleave',
                    function () {
                        Common.RemoveClass(nextAnchor, thisWidget.options.ClassSlideRightOn);
                    }
                );

                // Click
                thisWidget.options.RightClickBound = true;
                Events.On(nextAnchor, 'click',
                    function (event) {
                        var nextSlide = thisWidget.options.ImageArray[thisWidget.options.CurrentSlide + 1];
                        var currentDivSlide = Common.Get('DivThumbnailSlide' + thisWidget.options.CurrentSlide);
                        thisWidget.options.CurrentSlide = thisWidget.options.CurrentSlide + 1;
                        var nextSlideHtmlMarkup = '<div style="display: none;" id="DivThumbnailSlide' + thisWidget.options.CurrentSlide + '" class="gtc-classDivThumbnailImages"><ul>';
                        for (var topIndex = 0; topIndex < nextSlide.Top.length; topIndex++) {
                            var newLiTopImageId = 'LiSlide' + thisWidget.options.CurrentSlide + 'Top' + topIndex;
                            nextSlideHtmlMarkup += '<li';
                            if (thisWidget.options.CurrentSelectedSlideImageId == newLiTopImageId) {
                                nextSlideHtmlMarkup += ' class="gtc-classLiSelectedImageShadow"';
                            }
                            nextSlideHtmlMarkup += ' id="' + newLiTopImageId + '"><img src="' + Common.BuildResourcePath(nextSlide.Top[topIndex].Source) + '"/></li>';
                        }
                        if (nextSlide.Top.length < 3) {
                            for (var topPaddingIndex = 0; topPaddingIndex < 3; topPaddingIndex++) {
                                nextSlideHtmlMarkup += '<li></li>';
                            }
                        }
                        nextSlideHtmlMarkup += '</ul><ul>';
                        for (var bottomIndex = 0; bottomIndex < nextSlide.Bottom.length; bottomIndex++) {
                            var newLiBottomImageId = 'LiSlide' + thisWidget.options.CurrentSlide + 'Bottom' + bottomIndex;
                            nextSlideHtmlMarkup += '<li';
                            if (thisWidget.options.CurrentSelectedSlideImageId == newLiBottomImageId) {
                                nextSlideHtmlMarkup += ' class="gtc-classLiSelectedImageShadow"';
                            }
                            nextSlideHtmlMarkup += ' id="' + newLiBottomImageId + '"><img src="' + Common.BuildResourcePath(nextSlide.Bottom[bottomIndex].Source) + '"/></li>';
                        }
                        if (nextSlide.Bottom.length < 3) {
                            for (var bottomPaddingIndex = 0; bottomPaddingIndex < 3; bottomPaddingIndex++) {
                                nextSlideHtmlMarkup += '<li></li>';
                            }
                        }
                        nextSlideHtmlMarkup += '</ul></div>';
                        Common.InsertHTMLString(Common.Query('.gtc-classDivPrevious'), Common.InsertType.After, nextSlideHtmlMarkup);
                        Velocity(currentDivSlide, 'fadeOut', 500,
                            function () {
                                Common.Remove(currentDivSlide);
                                Velocity(Common.Get('DivThumbnailSlide' + thisWidget.options.CurrentSlide), 'fadeIn', 500,
                                    function () {
                                        thisWidget._attachThumbnailClicks();
                                    }
                                );
                            }
                        );
                        if (thisWidget.options.CurrentSlide > 0 && !thisWidget.options.LeftClickBound) {
                            thisWidget._bindSlideLeft();
                        }
                        if (thisWidget.options.ImageArray.length == thisWidget.options.CurrentSlide + 1 && thisWidget.options.RightClickBound) {
                            thisWidget._unbindSlideRight();
                        }
                    }
                );
            }

        },

        _init: function () {
        },

        _create: function () {

            var thisWidget = this;
            var selectedImage = Common.Query('.gtc-classDivThumbnailImages ul:first-child li:first-child');
            Common.AddClass(selectedImage, 'gtc-classLiSelectedImageShadow');
            thisWidget.options.CurrentSelectedSlideImageId = selectedImage.id;

            // Initialize Data
            thisWidget.options.SelectedImageId = Common.Query('.gtc-classDivSelectedImage img', thisWidget.element).id;
            thisWidget.options.ImageArray = JSON.parse(Common.GetAttr(thisWidget.element, 'data-imageslides'));
            thisWidget.options.TotalSlides = thisWidget.options.ImageArray.length;

            // Set sliders off
            Common.AddClass(Common.Query('.gtc-classDivPrevious a'), thisWidget.options.ClassSlideLeftOff);
            Common.AddClass(Common.Query('.gtc-classDivNext a'), thisWidget.options.ClassSlideRightOff);

            // Check if sliding needed
            if (thisWidget.options.TotalSlides > 1) {
                // Initialize Right Slide
                thisWidget._bindSlideRight();
            }

            // Attach events
            thisWidget._attachThumbnailClicks();
            thisWidget._attachSelectedImageClick();
            thisWidget._attachThumbnailHover();
        }
    };

    WidgetFactory.Register('gtc.imagegallery', ImageGalleryWidget);

} (window, document, Common, Cache, Events, Velocity));

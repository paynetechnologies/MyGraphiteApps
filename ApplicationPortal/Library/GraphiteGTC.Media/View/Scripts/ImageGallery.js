// Image Gallery
// Based On: ImageGallery -> ViewElement
(function (ImageGallery, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    ImageGallery.Render = function (imageGallery) {

        // Break images into slides with upper and bottom sections
        var imageSlides = [];
        if (Common.IsDefined(imageGallery.Images)) {
            var arrayIndex = 0, imageLength = imageGallery.Images.length;
            for ( ; arrayIndex < imageLength; arrayIndex += 6) {
                var imageSlide = {};
                imageSlide.Top = imageGallery.Images.slice(arrayIndex, arrayIndex + 3);
                imageSlide.Bottom = imageGallery.Images.slice(arrayIndex + 3, arrayIndex + 6);
                imageSlides.push(imageSlide);
            }
        }

        // Build Html markup
        var imageGalleryMarkup = '<div class="gtc-imagegallery gtc-classDivImageGallery" data-namespace="ImageGallery"' + ViewElement.RenderAttributes(imageGallery) + ' data-imageslides=\'' + JSON.stringify(imageSlides) + '\'>';
        if (Common.IsDefined(imageGallery.Images)) {
            imageGalleryMarkup += '<div class="gtc-classDivSelectedImage"><img id="Img' + imageGallery.Name + 'SelectedImage" src="' + Common.BuildResourcePath(imageGallery.Images[0].Source) + '"/></div>';
            imageGalleryMarkup += '<div class="gtc-classDivThumbnailSlider">';

            // Previous Anchor
            imageGalleryMarkup += '<div class="gtc-classDivImageGalleryNavigation gtc-classDivPrevious"><a>Previous<i class="gtc-icon-styles fa fa-arrow-circle-o-left"></i></a></div><div id="DivThumbnailSlide0" class="gtc-classDivThumbnailImages">';

            // Build First slide
            var topImageUl = '<ul>';
            var bottomImageUl = '<ul>';
            var topIndex = 0, topLength = imageSlides[0].Top.length;
            for ( ; topIndex < topLength; topIndex++) {
                topImageUl += '<li id="LiSlide0Top' + topIndex + '"><img src="' + Common.BuildResourcePath(imageSlides[0].Top[topIndex].Source) + '"/></li>';
            }
            if (imageSlides[0].Top.length < 3) {
                var topPaddingIndex = 0;
                for ( ; topPaddingIndex < 3; topPaddingIndex++) {
                    topImageUl += '<li></li>';
                }
            }
            var bottomIndex = 0, bottomLength = imageSlides[0].Bottom.length;
            for ( ; bottomIndex < bottomLength; bottomIndex++) {
                bottomImageUl += '<li id="LiSlide0Bottom' + bottomIndex + '"><img src="' + Common.BuildResourcePath(imageSlides[0].Bottom[bottomIndex].Source, 'image') + '"/></li>';
            }
            if (imageSlides[0].Bottom.length < 3) {
                var bottomPaddingIndex = 0;
                for ( ; bottomPaddingIndex < 3; bottomPaddingIndex++) {
                    bottomImageUl += '<li></li>';
                }
            }
            topImageUl += '</ul>';
            bottomImageUl += '</ul>';
            imageGalleryMarkup += topImageUl + bottomImageUl;

            // Next Anchor
            imageGalleryMarkup += '</div><div class="gtc-classDivImageGalleryNavigation gtc-classDivNext"><a>Next<i class="gtc-icon-styles fa fa-arrow-circle-o-right"></i></a></div>';

            // Close gallery divs and return html
            imageGalleryMarkup += '</div>';
        }
        imageGalleryMarkup += '</div>';
        return imageGalleryMarkup;

    };

} (window.ImageGallery = window.ImageGallery || {}, window, document, Common, Cache, Events, Velocity));

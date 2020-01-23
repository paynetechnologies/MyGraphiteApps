// Image
// Based On: Image -> ViewElement
(function (Image, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Variables
    Image.Status = {
        NotSet: 0,
        Missing: 1,
        Exists: 2
    };

    // Public Methods
    Image.Render = function (image) {

        // Sanity Check
        var imageStatus = null;
        var imageSource = null;
        var dataImage = (Common.IsDefined(image.Source) && image.Source.indexOf('data:') == 0) ? true : false;
        if (!dataImage) {
            if (Common.IsDefined(image.Source)) {
                imageSource = Common.BuildResourcePath(image.Source);
                Events.One(document.body, 'configureimages.' + image.Name, '#' + image.Name,
                    function () {
                        // Make ajax request
                        var requestObject = new XMLHttpRequest();
                        requestObject.open('HEAD', imageSource, true);
                        requestObject.onload = function () {
                            if (this.status >= 200 && this.status < 400) {
                                // Success!
                            }
                            else {
                                Common.AddClass(Common.Get(image.Name), 'gtc-img-missing');
                            }
                        };
                        requestObject.onerror = function () {
                            Common.AddClass(Common.Get(image.Name), 'gtc-img-missing');
                        };
                        requestObject.send();
                    }
                );
            }
            else {
                imageStatus = Image.Status.NotSet;
            }
        }

        // ClassName
        var className = '';
        if (image.IsResponsive == 'Yes') {
            className += ' gtc-img-responsive';
        }
        if (imageStatus == Image.Status.NotSet) {
            className += ' gtc-img-notset';
        }

        // Does Name exist?
        if (Common.IsNotDefined(image.Name)) {
            image.Name = "GTCImage" + Common.GenerateUniqueID();
        }

        // Img<, Class@, Id@
        var imageMarkup = '<img class="gtc-image' + className + '" data-namespace="Image"' + ViewElement.RenderAttributes(image);

        // Alt@
        if (Common.IsNotDefined(image.Title)) {
            // 508 Compliance
            image.Title = image.Name;
        }
        imageMarkup += ' alt="' + Common.TranslateKey(image.Title) + '"';
        imageMarkup += ' data-translate="[alt]' + image.Title + '"';

        // Src@
        var finalSource = "";
        if (dataImage) {
            Page.Images++;
            finalSource = image.Source;
        }
        else if (Common.IsDefined(image.Source)) {
            Page.Images++;
            finalSource = imageSource;
        }

        // Onload images to properly calculate height
        Events.One(document.body, 'configureimages',
            function () {
                var imageElement = Common.Get(image.Name);
                Events.On(imageElement, 'load',
                    function () {
                        Page.LoadedImages++;
                        if (Page.Images == Page.LoadedImages) {
                            Page.SetPageHeight();
                        }
                    }
                );
                imageElement.src = finalSource;
            }
        );

        // Height@, Width@, Img>
        if (Common.IsDefined(image.Dimension)) {
            if (Common.IsDefined(image.Dimension.Height)) {
                imageMarkup += ' height="' + image.Dimension.Height + '"';
            }
            if (Common.IsDefined(image.Dimension.Width)) {
                imageMarkup += ' width="' + image.Dimension.Width + '"';
            }
        }
        imageMarkup += ' />';

        // Return markup
        return imageMarkup;

    };

    Image.UpdateValue = function (image, imageUrl, promises) {

        // Get deferred object for animation
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Update and animate
        Common.Wrap(image, Common.Create('div'));
        var wrapper = image.parentNode;
        if (Common.IsEmptyString(imageUrl)) {
            CleanupValueInstruction(wrapper, image, animationPromise, true);
        }
        else {
            var imageSource = Common.BuildResourcePath(imageUrl);
            Velocity(wrapper, 'slideUp', 'slow',
                function () {
                    Common.RemoveClass(image, 'gtc-img-notset');
                    Common.RemoveClass(image, 'gtc-img-missing');
                    var dataImage = (imageUrl.indexOf('data:') == 0) ? true : false;
                    if (!dataImage) {
                        var requestObject = new XMLHttpRequest();
                        requestObject.open('HEAD', imageSource, true);
                        requestObject.onload = function () {
                            if (this.status >= 200 && this.status < 400) {
                                image.onload = function () {
                                    CleanupValueInstruction(wrapper, image, animationPromise, false);
                                };
                                image.src = imageSource;
                            }
                            else {
                                image.src = '';
                                Common.AddClass(image, 'gtc-img-missing');
                                CleanupValueInstruction(wrapper, image, animationPromise, false);
                            }
                        };
                        requestObject.onerror = function () {
                            image.src = '';
                            Common.AddClass(image, 'gtc-img-missing');
                            CleanupValueInstruction(wrapper, image, animationPromise, false);
                        };
                        requestObject.send();
                    }
                    else {
                        image.src = imageUrl;
                        CleanupValueInstruction(wrapper, image, animationPromise, false);
                    }
                }
            );
        }

    };

    Image.UpdateImage = function (image, imageUrl, promises) {

        Image.UpdateValue(image, imageUrl, promises);

    };

    // Private Methods
    function CleanupValueInstruction (wrapper, image, animationPromise, isEmptyImage) {

        var animationType = isEmptyImage ? 'slideUp' : 'slideDown';
        Velocity(wrapper, animationType, 'slow',
            function () {
                Common.Unwrap(image);
                animationPromise.resolve();
            }
        );

    };

} (window.Image = window.Image || {}, window, document, Common, Cache, Events, Velocity));

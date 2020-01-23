/** 
 * @class BackButtonDetect
 * @classdesc Supports Back Button Detection (for Breadcrumb support)
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (BackButtonDetect, window, document, Common, Cache, Events, Velocity, undefined) {

    // Private Variables
    var FrameLoaded = 0;
    var FrameTry = 0;
    var FrameTimeout = null;
    var SafariHash = 'false';
    var Browser = {};

    /**
     * @function BackButtonDetect.Initialize
     * @description Initializes Back Button Detection
     */
    BackButtonDetect.Initialize = function () {

        Browser.IE = !!(window.attachEvent && !window.opera);
        Browser.Safari = navigator.userAgent.indexOf('Apple') > -1;
        Browser.iOSChrome = navigator.userAgent.match('CriOS');
        if (Browser.Safari && !Browser.iOSChrome) {
            setTimeout(
                function () {
                    BackButtonDetect.DetectSafariClick();
                }, 600
            );
        }
        else {
            Common.InsertHTMLString(document.body, Common.InsertType.Append, '<iframe title="BackButtonDetect" id="BackDetectOnBack" src="blank.html" style="display:none;" onload="BackButtonDetect.DetectClick();" onunload="alert(\'BackButtonTest\')"></iframe>');
        }

    };

    /**
     * @function BackButtonDetect.OnClickBack
     * @description Handles the click of the Back Button
     */
    BackButtonDetect.OnClickBack = function () {

        // Cleanup Breadcrumb
        var namespace = window['Breadcrumb'];
        if (Common.IsDefined(namespace)) {
            namespace.PopBreadcrumbData();
        }

    };

    /**
     * @function BackButtonDetect.InitializeFrames
     * @description Initializes the iframes
     */
    BackButtonDetect.InitializeFrames = function () {

        clearTimeout(FrameTimeout);
        var BackDetectiFrame = Common.Get('BackDetectOnBack');
        var CheckHistoryLoad = BackDetectiFrame.src.substr(-11, 11);
        if (FrameLoaded == 1 && CheckHistoryLoad != 'HistoryLoad') {
            BackDetectiFrame.src = 'blank.html?HistoryLoad';
        }
        else {
            if (FrameTry < 2 && CheckHistoryLoad != 'HistoryLoad') {
                FrameTry++;
                FrameTimeout = setTimeout(
                    function () {
                        BackButtonDetect.InitializeFrames();
                    }, 700
                );
            }
        }

    };

    /**
     * @function BackButtonDetect.DetectClick
     * @description Detects Back Click
     */
    BackButtonDetect.DetectClick = function () {

        if (FrameLoaded > 1) {
            if (FrameLoaded == 2) {
                BackButtonDetect.OnClickBack();
                history.back();
            }
        }
        FrameLoaded++;
        if (FrameLoaded == 1) {
            if (Browser.IE) {
                BackButtonDetect.InitializeFrames();
            }
            else {
                FrameTimeout = setTimeout(
                    function () {
                        BackButtonDetect.InitializeFrames();
                    }, 700
                );
            }
        }

    };

    /**
     * @function BackButtonDetect.DetectSafariClick
     * @description Detects Back Click on Safari
     */
    BackButtonDetect.DetectSafariClick = function () {

        if (SafariHash == 'false') {
            var bodyGroup = Common.GetAttr(document.body, 'data-group');
            if (window.location.hash == '#' + bodyGroup) {
                SafariHash = 'true';
            }
            else {
                window.location.hash = '#' + bodyGroup;
            }
            setTimeout(
                function () {
                    BackButtonDetect.DetectSafariClick();
                }, 100
            );
        }
        else if (SafariHash == 'true') {
            if (Common.IsEmptyString(window.location.hash)) {
                SafariHash = 'back';
                BackButtonDetect.OnClickBack();
                history.back();
            }
            else {
                setTimeout(
                    function () {
                        BackButtonDetect.DetectSafariClick();
                    }, 100
                );
            }
        }

    };

} (window.BackButtonDetect = window.BackButtonDetect || {}, window, document, Common, Cache, Events, Velocity));

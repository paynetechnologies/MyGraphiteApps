// SpinKit
// Based On: SpinKit
(function (SpinKit, window, document, Common, Cache, Events, Velocity, undefined) {

    // Private Variables
    var spinners = {
        ChasingDots: '<div class="sk-chasing-dots"><div class="sk-child sk-dot1"></div><div class="sk-child sk-dot2"></div></div>',
        Circle: '<div class="sk-circle"><div class="sk-circle1 sk-child"></div><div class="sk-circle2 sk-child"></div><div class="sk-circle3 sk-child"></div><div class="sk-circle4 sk-child"></div><div class="sk-circle5 sk-child"></div><div class="sk-circle6 sk-child"></div><div class="sk-circle7 sk-child"></div><div class="sk-circle8 sk-child"></div><div class="sk-circle9 sk-child"></div><div class="sk-circle10 sk-child"></div><div class="sk-circle11 sk-child"></div><div class="sk-circle12 sk-child"></div></div>',
        CubeGrid: '<div class="sk-cube-grid"><div class="sk-cube sk-cube1"></div><div class="sk-cube sk-cube2"></div><div class="sk-cube sk-cube3"></div><div class="sk-cube sk-cube4"></div><div class="sk-cube sk-cube5"></div><div class="sk-cube sk-cube6"></div><div class="sk-cube sk-cube7"></div><div class="sk-cube sk-cube8"></div><div class="sk-cube sk-cube9"></div></div>',
        DoubleBounce: '<div class="sk-double-bounce"><div class="sk-child sk-double-bounce1"></div><div class="sk-child sk-double-bounce2"></div>',
        FadingCircle: '<div class="sk-fading-circle"><div class="sk-circle1 sk-circle"></div><div class="sk-circle2 sk-circle"></div><div class="sk-circle3 sk-circle"></div><div class="sk-circle4 sk-circle"></div><div class="sk-circle5 sk-circle"></div><div class="sk-circle6 sk-circle"></div><div class="sk-circle7 sk-circle"></div><div class="sk-circle8 sk-circle"></div><div class="sk-circle9 sk-circle"></div><div class="sk-circle10 sk-circle"></div><div class="sk-circle11 sk-circle"></div><div class="sk-circle12 sk-circle"></div></div>',
        FoldingCube: '<div class="sk-folding-cube"><div class="sk-cube1 sk-cube"></div><div class="sk-cube2 sk-cube"></div><div class="sk-cube4 sk-cube"></div><div class="sk-cube3 sk-cube"></div></div>',
        Pulse: '<div class="sk-spinner sk-spinner-pulse"></div>',
        RotatingPlane: '<div class="sk-rotating-plane"></div>',
        ThreeBounce: '<div class="sk-three-bounce"><div class="sk-child sk-bounce1"></div><div class="sk-child sk-bounce2"></div><div class="sk-child sk-bounce3"></div></div>',
        WanderingCubes: '<div class="sk-wandering-cubes"><div class="sk-cube sk-cube1"></div><div class="sk-cube sk-cube2"></div></div>',
        Wave: '<div class="sk-wave"><div class="sk-rect sk-rect1"></div><div class="sk-rect sk-rect2"></div><div class="sk-rect sk-rect3"></div><div class="sk-rect sk-rect4"></div><div class="sk-rect sk-rect5"></div></div>'
    };

    // Public Methods
    SpinKit.Setup = function () {

        var spinKit = Common.GetStorage('CurrentSpinKit');
        if (Common.IsNotDefined(spinKit) || spinKit.length <= 0) {
            spinKit = Common.GetAttr(document.body, 'data-spinner');
            if (Common.IsNotDefined(spinKit) || spinKit.length <= 0) {
                spinKit = "FadingCircle";
            }
        }
        return spinKit;
    };

    SpinKit.Show = function (element, customType) {

        if (Common.IsEmptyString(element.id)) {
            element.id = Common.GenerateUniqueID();
        }
        var spinKit = customType;
        if (Common.IsNotDefined(spinKit) || spinKit.length <= 0) {
            spinKit = SpinKit.Setup();
        }
        var spinnerHtml = '<div id="GTC-SpinKit-' + element.id + '" class="gtc-spinkit">' + spinners[spinKit] + '</div>';

        // TODO: make this better; know which field
        if (Common.Closest('.gtc-coupledfieldset', element) != null) {
            element = element.lastElementChild;
        }
        Common.InsertHTMLString(element, Common.InsertType.Append, spinnerHtml);

    };

    SpinKit.Hide = function (element) {

        var spinner = Common.Query('#GTC-SpinKit-' + element.id, element);
        Common.Remove(spinner);

    };

    SpinKit.CleanupAll = function () {

        var allSpinners = Common.QueryAll('.gtc-spinkit');
        if (allSpinners.length) {
            Common.Remove(allSpinners);
        }
        if (window.parent != window.top) {
            var allParentSpinners = window.parent.Common.QueryAll('.gtc-spinkit');
            if (allParentSpinners.length) {
                window.parent.Common.Remove(allParentSpinners);
            }
        }

    };

} (window.SpinKit = window.SpinKit || {}, window, document, Common, Cache, Events, Velocity));

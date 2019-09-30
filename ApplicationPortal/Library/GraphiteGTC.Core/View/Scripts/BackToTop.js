// Back To Top
(function (BackToTop, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    BackToTop.Render = function () {

        // Div<, Class@, Div>, Icon, Div</>
        var backToTopMarkup = '<div id="QuickBackToTopDiv" class="gtc-backtotop"><a id="QuickBackToTopLink"><i class="gtc-page-theme-color gtc-icon-styles fa fa-arrow-circle-o-up"></i></a></div>';

        // Configure
        Events.One(document.body, 'configurebacktotop',
            function () {
                var backToTop = Common.Get('QuickBackToTopDiv');
                var hasTimeout = false
                Events.On(document, 'scroll.QuickBackToTopDiv',
                    function () {
                        if (Common.QueryAll('.velocity-animating').length == 0) {
                            handleBackToTop(backToTop);
                        }
                        else {
                            if (!hasTimeout) {
                                hasTimeout = true;
                                setTimeout(
                                    function () {
                                        handleBackToTop(backToTop);
                                        hasTimeout = false;
                                    }, 1000
                                );
                            }
                        }
                    }
                );
                Events.On(Common.Get('QuickBackToTopLink'), 'click',
                    function () {
                        Velocity(Common.QueryAll('html'), 'scroll', 400,
                            function () {
                                Velocity(backToTop, 'transition.slideRightOut');
                            }
                        );
                    }
                );
            }
        );

        // Return
        return backToTopMarkup;

    };

    function handleBackToTop (backToTop) {
        var isHidden = Common.IsHidden(backToTop);
        if (window.pageYOffset > 0 && isHidden) {
            Velocity(backToTop, 'transition.slideRightIn');
        }
        else if (window.pageYOffset <= 0 && !isHidden) {
            Velocity(backToTop, 'transition.slideRightOut');
        }
    };

} (window.BackToTop = window.BackToTop || {}, window, document, Common, Cache, Events, Velocity));

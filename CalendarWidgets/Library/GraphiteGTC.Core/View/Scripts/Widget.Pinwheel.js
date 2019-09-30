// Pinwheel Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var PinwheelWidget = {

        // Global variables
        prefixes: ['webkit', 'moz', 'ms'],
        animations: {},
        useCssAnimations: undefined,

        // Options
        options: {
            Lines: 8,                       // The number of lines to draw (Try 5 or 17)
            Length: 0,                      // The length of each line (Try 0 or 30)
            Width: 6,                       // The line thickness (Try 2 to 20)
            Radius: 10,                     // The radius of the inner circle (Try 0 or 40)
            Rotate: 0,                      // Rotation offset (Try 0 or 90)
            OutterLeftCorner: undefined,    // Individual Corner Control (Try 0 or 1.0)
            OutterRightCorner: undefined,   // Individual Corner Control (Try 0 or 1.0)
            InnerLeftCorner: undefined,     // Individual Corner Control (Try 0 or 1.0)
            InnerRightCorner: undefined,    // Individual Corner Control (Try 0 or 1.0)
            OutterCorners: undefined,       // Outter Corner Roundness (Try 0 or 1.0)
            InnerCorners: undefined,        // Inner Corner Roundness (Try 0 or 1.0)
            Corners: 1.0,                   // Use to set all corners equal
            Color: '#A1A1A1',               // #rgb or #rrggbb
            Speed: 1.5,                     // Rounds per second (Try 0.5 or 2.2)
            Trail: 99,                      // Afterglow percentage (Try 10 or 100)
            AddRotation: true,              // Continuously rotate entire pinwheel
            RotationTime: 4,                // Continuously rotate entire pinwheel at this speed in seconds
            Opacity: 1 / 4,                 // Opacity of the lines
            Shadow: false,                  // Shadow
            hwAccel: false,                 // Hardware Acceleration
            fps: 20,                        // Frames per second when using setTimeout()
            zIndex: 4999,                   // Use a high z-index by default
            ClassName: 'gtc-pinwheel',       // CSS class to assign to the element
            Top: 'auto',                    // center vertically
            Left: 'auto',                   // center horizontally
            Position: 'relative',           // element position
            InvertOddY: false,              // Invert all odd elements on Y axis
            InvertEvenY: false,             // Invert all even elements on Y axis
            InvertOddZ: false,              // Invert all odd elements on Z axis
            InvertEvenZ: false,             // Invert all even elements on Z axis
            Prepend: false,                 // Prepend to element instead of append
            MakeFlat: false                 // Make the pinwheel straight instead of circular
        },

        // Public Methods
        StartPinwheel: function () {

            var pinwheel = this._startPinwheelAnimation(this._createElement());
            pinwheel.style.display = 'none';
            Common.AddClass(pinwheel, this.options.ClassName);
            if (this.options.Prepend) {
                this.element.insertBefore(pinwheel, this.element.firstChild);
            }
            else {
                this.element.appendChild(pinwheel);
            }
            Velocity(pinwheel, 'fadeIn');

        },

        StopPinwheel: function () {

            this._stopPinwheelAnimation();

        },

        // Private Methods
        _createElement: function (tag, properties) {

            var property, element = document.createElement(tag || 'span');
            for (property in properties) {
                element[property] = properties[property];
            }
            return element;

        },

        _insertChildren: function (parent) {

            var index = 1, length = arguments.length;
            for ( ; index < length; index++) {
                parent.appendChild(arguments[index]);
            }
            return parent;

        },

        _createCssStyleSheet: function () {

            var thisWidget = this;
            var element = thisWidget._createElement('style', { type: 'text/css', id: 'GeneratedPinwheelStyles' });
            thisWidget._insertChildren(Common.Query('head'), element);
            return element.sheet || element.styleSheet;

        },

        _addLineAnimationKeyframe: function (alpha, trail, i, lines) {

            var thisWidget = this;
            var name = ['opacity', trail, ~ ~(alpha * 100), i, lines].join('-');
            var start = 0.01 + i / lines * 100;
            var calculatedOpacity = Math.max(1 - (1 - alpha) / trail * (100 - start), alpha);
            var prefix = thisWidget.useCssAnimations.substring(0, thisWidget.useCssAnimations.indexOf('Animation')).toLowerCase();
            var pre = prefix && '-' + prefix + '-' || '';
            if (!thisWidget.animations[name]) {
                thisWidget.currentStyleSheet.insertRule(
                    '@' + pre + 'keyframes ' + name + '{' +
                    '0%{opacity:' + calculatedOpacity + '}' +
                    start + '%{opacity:' + alpha + '}' +
                    (start + 0.01) + '%{opacity:1}' +
                    (start + trail) % 100 + '%{opacity:' + alpha + '}' +
                    '100%{opacity:' + calculatedOpacity + '}' +
                    '}', thisWidget.currentStyleSheet.cssRules.length
                );
                thisWidget.animations[name] = 1;
            }
            return name;

        },

        _findSupportedPrefix: function (element, property) {

            var thisWidget = this;
            var elementStyle = element.style;
            var supportedProperty;
            if (Common.IsDefined(elementStyle[property])) {
                return property;
            }
            property = property.charAt(0).toUpperCase() + property.slice(1);
            var index = 0, length = thisWidget.prefixes.length;
            for ( ; index < length; index++) {
                supportedProperty = thisWidget.prefixes[index] + property;
                if (Common.IsDefined(elementStyle[supportedProperty])) {
                    return supportedProperty;
                }
            }

        },

        _setCssStyles: function (element, properties) {

            var property, thisWidget = this;
            for (property in properties) {
                element.style[thisWidget._findSupportedPrefix(element, property) || property] = properties[property];
            }
            return element;

        },

        _findElementOffset: function (element) {

            var pageOffset = { x: element.offsetLeft, y: element.offsetTop };
            while (element = element.offsetParent) {
                pageOffset.x += element.offsetLeft;
                pageOffset.y += element.offsetTop;
            }
            return pageOffset;

        },

        _getStyledPinwheelElement: function (color, shadow, options, lineIndex) {

            var thisWidget = this;
            var cornerRadius;
            if (Common.AreAllDefined([options.OutterLeftCorner, options.OutterRightCorner, options.InnerLeftCorner, options.InnerRightCorner])) {
                cornerRadius = {
                    borderTopLeftRadius: (options.InnerLeftCorner * options.Width >> 1) + 'px',
                    borderTopRightRadius: (options.OutterLeftCorner * options.Width >> 1) + 'px',
                    borderBottomLeftRadius: (options.InnerRightCorner * options.Width >> 1) + 'px',
                    borderBottomRightRadius: (options.OutterRightCorner * options.Width >> 1) + 'px'
                };
            }
            else if (Common.AreAllDefined([options.InnerCorners, options.OutterCorners])) {
                cornerRadius = {
                    borderTopLeftRadius: (options.InnerCorners * options.Width >> 1) + 'px',
                    borderTopRightRadius: (options.OutterCorners * options.Width >> 1) + 'px',
                    borderBottomLeftRadius: (options.InnerCorners * options.Width >> 1) + 'px',
                    borderBottomRightRadius: (options.OutterCorners * options.Width >> 1) + 'px'
                };
            }
            else {
                cornerRadius = {
                    borderRadius: (options.Corners * options.Width >> 1) + 'px'
                };
            }
            var cssStyles = Common.MergeObjects({
                position: 'absolute',
                width: options.Length + 'px',
                height: options.Width + 'px',
                background: color,
                boxShadow: shadow,
                transformOrigin: 'left',
                transform: 'rotate(' + ~ ~(360 / options.Lines * lineIndex + options.Rotate) + 'deg) translate(' + options.Radius + 'px' + ', 0)'
            }, cornerRadius);
            if (options.InvertOddY && lineIndex % 2 == 1) {
                cssStyles.transform = cssStyles.transform + ' rotateY(180deg)';
            }
            else if (options.InvertEvenY && lineIndex % 2 == 0) {
                cssStyles.transform = cssStyles.transform + ' rotateY(180deg)';
            }
            if (options.InvertOddZ && lineIndex % 2 == 1) {
                cssStyles.transform = cssStyles.transform + ' rotateZ(180deg)';
            }
            else if (options.InvertEvenZ && lineIndex % 2 == 0) {
                cssStyles.transform = cssStyles.transform + ' rotateZ(180deg)';
            }
            if (thisWidget.options.MakeFlat) {
                cssStyles.position = 'relative';
                cssStyles.transform = '';
                cssStyles.display = 'inline-block';
            }
            var styledSection = thisWidget._setCssStyles(thisWidget._createElement(), cssStyles);
            styledSection.className = 'gtc-pinwheel-section';
            return styledSection;

        },

        _startPinwheelAnimation: function (pinwheelElement) {

            var thisWidget = this;
            thisWidget._stopPinwheelAnimation();
            var options = thisWidget.options;
            var element = thisWidget._setCssStyles(thisWidget._createElement(null, { id: thisWidget.element.id + 'Pinwheel', className: thisWidget.options.ClassName }), { position: options.Position, width: 0, zIndex: options.zIndex });
            element.setAttribute('role', 'progressbar');
            if (Common.IsDefined(pinwheelElement)) {
                pinwheelElement.insertBefore(element, pinwheelElement.firstChild || null);
                if (options.Left == 'auto' && options.Top == 'auto') {
                    thisWidget._setCssStyles(element, { left: '50%', top: '50%' });
                }
                else {
                    var calculatedLeft;
                    var calculatedTop;
                    if (options.Left == 'auto') {
                        calculatedLeft = (Common.Width(thisWidget.element) / 2) + 'px';
                    }
                    else {
                        calculatedLeft = options.Left;
                    }
                    if (options.Top == 'auto') {
                        calculatedTop = (Common.Height(thisWidget.element) / 2) + 'px';
                    }
                    else {
                        calculatedTop = options.Top;
                    }
                    thisWidget._setCssStyles(element, { left: calculatedLeft, top: calculatedTop });
                }
            }
            var position = thisWidget.options.MakeFlat ? 'initial' : 'absolute';
            var addRotation = thisWidget.options.MakeFlat ? '' : 'gtc-pinwheel-rotation';
            var rotationElement = thisWidget._setCssStyles(thisWidget._createElement(null, { id: thisWidget.element.id + 'PinwheelRotation', className: addRotation }), { position: position, top: '50%', left: '50%' });
            thisWidget._animateLines(rotationElement, thisWidget.options);
            if (!thisWidget.useCssAnimations) {
                var animationIndex = 0;
                var fps = options.fps;
                var frameSpeed = fps / options.Speed;
                var opacityTrail = (1 - options.Opacity) / (frameSpeed * options.Trail / 100);
                var alphaTrail = frameSpeed / options.Lines;

                // IE animation function
                (
                    function anim () {
                        animationIndex++;
                        var lineIndex = options.Lines;
                        for ( ; lineIndex; lineIndex--) {
                            var alpha = Math.max(1 - (animationIndex + lineIndex * alphaTrail) % frameSpeed * opacityTrail, options.Opacity);
                            thisWidget._updateOpacity(element, options.Lines - lineIndex, alpha, options);
                        }
                        thisWidget.timeout = element && setTimeout(anim, ~ ~(1000 / fps));
                    }
                )();
            }
            element.appendChild(rotationElement);
            return element;

        },

        _stopPinwheelAnimation: function () {

            var thisWidget = this;
            if (thisWidget.element) {
                clearTimeout(thisWidget.timeout);
                var pinwheel = Common.Query('#' + thisWidget.element.id + 'Pinwheel', thisWidget.element);
                if (Common.IsNotDefined(pinwheel)) {
                    pinwheel = Common.Get(thisWidget.element.id + 'Pinwheel');
                }
                if (Common.IsDefined(pinwheel)) {
                    Common.Remove(pinwheel);
                }
            }

        },

        _animateLines: function (element, options) {

            var thisWidget = this, lineSegment, lineIndex = 0, styles;
            for ( ; lineIndex < options.Lines; lineIndex++) {
                styles = {
                    position: 'absolute',
                    top: 1 + ~(options.Width / 2) + 'px',
                    transform: options.hwAccel ? 'translate3d(0, 0, 0)' : '',
                    opacity: options.Opacity,
                    animation: thisWidget.useCssAnimations && thisWidget._addLineAnimationKeyframe(options.Opacity, options.Trail, lineIndex, options.Lines) + ' ' + 1 / options.Speed + 's linear infinite'
                };
                if (thisWidget.options.MakeFlat) {
                    styles.position = 'relative';
                    styles.display = 'inline-block';
                    styles['margin-left'] = '2px';
                }
                lineSegment = thisWidget._setCssStyles(thisWidget._createElement(), styles);
                if (options.Shadow) {
                    thisWidget._insertChildren(lineSegment, thisWidget._setCssStyles(thisWidget._getStyledPinwheelElement('#000000', '0px 0px 4px ' + '#000000', options, lineIndex), { top: 2 + 'px' }, options, lineIndex));
                }
                lineSegment.className = 'gtc-pinwheel-segment';
                thisWidget._insertChildren(element, thisWidget._insertChildren(lineSegment, thisWidget._getStyledPinwheelElement(options.Color, '0px 0px 1px rgba(0, 0, 0, .1)', options, lineIndex)));
            }
            return element;

        },

        _updateOpacity: function (element, opacityIndex, opacityValue) {

            if (opacityIndex < element.childNodes.length) {
                element.childNodes[opacityIndex].style.opacity = opacityValue;
            }

        },

        _addRotationCss: function () {

            var thisWidget = this;
            if (!thisWidget.options.MakeFlat) {
                var prefix = thisWidget.useCssAnimations.substring(0, thisWidget.useCssAnimations.indexOf('Animation')).toLowerCase();
                var pre = prefix && '-' + prefix + '-' || '';
                thisWidget.currentStyleSheet.insertRule(
                    '.gtc-pinwheel-rotation {' +
                    '-webkit-animation: pinwheelrotation ' + thisWidget.options.RotationTime + 's infinite linear;' +
                    'animation: pinwheelrotation ' + thisWidget.options.RotationTime + 's infinite linear;' +
                    '}', thisWidget.currentStyleSheet.cssRules.length
                );
                thisWidget.currentStyleSheet.insertRule(
                    '@' + pre + 'keyframes pinwheelrotation {' +
                    '0% {' + pre + 'transform: rotate(359deg);}' +
                    '100% {' + pre + 'transform: rotate(0deg);}' +
                    '}', thisWidget.currentStyleSheet.cssRules.length
                );
            }

        },

        _init: function () {

            if (Common.IsNotDefined(this.currentStyleSheet)) {
                var generatedStyles = Common.Get('GeneratedPinwheelStyles');
                if (Common.IsNotDefined(generatedStyles)) {
                    this.currentStyleSheet = this._createCssStyleSheet();
                }
                else {
                    this.currentStyleSheet = generatedStyles.sheet || generatedStyles.styleSheet;
                }
            }
            var pinwheel = this._startPinwheelAnimation(this._createElement());
            pinwheel.style.display = 'none';
            Common.AddClass(pinwheel, this.options.ClassName);
            if (this.options.AddRotation) {
                this._addRotationCss();
            }
            if (this.options.Prepend) {
                this.element.insertBefore(pinwheel, this.element.firstChild);
            }
            else {
                this.element.appendChild(pinwheel);
            }
            Velocity(pinwheel, 'fadeIn');

        },

        _create: function () {

            // Initialize
            var generatedStyles = Common.Get('GeneratedPinwheelStyles');
            if (Common.IsNotDefined(generatedStyles)) {
                this.currentStyleSheet = this._createCssStyleSheet();
            }
            else {
                this.currentStyleSheet = generatedStyles.sheet || generatedStyles.styleSheet;
            }
            var generatedStyle = this._setCssStyles(this._createElement('group'), { behavior: 'url(#default#VML)' });
            this.useCssAnimations = this._findSupportedPrefix(generatedStyle, 'animation');
            var pinwheel = this._startPinwheelAnimation(this._createElement());
            pinwheel.style.display = 'none';
            Common.AddClass(pinwheel, this.options.ClassName);
            if (this.options.AddRotation) {
                this._addRotationCss();
            }
            if (this.options.Prepend) {
                this.element.insertBefore(pinwheel, this.element.firstChild);
            }
            else {
                this.element.appendChild(pinwheel);
            }
            Velocity(pinwheel, 'fadeIn');

        }

    };

    WidgetFactory.Register('gtc.pinwheel', PinwheelWidget);

} (window, document, Common, Cache, Events, Velocity));

// Position
(function (Position, window, document, Common, Cache, Events, Velocity, undefined) {

    // Private Variables
    var cachedScrollbarWidth,
        supportsOffsetFractions,
        max = Math.max,
        abs = Math.abs,
        round = Math.round,
        rhorizontal = /left|center|right/,
        rvertical = /top|center|bottom/,
        roffset = /[\+\-]\d+(\.[\d]+)?%?/,
        rposition = /^\w+/,
        rpercent = /%$/;

    // Public Variables
    Position.Info = {
        scrollbarWidth: function () {

            if (cachedScrollbarWidth !== undefined) {
                return cachedScrollbarWidth;
            }
            var w1, w2,
                div = Common.GenerateHTML('<div style="display:block;position:absolute;width:50px;height:50px;overflow:hidden;""><div style="height:100px;width:auto;"></div></div>'),
                innerDiv = div.firstChild;

            document.body.appendChild(div);
            w1 = innerDiv.offsetWidth;
            div.style.overflow = 'scroll';

            w2 = innerDiv.offsetWidth;

            if (w1 === w2) {
                w2 = div.clientWidth;
            }

            Common.Remove(div, true);
            return (cachedScrollbarWidth = w1 - w2);

        },
        getScrollInfo: function (within) {

            var overflowX = within.isWindow || within.isDocument ? '' : Common.GetStyle(within.element, 'overflow-x'),
                overflowY = within.isWindow || within.isDocument ? '' : Common.GetStyle(within.element, 'overflow-y'),
                hasOverflowX = overflowX === 'scroll' ||
                    (overflowX === 'auto' && within.width < within.element.scrollWidth),
                hasOverflowY = overflowY === 'scroll' ||
                    (overflowY === 'auto' && within.height < within.element.scrollHeight);
            return {
                width: hasOverflowY ? Position.Info.scrollbarWidth() : 0,
                height: hasOverflowX ? Position.Info.scrollbarWidth() : 0
            };

        },
        getWithinInfo: function (element) {

            var withinElement = element || window,
                isWindow = Common.IsWindow(withinElement),
                isDocument = !!withinElement && withinElement.nodeType === 9,
                scrollTop, scrollLeft;
            if (isWindow || isDocument) {
                scrollTop = window.pageYOffset;
                scrollLeft = window.pageXOffset;
            }
            else {
                scrollTop = element.scrollTop;
                scrollLeft = element.scrollLeft;
            }
            return {
                element: withinElement,
                isWindow: isWindow,
                isDocument: isDocument,
                offset: Common.Offset(withinElement) || { left: 0, top: 0 },
                scrollLeft: scrollLeft,
                scrollTop: scrollTop,
                width: Common.Width(withinElement),
                height: Common.Height(withinElement)
            };

        }
    };

    Position.Collision = {
        fit: {
            left: function (position, data) {

                var within = data.within,
                    withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
                    outerWidth = within.width,
                    collisionPosLeft = position.left - data.collisionPosition.marginLeft,
                    overLeft = withinOffset - collisionPosLeft,
                    overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
                    newOverRight;

                // Element is wider than within
                if (data.collisionWidth > outerWidth) {
                    if (overLeft > 0 && overRight <= 0) {
                        // Element is initially over the left side of within
                        newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
                        position.left += overLeft - newOverRight;
                    }
                    else if (overRight > 0 && overLeft <= 0) {
                        // Element is initially over right side of within
                        position.left = withinOffset;
                    }
                    else {
                        // Element is initially over both left and right sides of within
                        if (overLeft > overRight) {
                            position.left = withinOffset + outerWidth - data.collisionWidth;
                        }
                        else {
                            position.left = withinOffset;
                        }
                    }
                }
                else if (overLeft > 0) {
                    // Too far left -> align with left edge
                    position.left += overLeft;
                }
                else if (overRight > 0) {
                    // Too far right -> align with right edge
                    position.left -= overRight;
                }
                else {
                    // Adjust based on position and margin
                    position.left = max(position.left - collisionPosLeft, position.left);
                }

            },
            top: function (position, data) {

                var within = data.within,
                    withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
                    outerHeight = data.within.height,
                    collisionPosTop = position.top - data.collisionPosition.marginTop,
                    overTop = withinOffset - collisionPosTop,
                    overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
                    newOverBottom;

                // Element is taller than within
                if (data.collisionHeight > outerHeight) {
                    if (overTop > 0 && overBottom <= 0) {
                        // Element is initially over the top of within
                        newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
                        position.top += overTop - newOverBottom;
                    }
                    else if (overBottom > 0 && overTop <= 0) {
                        // Element is initially over bottom of within
                        position.top = withinOffset;
                    }
                    else {
                        // Element is initially over both top and bottom of within
                        if (overTop > overBottom) {
                            position.top = withinOffset + outerHeight - data.collisionHeight;
                        }
                        else {
                            position.top = withinOffset;
                        }
                    }
                }
                else if (overTop > 0) {
                    // Too far up -> align with top
                    position.top += overTop;
                }
                else if (overBottom > 0) {
                    // Too far down -> align with bottom edge
                    position.top -= overBottom;
                }
                else {
                    // Adjust based on position and margin
                    position.top = max(position.top - collisionPosTop, position.top);
                }
            }

        },
        flip: {
            left: function (position, data) {

                var within = data.within,
                    withinOffset = within.offset.left + within.scrollLeft,
                    outerWidth = within.width,
                    offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
                    collisionPosLeft = position.left - data.collisionPosition.marginLeft,
                    overLeft = collisionPosLeft - offsetLeft,
                    overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
                    myOffset = data.my[0] === 'left' ? -data.elemWidth : data.my[0] === 'right' ? data.elemWidth : 0,
                    atOffset = data.at[0] === 'left' ? data.targetWidth : data.at[0] === 'right' ? -data.targetWidth : 0,
                    offset = -2 * data.offset[0],
                    newOverRight,
                    newOverLeft;

                if (overLeft < 0) {
                    newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
                    if (newOverRight < 0 || newOverRight < abs(overLeft)) {
                        position.left += myOffset + atOffset + offset;
                    }
                }
                else if (overRight > 0) {
                    newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
                    if (newOverLeft > 0 || abs(newOverLeft) < overRight) {
                        position.left += myOffset + atOffset + offset;
                    }
                }

            },
            top: function (position, data) {

                var within = data.within,
                    withinOffset = within.offset.top + within.scrollTop,
                    outerHeight = within.height,
                    offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
                    collisionPosTop = position.top - data.collisionPosition.marginTop,
                    overTop = collisionPosTop - offsetTop,
                    overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
                    top = data.my[1] === 'top',
                    myOffset = top ? -data.elemHeight : data.my[1] === 'bottom' ? data.elemHeight : 0,
                    atOffset = data.at[1] === 'top' ? data.targetHeight : data.at[1] === 'bottom' ? -data.targetHeight : 0,
                    offset = -2 * data.offset[1],
                    newOverTop,
                    newOverBottom;
                if (overTop < 0) {
                    newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
                    if (newOverBottom < 0 || newOverBottom < abs(overTop)) {
                        position.top += myOffset + atOffset + offset;
                    }
                }
                else if (overBottom > 0) {
                    newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
                    if (newOverTop > 0 || abs(newOverTop) < overBottom) {
                        position.top += myOffset + atOffset + offset;
                    }
                }

            }
        },
        flipfit: {
            left: function () {

                Position.Collision.flip.left.apply(this, arguments);
                Position.Collision.fit.left.apply(this, arguments);

            },
            top: function () {

                Position.Collision.flip.top.apply(this, arguments);
                Position.Collision.fit.top.apply(this, arguments);

            }
        }
    };

    // Public Methods
    Position.Set = function (elements, options) {

        // Make a copy, we don't want to modify arguments
        options = Common.MergeObjects({}, options);

        var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions, target,
            within = Position.Info.getWithinInfo(options.within),
            scrollInfo = Position.Info.getScrollInfo(within),
            collision = (options.collision || 'flip').split(' '),
            offsets = {};

        if (Common.IsString(options.of)) {
            target = Common.Query(options.of);
        }
        else {
            target = options.of;
        }

        dimensions = getDimensions(target);
        if (target.preventDefault) {
            // Force left top to allow flipping
            options.at = 'left top';
        }
        targetWidth = dimensions.width;
        targetHeight = dimensions.height;
        targetOffset = dimensions.offset;

        // Clone to reuse original targetOffset later
        basePosition = Common.MergeObjects({}, targetOffset);

        // Force my and at to have valid horizontal and vertical positions
        // If a value is missing or invalid, it will be converted to center
        var which, myat = ['my', 'at'], index = 0, length = 2;
        for ( ; index < length; index++) {
            which = myat[index];
            var pos = (options[which] || '').split(' '),
                horizontalOffset,
                verticalOffset;

            if (pos.length === 1) {
                pos = rhorizontal.test(pos[0]) ? pos.concat(['center']) : rvertical.test(pos[0]) ? ['center'].concat(pos) : ['center', 'center'];
            }
            pos[0] = rhorizontal.test(pos[0]) ? pos[0] : 'center';
            pos[1] = rvertical.test(pos[1]) ? pos[1] : 'center';

            // Calculate offsets
            horizontalOffset = roffset.exec(pos[0]);
            verticalOffset = roffset.exec(pos[1]);
            offsets[which] = [
                horizontalOffset ? horizontalOffset[0] : 0,
                verticalOffset ? verticalOffset[0] : 0
            ];

            // Reduce to just the positions without the offsets
            options[which] = [
                rposition.exec(pos[0])[0],
                rposition.exec(pos[1])[0]
            ];
        }

        // Normalize collision option
        if (collision.length === 1) {
            collision[1] = collision[0];
        }

        if (options.at[0] === 'right') {
            basePosition.left += targetWidth;
        }
        else if (options.at[0] === 'center') {
            basePosition.left += targetWidth / 2;
        }

        if (options.at[1] === 'bottom') {
            basePosition.top += targetHeight;
        }
        else if (options.at[1] === 'center') {
            basePosition.top += targetHeight / 2;
        }

        atOffset = getOffsets(offsets.at, targetWidth, targetHeight);
        basePosition.left += atOffset[0];
        basePosition.top += atOffset[1];

        // Convert elements to an array, if necessary.
        if (!elements.length) {
            elements = [elements];
        }
        index = 0, length = elements.length;
        for ( ; index < length; index++) {
            completePositioning(elements[index], options, atOffset, targetWidth, targetHeight, targetOffset, basePosition, target, within, scrollInfo, collision, offsets, index);
        }

    };

    // Private Methods
    function completePositioning (element, options, atOffset, targetWidth, targetHeight, targetOffset, basePosition, target, within, scrollInfo, collision, offsets, elementIndex) {

        var collisionPosition, using,
            elemWidth = Common.Width(element),
            elemHeight = Common.Height(element),
            marginLeft = parseCss(element, 'marginLeft'),
            marginTop = parseCss(element, 'marginTop'),
            collisionWidth = elemWidth + marginLeft + parseCss(element, 'marginRight') + scrollInfo.width,
            collisionHeight = elemHeight + marginTop + parseCss(element, 'marginBottom') + scrollInfo.height,
            position = Common.MergeObjects({}, basePosition),
            myOffset = getOffsets(offsets.my, Common.Width(element), Common.Height(element));

        if (options.my[0] === 'right') {
            position.left -= elemWidth;
        }
        else if (options.my[0] === 'center') {
            position.left -= elemWidth / 2;
        }

        if (options.my[1] === 'bottom') {
            position.top -= elemHeight;
        }
        else if (options.my[1] === 'center') {
            position.top -= elemHeight / 2;
        }

        position.left += myOffset[0];
        position.top += myOffset[1];

        // If the browser doesn't support fractions, then round for consistent results
        if (!supportsOffsetFractions) {
            position.left = round(position.left);
            position.top = round(position.top);
        }

        collisionPosition = {
            marginLeft: marginLeft,
            marginTop: marginTop
        };

        var leftTop = ['left', 'top'], index = 0, length = 2;
        for ( ; index < length; index++) {
            if (Position.Collision[collision[index]]) {
                Position.Collision[collision[index]][leftTop[index]](position, {
                    targetWidth: targetWidth,
                    targetHeight: targetHeight,
                    elemWidth: elemWidth,
                    elemHeight: elemHeight,
                    collisionPosition: collisionPosition,
                    collisionWidth: collisionWidth,
                    collisionHeight: collisionHeight,
                    offset: [atOffset[0] + myOffset[0], atOffset[1] + myOffset[1]],
                    my: options.my,
                    at: options.at,
                    within: within,
                    elem: element
                });
            }
        }

        if (options.using) {
            // Adds feedback as second argument to using callback, if present
            using = function (props) {
                var left = targetOffset.left - position.left,
                    right = left + targetWidth - elemWidth,
                    top = targetOffset.top - position.top,
                    bottom = top + targetHeight - elemHeight,
                    feedback = {
                        target: {
                            element: target,
                            left: targetOffset.left,
                            top: targetOffset.top,
                            width: targetWidth,
                            height: targetHeight
                        },
                        element: {
                            element: element,
                            left: position.left,
                            top: position.top,
                            width: elemWidth,
                            height: elemHeight
                        },
                        horizontal: right < 0 ? 'left' : left > 0 ? 'right' : 'center',
                        vertical: bottom < 0 ? 'top' : top > 0 ? 'bottom' : 'middle'
                    };
                if (targetWidth < elemWidth && abs(left + right) < targetWidth) {
                    feedback.horizontal = 'center';
                }
                if (targetHeight < elemHeight && abs(top + bottom) < targetHeight) {
                    feedback.vertical = 'middle';
                }
                if (max(abs(left), abs(right)) > max(abs(top), abs(bottom))) {
                    feedback.important = 'horizontal';
                }
                else {
                    feedback.important = 'vertical';
                }
                options.using.call(this, props, feedback);
            };
        }
        setOffsets(element, Common.MergeObjects(position, { using: using}), elementIndex);

    };

    function setOffsets (elem, options, index) {

        var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
            position = Common.GetStyle(elem, 'position'),
            props = {}, style = elem.style;

        // Set position first, in-case top/left are set even on static elem
        if (position === 'static') {
            style.position = 'relative';
        }

        curOffset = Common.Offset(elem);
        curCSSTop = Common.GetStyle(elem, 'top');
        curCSSLeft = Common.GetStyle(elem, 'left');
        calculatePosition = (position === 'absolute' || position === 'fixed') && (curCSSTop + curCSSLeft).indexOf('auto') > -1;

        // Need to be able to calculate position if either
        // top or left is auto and position is either absolute or fixed
        if (calculatePosition) {
            curPosition = Common.Position(elem);
            curTop = curPosition.top;
            curLeft = curPosition.left;

        }
        else {
            curTop = parseFloat(curCSSTop) || 0;
            curLeft = parseFloat(curCSSLeft) || 0;
        }

        if (Common.IsFunction(options)) {
            options = options.call(elem, index, curOffset);
        }

        if (options.top != null) {
            props.top = (options.top - curOffset.top) + curTop;
        }
        if (options.left != null) {
            props.left = (options.left - curOffset.left) + curLeft;
        }

        if ('using' in options) {
            options.using.call(elem, props);

        }
        else {
            if (props.top != null) {
                style.top = props.top + 'px';
            }
            if (props.left != null) {
                style.left = props.left + 'px';
            }
        }

    };

    function getOffsets (offsets, width, height) {

        return [
            parseFloat(offsets[0]) * (rpercent.test(offsets[0]) ? width / 100 : 1),
            parseFloat(offsets[1]) * (rpercent.test(offsets[1]) ? height / 100 : 1)
        ];

    };

    function parseCss (element, property) {

        return parseInt(Common.GetStyle(element, property), 10) || 0;

    };

    function getDimensions (elem) {

        if (elem.nodeType === 9) {
            return {
                width: Common.Width(elem),
                height: Common.Height(elem),
                offset: { top: 0, left: 0 }
            };
        }
        if (Common.IsWindow(elem)) {
            return {
                width: Common.Width(elem),
                height: Common.Height(elem),
                offset: { top: window.pageYOffset, left: window.pageXOffset }
            };
        }
        if (elem.preventDefault) {
            return {
                width: 0,
                height: 0,
                offset: { top: elem.pageY, left: elem.pageX }
            };
        }
        return {
            width: Common.Width(elem),
            height: Common.Height(elem),
            offset: Common.Offset(elem)
        };

    };

    // Fraction support test
    (function() {

        var testElement, testElementParent, testElementStyle, offsetLeft, i, style,
            body = document.getElementsByTagName('body')[0],
            div = document.createElement('div');

        //Create a "fake body" for testing
        testElement = document.createElement(body ? 'div' : 'body');
        testElementStyle = {
            visibility: 'hidden',
            width: 0,
            height: 0,
            border: 0,
            margin: 0,
            background: 'none'
        };
        if (body) {
            Common.MergeObjects(testElementStyle, {
                position: 'absolute',
                left: '-1000px',
                top: '-1000px'
            });
        }
        style = testElement.style;
        for (i in testElementStyle) {
            style[i] = testElementStyle[i];
        }
        testElement.appendChild(div);
        testElementParent = body || document.documentElement;
        testElementParent.insertBefore(testElement, testElementParent.firstChild);

        div.style.cssText = 'position: absolute; left: 10.7432222px;';

        offsetLeft = Common.Offset(div).left;
        supportsOffsetFractions = offsetLeft > 10 && offsetLeft < 11;

        testElement.innerHTML = '';
        testElementParent.removeChild(testElement);

    })();

} (window.Position = window.Position || {}, window, document, Common, Cache, Events, Velocity));

// Tile
// Based On: Tile -> Hyperlink -> Link -> ViewElement
(function (Tile, window, document, Common, Cache, Events, Velocity, undefined) {

    // Private Variables
    var keyboardOn = false;
    var centerSet = true;
    var centerName = '';

    // Public Methods
    Tile.Render = function (tile, tilePanelType, tileIndex, tilesLength) {

        // Li<, TabIndex@, Class@, Id@
        var addClass = ' gtc-inactive';
        var addZIndex = '';
        var hoveredIndex = Math.floor(tilesLength / 2);
        if (tilePanelType == 'CoverFlow') {
            if (tileIndex == hoveredIndex) {
                addClass = ' gtc-active gtc-tile-hover';
                centerName = tile.Name;
                Events.One(document.body, 'configurecoverflowtile',
                    function () {
                        var hoveredTile = Common.Get(centerName);
                        hoveredTile.focus();
                        Events.Trigger(Common.Query('.gtc-tile-link', hoveredTile), 'mouseleave.tilepaneltooltip');
                    }
                );
            }
            else if (tileIndex > hoveredIndex) {
                addClass += ' gtc-tile-next';
                addZIndex = ' style="z-index:' + (tilesLength - tileIndex) + '"';
            }
        }
        else if (tilePanelType == 'Panes') {
            addClass += GetPanesClass(tilesLength, tileIndex);
        }

        // Is active color light or dark?
        if (Common.IsDefined(tile.ActiveColor)) {
            addClass += Colors.IsDarkColor(tile.ActiveColor) ? ' gtc-theme-dark' : ' gtc-theme-light';
        }

        // Form to send?
        var formToSend = '';
        if (Common.IsDefined(tile.FormToSerialize)) {
            formToSend = ' data-formtoserialize="' + tile.FormToSerialize + '"';
        }

        // Initialize
        var tileMarkup = '<li data-namespace="Tile"' + addZIndex + ' class="gtc-tile gtc-title-' + tile.Name + addClass + '"' + ViewElement.RenderAttributes(tile) + '>';

        // Style
        if (Common.IsDefined(tile.ActiveColor)) {
            var activeColor = Colors.ProcessValue(tile.ActiveColor, false, null);
            var colorCss = Colors.ColorCSS(activeColor);
            tileMarkup += '<style>';
            tileMarkup += ' .gtc-title-' + tile.Name + '.gtc-active,';
            tileMarkup += ' .gtc-title-' + tile.Name + '.gtc-inactive { ';
            tileMarkup += colorCss;
            tileMarkup += Colors.BackgroundCSS(activeColor);
            tileMarkup += Colors.ShadowCSS(activeColor, 'inset 0 0 50px 0', ['inset 5px 5px 40px -2px', 'inset -5px -5px 40px -2px']);
            tileMarkup += ' }';
            tileMarkup += ' .gtc-title-' + tile.Name + ' > .gtc-tile-link { ';
            tileMarkup += colorCss;
            tileMarkup += ' }';
            tileMarkup += '</style>';
        }

        // Image Dimension Classes
        var imageHeightClass = 'gtc-tile-image-height-' + tile.Name.toLowerCase();
        var imageWidthClass = 'gtc-tile-image-width-' + tile.Name.toLowerCase();
        if (Common.IsDefined(tile.ImageDimension)) {
            tileMarkup += '<style>';
            if (Common.IsDefined(tile.ImageDimension.Height)) {
                tileMarkup += ' .' + imageHeightClass + ' {height: ' + tile.ImageDimension.Height + tile.ImageDimension.Scale + ';}';
            }
            if (Common.IsDefined(tile.ImageDimension.Width)) {
                tileMarkup += ' .' + imageWidthClass + ' {width: ' + tile.ImageDimension.Width + tile.ImageDimension.Scale + ';}';
            }
            tileMarkup += '</style>';
        }

        // Anchor<, Data-Namespace@, Id@
        tileMarkup += '<a data-namespace="Tile"' + formToSend + ' id="' + tile.Name + 'TileLink"';

        // Class@
        tileMarkup += ' class="gtc-tile-link';
        if (tile.IsDisabled == 'Yes') {
            tileMarkup += ' gtc-btn--is-disabled';
        }
        tileMarkup += '"';

        // ToolTip@, Translations
        if (Common.IsDefined(tile.Tooltip)) {
            tileMarkup += ' data-tooltip="' + Common.TranslateKey(tile.Tooltip) + '" data-translate="[data-tooltip]' + tile.Tooltip + '"';
        }

        // View or External?
        if (Common.IsDefined(tile.Navigation)) {
            tileMarkup += Navigation.RenderAttributes(tile.Navigation);
        }
        else {
            // TODO: 508 Compliance on external
            // Target
            if (Common.IsDefined(tile.Target)) {
                tileMarkup += ' target="' + tile.Target + '"';
            }

            // Href
            if (Common.IsDefined(tile.Url)) {
                var addPrefix = '';
                if (Common.IsDefined(tile.Prefix)) {
                    if (tile.Url.indexOf(tile.Prefix) != 0) {
                        addPrefix = tile.Prefix;
                    }
                }
                tileMarkup += ' href="' + addPrefix + tile.Url + '"';
            }
        }
        tileMarkup += '>';


        // Icon and Image (if not Shutters)
        if (tilePanelType != 'Shutters') {
            if (Common.IsDefined(tile.Icon)) {
                // Icon
                tileMarkup += Icon.Render(tile.Icon, false);
            }
            else {
                // Image
                if (Common.IsDefined(tile.ImageSource)) {
                    var imageSource = BuildImageSource(tile);
                    tileMarkup += '<img class="gtc-tile-image';
                    if (Common.IsDefined(tile.ImageDimension)) {
                        if (Common.IsDefined(tile.ImageDimension.Height)) {
                            tileMarkup += ' ' + imageHeightClass;
                        }
                        if (Common.IsDefined(tile.ImageDimension.Width)) {
                            tileMarkup += ' ' + imageWidthClass;
                        }
                    }
                    tileMarkup += '" id="' + tile.Name + 'Image" src="' + imageSource + '" />';
                }
            }
        }

        // Span<>, Anchor</>
        tileMarkup += '<span';

        // Translations
        if (Common.IsDefined(tile.Title)) {
            tileMarkup += ' data-translate="' + tile.Title + '"';
        }
        tileMarkup += '>' + Common.TranslateKey(tile.Title) + '</span>';

        // Icon and Image (if Shutters)
        if (tilePanelType == 'Shutters') {
            if (Common.IsDefined(tile.Icon)) {
                // Icon
                tileMarkup += Icon.Render(tile.Icon, false);
            }
            else {
                // Image
                if (Common.IsDefined(tile.ImageSource)) {
                    var imageSource = BuildImageSource(tile);
                    tileMarkup += '<img class="gtc-tile-image';
                    if (Common.IsDefined(tile.ImageDimension)) {
                        if (Common.IsDefined(tile.ImageDimension.Height)) {
                            tileMarkup += ' ' + imageHeightClass;
                        }
                        if (Common.IsDefined(tile.ImageDimension.Width)) {
                            tileMarkup += ' ' + imageWidthClass;
                        }
                    }
                    tileMarkup += '" id="' + tile.Name + 'Image" src="' + imageSource + '" />';
                }
            }
        }

        // Stack Tooltip
        if (tilePanelType == 'Stack' && Common.IsDefined(tile.Tooltip)) {
            tileMarkup += '<p class="gtc-paragraph" data-namespace="Paragraph"';
            tileMarkup += ' data-translate="' + tile.Tooltip + '"';
            tileMarkup += '>';
            tileMarkup += Common.TranslateKey(tile.Tooltip);
            tileMarkup += '</p>';
        }

        // Anchor</>
        tileMarkup += '</a>';

        // Wire Click!
        Link.WireClick(tile, ' .gtc-tile-link');

        // 508 Compliance - Focus In/Focus Out
        if (keyboardOn == false) {
            keyboardOn = true;
            AttachCoverFlowKeyboard(tile.Name);
        }
        Events.On(document.body, 'focusin.' + tile.Name, '#' + tile.Name,
            function (event) {
                Common.SwitchClass(this, 'gtc-inactive', 'gtc-active');
                if (tilePanelType == 'CoverFlow') {
                    if (centerSet == true) {
                        centerSet = false;
                        var centerTile = Common.Get(centerName);
                        Common.RemoveClass(centerTile, 'gtc-tile-hover');
                    }
                    Common.AddClass(this, 'gtc-tile-hover');
                    Events.Trigger(Common.Get(this.id + 'TileLink'), 'mouseenter.tilepaneltooltip');
                    var nextTiles = Common.GetAllSibling(this, Common.SiblingType.Next);
                    var allLength = nextTiles.length;
                    var index = 0, allLengthCopy = allLength;
                    for ( ; index < allLength; index++) {
                        Common.AddClass(nextTiles[index], 'gtc-tile-next');
                        nextTiles[index].style.zIndex = allLengthCopy;
                        allLengthCopy--;
                    }
                    var previousTiles = Common.GetAllSibling(this, Common.SiblingType.Previous, '.gtc-tile-next');
                    index = 0, allLength = previousTiles.length;
                    for ( ; index < allLength; index++) {
                        previousTiles[index].style.zIndex = '';
                        Common.RemoveClass(previousTiles[index], 'gtc-tile-next');
                    }
                }
                else if (tilePanelType == 'Panes' || tilePanelType == 'Shutters' || tilePanelType == 'Stack') {
                    Common.AddClass(this, 'gtc-tile-hover');
                    Events.Trigger(Common.Get(this.id + 'TileLink'), 'mouseenter.tilepaneltooltip');
                }
                Events.On(document, 'keyup.' + tile.Name,
                    function (event) {
                        var pressedKeyCode = (event.keyCode ? event.keyCode : event.which);
                        if (pressedKeyCode == GTC.Keyboard.Enter) {
                            document.activeElement.blur();
                            var element = Common.Query('a', Common.Get(tile.Name));
                            Events.Trigger(element, 'click');
                        }
                    }
                );
            }
        );
        Events.On(document.body, 'focusout.' + tile.Name, '#' + tile.Name,
            function (event) {
                Common.SwitchClass(this, 'gtc-active', 'gtc-inactive');
                if (tilePanelType == 'CoverFlow') {
                    var centerTile = Common.Get(centerName);
                    if (centerSet == true || Common.HasClass(centerTile, 'gtc-tile-hover')) {
                        centerSet = true;
                        Events.Trigger(Common.Get(centerTile.id + 'TileLink'), 'mouseleave.tilepaneltooltip');
                    }
                    else {
                        Common.RemoveClasses(this, 'gtc-tile-hover gtc-tile-next');
                        Events.Trigger(Common.Get(this.id + 'TileLink'), 'mouseleave.tilepaneltooltip');
                        var previousTiles = Common.GetAllSibling(this, Common.SiblingType.Previous);
                        var index = 0, allLength = previousTiles.length;
                        this.style.zIndex = '';
                        for ( ; index < allLength; index++) {
                            previousTiles[index].style.zIndex = '';
                            Common.RemoveClass(previousTiles[index], 'gtc-tile-next');
                        }
                        setTimeout(
                            function () {
                                var focusedElement = document.activeElement;
                                if (!Common.HasClass(focusedElement, 'gtc-tile') && !Common.HasClass(focusedElement, 'gtc-tile-link')) {
                                    if (centerSet == false) {
                                        var centerTile = Common.Get(centerName);
                                        Common.AddClass(centerTile, 'gtc-tile-hover');
                                        var previousTiles = Common.GetAllSibling(centerTile, Common.SiblingType.Previous);
                                        var index = 0, allLength = previousTiles.length;
                                        for ( ; index < allLength; index++) {
                                            previousTiles[index].style.zIndex = '';
                                            Common.RemoveClass(previousTiles[index], 'gtc-tile-next');
                                        }
                                        var nextTiles = Common.GetAllSibling(centerTile, Common.SiblingType.Next);
                                        index = 0, allLength = nextTiles.length;
                                        var allLengthCopy = allLength;
                                        for ( ; index < allLength; index++) {
                                            Common.AddClass(nextTiles[index], 'gtc-tile-next');
                                            nextTiles[index].style.zIndex = allLengthCopy;
                                            allLengthCopy--;
                                        }
                                        Events.Trigger(Common.Get(centerTile.id + 'TileLink'), 'mouseleave.tilepaneltooltip');
                                        centerSet = true;
                                    }
                                }
                            }, 50
                        );
                    }
                }
                else if (tilePanelType == 'Panes' || tilePanelType == 'Shutters' || tilePanelType == 'Stack') {
                    Common.RemoveClass(this, 'gtc-tile-hover');
                    Events.Trigger(Common.Get(this.id + 'TileLink'), 'mouseleave.tilepaneltooltip');
                }
                Events.Off(document, 'keyup.' + tile.Name);
            }
        );

        // Wire Hover Active/Inactive Class change and CoverFlow tooltip trigger
        Events.On(document.body, 'mouseenter.activeinactive.' + tile.Name, '#' + tile.Name,
            function () {
                Common.SwitchClass(this, 'gtc-inactive', 'gtc-active');
                if (tilePanelType == 'CoverFlow') {
                    this.focus();
                    Events.Trigger(Common.Get(this.id + 'TileLink'), 'mouseenter.tilepaneltooltip');
                }
            }
        );
        Events.On(document.body, 'mouseleave.activeinactive.' + tile.Name, '#' + tile.Name,
            function () {
                Common.SwitchClass(this, 'gtc-active', 'gtc-inactive');
            }
        );

        // Li</>
        tileMarkup += '</li>';
        return tileMarkup;

    };

    Tile.ShowPinwheel = function (tile) {

        SpinKit.Show(tile, 'FadingCircle');

    };

    Tile.HidePinwheel = function (tile) {

        SpinKit.Hide(tile);

    };

    function BuildImageSource (tile) {

        var imageSource = "";
        var dataImage = (Common.IsDefined(tile.ImageSource) && tile.ImageSource.indexOf('data:') == 0) ? true : false;
        if (dataImage) {
            imageSource = tile.ImageSource;
        }
        else {
            imageSource = Common.BuildResourcePath(tile.ImageSource);
        }
        return imageSource;

    };

    function AttachCoverFlowKeyboard (tileName) {

        Events.On(document, 'keyup.tilepanelcoverflow.' + tileName,
            function (keyupEvent) {
                var pressedKeyCode = (keyupEvent.keyCode ? keyupEvent.keyCode : keyupEvent.which);
                var noSelection = false;
                var focusedTile = Common.Query('.gtc-tile-hover');
                switch (pressedKeyCode) {
                    case GTC.Keyboard.Left:
                    case GTC.Keyboard.Up:
                        if (Common.IsNotDefined(focusedTile)) {
                            focusedTile = Common.Query('.gtc-tile:last-child');
                            noSelection = true;
                        }
                        if (focusedTile != focusedTile.parentNode.firstChild) {
                            if (noSelection) {
                                focusedTile.focus();
                                Events.Trigger(Common.Get(focusedTile.id + 'TileLink'), 'mouseenter.tilepaneltooltip');
                            }
                            else {
                                Events.Trigger(Common.Get(focusedTile.id + 'TileLink'), 'mouseleave.tilepaneltooltip');
                                var previousTile = Common.GetSibling(focusedTile, Common.SiblingType.Previous);
                                previousTile.focus();
                                Events.Trigger(Common.Get(previousTile.id + 'TileLink'), 'mouseenter.tilepaneltooltip');
                            }
                        }
                        break;
                    case GTC.Keyboard.Right:
                    case GTC.Keyboard.Down:
                        if (Common.IsNotDefined(focusedTile)) {
                            focusedTile = Common.Query('.gtc-tile:first-child');
                            noSelection = true;
                        }
                        if (focusedTile != focusedTile.parentNode.lastChild) {
                            if (noSelection) {
                                focusedTile.focus();
                                Events.Trigger(Common.Get(focusedTile.id + 'TileLink'), 'mouseenter.tilepaneltooltip');
                            }
                            else {
                                Events.Trigger(Common.Get(focusedTile.id + 'TileLink'), 'mouseleave.tilepaneltooltip');
                                var nextTile = Common.GetSibling(focusedTile, Common.SiblingType.Next);
                                nextTile.focus();
                                Events.Trigger(Common.Get(nextTile.id + 'TileLink'), 'mouseenter.tilepaneltooltip');
                            }
                        }
                        break;
                }
            }
        );

    };

    function RemoveCoverFlowKeyboard () {

        Events.Off(document, 'keyup.tilepanelcoverflow');

    };

    function GetPanesClass (tilesLength, tileIndex) {

        var addClass = '';
        if (tilesLength == 1 || tilesLength == 2) {
            addClass = ' gtc-tile-panes-large';
        }
        else if (tilesLength == 3) {
            if (tileIndex == 0) {
                addClass = ' gtc-tile-panes-large';
            }
            else {
                addClass = ' gtc-tile-panes-medium';
            }
        }
        else if (tilesLength == 4) {
            if (tileIndex == 0) {
                addClass = ' gtc-tile-panes-large';
            }
            else if (tileIndex == 1 || tileIndex == 2) {
                addClass = ' gtc-tile-panes-small';
            }
            else {
                addClass = ' gtc-tile-panes-medium';
            }
        }
        else if (tilesLength == 5) {
            if (tileIndex != 1 && tileIndex != 2) {
                addClass = ' gtc-tile-panes-medium';
            }
            else {
                addClass = ' gtc-tile-panes-small';
            }
        }
        else if (tilesLength == 6) {
            if (tileIndex == 0) {
                addClass = ' gtc-tile-panes-large';
            }
            else if (tileIndex == 1 || tileIndex == 2) {
                addClass = ' gtc-tile-panes-small';
            }
            else {
                addClass = ' gtc-tile-panes-medium';
            }
        }
        else if (tilesLength == 7) {
            if (tileIndex == 0) {
                addClass = ' gtc-tile-panes-large';
            }
            else if (tileIndex == 1 || tileIndex == 2 || tileIndex == 4 || tileIndex == 6) {
                addClass = ' gtc-tile-panes-small';
            }
            else {
                addClass = ' gtc-tile-panes-medium';
            }
        }
        return addClass;

    };

} (window.Tile = window.Tile || {}, window, document, Common, Cache, Events, Velocity));

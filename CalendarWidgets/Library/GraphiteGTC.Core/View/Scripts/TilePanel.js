// Tile Panel
// Based On: TilePanel -> ViewElement
(function (TilePanel, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    TilePanel.Render = function (tilePanel) {

        // Div<, TabIndex@, Class@, Id@, Data-DefaultTooltip@, Div>, Ul<, Class@, Data-DefaultTooltip@>
        var tilePanelMarkup = '<div data-namespace="TilePanel" class="gtc-tilepanel gtc-tilepanel-' + tilePanel.TilePanelType.toLowerCase() + '"' + ViewElement.RenderAttributes(tilePanel) + '>';

        // H2<>, Title, H2</>
        if (Common.IsDefined(tilePanel.Title)) {
            tilePanelMarkup += '<h2 class="gtc-page-theme-color"';

            // Translations
            tilePanelMarkup += ' data-translate="' + tilePanel.Title + '"';
            tilePanelMarkup += '>' + Common.TranslateKey(tilePanel.Title) + '</h2>';
        }

        // Ul<>
        tilePanelMarkup += '<ul id="' + tilePanel.Name + '-Ul" class="gtc-tilepanel-ul-' + tilePanel.TilePanelType.toLowerCase() + '"';

        // Translations
        if (Common.IsDefined(tilePanel.Tooltip) && Common.IsDefined(tilePanel.Tooltip.TextString)) {
            tilePanelMarkup += ' data-tooltip="' + Common.TranslateKey(tilePanel.Tooltip.TextString) + '" data-translate="[data-tooltip]' + tilePanel.Tooltip.TextString + '"';
        }
        tilePanelMarkup += '>';

        // Tiles
        if (Common.IsDefined(tilePanel.Tiles)) {
            var index = 0, length = tilePanel.Tiles.length;
            if (tilePanel.TilePanelType == 'Panes' && length > 7) {
                length = Math.ceil(length / 7);
                for ( ; index < length; index++) {
                    var subsetIndex = 0;
                    var subset = tilePanel.Tiles.slice(7 * index);
                    var subsetLength = 7;
                    if (subset.length < 7) {
                        subsetLength = subset.length;
                    }
                    for ( ; subsetIndex < subsetLength; subsetIndex++) {
                        tilePanelMarkup += Tile.Render(subset[subsetIndex], tilePanel.TilePanelType, subsetIndex, subsetLength);
                    }
                }
            }
            else {
                for ( ; index < length; index++) {
                    tilePanelMarkup += Tile.Render(tilePanel.Tiles[index], tilePanel.TilePanelType, index, length);
                }
            }
        }

        // Ul</>
        tilePanelMarkup += '</ul>';

        // Paragraph
        if (tilePanel.TilePanelType != 'Stack') {
            tilePanelMarkup += Paragraph.Render(tilePanel.Tooltip);

            // Wire Hover
            if (Common.IsDefined(tilePanel.Tooltip)) {
                Events.On(document.body, 'mouseenter.tilepaneltooltip.' + tilePanel.Name, '#' + tilePanel.Name + ' .gtc-tile-link',
                    function () {
                        var tileTooltip = Common.GetAttr(this, 'data-tooltip');
                        if (Common.IsDefined(tileTooltip)) {
                            Common.Get(tilePanel.Tooltip.Name).textContent = tileTooltip;
                        }
                        else {
                            var defaultTooltip = Common.GetAttr(Common.Get(tilePanel.Name + '-Ul'), 'data-tooltip');
                            if (Common.IsDefined(defaultTooltip)) {
                                Common.Get(tilePanel.Tooltip.Name).textContent = defaultTooltip;
                            }
                            else {
                                Common.Get(tilePanel.Tooltip.Name).textContent = '';
                            }
                        }
                    }
                );
                Events.On(document.body, 'mouseleave.tilepaneltooltip.' + tilePanel.Name, '#' + tilePanel.Name + ' .gtc-tile-link',
                    function () {
                        var defaultTooltip = Common.GetAttr(Common.Get(tilePanel.Name + '-Ul'), 'data-tooltip');
                        if (Common.IsDefined(defaultTooltip)) {
                            Common.Get(tilePanel.Tooltip.Name).textContent = defaultTooltip;
                        }
                        else {
                            Common.Get(tilePanel.Tooltip.Name).textContent = '';
                        }
                    }
                );
            }
        }

        // Div</>
        tilePanelMarkup += '</div>';

        // Return
        return tilePanelMarkup;

    };

} (window.TilePanel = window.TilePanel || {}, window, document, Common, Cache, Events, Velocity));

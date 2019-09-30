// Tree Panel
// Based On: TreePanel -> ViewElement
(function (TreePanel, window, document, Common, Cache, Events, Velocity, undefined) {

    // Private Variables
    var xAxisDrag;
    var resizer;
    var treeSection;
    var displaySection;
    var treeSectionWidth;
    var displaySectionWidth;
    var treePanelName;

    // Public Methods
    TreePanel.Render = function (treePanel) {

        // Initial State Class
        var additionalClass = '';
        var treeDisplayGroupStyle = '';
        var iconRotateClass = '';
        if (treePanel.InitialState == 'Open') {
            additionalClass = ' gtc-treepanel-open';
            iconRotateClass = ' fa-rotate-180';
        }
        else {
            treeDisplayGroupStyle = ' style="display:none;"';
        }

        // Div<, TabIndex@, Class@, Id@
        var treePanelMarkup = '<div class="gtc-treepanel' + additionalClass + '" data-namespace="TreePanel"' + ViewElement.RenderAttributes(treePanel);

        // Div>
        treePanelMarkup += '><div class="gtc-treepanel-titlebar">';

        // H2<>, Title, H2</>
        if (Common.IsDefined(treePanel.Title)) {
            treePanelMarkup += '<h2 class="gtc-page-theme-color"';

            // Translations
            treePanelMarkup += ' data-translate="' + treePanel.Title + '"';
            treePanelMarkup += '>' + Common.TranslateKey(treePanel.Title) + '</h2>';
        }
        treePanelMarkup += '<a id="' + treePanel.Name + '-ExpandLink" class="gtc-treepanel-expand"><i class="gtc-icon-styles fa fa-arrow-circle-down' + iconRotateClass + '"></i></a>';

        // Links
        if (Common.IsDefined(treePanel.Links) && treePanel.Links.length > 0) {

            // Links
            var index = 0, length = treePanel.Links.length;
            for ( ; index < length; index++) {
                // Li<>, Anchor, Li</>
                treePanelMarkup += Link.Render(treePanel.Links[index]);
            }
        }
        treePanelMarkup += '</div><div class="gtc-treepanel-treedisplaygroup"' + treeDisplayGroupStyle + '>';

        // Tree Section
        treePanelMarkup += '<div id="' + treePanel.Name + '-TreeSectionScrollTarget" class="gtc-treepanel-tree-scrolltarget gtc-cfscroll-y"><div class="gtc-treepanel-tree" id="' + treePanel.Name + 'TreeSection">';
        if (Common.IsDefined(treePanel.Tree)) {
            treePanelMarkup += Tree.Render(treePanel.Tree, true);
        }
        treePanelMarkup += '</div></div><div class="gtc-treepanel-resizer" id="' + treePanel.Name + 'Resizer"></div>';

        // Display Panel Section
        treePanelMarkup += '<div id="' + treePanel.Name + '-DisplayPanelSectionScrollTarget" class="gtc-treepanel-displaypanel-scrolltarget gtc-cfscroll-y"><div id="' + treePanel.Name + '-DisplayPanelSection" class="gtc-treepanel-displaypanel">';
        if (Common.IsDefined(treePanel.DisplayPanel)) {
            var displayPanelNamespace = window[treePanel.DisplayPanel.Type.toString()];
            treePanelMarkup += displayPanelNamespace.Render(treePanel.DisplayPanel);
        }
        treePanelMarkup += '</div></div>';

        // Attach Expand Link Event
        Events.On(document.body, 'click.' + treePanel.Name + '-ExpandLink', '#' + treePanel.Name + '-ExpandLink',
            function () {
                var treePanelElement = Common.Get(treePanel.Name);
                if (Common.HasClass(treePanelElement, 'gtc-treepanel-open')) {
                    Common.RemoveClass(Common.Query('i', this), 'fa-rotate-180');
                    Velocity(Common.Query('.gtc-treepanel-treedisplaygroup', treePanelElement), 'slideUp', 'slow',
                        function () {
                            Common.ResizeView();
                        }
                    );
                }
                else {
                    Common.AddClass(Common.Query('i', this), 'fa-rotate-180');
                    Velocity(Common.Query('.gtc-treepanel-treedisplaygroup', treePanelElement), 'slideDown', 'slow',
                        function () {
                            Common.ResizeView();
                        }
                    );
                }
                Common.ToggleClass(treePanelElement, 'gtc-treepanel-open');
            }
        );

        Events.One(document.body, 'configuretreepanel',
            function (event) {
                treePanelName = treePanel.Name;
                makeResizable(treePanelName);
            }
        );

        // Div</>
        treePanelMarkup += '</div></div>';
        return treePanelMarkup;

    };

    function makeResizable (id) {

        resizer = Common.Get(id + 'Resizer');
        treeSection = Common.Get(id + '-TreeSectionScrollTarget');
        displaySection = Common.Get(id + '-DisplayPanelSectionScrollTarget');
        Events.On(resizer, 'mousedown', initializeDrag);

    };

    function initializeDrag (event) {

        Common.AddClass(document.body, 'gtc-unselectable');
        xAxisDrag = event.clientX;
        treeSectionWidth = Common.Width(treeSection);
        displaySectionWidth = Common.Width(displaySection);
        Events.On(document, 'mousemove.treePanelResizer.' + treePanelName, onResizerDrag);
        Events.On(document, 'mouseup.treePanelResizer.' + treePanelName, onStopResizerDrag);

    };

    function onResizerDrag (event) {

        var newTreeSectionWidth = treeSectionWidth + event.clientX - xAxisDrag;
        var newDisplaySectionWidth = displaySectionWidth - event.clientX + xAxisDrag;
        if (newTreeSectionWidth <= 200 || newDisplaySectionWidth <= 200) {
            return;
        }
        treeSection.style.width = newTreeSectionWidth + 'px';

    };

    function onStopResizerDrag (event) {

        Events.Off(document, 'mousemove.treePanelResizer', onResizerDrag);
        Events.Off(document, 'mouseup.treePanelResizer', onStopResizerDrag);
        Common.RemoveClass(document.body, 'gtc-unselectable');

    };

} (window.TreePanel = window.TreePanel || {}, window, document, Common, Cache, Events, Velocity));

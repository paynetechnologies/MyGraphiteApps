// Accordion Tree
// Based On: AccordionTree -> Tree -> ViewElement
(function (AccordionTree, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    AccordionTree.Render = function (accordionTree, inTreePanel) {

        var accordionTreeMarkup = '';
        var inTreePanelAttribute = '';
        if (inTreePanel == true) {
            inTreePanelAttribute = ' data-intreepanel="true"';
        }

        // Dimension
        var dimensionClass = '';
        var dimensionData = '';
        if (Common.IsDefined(accordionTree.Dimension) && Common.IsOneDefined([accordionTree.Dimension.Height, accordionTree.Dimension.Width])) {
            dimensionClass = 'gtc-tree-' + accordionTree.Name.toLowerCase();
            accordionTreeMarkup += '<style>.' + dimensionClass + ' {';
            if (Common.IsDefined(accordionTree.Dimension.Height)) {
                accordionTreeMarkup += 'height:' + accordionTree.Dimension.Height + accordionTree.Dimension.Scale + ';';
                dimensionData += ' data-height="' + accordionTree.Dimension.Height + accordionTree.Dimension.Scale + '"';
            }
            accordionTreeMarkup += 'width:100%;}</style>';
            dimensionData += ' data-width="100%"';
            dimensionClass = ' ' + dimensionClass;
        }

        // Div<, TabIndex@, Class@, Id@
        accordionTreeMarkup += '<div' + inTreePanelAttribute + dimensionData + ' class="gtc-accordiontree' + dimensionClass + '" data-treetype="' + accordionTree.TreeType + '" data-namespace="Tree"' + ViewElement.RenderAttributes(accordionTree);

        // On Node Select Event
        if (Common.IsEventViewElementDefined(accordionTree.OnNodeSelect)) {
            // Data-ControllerPath/ActionName
            accordionTreeMarkup += ' data-nodeselect=\'' + JSON.stringify(accordionTree.OnNodeSelect) + '\'';
        }

        // On Load Event
        if (Common.IsEventViewElementDefined(accordionTree.OnLoad)) {
            // Data-ControllerPath/ActionName
            accordionTreeMarkup += ' data-load=\'' + JSON.stringify(accordionTree.OnLoad) + '\'';
        }

        // Div>
        accordionTreeMarkup += '>';

        // Title
        if (Common.IsDefined(accordionTree.Title)) {
            accordionTreeMarkup += '<h2 id="' + accordionTree.Name + 'Title" class="gtc-accordiontree-title gtc-page-theme-color" data-translate="' + accordionTree.Title + '">' + Common.TranslateKey(accordionTree.Title) + '</h2>';
        }

        // Build tree markup
        accordionTreeMarkup += BuildTreeStructure(accordionTree, false);

        // Div</>
        accordionTreeMarkup += '</div>';
        return accordionTreeMarkup;

    };

    AccordionTree.OnNodeSelect = function (tree, node) {

        // Initialize
        var onNodeSelectParameters = [];
        var selectedNodeUiParameters = {
            Name: tree.id,
            Value: null,
            UiParameters: []
        };

        // Get OnNodeSelectEvent object
        var onNodeSelectEvent = JSON.parse(Common.GetAttr(tree, 'data-nodeselect'));
        if (Common.IsDefined(onNodeSelectEvent.UiParameters)) {
            onNodeSelectParameters = onNodeSelectParameters.concat(onNodeSelectEvent.UiParameters);
        }

        // Object properties
        var propertiesUiParameters = [];

        // View Model
        var viewModel = Common.GetAttr(node, 'data-nodeid');
        var viewModelId = null;
        if (Common.IsDefined(viewModel) && Common.IsNotEmptyString(viewModel)) {
            viewModelId = viewModel;
        }

        // Id
        propertiesUiParameters.push(
            {
                Name: 'Id',
                Value: viewModelId,
                UiParameters: null
            }
        );

        // Ui Parameters
        var extraUiParameters = JSON.parse(Common.GetAttr(node, 'data-uiparameters'));
        if (Common.IsDefined(extraUiParameters)) {
            var uiParameter, index = 0, length = extraUiParameters.length;
            for ( ; index < length; index++) {
                uiParameter = extraUiParameters[index];
                propertiesUiParameters.push(
                    {
                        Name: uiParameter.Name,
                        Value: uiParameter.Value,
                        UiParameters: null
                    }
                );
            }
        }

        // Entity
        selectedNodeUiParameters.UiParameters = propertiesUiParameters;

        // Add selected node
        onNodeSelectParameters = onNodeSelectParameters.concat(selectedNodeUiParameters);

        // Execute View Behavior
        Common.ExecuteViewBehavior(onNodeSelectEvent.ControllerPath + onNodeSelectEvent.ActionName, onNodeSelectParameters, Page.RunInstructions, tree);

    };

    AccordionTree.OnLoad = function (tree) {

        // Initialize
        var onLoadParameters = [];

        // Get OnLoadEvent object
        var onLoadEvent = JSON.parse(Common.GetAttr(tree, 'data-load'));
        if (Common.IsDefined(onLoadEvent.UiParameters)) {
            onLoadParameters = onLoadParameters.concat(onLoadEvent.UiParameters);
        }

        // Execute View Behavior
        Common.ExecuteViewBehavior(onLoadEvent.ControllerPath + onLoadEvent.ActionName, onLoadParameters, Page.RunInstructions, tree);

    };

    AccordionTree.ReplaceElement = function (tree, viewElements, promises, context) {

        if (Common.IsDefined(viewElements) && viewElements.length == 1) {

            // Get promise
            var animationHidePromise = Common.Promise();
            promises.push(animationHidePromise.promise);

            // Get data
            var dataTree = viewElements[0];

            // Update Title
            if (Common.IsDefined(dataTree.Title)) {
                var title = Common.Get(tree.id + 'Title');
                if (Common.IsDefined(title)) {
                    Common.Slide(title, 'hide', 'left', 'slow',
                        function () {
                            Common.SetAttr(title, 'data-translate', dataTree.Title);
                            title.textContent = Common.TranslateKey(dataTree.Title);
                            Common.Slide(title, 'show', 'left', 'slow');
                        }
                    );
                }
                else {
                    var fragment = Common.GenerateFragment('<h2 id="' + tree.id + 'Title" style="display: none;" class="gtc-accordiontree-title gtc-page-theme-color" data-translate="' + dataTree.Title + '">' + Common.TranslateKey(dataTree.Title) + '</h2>');
                    tree.insertBefore(fragment, tree.firstChild);
                    title = Common.Get(tree.id + 'Title');
                    Common.Slide(title, 'show', 'left', 'slow');
                }
    	    }

            // Hide Tree
            var isParent = (context == 'Parent') ? true : false;
            Velocity(tree, 'slideUp', 'slow',
                function () {
                    if (isParent) {
                        window.parent.Widgets.accordiontree(tree, 'destroy');
                    }
                    else {
                        Widgets.accordiontree(tree, 'destroy');
                    }
                    Common.Remove(Common.Query('.gtc-accordiontree-root', tree));

                    // Build Tree Structure
                    var treeMarkup = BuildTreeStructure(dataTree, false);

                    // Insert tree
                    tree.appendChild(Common.GenerateFragment(treeMarkup));

                    // Intialize tree
                    if (isParent) {
                        window.parent.Widgets.accordiontree(tree);
                    }
                    else {
                        Widgets.accordiontree(tree);
                    }

                    // Show Tree
                    Velocity(tree, 'slideDown', 'slow',
                        function () {
                            animationHidePromise.resolve();
                        }
                    );
                }
            );
        }

    };

    AccordionTree.AppendContent = function (tree, viewElements, promises, context) {

        if (Common.IsDefined(viewElements)) {
            Tree.ShowPinwheel(tree);
            var subTree, index = 0, length = viewElements.length;
            for ( ; index < length; index++) {
                subTree = viewElements[index];
                var subTreeId = subTree.Nodes[0].Name + Common.SanitizeToken(subTree.Nodes[0].Id);
                var htmlMarkup = BuildTreeStructure(subTree, true);
                if (context == 'Parent') {
                    window.parent.Widgets.accordiontree(tree, 'AddSubTree', { SubTreeId: subTreeId, HtmlMarkup: htmlMarkup });
                }
                else {
                    Widgets.accordiontree(tree, 'AddSubTree', { SubTreeId: subTreeId, HtmlMarkup: htmlMarkup });
                }
            }
            Tree.HidePinwheel(tree);
        }

    };

    AccordionTree.RemoveContent = function (tree, viewElements, promises, context) {

        if (Common.IsDefined(viewElements)) {
            Tree.ShowPinwheel(tree);
            var subTree, index = 0, length = viewElements.length;
            for ( ; index < length; index++) {
                subTree = viewElements[index];
                if (Common.IsDefined(subTree.Nodes) && subTree.Nodes.length == 1) {
                    var subTreeId = subTree.Nodes[0].Name + Common.SanitizeToken(subTree.Nodes[0].Id);
                    if (context == 'Parent') {
                        window.parent.Widgets.accordiontree(tree, 'RemoveSubTree', subTreeId);
                    }
                    else {
                        Widgets.accordiontree(tree, 'RemoveSubTree', subTreeId);
                    }
                }
            }
            Tree.HidePinwheel(tree);
        }

    };

    // Private Methods
    function BuildTreeStructure (treeData, isSubTree) {

        // Builds initial html structure for root nodes
        var treeNodeMarkup = '';
        var classAttribute = ' class="gtc-accordiontree-root"';
        if (isSubTree == true) {
            classAttribute = '';
        }
        else {
            treeNodeMarkup = '<ul role="tree"' + classAttribute + '>';
        }
        if (Common.IsDefined(treeData.Nodes) && treeData.Nodes.length > 0) {
            var node, index = 0, length = treeData.Nodes.length;
            for ( ; index < length; index++) {
                node = treeData.Nodes[index];
                if (isSubTree != true) {
                    treeNodeMarkup += '<li role="treeitem" aria-expanded="false" id="' + node.Name + Common.SanitizeToken(node.Id) + '"><a role="button"';
                    if (Common.IsDefined(node.Id)) {
                        treeNodeMarkup += ' data-nodeid="' + node.Id + '"';
                    }
                    if (Common.IsDefined(node.UiParameters)) {
                        treeNodeMarkup += ' data-uiparameters=\'' + JSON.stringify(node.UiParameters) + '\'';
                    }
                    treeNodeMarkup += '><span class="gtc-accordiontree-openclose"><i class="gtc-icon-styles fa fa-plus-square-o"></i><i class="gtc-icon-styles fa fa-minus-square-o"></i><i class="gtc-icon-styles fa fa-square-o"></i></span>';
                    treeNodeMarkup += node.Display;
                    treeNodeMarkup += '</a>';
                }
                if (Common.IsDefined(node.Children) && node.Children.length > 0) {
                    treeNodeMarkup += '<ul>';
                    var child, childIndex = 0, childLength = node.Children.length;
                    for ( ; childIndex < childLength; childIndex++) {
                        child = node.Children[childIndex];
                        treeNodeMarkup += BuildTreeChildren(child);
                    }
                    treeNodeMarkup += '</ul>';
                }
                if (isSubTree != true) {
                    treeNodeMarkup += '</li>';
                }
            }
        }
        if (isSubTree != true) {
            treeNodeMarkup += '</ul>';
        }
        return treeNodeMarkup;

    };

    function BuildTreeChildren (node) {

        // Recursively builds html structure for all child nodes
        var treeNodeMarkup = '<li role="treeitem" aria-expanded="false" id="' + node.Name + Common.SanitizeToken(node.Id) + '"><a role="button"';
        if (Common.IsDefined(node.Id)) {
            treeNodeMarkup += ' data-nodeid="' + node.Id + '"';
        }
        if (Common.IsDefined(node.UiParameters)) {
            treeNodeMarkup += ' data-uiparameters=\'' + JSON.stringify(node.UiParameters) + '\'';
        }
        treeNodeMarkup += '><span class="gtc-accordiontree-openclose"><i class="gtc-icon-styles fa fa-plus-square-o"></i><i class="gtc-icon-styles fa fa-minus-square-o"></i><i class="gtc-icon-styles fa fa-square-o"></i></span>';
        treeNodeMarkup += node.Display;
        treeNodeMarkup += '</a>';
        if (Common.IsDefined(node.Children) && node.Children.length > 0) {
            treeNodeMarkup += '<ul>';
            var child, index = 0, length = node.Children.length;
            for ( ; index < length; index++) {
                child = node.Children[index];
                treeNodeMarkup += '<li role="treeitem" aria-expanded="false" id="' + child.Name + Common.SanitizeToken(child.Id) + '"><a role="button"';
                if (Common.IsDefined(child.Id)) {
                    treeNodeMarkup += ' data-nodeid="' + child.Id + '"';
                }
                if (Common.IsDefined(child.UiParameters)) {
                    treeNodeMarkup += ' data-uiparameters=\'' + JSON.stringify(child.UiParameters) + '\'';
                }
                treeNodeMarkup += '><span class="gtc-accordiontree-openclose"><i class="gtc-icon-styles fa fa-plus-square-o"></i><i class="gtc-icon-styles fa fa-minus-square-o"></i><i class="gtc-icon-styles fa fa-square-o"></i></span>';
                treeNodeMarkup += child.Display;
                treeNodeMarkup += '</a>';
                if (Common.IsDefined(child.Children) && child.Children.length > 0) {
                    treeNodeMarkup += '<ul>';
                    var nodeChild, childIndex = 0, childLength = child.Children.length;
                    for ( ; childIndex < childLength; childIndex++) {
                        nodeChild = child.Children[childIndex];
                        treeNodeMarkup += BuildTreeChildren(nodeChild);
                    }
                    treeNodeMarkup += '</ul>';
                }
                treeNodeMarkup += '</li>';
            }
            treeNodeMarkup += '</ul>';
        }
        treeNodeMarkup += '</li>';
        return treeNodeMarkup;

    };

} (window.AccordionTree = window.AccordionTree || {}, window, document, Common, Cache, Events, Velocity));

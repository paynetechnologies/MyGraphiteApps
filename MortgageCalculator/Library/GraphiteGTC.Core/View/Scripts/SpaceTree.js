// Space Tree
// Based On: SpaceTree -> Tree -> ViewElement
(function (SpaceTree, window, document, Common, Cache, Events, Velocity, undefined) {

    // Private Variables
    SpaceTree.InitializedTrees = [];

    // Public Methods
    SpaceTree.Render = function (dataTree) {

        // Initiliaze
        var treeMarkup = '';

        // Dimension
        var dimensionClass = '';
        var dimensionData = '';
        if (Common.IsDefined(dataTree.Dimension) && Common.IsOneDefined([dataTree.Dimension.Height, dataTree.Dimension.Width])) {
            dimensionClass = 'gtc-tree-' + dataTree.Name.toLowerCase();
            treeMarkup += '<style>.' + dimensionClass + ' {';
            if (Common.IsDefined(dataTree.Dimension.Height)) {
                treeMarkup += 'height:' + dataTree.Dimension.Height + dataTree.Dimension.Scale + ';';
                dimensionData += ' data-height="' + dataTree.Dimension.Height + dataTree.Dimension.Scale + '"';
            }
            treeMarkup += 'width:100%;} </style>';
            dimensionData += ' data-width="100%"';
            dimensionClass = ' ' + dimensionClass;
        }

        // Div<, Class@, Id@, Data-Tree@>
        treeMarkup += '<div class="gtc-spacetree gtc-tree-container" data-treetype="' + dataTree.TreeType + '" data-namespace="Tree"' + ViewElement.RenderAttributes(dataTree) + ' data-tree=\'' + JSON.stringify(dataTree) + '\'';

        // On Node Select Event
        if (Common.IsEventViewElementDefined(dataTree.OnNodeSelect)) {
            // Data-ControllerPath/ActionName
            treeMarkup += ' data-nodeselect=\'' + JSON.stringify(dataTree.OnNodeSelect) + '\'';
        }

        // On Load Event
        if (Common.IsEventViewElementDefined(dataTree.OnLoad)) {
            // Data-ControllerPath/ActionName
            treeMarkup += ' data-load=\'' + JSON.stringify(dataTree.OnLoad) + '\'';
        }

        // Dimension Data
        if (Common.IsNotEmptyString(dimensionData)) {
            treeMarkup += dimensionData;
        }

        // Variable Name
        if (Common.IsDefined(dataTree.VariableName)) {
            treeMarkup += ' data-variablename="' + dataTree.VariableName + '"';
        }
        treeMarkup += '>';

        // Title
        if (Common.IsDefined(dataTree.Title)) {
            treeMarkup += '<h2 id="' + dataTree.Name + 'Title" class="gtc-tree-title gtc-page-theme-color" data-translate="' + dataTree.Title + '">' + Common.TranslateKey(dataTree.Title) + '</h2>';
        }

        // Expand All
        if (dataTree.DisplayExpandAll == 'Yes') {
            treeMarkup += '<a data-currentstate="contracted" class="gtc-tree-expandall" id="tree-expandall-' + dataTree.Name + '"><i class="gtc-icon-styles fa fa-plus"></i></a>';
        }

        // Change Orientation
        var treeObjectOrientation = 'top';
        if (dataTree.Orientation.toLowerCase() == 'landscape') {
            treeObjectOrientation = 'left';
        }
        if (dataTree.DisplayChangeOrientation == 'Yes') {
            treeMarkup += '<a data-currentstate="' + treeObjectOrientation + '" class="gtc-tree-changeorientation gtc-tree-changeorientation-startingstate-' + treeObjectOrientation + '" id="tree-changeorientation-' + dataTree.Name + '"><i class="gtc-icon-styles fa fa-sitemap"></i></a>';
        }
        treeMarkup += '<div class="gtc-tree gtc-tree-' + dataTree.TreeType.toLowerCase() + dimensionClass + '" id="' + dataTree.Name + '-Container"></div>';
        treeMarkup += '</div>';

        // Return markup
        return treeMarkup;

    };

    SpaceTree.ShowTrees = function (spaceTrees) {

        var divTree, treeIndex = 0, length = spaceTrees.length;
        for ( ; treeIndex < length; treeIndex++) {
            divTree = spaceTrees[treeIndex];
            var dataTree = JSON.parse(Common.GetAttr(divTree, 'data-tree'));

            // Configure Tooltips
            var tooltips = {
                enable: false
            };
            if (dataTree.DisplayTooltips == 'Yes') {
                tooltips = {
                    enable: true,
                    offsetX: 20,
                    offsetY: 20,
                    onShow: function (tip, node) {
                        if (Common.IsDefined(node.data['Tooltip'])) {
                            Common.AddClass(tip, 'gtc-tip');
                            tip.innerHTML = '<div style="text-align: center">' + node.name + '</div><div>' + node.data['Tooltip'] + '</div>';
                            return true;
                        }
                        else {
                            tip.innerHTML = '';
                            return false;
                        }
                    }
                };
            }

            // Build Tree Data
            var jsonData = BuildJSONData(dataTree);

            // Tree Orientation
            var treeObjectOrientation = 'top';
            if (dataTree.Orientation.toLowerCase() == 'landscape') {
                treeObjectOrientation = 'left';
            }

            // Initialize Tree
            var currentScale = 1;
            var isZooming = false;
            var isDragging = false;
            var treeObject = new $jit.ST(
                {
                    injectInto: divTree.id + '-Container',
                    duration: 500,
                    transition: $jit.Trans.Quart.easeInOut,
                    levelDistance: 50,
                    constrained: true,
                    levelsToShow: 1,
                    orientation: treeObjectOrientation,
                    type: '2D',
                    Navigation: {
                        enable: true,
                        panning: true,
                        zooming: false,
                        onZoom: function (scroll) {
                            if (isZooming == false) {
                                isZooming = true;
                                var newScale = 0;
                                if (scroll > 1) {
                                    newScale = currentScale + (parseInt(scroll.toString().split('.')[1], 10) / 100);
                                }
                                else {
                                    newScale = currentScale - (1 - (parseInt(scroll.toString().split('.')[1], 10) / 100));
                                }
                                if (currentScale >= .5) {
                                    treeObject.graph.eachNode(
                                        function (node) {
                                            node.data['isScrolling'] = true;
                                            treeObject.labels.plotLabel(treeObject.canvas, node, treeObject.controller);
                                        }
                                    );
                                    currentScale = newScale;
                                }
                                else {
                                    currentScale = .5;
                                }
                                isZooming = false;
                            }
                        }
                    },
                    Node: {
                        height: 25,
                        width: 100,
                        color: '#FFFFFF',
                        type: 'rectangle',
                        overridable: true
                    },
                    Tips: tooltips,
                    Edge: {
                        type: 'bezier',
                        overridable: true,
                        color: '#BBBBBB'
                    },
                    Events: {
                        enable: true,
                        onClick: function (node, eventInfo, event) {
                            if (Common.IsDefined(Common.GetAttr(divTree, 'data-nodeselect')) && node != false && node.data['IgnoreNodeSelect'] == 'No') {
                                SpaceTree.OnNodeSelect(divTree, node);
                            }
                        },
                        onDragMove: function (node, eventInfo, event) {
                            isDragging = true;
                        }
                    },
                    onCreateLabel: function (label, node) {
                        label.id = node.id;
                        Common.AddClass(label, 'gtc-node');
                        label.innerHTML = node.name;
                        label.onclick = function (event) {
                            if (isDragging) {
                                isDragging = false;
                            }
                            else {
                                treeObject.onClick(node.id);
                            }
                        };
                    },
                    onPlaceLabel: function (label, node) {
                        var isScrolling = node.data['isScrolling'];
                        var labelStyle = label.style;
                        if (isScrolling == true) {
                            node.data['isScrolling'] = false;
                            labelStyle.webkitTransform = 'scale(' + currentScale + ', ' + currentScale + ')';
                            labelStyle.msTransform = 'scale(' + currentScale + ', ' + currentScale + ')';
                            labelStyle.transform = 'scale(' + currentScale + ', ' + currentScale + ')';
                        }
                        if (currentScale == 1) {
                            labelStyle.height = node.Node.height + 'px';
                            labelStyle.width = node.Node.width + 'px';
                        }
                        if (node.selected) {
                            Common.AddClass(label, 'gtc-selected-node');
                        }
                        else {
                            Common.RemoveClass(label, 'gtc-selected-node');
                        }
                    },
                    onBeforePlotNode: function (node) {
                        if (node.selected) {
                            node.setData('color', '#000000');
                        }
                        else {
                            node.setData('color', '#FFFFFF');
                        }
                    },
                    onBeforePlotLine: function (adjacency) {
                        if (adjacency.nodeFrom.selected && adjacency.nodeTo.selected) {
                            adjacency.data.$color = '#888888';
                            adjacency.data.$lineWidth = 3;
                        }
                        else {
                            delete adjacency.data.$color;
                            delete adjacency.data.$lineWidth;
                        }
                    }
                }
            );

            // Attach expand event
            if (dataTree.DisplayExpandAll == 'Yes') {
                Events.On(Common.Get('tree-expandall-' + dataTree.Name), 'click',
                    function () {
                        var spaceTree = Common.Get(dataTree.Name);
                        Tree.ShowPinwheel(spaceTree);
                        var currentState = Common.GetAttr(this, 'data-currentstate');
                        var options = treeObject.canvas.getConfig();
                        var treeObjectOrientation = Common.GetAttr(Common.Get('tree-changeorientation-' + dataTree.Name), 'data-currentstate');
                        if (currentState == 'expanded') {
                            options.constrained = true;
                            options.levelsToShow = 1;
                            treeObject.switchPosition(treeObjectOrientation, 'animate');
                            Common.SetAttr(this, 'data-currentstate', 'contracted');
                            Common.RemoveClass(Common.Query('i', this), 'gtc-rotate45');
                        }
                        else {
                            options.constrained = false;
                            options.levelsToShow = 500;
                            treeObject.switchPosition(treeObjectOrientation, 'animate');
                            Common.SetAttr(this, 'data-currentstate', 'expanded');
                            Common.AddClass(Common.Query('i', this), 'gtc-rotate45');
                        }
                        Tree.HidePinwheel(spaceTree);
                    }
                );
            }

            // Attach change orientation event
            if (dataTree.DisplayChangeOrientation == 'Yes') {
                Events.On(Common.Get('tree-changeorientation-' + dataTree.Name), 'click',
                    function () {
                        var spaceTree = Common.Get(dataTree.Name);
                        Tree.ShowPinwheel(spaceTree);
                        var currentState = Common.GetAttr(this, 'data-currentstate');
                        if (currentState == 'top') {
                            treeObject.switchPosition('left', 'animate');
                            Common.SetAttr(this, 'data-currentstate', 'left');
                            if (Common.HasClass(this, 'gtc-tree-changeorientation-startingstate-left')) {
                                Common.RemoveClass(Common.Query('i', this), 'gtc-rotate90');
                            }
                            else if (Common.HasClass(this, 'gtc-tree-changeorientation-startingstate-top')) {
                                Common.AddClass(Common.Query('i', this), 'gtc-rotate90');
                            }
                        }
                        else {
                            treeObject.switchPosition('top', 'animate');
                            Common.SetAttr(this, 'data-currentstate', 'top');
                            if (Common.HasClass(this, 'gtc-tree-changeorientation-startingstate-left')) {
                                Common.AddClass(Common.Query('i', this), 'gtc-rotate90');
                            }
                            else if (Common.HasClass(this, 'gtc-tree-changeorientation-startingstate-top')) {
                                Common.RemoveClass(Common.Query('i', this), 'gtc-rotate90');
                            }
                        }
                        Tree.HidePinwheel(spaceTree);
                    }
                );
            }

            if (!Common.IsEmptyObject(jsonData)) {
                // Load the json data
                treeObject.loadJSON(jsonData);

                // Compute node positions
                treeObject.compute();

                // Display tree or wait for display of modal for proper width
                var displayTreeFunction = function () {
                    // Animate tree into view
                    treeObject.geom.translate(new $jit.Complex(-300, -300), 'current');

                    // Emulate root node click to display tree
                    treeObject.onClick(treeObject.root);
                };

                // Is View a Modal?
                if (Common.IsModal()) {
                    setTimeout(
                        function () {
                            displayTreeFunction();
                            treeObject.canvas.resize(Common.Width(divTree), Common.Height(divTree));
                        }, 1000
                    );
                }
                else {
                    displayTreeFunction();
                }
            }

            // Cleanup json data
            Common.RemoveAttr(divTree, 'data-tree');

            // Save Reference for async changes
            SpaceTree.InitializedTrees[divTree.id] = treeObject;

            // Trigger OnLoad event
            if (Common.IsDefined(Common.GetAttr(divTree, 'data-load'))) {
                SpaceTree.OnLoad(divTree);
            }
        }

    };

    SpaceTree.OnNodeSelect = function (tree, node) {

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
        var viewModel = node.data['UiParameterNodeId'];
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
        var extraUiParameters = node.data['UiParameters'];
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

    SpaceTree.OnLoad = function (tree) {

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

    SpaceTree.ReplaceElement = function (tree, viewElements) {

        Tree.ShowPinwheel(tree);
        var hiddenTree = Common.IsHidden(tree);
        var replaceTree = function () {
            if (Common.IsDefined(viewElements) && viewElements.length == 1) {
                var dataTree = viewElements[0];

                var treeObject = SpaceTree.InitializedTrees[tree.id];
                treeObject.graph.empty();

                // Build Tree Data
                var jsonData = BuildJSONData(dataTree);

                // Load the json data
                treeObject.loadJSON(jsonData);

                // Compute node positions
                treeObject.compute();

                // Emulate root node click to display tree
                treeObject.onClick(treeObject.root);

                // Resize and refresh canvas
                if (hiddenTree) {
                    treeObject.canvas.resize(Common.Width(tree), Common.Height(tree));
                    treeObject.refresh();
                }

                // Remove Pinwheel
                Tree.HidePinwheel(tree);
            }
        };

        if (hiddenTree) {
            // Give time for tree to display so we can update canvas
            setTimeout(
                function () {
                    replaceTree();
                }, 1000
            );
        }
        else {
            replaceTree();
        }

    };

    SpaceTree.UpdateValues = function (tree, uiParameters) {

        if (Common.IsDefined(uiParameters)) {
            Tree.ShowPinwheel(tree);
            var treeObject = SpaceTree.InitializedTrees[tree.id];
            var uiParameter, index = 0, length = uiParameters.length;
            for ( ; index < length; index++) {
                uiParameter = uiParameters[index];

                var label = treeObject.labels.getLabel(uiParameter.Name);
                if (Common.IsDefined(label)) {

                    // For loops have no scope! Give it some. (IIFE)
                    (function (label, uiParameter) {

                        Velocity(label, { 'opacity': '0' }, 'slow',
                            function () {
                                label.textContent = uiParameter.Value;
                                Velocity(label, 'reverse');
                            }
                        );

                    }(label, uiParameter));

                }
            }
            Tree.HidePinwheel(tree);
        }

    };

    SpaceTree.UpdateColor = function (tree, uiParameters) {

        if (Common.IsDefined(uiParameters)) {
            Tree.ShowPinwheel(tree);
            var treeObject = SpaceTree.InitializedTrees[tree.id];
            var uiParameter, index = 0, length = uiParameters.length;
            for ( ; index < length; index++) {
                uiParameter = uiParameters[index];
                var label = treeObject.labels.getLabel(uiParameter.Name);
                var node = treeObject.graph.getNode(uiParameter.Name);
                var color = Colors.ProcessValue(uiParameter.Value, false, null);
                var labelStyle = label.style;
                labelStyle.backgroundColor = color;
                labelStyle.color = Colors.Invert(color);
                if (new RegExp(Colors.RGBRegEx).test(color)) {
                    color = '#' + Colors.ConvertRGBToHex(color);
                }
                node.setData('color', color);
                treeObject.fx.animate(
                    {
                        modes : [ 'node-property:color' ],
                        duration : 1
                    }
                );
            }
            Tree.HidePinwheel(tree);
        }

    };

    SpaceTree.UpdateTooltip = function (tree, uiParameters) {

        if (Common.IsDefined(uiParameters)) {
            Tree.ShowPinwheel(tree);
            var treeObject = SpaceTree.InitializedTrees[tree.id];
            var uiParameter, index = 0, length = uiParameters.length;
            for ( ; index < length; index++) {
                uiParameter = uiParameters[index];
                var node = treeObject.graph.getNode(uiParameter.Name);
                node.data['Tooltip'] = uiParameter.Value;
            }
            Tree.HidePinwheel(tree);
        }

    };

    SpaceTree.AppendContent = function (tree, viewElements) {

        if (Common.IsDefined(viewElements)) {
            Tree.ShowPinwheel(tree);
            var treeObject = SpaceTree.InitializedTrees[tree.id];
            var subTree, index = 0, length = viewElements.length;
            for ( ; index < length; index++) {
                subTree = viewElements[index];
                var jsonData = BuildJSONData(subTree);
                treeObject.addSubtree(jsonData, 'animate');
            }
            Tree.HidePinwheel(tree);
        }

    };

    SpaceTree.RemoveContent = function (tree, viewElements) {

        if (Common.IsDefined(viewElements)) {
            Tree.ShowPinwheel(tree);
            var treeObject = SpaceTree.InitializedTrees[tree.id];
            var subTree, index = 0, length = viewElements.length;
            for ( ; index < length; index++) {
                subTree = viewElements[index];
                if (Common.IsDefined(subTree.Nodes) && subTree.Nodes.length == 1) {
                    var subTreeId = subTree.Nodes[0].Name + Common.SanitizeToken(subTree.Nodes[0].Id);
                    treeObject.removeSubtree(subTreeId, true, 'animate');
                }
            }
            Tree.HidePinwheel(tree);
        }

    };

    // Private Methods
    function BuildJSONData(treeData) {

        // Builds initial JSON structure for root nodes
        var jsonData = {};
        if (Common.IsDefined(treeData.Nodes) && treeData.Nodes.length > 0) {
            var node, nodeIndex = 0, nodeLength = treeData.Nodes.length;
            for ( ; nodeIndex < nodeLength; nodeIndex++) {
                node = treeData.Nodes[nodeIndex];
                jsonData.id = node.Name + Common.SanitizeToken(node.Id);
                jsonData.name = node.Display;
                jsonData.data = {
                    'Tooltip': node.Tooltip,
                    'IgnoreNodeSelect': node.IgnoreNodeSelect,
                    'UiParameterNodeId': node.Id,
                    'UiParameters': node.UiParameters
                };
                if (Common.IsDefined(node.Children) && node.Children.length > 0) {
                    jsonData.children = [];
                    var childIndex = 0, childLength = node.Children.length;
                    for ( ; childIndex < childLength; childIndex++) {
                        jsonData.children.push(BuildJSONChildren(node.Children[childIndex]));
                    }
                }
            }
        }
        return jsonData;

    };

    function BuildJSONChildren(node) {

        // Recursively builds JSON structure for all child nodes
        var jsonData = {};
        jsonData.id = node.Name + Common.SanitizeToken(node.Id);
        jsonData.name = node.Display;
        jsonData.data = {
            'Tooltip': node.Tooltip,
            'IgnoreNodeSelect': node.IgnoreNodeSelect,
            'UiParameterNodeId': node.Id,
            'UiParameters': node.UiParameters
        };
        if (Common.IsDefined(node.Children) && node.Children.length > 0) {
            jsonData.children = [];
            var child, childIndex = 0, childLength = node.Children.length;
            for ( ; childIndex < childLength; childIndex++) {
                child = node.Children[childIndex];
                var jsonChildData = {};
                jsonChildData.id = child.Name + Common.SanitizeToken(child.Id);
                jsonChildData.name = child.Display;
                jsonChildData.data = {
                    'Tooltip': child.Tooltip,
                    'IgnoreNodeSelect': child.IgnoreNodeSelect,
                    'UiParameterNodeId': child.Id,
                    'UiParameters': child.UiParameters
                };
                if (Common.IsDefined(child.Children) && child.Children.length > 0) {
                    jsonChildData.children = [];
                    var nodeChildIndex = 0, nodeChildLength = child.Children.length;
                    for ( ; nodeChildIndex < nodeChildLength; nodeChildIndex++) {
                        jsonChildData.children.push(BuildJSONChildren(child.Children[nodeChildIndex], false));
                    }
                }
                jsonData.children.push(jsonChildData);
            }
        }
        return jsonData;

    };

} (window.SpaceTree = window.SpaceTree || {}, window, document, Common, Cache, Events, Velocity));

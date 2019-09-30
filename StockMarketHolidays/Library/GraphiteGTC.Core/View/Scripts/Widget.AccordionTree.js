// Accordion Tree Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var AccordionTreeWidget = {

        // Options
        options: {
            TreeRoot: null,
            StartCollapsed: true,
            CloseSameLevel: false,
            AnimationDuration: 400,
            InTreePanel: false,
            HasNodeSelectEvent: false
        },

        // Public Methods
        AddSubTree: function (subTreeData) {

            var thisWidget = this;
            thisWidget._addSubTree(subTreeData);

        },

        RemoveSubTree: function (subTreeId) {

            var thisWidget = this;
            thisWidget._removeSubTree(subTreeId);

        },

        // Private Methods
        _applyInitialUlStyles: function (uls) {

            // Initialize
            var thisWidget = this;

            // Apply styling
            var ulStyle, index = 0, length = uls.length;
            for ( ; index < length; index++) {
                ulStyle = uls[index].style;
                ulStyle.overflow = 'hidden';
                ulStyle.height = (thisWidget.options.StartCollapsed) ? 0 : 'auto';
                ulStyle.display = (thisWidget.options.StartCollapsed) ? 'none' : 'block';
            }

        },

        _applyInitialLiStyles: function (lis) {

            // Initialize
            var thisWidget = this;

            // Add classes for node element styling
            var val, children, index = 0, length = lis.length, childrenIndex, childrenLength;
            for ( ; index < length; index++) {
                val = lis[index];
                val.firstChild.style.cursor = 'pointer';
                children = Common.GetChildren(val, 'ul');
                childrenLength = children.length;
                if (childrenLength > 0) {
                    Common.AddClasses(val, 'gtc-accordiontree-node gtc-accordiontree-' + ((thisWidget.options.StartCollapsed) ? 'closed' : 'open'));
                    childrenIndex = 0;
                    for ( ; childrenIndex < childrenLength; childrenIndex++) {
                        Common.AddClass(children[childrenIndex], 'gtc-accordiontree-level-' + (Common.ParentsUntil(val, '.gtc-accordiontree-root', 'ul').length + 1));
                    }
                }
            }

        },

        _attachNodeAnchorClicks: function (anchors) {

            var thisWidget = this;

            // Set accordiontree-active class on list items for last opened element
            Events.Off(anchors, 'click.accordiontree-active');
            Events.On(anchors, 'click.accordiontree-active',
                function (event) {
                    // Set proper classes
                    var thisParent = this.parentNode;
                    var eventTarget = event.target;
                    var closestOpenClose = Common.Closest('.gtc-accordiontree-openclose', eventTarget);
                    if (Common.IsNotDefined(closestOpenClose)) {
                        var activeLis = Common.QueryAll('.gtc-accordiontree-active:not(#' + thisParent.id + ')', thisWidget.element);
                        Common.RemoveClassFromElements(activeLis, 'gtc-accordiontree-active');
                        if (Common.HasClass(thisParent, 'accordiontree-closed')) {
                            Common.AddClass(thisParent, 'gtc-accordiontree-active');
                        }
                        else {
                            Common.ToggleClass(thisParent, 'gtc-accordiontree-active');
                        }
                    }

                    if (Common.IsDefined(closestOpenClose)) {
                        var ulChild = Common.GetChildren(thisParent, 'ul')[0];
                        var isOpen = Common.HasClass(thisParent, 'gtc-accordiontree-open');

                        // Close other elements on same level if configured
                        if (thisWidget.options.CloseSameLevel) {
                            var openItems = Common.GetChildren(Common.Closest('ul', this), '.gtc-accordiontree-open:not(#' + thisParent.id + ')');
                            var itemsToClose = [], index = 0, length = openItems.length;
                            for ( ; index < length; index++) {
                                itemsToClose.push(Common.GetChildren(openItems[index], 'ul')[0]);
                            }
                            Velocity(itemsToClose, 'slideUp', thisWidget.options.AnimationDuration,
                                function () {
                                    var itemsToCloseIndex = 0, itemsToCloseLength = this.length;
                                    for ( ; itemsToCloseIndex < itemsToCloseLength; itemsToCloseIndex++) {
                                        thisWidget._setNodeClass(this[index].parentNode, true);
                                    }
                                }
                            );
                        }

                        // Set auto height, class and animate open/closed
                        if (Common.IsDefined(ulChild)) {
                            ulChild.style.height = 'auto';
                            thisWidget._setNodeClass(thisParent, isOpen);
                            var slideDirection = 'slideDown';
                            if (isOpen) {
                                slideDirection = 'slideUp';
                            }
                            Velocity(ulChild, slideDirection, thisWidget.options.AnimationDuration);
                        }
                    }
                    else {
                        // OnClickNode
                        if (Common.HasClass(thisParent, 'gtc-accordiontree-active') && Common.IsDefined(Common.GetAttr(thisWidget.element, 'data-nodeselect'))) {
                            AccordionTree.OnNodeSelect(thisWidget.element, this);
                        }
                    }
                }
            );

        },

        _attachNodeClicks: function (nodes) {

            var thisWidget = this;

            // Set node click elements
            var firstNodeChildren = [], index = 0, length = nodes.length;
            for ( ; index < length; index++) {
                firstNodeChildren.push(nodes[index].firstChild);
            }
            Events.Off(firstNodeChildren, 'click.accordiontree');
            Events.On(firstNodeChildren, 'click.accordiontree',
                function (event) {
                    event.preventDefault();

                    // Trigger OnNodeSelect event
                    if (Common.IsNotDefined(Common.Closest('.gtc-accordiontree-openclose', event.target)) && thisWidget.options.HasNodeSelectEvent) {
                        AccordionTree.OnNodeSelect(thisWidget.element, this.parentNode);
                    }
                }
            );

        },

        _setNodeClass: function (element, isOpen) {

            if (isOpen) {
                Common.RemoveClass(element, 'gtc-accordiontree-open');
                Common.AddClass(element, 'gtc-accordiontree-closed');
                Common.SetAttr(element, 'aria-expanded', 'false');
            }
            else {
                Common.RemoveClass(element, 'gtc-accordiontree-closed');
                Common.AddClass(element, 'gtc-accordiontree-open');
                Common.SetAttr(element, 'aria-expanded', 'true');
            }

        },

        _addSubTree: function (subTreeData) {

            // Initialize
            var thisWidget = this;

            // Find node to add subtree into
            var node = Common.Query('#' + subTreeData.SubTreeId, thisWidget.element);
            Common.Remove(Common.Query('ul', node));
            Common.RemoveClass(node, 'gtc-accordiontree-open');
            Common.RemoveClass(node, 'gtc-accordiontree-closed');
            Common.InsertHTMLString(node, Common.InsertType.Append, subTreeData.HtmlMarkup);

            // Set initial styles
            thisWidget._applyInitialUlStyles(Common.QueryAll('ul', node));
            var initialNodes = Common.FilterElementsOnDescendants(Common.QueryAll('li', node), 'ul');
            var initialLis = Common.MergeArray([], initialNodes);
            initialLis.push(node);
            thisWidget._applyInitialLiStyles(initialLis);

            // Attach node clicks
            thisWidget._attachNodeAnchorClicks(Common.QueryAll('li > *:first-child', node));
            thisWidget._attachNodeClicks(initialNodes);

            var element = Common.GetChildren(node, 'ul')[0];
            var isOpen = Common.HasClass(node, 'gtc-accordiontree-open');

            if (Common.HasClass(node, 'gtc-accordiontree-active')) {
                // Close other elements on same level if configured
                if (thisWidget.options.CloseSameLevel) {
                    var openItems = Common.GetChildren(Common.Closest('ul', node), '.gtc-accordiontree-open:not(#' + node.parentNode.id + ')');
                    var itemsToClose = [], index = 0, length = openItems.length;
                    for ( ; index < length; index++) {
                        itemsToClose.push(Common.GetChildren(openItems[index], 'ul')[0]);
                    }
                    Velocity(itemsToClose, 'slideUp', thisWidget.options.AnimationDuration,
                        function () {
                            var itemsToCloseIndex = 0, itemsToCloseLength = this.length;
                            for ( ; itemsToCloseIndex < itemsToCloseLength; itemsToCloseIndex++) {
                                thisWidget._setNodeClass(this[index].parentNode, true);
                            }
                        }
                    );
                }

                // Set auto height, class and animate open/closed
                if (Common.IsDefined(element)) {
                    element.style.height = 'auto';
                    thisWidget._setNodeClass(node, isOpen);
                    var slideDirection = 'slideDown';
                    if (isOpen) {
                        slideDirection = 'slideUp';
                    }
                    Velocity(element, slideDirection, thisWidget.options.AnimationDuration);
                }
            }

        },

        _removeSubTree: function (subTreeId) {

            // Initialize
            var thisWidget = this;

            // Remove subtree
            Common.Remove(Common.Query('#' + subTreeId, thisWidget.element));

        },

        _init: function () {

        },

        _create: function () {

            // Initialize
            var thisWidget = this;
            thisWidget.options.TreeRoot = Common.Query('.gtc-accordiontree-root', thisWidget.element);
            if (Common.IsDefined(Common.GetAttr(thisWidget.element, 'data-intreepanel')) && Common.GetAttr(thisWidget.element, 'data-intreepanel') == 'true') {
                thisWidget.options.InTreePanel = true;
            }

            // Set initial styles
            thisWidget._applyInitialUlStyles(Common.QueryAll('ul', thisWidget.options.TreeRoot));
            var initialLis = Common.FilterElementsOnDescendants(Common.QueryAll('li', thisWidget.element), 'ul');
            thisWidget._applyInitialLiStyles(initialLis);

            // Attach node clicks
            thisWidget._attachNodeAnchorClicks(Common.QueryAll('#' + thisWidget.element.id +'.gtc-accordiontree li > *:first-child'));
            thisWidget._attachNodeClicks(initialLis);

            // NOde Select event configured?
            if (Common.IsDefined(Common.GetAttr(thisWidget.element, 'data-nodeselect'))) {
                thisWidget.options.HasNodeSelectEvent = true;
            }

            // Trigger OnLoad event
            if (Common.IsDefined(Common.GetAttr(thisWidget.element, 'data-load'))) {
                AccordionTree.OnLoad(thisWidget.element);
            }

        }

    };

    WidgetFactory.Register('gtc.accordiontree', AccordionTreeWidget);

} (window, document, Common, Cache, Events, Velocity));

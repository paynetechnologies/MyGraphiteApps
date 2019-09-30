// Tree
// Based On: Tree -> ViewElement
(function (Tree, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Tree.Render = function (dataTree, inTreePanel) {

        var treeNamespace = window[dataTree.TreeType.toString() + 'Tree'];
        return treeNamespace.Render(dataTree, inTreePanel);

    };

    Tree.Configure = function (tree, configureStage) {

        if (tree.dataset.treetype == 'Space') {
            SpaceTree.ShowTrees(tree);
        }
        else if (tree.dataset.treetype == 'Accordion') {
            Widgets.accordiontree(tree);
        }
    };

    Tree.ReplaceElement = function (tree, viewElements, promises, context) {

        var treeNamespace = window[Common.GetAttr(tree, 'data-treetype') + 'Tree'];
        treeNamespace.ReplaceElement(tree, viewElements, promises, context);

    };

    Tree.UpdateTitle = function (tree, updatedTitle, promises, context) {

        // Get deferred object for animation
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Find title
        var onParent = context == 'Parent';
        var title = Common.Get(tree.id + 'Title', onParent);

        // Define our update function
        var updateTitleFunction = function () {
            title.textContent = Common.TranslateKey(updatedTitle);
            Common.SetAttr(title, 'data-translate', updatedTitle);
        };

        // If title doesnt exist, create one
        if (Common.IsNotDefined(title)) {
            var className = 'gtc-tree-title ';
            var treeNamespace = window[Common.GetAttr(tree, 'data-treetype') + 'Tree'];
            if (treeNamespace == 'AccordionTree') {
                className = 'gtc-accordiontree-title ';
            }
            var titleHtml = '<h2 id="' + tree.id + 'Title" style="display: none;" class="' + className + 'gtc-page-theme-color" data-translate="' + updatedTitle + '">' + Common.TranslateKey(updatedTitle) + '</h2>';
            title = Common.InsertHTMLString(tree, Common.InsertType.Prepend, titleHtml, tree.id + 'Title');
            Common.Slide(title, 'show', 'left', 'slow');
        }
        else if (Common.IsHidden(tree)) {
            updateTitleFunction();
        }
        else {
            // Animate
            Velocity(title, { 'opacity': 0 }, 'slow',
                function () {
                    updateTitleFunction();
                    Velocity(title, 'reverse',
                        function () {
                            Common.RemoveOpacity(title);
                            animationPromise.resolve();
                        }
                    );
                }
            );
        }

    };

    Tree.UpdateValues = function (tree, uiParameters) {

        var treeNamespace = window[Common.GetAttr(tree, 'data-treetype') + 'Tree'];
        treeNamespace.UpdateValues(tree, uiParameters);

    };

    Tree.UpdateColor = function (tree, uiParameters) {

        var treeNamespace = window[Common.GetAttr(tree, 'data-treetype') + 'Tree'];
        treeNamespace.UpdateColor(tree, uiParameters);

    };

    Tree.UpdateTooltip = function (tree, uiParameters) {

        var treeNamespace = window[Common.GetAttr(tree, 'data-treetype') + 'Tree'];
        treeNamespace.UpdateTooltip(tree, uiParameters);

    };

    Tree.AppendContent = function (tree, viewElements, promises, context) {

        var treeNamespace = window[Common.GetAttr(tree, 'data-treetype') + 'Tree'];
        treeNamespace.AppendContent(tree, viewElements, promises, context);

    };

    Tree.RemoveContent = function (tree, viewElements, promises, context) {

        var treeNamespace = window[Common.GetAttr(tree, 'data-treetype') + 'Tree'];
        treeNamespace.RemoveContent(tree, viewElements, promises, context);

    };

    Tree.ShowPinwheel = function (tree) {

        Common.InsertHTMLString(document.body, Common.InsertType.Append, '<div class="gtc-pinwheel-overlay gtc-pinwheel-overlay-transparent" id="TreePinwheelOverlay"></div>');
        SpinKit.Show(tree, 'FadingCircle');

    };

    Tree.HidePinwheel = function (tree) {

        setTimeout(
            function () {
                SpinKit.Hide(tree);
                Common.Remove(Common.Get('TreePinwheelOverlay'));
            }, 600
        );

    };

} (window.Tree = window.Tree || {}, window, document, Common, Cache, Events, Velocity));

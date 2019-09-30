// Graphite GTC Preview

function customSessionHolder (dictionary) {

    this.dictionary = dictionary;
    this.getItem = function (key) {

        var value = dictionary[key];
        if (Common.IsNotDefined(value)) {
            return null;
        }
        return value;

    };
    this.setItem = function (key, value) {

        dictionary[key] = value;

    };
    this.removeItem = function (key) {

        delete dictionary[key];

    };
    this.clear = function () {

        dictionary = {};

    };

};

var dictionaryObject = {};
var customSessionStorage = new customSessionHolder(dictionaryObject);

Common.GetStorage = function (key) {

    return customSessionStorage.getItem( key );

};

Common.SetStorage = function (key, value) {

    customSessionStorage.setItem(key, value);

};

Common.RemoveStorage = function (key) {

    customSessionStorage.removeItem(key);

};

Common.ClearStorage = function () {

    customSessionStorage.clear();

};

function RenderPreview (view, translationResources, theme, language) {

    // Clear Session Data
    Common.ClearStorage();

    // Reset Theme and Language
    Common.SetStorage('CurrentTheme', theme);
    Common.SetStorage('CurrentLanguage', language);

    // Set Context
    Common.SetStorage('CurrentContext', 'Buttons');

    // Set Theme
    Common.ApplyTheme(false);

    // Build Page HTML
    var pageHtml = Page.Render(view);

    // 508 Compliance
    pageHtml = '<a id="SkipToMainContent508" class="gtc-sr-only gtc-sr-only-focusable" href="#PageMainContent" data-translate="SkipToMainContent">' + Common.TranslateKey('SkipToMainContent') + '</a>' + pageHtml;

    // Insert into DOM
    var bodyObject = document.body;
    var contentDiv = document.createElement('div');
    contentDiv.innerHTML = pageHtml;
    bodyObject.insertBefore(contentDiv, bodyObject.firstChild);

    // Configure page
    Page.Configure(view);

    // Show Graphs (use a Function that Translate will call after 18n.init)
    var showGraphs = function() {
        var graphs = Common.QueryAll('.gtc-graph-container');
        if (graphs.length > 0) {
            Graph.ShowGraphs(graphs, showGraphs);
        }
    };

    // Translate page
    Common.TranslatePage(false, showGraphs, translationResources);

    // Set Margin
    Page.SetPageHeight();

};

function RenderPreviewModal (jsonObject, translationResources, theme, language) {

    // Clear Session Data
    Common.ClearStorage();

    // Reset Theme and Language
    Common.SetStorage('CurrentTheme', theme);
    Common.SetStorage('CurrentLanguage', language);

    // Set Context
    Common.SetStorage('CurrentContext', 'DocumentModal');

    // Build Modal
    var divOverlay = '<div id="ModalPreviewOverlay" class="gtc-modal-overlay"></div>';
    var divModal = '<div id="ModalPreview" class="gtc-modal-container">';

    // Fake iFrame
    divModal += '<div class="gtc-modal-body" name="IframeModalPreview" id="IframeModalPreview" data-modalsize="Auto"><a id="SkipToMainContent508" class="gtc-sr-only gtc-sr-only-focusable" href="#PageMainContent" data-translate="SkipToMainContent">' + Common.TranslateKey('SkipToMainContent') + '</a></div>';
    divModal += '</div>';

    // Attach Modal to DOM
    Common.InsertHTMLString(document.body, Common.InsertType.Append, divOverlay);
    Common.InsertHTMLString(document.body, Common.InsertType.Append, divModal);

    // Initialize modal dialog
    var modalInstance = Common.Get('ModalPreview');
    Widgets.modal(modalInstance,
        {
            minHeight: false,
            minWidth: false,
            maxHeight: false,
            maxWidth: false,
            width: false,
            dialogClass: 'gtc-modal-dialog',
            autoOpen: false
        }
    );

    // Call Render for JSON here
    var html = Page.Render(jsonObject);
    Common.InsertHTMLString(Common.Get('IframeModalPreview'), Common.InsertType.Append, html);

    // Wrap for scrolling
    var wrapper = Common.GenerateHTML('<div class="gtc-modal-scrollcontainer"></div>');
    Common.Wrap(modalInstance.parentNode, wrapper);

    // Show Graphs (use a Function that Translate will call after 18n.init)
    var showGraphs = function() {
        var graphs = Common.QueryAll('.gtc-graph-container');
        if (graphs.length > 0) {
            Graph.ShowGraphs(graphs, showGraphs);
        }
    };

    // Configure Page
    Page.Configure(jsonObject, showGraphs);

    // Translate page
    Common.TranslatePage(false);

    // Add custom class and close link to title bar
    var modalTitleBar = Common.Query('.gtc-ui-dialog-titlebar', modalInstance.parentNode);
    Common.AddClass(modalTitleBar, 'gtc-modal-titlebar');
    Common.InsertHTMLString(modalTitleBar, Common.InsertType.Append, '<a class="gtc-modal-close">Close</a>');

    // Get modal sizes
    var modalBody = Common.Get('IframeModalPreview');
    Widgets.modal(modalInstance, 'option', { height: 'auto' });

    // Determine if we should force modal width
    var modalSizeOverride = Common.GetAttr(modalBody, 'data-modalsize');
    if (Common.IsDefined(modalSizeOverride) && modalSizeOverride.toLowerCase() != 'auto') {
        Common.AddClass(modalInstance.parentNode, 'gtc-modal-' + modalSizeOverride.toLowerCase());
    }
    else {
        var modalSizingClass = Modals.DetermineModalDialogWidth(modalBody);
        Common.AddClass(modalInstance.parentNode, modalSizingClass);
    }

    // Find height real height ( For now cant find a better way than timeout)
    setTimeout(
        function () {
            ResizeModalPreview('ModalPreview', true, false, null);
            // Show modal
            Widgets.modal(modalInstance, 'open');
        }, 100
    );

    // Show modal overlay
    Velocity(Common.Get('ModalPreviewOverlay'), 'fadeIn', 'slow');

};

function ResizeModalPreview (modalName, centerModal, animateResizing, callBackFunction) {

    // Initialize
    var centeringStep = null;

    // Get modal, body and sizes
    var modal = Common.Get(modalName);
    var modalScroll = Common.Closest('.gtc-modal-scrollcontainer', modal);
    var displayCache = '';
    var modalParent = modal.parentNode;
    var modalParentStyle = modalParent.style;
    if (animateResizing != true) {
        displayCache = Common.GetStyle(modalParent, 'display');
        modalParentStyle.zIndex = '-1000';
        modalParentStyle.display = 'block';
    }
    var newHeight = Common.Height(Common.Query('#DivPage', modal), true);

    // Handle modals that need scrolling
    var positionObject = { my: 'center', at: 'center', of: modalScroll };
    if (newHeight > Common.Height(window)) {
        positionObject = { my: 'top', at: 'top', of: modalScroll };
    }
    else {
        var documentDisplay = Common.Query('.gtc-documentdisplay', modal);
        if (Common.IsDefined(documentDisplay)) {
            positionObject = { my: 'top', at: 'top', of: modalScroll };
            var documentHeight = Common.GetAttr(documentDisplay, 'data-height');
            if (Common.IsDefined(documentHeight)) {
                // TODO: Add em, pt and % conversions
                newHeight += parseInt(documentHeight, 10) + 200;
            }
            else {
                newHeight += Common.Height(parent.window) + 200;
            }
        }
    }
    if (animateResizing == true) {
        // Add centering step function if needed
        if (centerModal == true) {
            centeringStep = function () {
                Widgets.modal(modal, 'option', 'position', positionObject);
            };
        }

        // Start modal animations
        Velocity(modal,
            {
                height: newHeight
            }, 250
        );

        // Start dialog widget animations
        Velocity(Widgets.modal(modal, 'widget'),
            {
                height: newHeight
            },
            {
                duration: 250,
                progress: centeringStep
            }
        );
    }
    else {
        // Update new modal sizes
        modal.style.height = newHeight + 'px';

        // Create dialog options
        var dialogOptions = {
            height: newHeight
        };

        // Add centering if modal centering is needed
        if (centerModal == true) {
            dialogOptions.position = positionObject;
        }

        // Update modal
        Widgets.modal(modal, 'option', dialogOptions);
    }
    if (animateResizing != true) {
        modalParentStyle.display = displayCache;
        modalParentStyle.zIndex = '';
    }

};

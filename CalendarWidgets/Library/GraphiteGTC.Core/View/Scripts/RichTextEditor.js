// Rich Text Editor
// Based On: RichTextEditor -> ViewElement
(function (RichTextEditor, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    RichTextEditor.Render = function (richTextEditor) {

        // Div<, TabIndex@, Class@, Id@>
        var tabIndex = richTextEditor.FocusIndex;
        richTextEditor.FocusIndex = 0;
        var editorMarkup = '<div data-namespace="RichTextEditor" data-serializable class="gtc-editor-container"' + ViewElement.RenderAttributes(richTextEditor);
        richTextEditor.FocusIndex = tabIndex;

        // On Save Event
        if (Common.IsEventViewElementDefined(richTextEditor.OnSave)) {
            // Data-ControllerPath/ActionName
            editorMarkup += ' data-save=\'' + JSON.stringify(richTextEditor.OnSave) + '\'';
        }

        // Div</>
        editorMarkup += '>';

        // H2<>, Title, H2</>
        if (Common.IsDefined(richTextEditor.Title)) {
            editorMarkup += '<h2 class="gtc-page-theme-color"';

            // Translations
            editorMarkup += ' data-translate="' + richTextEditor.Title + '"';
            editorMarkup += '>' + Common.TranslateKey(richTextEditor.Title) + '</h2>';
        }

        // Required?
        if (richTextEditor.IsRequired == 'Yes') {
            var fieldNamespace = window[richTextEditor.Type.toString()];
            if (Common.IsDefined(richTextEditor.Value) && Common.IsNotEmptyString(richTextEditor.Value)) {
                editorMarkup += '<span id="SpanRequired' + richTextEditor.Name + '" class="gtc-classSpanRequired gtc-classSpanRequiredCompleted">!</span>';
            }
            else {
                editorMarkup += '<span id="SpanRequired' + richTextEditor.Name + '" class="gtc-classSpanRequired gtc-classSpanRequiredYes">!</span>';
            }
        }
        else {
            editorMarkup += '<span id="SpanRequired' + richTextEditor.Name + '" class="gtc-classSpanRequired gtc-classSpanRequiredNo">!</span>';
        }

        // Div<, Id@>
        editorMarkup += '<label id="' + richTextEditor.Name + 'EditableAreaLabel" for="' + richTextEditor.Name + 'EditableArea" class="gtc-sr-only">' + richTextEditor.Name + 'EditableAreaLabel</label><textarea id="' + richTextEditor.Name + 'EditableArea" class="gtc-editor-editablearea" tabindex="' + tabIndex + '">';

        if (Common.IsDefined(richTextEditor.Value)) {
            editorMarkup += richTextEditor.Value;
        }

        // Div</>, Div</>
        editorMarkup += '</textarea></div>';

        // Configure editor once inserted in DOM
        var options = BuildEditorConfiguration(richTextEditor);
        Events.One(document.body, 'configurerichtexteditor',
            function () {
                var editorInstance = CKEDITOR.replace(richTextEditor.Name + 'EditableArea', options);
                editorInstance.on('instanceReady',
                    function () {
                        if (Common.IsEventViewElementDefined(richTextEditor.OnSave)) {
                            ConfigureEditorSaving(editorInstance, richTextEditor.Name);
                        }
                        if (richTextEditor.IsHeightResizable == 'Yes' || richTextEditor.IsWidthResizable == 'Yes') {
                            ConfigureResizeComplete(editorInstance);
                        }
                        if (richTextEditor.IsRequired == 'Yes') {
                            ConfigureRequiredField(editorInstance, richTextEditor.Name);
                        }
                        ConfigureEditorOnChangeValue(editorInstance, richTextEditor.Name);
                        if (Common.IsModal()) {
                            ConfigureEditorModalMaximize(editorInstance);
                        }
                        if (Common.IsModal()) {
                            setTimeout(
                                function () {
                                    Common.ResizeView(true);
                                }, 1000
                            );
                        }
                    }
                );
            }
        );
        return editorMarkup;

    };

    RichTextEditor.OnSave = function (editorId) {

        // Initialize
        var editorObject = CKEDITOR.instances[editorId + 'EditableArea'];
        var fieldParameterName = Common.RemovePrefix(editorId);
        var onSaveParameters = [
            {
                Name: fieldParameterName,
                Value: editorObject.getData(),
                UiParameters: null
            }
        ];

        // Get OnSaveEvent object
        var editorElement = Common.Get(editorId);
        var onSaveEvent = JSON.parse(Common.GetAttr(editorElement, 'data-save'));
        if (Common.IsDefined(onSaveEvent.UiParameters)) {
            onSaveParameters = onSaveParameters.concat(onSaveEvent.UiParameters);
        }

        // Execute View Behavior
        Common.ExecuteViewBehavior(onSaveEvent.ControllerPath + onSaveEvent.ActionName, onSaveParameters, Page.RunInstructions, editorElement);

    };

    RichTextEditor.UpdateValue = function (editor, fieldValue) {

        var editorObject = CKEDITOR.instances[editor.id + 'EditableArea'];
        var decodedHtml = Common.Decode(fieldValue);
        editorObject.setData(decodedHtml);
        if (Common.IsDefined(Common.GetAttr(editor, 'data-serializable'))) {
            Common.SetAttr(editor, 'data-haschanged', 'Yes');
        }
        editorObject.fire('blur');

    };

    RichTextEditor.ShowPinwheel = function (editorElement) {
    };

    RichTextEditor.HidePinwheel = function (editorElement) {
    };

    // Private Methods
    function BuildEditorConfiguration (richTextEditor) {

        // Build options object
        var options = {};
        options.customConfig = '';
        options.skin = 'moono-dark';
        options.language = Common.GetLanguage();
        options.pasteFromWordRemoveFontStyles = false;
        options.pasteFromWordRemoveStyles = false;
        options.removePlugins = 'about';
        options.tabIndex = (richTextEditor.FocusIndex == 0) ? -1 : richTextEditor.FocusIndex;

        // Can resize height/width manually?
        if (richTextEditor.IsHeightResizable == 'No' && richTextEditor.IsWidthResizable == 'No') {
            options.resize_enabled = false;
        }
        else if (richTextEditor.IsHeightResizable == 'Yes' && richTextEditor.IsWidthResizable == 'Yes') {
            options.resize_dir = 'both';
        }
        else if (richTextEditor.IsHeightResizable == 'Yes') {
            options.resize_dir = 'vertical';
        }
        else if (richTextEditor.IsWidthResizable == 'Yes') {
            options.resize_dir = 'horizontal';
        }

        // Manual height or width set?
        var dimensionStyle = StyleHelper.BuildDimensionStyle(richTextEditor.Dimension);
        if (Common.IsDefined(dimensionStyle)) {
            if (Common.IsDefined(dimensionStyle.Height)) {
                options.height = dimensionStyle.Height.replace(';', '');
            }
            if (Common.IsDefined(dimensionStyle.Width)) {
                options.width = dimensionStyle.Width.replace(';', '');
            }
        }

        // Build toolbar configuration
        // Initialization
        options.toolbar = [];
        options.toolbarGroups = [];
        var sectionGroup = {};
        var toolbarGroup = [];
        var section = {};
        var groups = [];
        var items = [];

        // Mode, Document, DocTools Section
        if (richTextEditor.CanViewSource == 'Yes') {
            groups.push('mode');
            items.push('Source');
            items.push('-');
            toolbarGroup.push('mode');
        }
        if (Common.IsDefined(richTextEditor.OnSave)) {
            groups.push('document');
            items.push('Save');
            toolbarGroup.push('document');
        }
        else {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',save';
        }
        if (richTextEditor.ShowNewPageButton == 'Yes') {
            if (!Common.IsInArray('document', groups)) {
                groups.push('document');
            }
            items.push('NewPage');
            if (!Common.IsInArray('document', toolbarGroup)) {
                toolbarGroup.push('document');
            }
        }
        else {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',newpage';
        }
        if (richTextEditor.ShowPrintButtons == 'Yes') {
            if (!Common.IsInArray('document', groups)) {
                groups.push('document');
            }
            items.push('Preview');
            items.push('Print');
            if (!Common.IsInArray('document', toolbarGroup)) {
                toolbarGroup.push('document');
            }
        }
        else {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',print,preview';
        }
        if (richTextEditor.CanUseTemplates == 'Yes') {
            groups.push('doctools');
            items.push('-');
            items.push('Templates');
            toolbarGroup.push('doctools');
        }
        else {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',templates';
        }
        if (groups.length > 0 && items.length > 0) {
            section.name = 'document';
            section.groups = groups;
            section.items = items;
            options.toolbar.push(section);
            sectionGroup.name = 'document';
            sectionGroup.groups = toolbarGroup;
            options.toolbarGroups.push(sectionGroup);
        }

        // Reinitialize
        sectionGroup = {};
        toolbarGroup = [];
        section = {};
        groups = [];
        items = [];

        // Clipboard section
        if (richTextEditor.ShowClipboardActions == 'Yes') {
            groups.push('clipboard');
            items.push('Cut');
            items.push('Copy');
            items.push('Paste');
            items.push('PasteText');
            items.push('PasteFromWord');
            toolbarGroup.push('clipboard');
        }
        else {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',clipboard,pastetext,pastefromword';
        }
        if (richTextEditor.CanUndoRedo == 'Yes') {
            groups.push('undo');
            if (items.length > 0) {
                items.push('-');
            }
            items.push('Undo');
            items.push('Redo');
            toolbarGroup.push('undo');
        }
        if (groups.length > 0 && items.length > 0) {
            section.name = 'clipboard';
            section.groups = groups;
            section.items = items;
            options.toolbar.push(section);
            sectionGroup.name = 'clipboard';
            sectionGroup.groups = toolbarGroup;
            options.toolbarGroups.push(sectionGroup);
        }

        // Reinitialize
        sectionGroup = {};
        toolbarGroup = [];
        section = {};
        groups = [];
        items = [];

        // Editing section
        if (richTextEditor.CanFind == 'Yes') {
            groups.push('find');
            items.push('Find');
            toolbarGroup.push('find');
        }
        if (richTextEditor.CanReplace == 'Yes') {
            if (!Common.IsInArray('find', groups)) {
                groups.push('find');
            }
            items.push('Replace');
            if (!Common.IsInArray('find', toolbarGroup)) {
                toolbarGroup.push('find');
            }
        }
        if (richTextEditor.CanFind == 'No' && richTextEditor.CanReplace == 'No') {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',find';
        }
        if (richTextEditor.ShowSelectAllButton == 'Yes') {
            groups.push('selection');
            if (items.length > 0) {
                items.push('-');
            }
            items.push('SelectAll');
            toolbarGroup.push('selection');
        }
        else {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',selectall';
        }
        if (richTextEditor.CanSpellCheck == 'Yes') {
            groups.push('spellchecker');
            if (items.length > 0) {
                items.push('-');
            }
            items.push('Scayt');
            toolbarGroup.push('spellchecker');
            options.scayt_autoStartup = true;
        }
        else {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',scayt,wsc';

            // Turn on native browser spell checking
            options.disableNativeSpellChecker = false;
        }
        if (groups.length > 0 && items.length > 0) {
            section.name = 'editing';
            section.groups = groups;
            section.items = items;
            options.toolbar.push(section);
            sectionGroup.name = 'editing';
            sectionGroup.groups = toolbarGroup;
            options.toolbarGroups.push(sectionGroup);
        }

        // Reinitialize
        sectionGroup = {};
        toolbarGroup = [];
        section = {};
        groups = [];
        items = [];

        // Form Elements section
        if (richTextEditor.CanInsertFormElements == 'Yes') {
            items.push('Form');
            items.push('Checkbox');
            items.push('Radio');
            items.push('TextField');
            items.push('Textarea');
            items.push('Select');
            items.push('Button');
            items.push('ImageButton');
            items.push('HiddenField');
            section.name = 'forms';
            section.items = items;
            options.toolbar.push(section);
            sectionGroup.name = 'forms';
            options.toolbarGroups.push(sectionGroup);
        }
        else {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',forms';
        }

        // Reinitialize
        sectionGroup = {};
        toolbarGroup = [];
        section = {};
        groups = [];
        items = [];

        // Styling section
        if (richTextEditor.CanDoBasicStyling == 'Yes') {
            groups.push('basicstyles');
            items.push('Bold');
            items.push('Italic');
            items.push('Underline');
            items.push('Strike');
            toolbarGroup.push('basicstyles');
        }
        if (richTextEditor.CanDoSubSuperScripts == 'Yes') {
            if (!Common.IsInArray('basicstyles', groups)) {
                groups.push('basicstyles');
            }
            items.push('Subscript');
            items.push('Superscript');
            if (!Common.IsInArray('basicstyles', toolbarGroup)) {
                toolbarGroup.push('basicstyles');
            }
        }
        if (richTextEditor.CanDoBasicStyling == 'No' && richTextEditor.CanDoSubSuperScripts == 'No') {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',basicstyles';
        }
        if (richTextEditor.ShowRemoveFormatButton == 'Yes') {
            groups.push('cleanup');
            if (items.length > 0) {
                items.push('-');
            }
            items.push('RemoveFormat');
            toolbarGroup.push('cleanup');
        }
        else {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',removeformat';
        }
        if (groups.length > 0 && items.length > 0) {
            section.name = 'basicstyles';
            section.groups = groups;
            section.items = items;
            options.toolbar.push(section);
            sectionGroup.name = 'basicstyles';
            sectionGroup.groups = toolbarGroup;
            options.toolbarGroups.push(sectionGroup);
        }

        // Reinitialize
        sectionGroup = {};
        toolbarGroup = [];
        section = {};
        groups = [];
        items = [];

        // Paragraph section
        if (richTextEditor.CanInsertLists == 'Yes') {
            groups.push('list');
            items.push('NumberedList');
            items.push('BulletedList');
            toolbarGroup.push('list');
        }
        else {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',list';
        }
        if (richTextEditor.ShowIndentButtons == 'Yes') {
            groups.push('indent');
            if (items.length > 0) {
                items.push('-');
            }
            items.push('Outdent');
            items.push('Indent');
            toolbarGroup.push('indent');
        }
        if (richTextEditor.CanBlockQuote == 'Yes') {
            groups.push('blocks');
            if (items.length > 0) {
                items.push('-');
            }
            items.push('Blockquote');
            items.push('CreateDiv');
            toolbarGroup.push('blocks');
        }
        if (richTextEditor.CanChangeJustifications == 'Yes') {
            groups.push('align');
            if (items.length > 0) {
                items.push('-');
            }
            items.push('JustifyLeft');
            items.push('JustifyCenter');
            items.push('JustifyRight');
            items.push('JustifyBlock');
            toolbarGroup.push('align');
        }
        else {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',justify';
        }
        if (richTextEditor.ShowBiDirectionalTextButtons == 'Yes') {
            groups.push('bidi');
            if (items.length > 0) {
                items.push('-');
            }
            items.push('BidiLtr');
            items.push('BidiRtl');
            items.push('Language');
            toolbarGroup.push('bidi');
        }
        else {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',bidi';
        }
        if (groups.length > 0 && items.length > 0) {
            section.name = 'paragraph';
            section.groups = groups;
            section.items = items;
            options.toolbar.push(section);
            sectionGroup.name = 'paragraph';
            sectionGroup.groups = toolbarGroup;
            options.toolbarGroups.push(sectionGroup);
        }

        // Reinitialize
        sectionGroup = {};
        toolbarGroup = [];
        section = {};
        groups = [];
        items = [];

        // Links section
        if (richTextEditor.CanInsertLinks == 'Yes') {
            items.push('Link');
            items.push('Unlink');
            items.push('Anchor');
            section.name = 'links';
            section.items = items;
            options.toolbar.push(section);
            sectionGroup.name = 'links';
            options.toolbarGroups.push(sectionGroup);
        }
        else {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',link';
        }

        // Reinitialize
        sectionGroup = {};
        toolbarGroup = [];
        section = {};
        groups = [];
        items = [];

        // Inserts section
        if (richTextEditor.CanInsertImages == 'Yes') {
            items.push('base64image');
            options.extraPlugins = 'base64image';
            options.removePlugins += ',image';
        }
        else {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',image';
        }
        if (richTextEditor.CanInsertTables == 'Yes') {
            items.push('Table');
        }
        else {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',table,tabletools';
        }
        if (richTextEditor.CanInsertPageBreaks == 'Yes') {
            items.push('PageBreak');
        }
        else {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',pagebreak';
        }
        if (richTextEditor.CanInsertOther == 'Yes') {
            items.push('Flash');
            items.push('HorizontalRule');
            items.push('Smiley');
            items.push('SpecialChar');
            items.push('Iframe');
        }
        else {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',smiley,flash,iframe,specialchar,horizontalrule';
        }
        if (items.length > 0) {
            section.name = 'insert';
            section.items = items;
            options.toolbar.push(section);
            sectionGroup.name = 'insert';
            options.toolbarGroups.push(sectionGroup);
        }

        // Reinitialize
        sectionGroup = {};
        toolbarGroup = [];
        section = {};
        groups = [];
        items = [];

        // Styling dropdown section
        if (richTextEditor.ShowStylesDropdown == 'Yes') {
            items.push('Styles');
        }
        if (richTextEditor.ShowFormatDropdown == 'Yes') {
            items.push('Format');
        }
        if (richTextEditor.ShowFontDropdown == 'Yes') {
            items.push('Font');
        }
        if (richTextEditor.ShowFontSizeDropdown == 'Yes') {
            items.push('FontSize');
        }
        if (items.length > 0) {
            section.name = 'styles';
            section.items = items;
            options.toolbar.push(section);
            sectionGroup.name = 'styles';
            options.toolbarGroups.push(sectionGroup);
        }

        // Reinitialize
        sectionGroup = {};
        toolbarGroup = [];
        section = {};
        groups = [];
        items = [];

        // Colors section
        if (richTextEditor.CanChangeColors == 'Yes') {
            items.push('TextColor');
            items.push('BGColor');
            section.name = 'colors';
            section.items = items;
            options.toolbar.push(section);
            sectionGroup.name = 'colors';
            options.toolbarGroups.push(sectionGroup);
        }

        // Reinitialize
        sectionGroup = {};
        toolbarGroup = [];
        section = {};
        groups = [];
        items = [];

        // Styling dropdown section
        if (richTextEditor.CanMaximize == 'Yes') {
            items.push('Maximize');
        }
        else {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',maximize';
        }
        if (richTextEditor.ShowContentBlocksButton == 'Yes') {
            items.push('ShowBlocks');
        }
        else {
            // Stop uneccessary plugins from loading
            options.removePlugins += ',showblocks';
        }
        if (items.length > 0) {
            section.name = 'tools';
            section.items = items;
            options.toolbar.push(section);
            sectionGroup.name = 'tools';
            options.toolbarGroups.push(sectionGroup);
        }

        // Return
        return options;

    };

    function ConfigureEditorSaving (editorObject, editorId) {

        editorObject.commands.save.enable();
        editorObject.on('save',
            function () {
                RichTextEditor.OnSave(editorId);
                return false;
            }
        );

    };

    function ConfigureEditorOnChangeValue (editorObject, editorId) {

        var editorElement = Common.Get(editorId);
        editorObject.on('change',
            function (event) {
                Common.SetAttr(editorElement, 'data-haschanged', 'Yes');
                event.removeListener();
            }
        );

    };

    function ConfigureEditorModalMaximize (editorObject) {

        editorObject.on('maximize',
            function(event) {
                var modalDialog = Common.Query('.gtc-modal-dialog', null, true);
                if (event.data == 1) {
                    // Maximize
                    Common.AddClass(modalDialog, 'gtc-modal-fullscreen');
                }
                else if (event.data == 2) {
                    // Minimize
                    Common.RemoveClass(modalDialog, 'gtc-modal-fullscreen');
                }
            }
        );

    };

    function ConfigureResizeComplete (editorObject) {

        editorObject.on('resized',
            function () {
                Page.SetPageHeight();
                if (Common.IsModal()) {
                    Common.ResizeView(true);
                }
            }
        );

    };

    function ConfigureRequiredField (editorObject, editorId) {

        editorObject.on('blur',
            function () {
                var value = editorObject.getData();
                var requiredSpan = Common.Get('SpanRequired' + editorId);
                if (Common.IsDefined(value) && Common.IsNotEmptyString(value)) {
                    Common.RemoveClass(requiredSpan, 'gtc-classSpanRequiredYes');
                    Common.AddClass(requiredSpan, 'gtc-classSpanRequiredCompleted');
                }
                else {
                    Common.RemoveClass(requiredSpan, 'gtc-classSpanRequiredCompleted');
                    Common.AddClass(requiredSpan, 'gtc-classSpanRequiredYes');
                }
            }
        );

    };

} (window.RichTextEditor = window.RichTextEditor || {}, window, document, Common, Cache, Events, Velocity));

// Editable Display Item
// Based On: EditableDisplayItem -> DisplayItem -> ViewElement
(function (EditableDisplayItem, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    EditableDisplayItem.Render = function (editableDisplayItem, displayDetail) {

        var className = '';
        if (Common.IsDefined(editableDisplayItem.ItemSpan)) {
            className = ' gtc-columns-' + editableDisplayItem.ItemSpan;
        }

        // Li<, Data-Name@, Li>
        var editableDisplayItemMarkup = '<li data-namespace="EditableDisplayItem" class="gtc-editabledisplayitem gtc-displaydetail-column' + className + '"' + 'data-name="' + editableDisplayItem.PropertyName + '">';

        // Build markup for label
        if (Common.IsDefined(editableDisplayItem.Label) && editableDisplayItem.Label.length <= 0) {
            // Span<>, Span</>
            editableDisplayItemMarkup += '<span class="gtc-displaydetail-item-head"></span>';
        }
        else {
            // Span<>, Label, Span</>
            editableDisplayItemMarkup += '<span class="gtc-displaydetail-item-head"';

            // Translations
            editableDisplayItemMarkup += ' data-translate="' + editableDisplayItem.Label + '"';
            editableDisplayItemMarkup += '>' + Common.TranslateKey(editableDisplayItem.Label) + '</span>';
        }
        editableDisplayItemMarkup += '<span class="gtc-displaydetail-item">';

        // Sanity Check
        editableDisplayItem.Value = (Common.IsNotDefined(editableDisplayItem.Value)) ? '' : editableDisplayItem.Value;

        // Field Namespace
        if (Common.IsDefined(editableDisplayItem.EditableField)) {
            // Field
            var fieldNamespace = window[editableDisplayItem.EditableField.Type];
            ViewElement.TestExists(editableDisplayItem.EditableField.Type, fieldNamespace);
            editableDisplayItem.EditableField.Name += Common.SanitizeToken(displayDetail.Id);
            editableDisplayItem.EditableField.IsEditableDisplayItem = true;
            editableDisplayItemMarkup += fieldNamespace.Render(editableDisplayItem.EditableField);
        }

        // Span</>, Li</>
        editableDisplayItemMarkup += '</span></li>';
        return editableDisplayItemMarkup;

    };

} (window.EditableDisplayItem = window.EditableDisplayItem || {}, window, document, Common, Cache, Events, Velocity));

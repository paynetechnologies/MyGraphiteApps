/** 
 * @class Column
 * @classdesc Supports the Column View Element<br>
 *            Based On: ViewElement
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (Column, window, document, Common, Cache, Events, Velocity, undefined) {

    // Private Variables
    var Priorities = {
        Highest: '0',
        High: '1',
        Medium: '2',
        MediumLow: '3',
        Low: '4',
        Lowest: '5',
        NoPriority: '6'
    };

    /**
     * @function Column.Render
     * @param {object} column - The Column View Element in JSON format
     * @description Generates the HTML markup for the Column View Element 
     * @returns {string} HTML Markup of the Column View Element
     */
    Column.Render = function (column) {

        // Th<, TabIndex@, Id@, Th>
        var columnMarkup = '<th scope="col" data-namespace="Column" ' + ViewElement.RenderAttributes(column);

        // Priority
        var priority = Priorities[column.Priority];
        var canSort = false;
        if (Common.IsEventViewElementDefined(column.OnClick)) {
            canSort = true;
        }

        // Alignment?
        if (Common.IsDefined(column.Alignment)) {
            columnMarkup += ' class="gtc-text-' + column.Alignment.toLowerCase() + '"';
        }

        // Data-Mask@
        var maskingOptions;
        if (Common.IsDefined(column.Mask)) {
            // Mask Options
            maskingOptions = MaskField.MaskingOptions[column.Mask];
            if (Common.IsNotDefined(maskingOptions)) {
                maskingOptions = Mask.BuildMaskingOptions(column.Mask);
                MaskField.MaskingOptions[column.Mask] = maskingOptions;
            }
            columnMarkup += ' data-mask=\'' + JSON.stringify(maskingOptions) + '\'';
        }
        if (priority != '0') {
            columnMarkup += ' data-priority="' + priority + '"';
        }
        if (canSort) {
            columnMarkup += EventElement.AttachEvent(column.Name + '-SortAnchor', 'click', column.OnClick, Table.OnClickColumn);
        }
        columnMarkup += '>';
        if (canSort) {
            columnMarkup += '<a id="' + column.Name + '-SortAnchor">';
        }
        columnMarkup += '<span class="gtc-column-span"';

        // Masking/Translations (Don't translate if masking is defined)
        var columnLabel = column.Label;
        if (Common.IsDefined(column.Mask) && Common.IsDefined(columnLabel)) {
            // Format Value
            if (Common.IsObject(maskingOptions)) {
                var formatResult = Mask.Format(columnLabel, maskingOptions);
                columnLabel = formatResult.Text;
            }
        }
        else if (Common.IsDefined(columnLabel)) {
            columnMarkup += ' data-translate="' + columnLabel + '"';
        }
        columnMarkup += '>';
        columnMarkup += Common.TranslateKey(columnLabel) + '</span>';
        if (canSort) {
            columnMarkup += '</a>';
        }
        columnMarkup += '</th>';
        return columnMarkup;

    };

    /**
     * @function Column.UpdateValue
     * @param {object} column - The Column DOM element
     * @param {string} columnValue - The new Value of the Column
     * @param {object[]} promises - An array of promises that is used to know when all Page Instructions are completed
     * @description Updates the Value of the Column
     */
    Column.UpdateValue = function (column, columnValue, promises) {

        // Animation hide promise
        var animationHidePromise = Common.Promise();
        promises.push(animationHidePromise.promise);

        // Sanity Check
        columnValue = (Common.IsNotDefined(columnValue)) ? '' : columnValue;

        // Check for Mask
        var maskString = Common.GetAttr(column, 'data-mask');
        if (Common.IsString(maskString)) {
            if (maskString.length > 0 && columnValue.length > 0) {
                formatResult = Mask.Format(columnValue, Mask.BuildMaskingOptions(maskString), true);
                columnValue = formatResult.Text;
            }
        }

        // Set Value
        Velocity(Common.Query('.gtc-column-span', column), { 'opacity': 0 }, 'slow',
            function () {
                var animationPromise = Common.Promise();
                promises.push(animationPromise.promise);
                var columnSpan = this[0];
                if (columnValue.length > 0) {
                    columnValue = Common.TranslateKey(columnValue);
                }
                columnSpan.textContent = columnValue;
                Common.SetAttr(columnSpan, 'data-translate', columnValue);
                Velocity(columnSpan, 'reverse',
                    function () {
                        Common.RemoveOpacity(columnSpan);
                        var table = Common.Closest('.gtc-table-responsive', column);
                        if (Common.IsModal()) {
                            if (Common.IsNotDefined(Common.Get(table.id))) {
                                window.parent.Widgets.table(table, 'UpdateStickyHeaderValues');
                            }
                        }
                        else {
                            Widgets.table(table, 'UpdateStickyHeaderValues');
                        }
                        animationHidePromise.resolve();
                        animationPromise.resolve();
                    }
                );
            }
        );

    };

} (window.Column = window.Column || {}, window, document, Common, Cache, Events, Velocity));

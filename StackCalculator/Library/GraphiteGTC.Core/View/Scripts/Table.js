// Table
// Based On: Table -> ViewElement
(function (Table, window, document, Common, Cache, Events, Velocity, undefined) {

    // Private Variables
    var responsiveWrapper = null;
    var tableBody = null;
    var scrollSemaphore = false;

    // Public Methods
    Table.Render = function (table) {

        // Setup ordering?
        var orderedAttribute = '';
        if (Common.IsDefined(table.OrderedColumn)) {
            orderedAttribute = ' data-currentsort="' + table.OrderedColumn + '"';
            if (Common.IsDefined(table.SortOrder)) {
                orderedAttribute = ' data-currentorder="' + table.SortOrder + '"';
            }
        }

        // Div<, TabIndex@, Class@, Id@, Div>
        var tableMarkup = '<div class="gtc-table-container" data-namespace="Table" data-configure="Pre"' + orderedAttribute + ViewElement.RenderAttributes(table) + ' data-columns=\'' + JSON.stringify(table.Columns) + '\' data-canfocus="' + table.CanFocus + '" data-canhidecolumns="' + table.CanHideColumns + '"';

        // Paging On Scroll?
        if (Common.IsEventViewElementDefined(table.OnScroll)) {
            if (Common.IsDefined(table.FormToSerialize)) {
                table.OnScroll.FormToSerialize = table.FormToSerialize;
            }
            tableMarkup += ' data-onscroll=\'' + JSON.stringify(table.OnScroll) + '\' data-pagenumber="1"';

            // Attach configure event
            Events.One(document.body, 'configuretableonscroll',
                function () {
                    SetScrolling(table.Name);
                }
            );
        }

        // Div>
        tableMarkup += '>';

        // H2<>, Title, H2</>
        if (Common.IsDefined(table.Title)) {
            tableMarkup += '<h2 class="gtc-page-theme-color"';

            // Translations
            tableMarkup += ' data-translate="' + table.Title + '"';
            tableMarkup += '>' + Common.TranslateKey(table.Title) + '</h2>';
        }

        // Styling
        var classNames = 'gtc-table';
        if (table.Borders === 'Yes') {
            classNames += ' gtc-table--borders';
        }
        if (table.Hover === 'Yes') {
            classNames += ' gtc-table--hover';
        }
        if (table.Stripes === 'Yes') {
            classNames += ' gtc-table--stripes';
        }
        if (table.EqualColumnWidth === 'Yes') {
            classNames += ' gtc-table--fixed';
        }
        if (Common.IsDefined(table.PaddingSize)) {
            classNames += ' gtc-table--size-' + table.PaddingSize.toLowerCase();
        }
        classNames += ' gtc-text-' + table.Alignment.toLowerCase();

        // Columns
        tableMarkup += '<div id="' + table.Name + '-ResponsiveTableWrapperDiv" class="gtc-table-responsive"><table id="' + table.Name + '-TableElement" class="' + classNames + '"><thead><tr>'
        if (Common.IsDefined(table.Columns)) {
            var columnIndex = 0, columnLength = table.Columns.length;
            for ( ; columnIndex < columnLength; columnIndex++) {
                tableMarkup += Column.Render(table.Columns[columnIndex]);
            }
        }
        tableMarkup += '</tr></thead>';

        // Rows
        var columnScope = table.Columns;
        tableMarkup += '<tbody id="' + table.Name + '-TableBody">';
        if (Common.IsDefined(table.Rows)) {
            var row, rowIndex = 0, rowLength = table.Rows.length;
            for ( ; rowIndex < rowLength; rowIndex++) {
                row = table.Rows[rowIndex];
                tableMarkup += '<tr ' + ViewElement.RenderAttributes(row) + '>';
                if (Common.IsDefined(row.Cells)) {
                    var cell, cellIndex = 0, cellLength = row.Cells.length;
                    for ( ; cellIndex < cellLength; cellIndex++) {
                        cell = row.Cells[cellIndex];
                        tableMarkup += '<td data-columnid="' + columnScope[cellIndex].Name + '" colspan="' + cell.ColumnSpan + '"';

                        // Alignment?
                        if (Common.IsDefined(cell.Alignment)) {
                            tableMarkup += ' class="gtc-text-' + cell.Alignment.toLowerCase() + '"';
                        }
                        tableMarkup += '>';

                        // Cell Element
                        if (Common.IsDefined(cell.CellElement)) {
                            // Color
                            if (Common.IsDefined(cell.TextColor)) {
                                tableMarkup += '<style>';
                                tableMarkup += '#' + cell.CellElement.Name + ' { ';
                                if (Common.IsDefined(cell.TextColor)) {
                                    tableMarkup += 'color: ' + Colors.ProcessValue(cell.TextColor, false, null) + ' !important;';
                                }
                                tableMarkup += ' }';
                                tableMarkup += '</style>';
                            }

                            // Render Cell Element
                            var viewElementNamespace = window[cell.CellElement.Type.toString()];
                            ViewElement.TestExists(cell.CellElement.Type, viewElementNamespace);
                            tableMarkup += viewElementNamespace.Render(cell.CellElement);
                        }
                        tableMarkup += '</td>';
                    }
                }
                tableMarkup += '</tr>';
            }
        }
        tableMarkup += '</tbody>';

        // Table</>, Div</>
        tableMarkup += '</table></div></div>';

        // Build widget options
        var options = {};
        if (table.CanFocus == 'Yes') {
            options.CanFocus = true;
        }
        else {
            options.CanFocus = false;
        }
        if (table.CanHideColumns == 'Yes') {
            options.CanHideColumns = true;
        }
        else {
            options.CanHideColumns = false;
        }
        if (table.IsDisplayed == 'No') {
            options.InitiallyHidden = true;
        }

        // Configure table to be responsive once in DOM
        Events.One(document.body, 'configureresponsivetable',
            function () {
                if (table.IsDisplayed != 'No' && Common.IsHidden(Common.Get(table.Name), true)) {
                    options.InitiallyHidden = true;
                }

                // Cache commonly used elements
                responsiveWrapper = Common.Get(table.Name + '-ResponsiveTableWrapperDiv');
                tableBody = Common.Query('#' + table.Name + '-TableBody', responsiveWrapper);

                // Initialize widget
                Widgets.table(responsiveWrapper, options);
            }
        );
        return tableMarkup;

    };

    Table.Configure = function (table, configureStage) {

        if (Common.IsDefined(table.dataset.onscroll)) {
            Events.Trigger(table, 'configuretableonscroll');
        }

    };

    Table.OnClickColumn = function (event) {

        // Initialize
        var thParent = this.parentNode;
        var onClickParameters = [
            {
                Name: 'ClickedColumn',
                Value: thParent.id,
                UiParameters: null
            },
            {
                Name: 'CurrentOrder',
                Value: Common.GetAttr(Common.Closest('.gtc-table-responsive', this), 'data-currentorder'),
                UiParameters: null
            }
        ];

        // Get OnClickEvent object
        var onClickEvent = JSON.parse(Common.GetAttr(thParent, 'data-click'));
        if (Common.IsDefined(onClickEvent.UiParameters)) {
            onClickParameters = onClickParameters.concat(onClickEvent.UiParameters);
        }

        // Execute View Behavior
        Common.ExecuteViewBehavior(onClickEvent.ControllerPath + onClickEvent.ActionName, onClickParameters, Page.RunInstructions, this);

    };

    Table.OnScroll = function (table, pageNumber) {

        // Initialize
        var onScrollParameters = [];

        // Get OnScrollEvent object
        var onScrollEvent = JSON.parse(Common.GetAttr(table, 'data-onscroll'));
        if (Common.IsDefined(onScrollEvent.UiParameters)) {
            onScrollParameters = onScrollParameters.concat(onScrollEvent.UiParameters);
        }

        // Serialize Form?
        if (Common.IsDefined(onScrollEvent.FormToSerialize)) {
            onScrollParameters = onScrollParameters.concat(Form.SerializeArray(Common.Get(onScrollEvent.FormToSerialize)));
        }

        // Page Number
        var newPageNumber = parseInt(pageNumber, 10) + 1;
        onScrollParameters.push(
            {
                Name: 'PageNumber',
                Value: newPageNumber,
                UiParameters: null
            }
        );

        // Execute View Behavior
        Common.ExecuteViewBehavior(onScrollEvent.ControllerPath + onScrollEvent.ActionName, onScrollParameters,
            function (pageInstructionData) {
                // Return if no page instructions
                if (Common.IsNotDefined(pageInstructionData.PageInstructions) || pageInstructionData.PageInstructions.length == 0) {
                    RemoveSemaphore(table);
                    return;
                }

                // Remove instruction from list
                var pagingInstruction = null;
                pageInstructionData.PageInstructions = Common.FilterArray(pageInstructionData.PageInstructions,
                    function(pageInstruction) {
                        if (pageInstruction.Instruction != 'Page') {
                            return true;
                        }
                        else {
                            pagingInstruction = pageInstruction;
                            return false;
                        }
                    }
                );

                // Insert new paging data if there are view elements
                var delayValue = 300;
                if (Common.IsDefined(pagingInstruction.ViewElements) && pagingInstruction.ViewElements.length > 0) {
                    Widgets.table(responsiveWrapper, 'destroy');
                    Common.SetAttr(table, 'data-pagenumber', newPageNumber);
                    var tableMarkup = BuildContent(table, pagingInstruction.ViewElements);
                    Common.InsertHTMLString(tableBody, Common.InsertType.Append, tableMarkup);

                    // Build widget options and initialize
                    var options = {};
                    if (Common.GetAttr(table, 'data-canfocus') == 'Yes') {
                        options.CanFocus = true;
                    }
                    else {
                        options.CanFocus = false;
                    }
                    if (Common.GetAttr(table, 'data-canhidecolumns') == 'Yes') {
                        options.CanHideColumns = true;
                    }
                    else {
                        options.CanHideColumns = false;
                    }
                    options.InitiallyHidden = false;
                    Widgets.table(responsiveWrapper, options);
                    Events.Trigger(document.body, 'configureimages');
                    Page.SetPageHeight();
                    Common.RetranslatePage();
                }
                else {
                    delayValue = 0;
                }

                // Remove loader
                RemoveSemaphore(table);

                // Run remaining instructions if they exist
                if (pageInstructionData.PageInstructions.length > 0) {
                    Page.RunInstructions(pageInstructionData);
                }
            }, table
        );

    };

    Table.UpdateValues = function (table, uiParameters, promises) {

        if (Common.IsDefined(uiParameters)) {
            var uiParameter, index = 0, length = uiParameters.length;
            for ( ; index < length; index++) {
                uiParameter = uiParameters[index];
                var cell = Common.Query('#' + uiParameter.Name, table);
                if (Common.IsDefined(cell)) {
                    cell = Common.Query('input[name="' + uiParameter.Name + '"]', table);
                }
                if (Common.IsDefined(cell)) {
                    // Element Type
                    var elementType = Common.GetAttr(cell, 'data-namespace');

                    // Update
                    var elementNamespace = window[elementType];
                    ViewElement.TestExists(elementType, elementNamespace, null, 'UpdateValue');
                    elementNamespace.UpdateValue(cell, uiParameter.Value, promises);
                }
            }
        }

    };

    Table.ReplaceElement = function (table, viewElements, promises) {

        // Animation Promise
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Remove delegated events before building HTML which will attach delegated events with same id!
        Cache.CleanDelegatedElementsData(table);

        // Replace element
        Velocity(table, 'slideUp', 'slow',
            function () {
                // Build Markup
                var viewElement, index = 0, length = viewElements.length;
                for ( ; index < length; index++) {
                    viewElement = viewElements[index];
                    var tableElement = Common.Get(viewElement.Name);
                    var responsiveElement = Common.Get(viewElement.Name + '-ResponsiveTableWrapperDiv');
                    Widgets.table(responsiveElement, 'destroy');
                    var tableMarkup = Table.Render(viewElement);
                    Common.InsertHTMLString(tableElement, Common.InsertType.After, tableMarkup);
                    Common.Remove(tableElement, false, true);
                }

                // Reset Paging if needed
                ResetPaging(table);

                // Trigger event to call responsive table widget
                Events.Trigger(document.body, 'configureresponsivetable');
                Velocity(table, 'slideDown', 'slow',
                    function () {
                        animationPromise.resolve();
                    }
                );
            }
        );

    };

    Table.ReplaceContent = function (table, viewElements, promises) {

        // Get Table Details
        responsiveWrapper = Common.Get(table.id + '-ResponsiveTableWrapperDiv');
        tableBody = Common.Query('#' + table.id + '-TableBody', responsiveWrapper);

        // Animation Promise
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Clean delegated events on elements being removed before building HTML which will attach delegated events with same id!
        // Only on children elements since this is replace content. (1st tbody in sticky header, 2nd in main tbody)
        Cache.CleanDelegatedElementsData(Common.Query('tbody', table));
        Cache.CleanDelegatedElementsData(tableBody);

        // Hide existing table
        Velocity(table, 'slideUp', 'slow',
            function () {
                var columnScope = JSON.parse(Common.GetAttr(table, 'data-columns'));
                Widgets.table(responsiveWrapper, 'destroy');
                var rowMarkup = '<tbody id="' + table.id + '-TableBody">';

                // Build Markup
                var row, rowIndex = 0, rowLength = viewElements.length;
                for ( ; rowIndex < rowLength; rowIndex++) {
                    row = viewElements[rowIndex];

                    // Rows
                    rowMarkup += '<tr ' + ViewElement.RenderAttributes(row) + '>';
                    if (Common.IsDefined(row.Cells)) {
                        var cell, cellIndex = 0, cellLength = row.Cells.length;
                        for ( ; cellIndex < cellLength; cellIndex++) {
                            cell = row.Cells[cellIndex];
                            rowMarkup += '<td data-columnid="' + columnScope[cellIndex].Name + '" colspan="' + cell.ColumnSpan + '"';

                            // Alignment?
                            if (Common.IsDefined(cell.Alignment)) {
                                rowMarkup += ' class="gtc-text-' + cell.Alignment.toLowerCase() + '"';
                            }
                            rowMarkup += '>';

                            // Cell Element
                            if (Common.IsDefined(cell.CellElement)) {
                                // Color
                                if (Common.IsDefined(cell.TextColor)) {
                                    rowMarkup += '<style>';
                                    rowMarkup += '#' + cell.CellElement.Name + ' { ';
                                    if (Common.IsDefined(cell.TextColor)) {
                                        rowMarkup += 'color: ' + Colors.ProcessValue(cell.TextColor, false, null) + ' !important;';
                                    }
                                    rowMarkup += ' }';
                                    rowMarkup += '</style>';
                                }

                                // Render Cell Element
                                var viewElementNamespace = window[cell.CellElement.Type];
                                ViewElement.TestExists(cell.CellElement.Type, viewElementNamespace);
                                rowMarkup += viewElementNamespace.Render(cell.CellElement);
                            }
                            rowMarkup += '</td>';
                        }
                    }
                    rowMarkup += '</tr>';
                }
                rowMarkup += '</tbody>';

                // Replace rows
                Common.Remove(tableBody, false, true);
                var tableElement = Common.Query('#' + table.id + '-TableElement', responsiveWrapper);
                Common.InsertHTMLString(tableElement, Common.InsertType.Append, rowMarkup);

                // Reset Paging if needed
                ResetPaging(table);

                // Build widget options and initialize
                var options = {};
                if (Common.GetAttr(table, 'data-canfocus') == 'Yes') {
                    options.CanFocus = true;
                }
                else {
                    options.CanFocus = false;
                }
                if (Common.GetAttr(table, 'data-canhidecolumns') == 'Yes') {
                    options.CanHideColumns = true;
                }
                else {
                    options.CanHideColumns = false;
                }
                options.InitiallyHidden = true;
                Widgets.table(responsiveWrapper, options);

                // Show table and resolve promise
                Velocity(table, 'slideDown', 'slow',
                    function () {
                        animationPromise.resolve();
                    }
                );
            }
        );

    };

    Table.ShowPinwheel = function (table) {

        SpinKit.Show(table, 'FadingCircle');

    };

    Table.HidePinwheel = function (table) {

        SpinKit.Hide(table);

    };

    // Private Methods
    function BuildContent (table, viewElements) {

        // Columns
        var columnScope = JSON.parse(Common.GetAttr(table, 'data-columns'));

        // Build Markup
        var tableMarkup = '';
        if (Common.IsDefined(viewElements)) {
            var row, index = 0, length = viewElements.length;
            for ( ; index < length; index++) {
                row = viewElements[index];

                // Rows
                tableMarkup += '<tr ' + ViewElement.RenderAttributes(row) + '>';
                if (Common.IsDefined(row.Cells)) {
                    var cell, cellIndex = 0, cellLength = row.Cells.length;
                    for ( ; cellIndex < cellLength; cellIndex++) {
                        cell = row.Cells[cellIndex];
                        tableMarkup += '<td data-columnid="' + columnScope[cellIndex].Name + '"';

                        // Alignment?
                        if (Common.IsDefined(cell.Alignment)) {
                            tableMarkup += ' class="gtc-text-' + cell.Alignment.toLowerCase() + '"';
                        }
                        tableMarkup += '>';

                        // Cell Element
                        if (Common.IsDefined(cell.CellElement)) {
                            // Color
                            if (Common.IsDefined(cell.TextColor)) {
                                tableMarkup += '<style>';
                                tableMarkup += '#' + cell.CellElement.Name + ' { ';
                                if (Common.IsDefined(cell.TextColor)) {
                                    tableMarkup += 'color: ' + Colors.ProcessValue(cell.TextColor, false, null) + ' !important;';
                                }
                                tableMarkup += ' }';
                                tableMarkup += '</style>';
                            }

                            // Render Cell Element
                            var viewElementNamespace = window[cell.CellElement.Type];
                            ViewElement.TestExists(cell.CellElement.Type, viewElementNamespace);
                            tableMarkup += viewElementNamespace.Render(cell.CellElement);
                        }
                        tableMarkup += '</td>';
                    }
                }
                tableMarkup += '</tr>';
            }
        }
        return tableMarkup;

    };

    function SetScrolling(tableName) {

        var tableElement = Common.Get(tableName);

        // Attach scroll event
        Events.On(window, 'scroll.paging' + tableName + '.' + tableName,
            function () {
                HandleScrollEvent(tableElement);
            }
        );

        // Attach wheel event
        Events.On(tableElement, 'wheel.paging' + tableName + '.' + tableName,
            function () {
                if (event.deltaY < 0) {
                    return;
                }
                HandleScrollEvent(tableElement);
            }
        );

    };

    function HandleScrollEvent (tableElement) {

        if (!scrollSemaphore) {
            if (Math.round(window.pageYOffset) == Common.Height(document) - Common.Height(window)) {
                scrollSemaphore = true;
                Table.ShowPinwheel(tableElement);
                Table.OnScroll(tableElement, Common.GetAttr(tableElement, 'data-pagenumber'));
            }
        }

    };

    function RemoveSemaphore (tableElement) {

        scrollSemaphore = false;
        Table.HidePinwheel(tableElement);

    };

    function ResetPaging (table) {

        if (Common.IsDefined(table.dataset.onscroll)) {
            Common.SetAttr(table, 'data-pagenumber', 1);
        }

    };

} (window.Table = window.Table || {}, window, document, Common, Cache, Events, Velocity));

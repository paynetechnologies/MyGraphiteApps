// Table Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var TableWidget = {

        // Options
        options: {
            CanFocus: true,
            CanHideColumns: true,
            TableWrapper: null,
            TableScrollWrapper: null,
            Table: null,
            TableClone: null,
            StickyTableHeader: null,
            TableHead: null,
            TableBody: null,
            HeaderCells: null,
            BodyRows: null,
            ColumnDisplaySelectbox: null,
            ColumnDisplayOptions: null,
            DisplayAllButton: null,
            FocusButton: null,
            iOS: false,
            ElementId: null,
            DisplayAllEventName: null,
            InitiallyHidden: false
        },

        // Public Methods
        UpdateStickyHeaderValues: function () {

            // Initialize
            var thisWidget = this;

            // Update sticky header
            thisWidget._updateStickyHeaderValues();

        },

        // Private Methods
        _wrapTable: function () {

            // Initialize
            var thisWidget = this;

            // Add responsive wrapper
            var wrapper = Common.Create('div', null, 'gtc-table-wrapper');
            Common.Wrap(thisWidget.options.TableScrollWrapper, wrapper);
            thisWidget.options.TableWrapper = thisWidget.options.TableScrollWrapper.parentNode;

        },

        _createDisplayButtons: function () {

            // Initialize
            var thisWidget = this;

            // Setup focus button
            if (thisWidget.options.CanFocus) {
                thisWidget.options.FocusButton = Common.GenerateHTML('<a class="gtc-focus-link"><i class="gtc-icon-styles fa fa-eye"></i></a>');

                // Bind click for focus
                Events.On(thisWidget.options.FocusButton, 'click',
                    function () {
                        thisWidget._activateFocus();
                    }
                );

                // Bind click on rows
                Events.On(thisWidget.options.BodyRows, 'click',
                    function () {
                        thisWidget._focusOnRow(this);
                    }
                );
            }

            // Setup column hiding
            if (thisWidget.options.CanHideColumns) {
                // Create necessary markup
                thisWidget.options.ColumnDisplaySelectbox = Common.GenerateHTML('<a class="gtc-column-display-link"><i class="gtc-icon-styles fa fa-bars fa-rotate-90"></i></a>');
                thisWidget.options.ColumnDisplayOptions = Common.GenerateHTML('<ul class="gtc-column-display-dropdown"></ul>');

                // Attach column dropdown display event
                var isWidthCalculated = false;
                var columnDisplayWidth = 0;
                Events.On(thisWidget.options.ColumnDisplaySelectbox, 'click',
                    function () {
                        var columnDisplayOptionsStyle = thisWidget.options.ColumnDisplayOptions.style;
                        if (isWidthCalculated != true) {
                            columnDisplayOptionsStyle.position = 'absolute';
                            columnDisplayOptionsStyle.zIndex = '-150';
                            columnDisplayOptionsStyle.display = 'block';
                            columnDisplayWidth = Common.Width(thisWidget.options.ColumnDisplayOptions, true);
                            columnDisplayOptionsStyle.display = '';
                            columnDisplayOptionsStyle.zIndex = '';
                            isWidthCalculated = true;
                        }
                        if (Common.HasClass(this, 'gtc-menu-open')) {
                            Common.RemoveClass(this, 'gtc-menu-open');
                            columnDisplayOptionsStyle.display = 'none';
                            columnDisplayOptionsStyle.zIndex = '';
                        }
                        else {
                            Common.AddClass(this, 'gtc-menu-open');
                            columnDisplayOptionsStyle.zIndex = '150';
                            columnDisplayOptionsStyle.top = Common.Height(this, true) + 'px';
                            columnDisplayOptionsStyle.left = '-' + columnDisplayWidth + 'px';
                            columnDisplayOptionsStyle.display = 'block';
                        }
                    }
                );

                // Create display all button
                thisWidget.options.DisplayAllButton = Common.GenerateHTML('<a class="gtc-display-all-link"><i class="gtc-icon-styles gtc-icon gtc-icon-landscape"></i></a>');

                // Bind click for display all
                Events.On(thisWidget.options.DisplayAllButton, 'click',
                    function () {
                        thisWidget._displayAll();
                    }
                );

                // Add columns options to selectbox
                thisWidget.options.ColumnDisplaySelectbox.appendChild(thisWidget.options.ColumnDisplayOptions);
            }

            // Append buttons to table wrapper
            var tableWrapper = thisWidget.options.TableWrapper;
            var tableWrapperParent = tableWrapper.parentNode;
            if (thisWidget.options.CanFocus) {
                tableWrapperParent.insertBefore(thisWidget.options.FocusButton, tableWrapper);
            }
            if (thisWidget.options.CanHideColumns) {
                tableWrapperParent.insertBefore(thisWidget.options.ColumnDisplaySelectbox, tableWrapper);
                tableWrapperParent.insertBefore(thisWidget.options.DisplayAllButton, tableWrapper);
            }

        },

        _setupHeader: function () {

            // Initialize
            var thisWidget = this;

            // Loop over column headers
            var index = 0, length = thisWidget.options.HeaderCells.length;
            for ( ; index < length; index++) {
                var headerCell = thisWidget.options.HeaderCells[index];
                var headerCellId = headerCell.id;
                var headerCellText = headerCell.textContent;

                // Create the hide/show for column
                if (Common.HasAttr(headerCell, 'data-priority')) {

                    // For loops have no scope! Give it some. (IIFE)
                    (function (headerCell, headerCellId, headerCellText) {

                        var checkboxSection = Common.GenerateHTML('<li class="gtc-checkbox-row"><input type="checkbox" class="gtc-checkbox-displaycolumn" name="DisplayColumn-' + headerCellId + '" id="DisplayColumn-' + headerCellId + '" value="' + headerCellId + '" /><label data-translate="' + headerCellText + '" for="DisplayColumn-' + headerCellId + '">' + Common.TranslateKey(headerCellText) + '</label></li>');
                        var checkboxInput = Common.Query('input', checkboxSection);
                        thisWidget.options.ColumnDisplayOptions.appendChild(checkboxSection);

                        // Bind click of checkbox section
                        Events.On(checkboxSection, 'click',
                            function () {
                                checkboxInput.checked = !checkboxInput.checked;
                                Events.Trigger(checkboxInput, 'change');
                            }
                        );

                        // Stop click of label from unchecking
                        Events.On(Common.Query('label', checkboxSection), 'click',
                            function (event) {
                                event.stopPropagation();
                            }
                        );

                        // Stop click of checkbox from unchecking
                        Events.On(checkboxInput, 'click',
                            function (event) {
                                event.stopPropagation();
                            }
                        );
                        Events.On(checkboxInput, 'change',
                            function () {
                                var value = this.value;
                                var cells = Common.QueryAll('#' + value + ', #' + value + '-Clone, [data-columnid=' + value + ']', thisWidget.options.TableWrapper);

                                // Save display all state
                                if (Common.HasClass(thisWidget.options.Table, 'gtc-display-all')) {
                                    thisWidget._preserveDisplayAll();
                                    Common.RemoveClass(thisWidget.options.Table, 'gtc-display-all');
                                    if (thisWidget.options.TableClone) {
                                        Common.RemoveClass(thisWidget.options.TableClone, 'gtc-display-all');
                                    }
                                    Common.RemoveClass(thisWidget.options.DisplayAllButton, 'gtc-btn-isselected');
                                }

                                // Show/hide cells
                                var cell, cellIndex = 0, cellLength = cells.length;
                                for ( ; cellIndex < cellLength; cellIndex++) {
                                    cell = cells[cellIndex];
                                    if (this.checked) {
                                        cell.style.display = 'table-cell';
                                    }
                                    else {
                                        cell.style.display = 'none';
                                    }
                                }
                            }
                        );
                        Events.On(checkboxInput, 'UpdateCheckboxes',
                            function () {
                                if (Common.GetStyle(headerCell, 'display') != 'none') {
                                    this.checked = true;
                                }
                                else {
                                    this.checked = false;
                                }
                            }
                        )
                        Events.Trigger(checkboxInput, 'UpdateCheckboxes');

                    }(headerCell, headerCellId, headerCellText));

                }
            }
        },

        _setupCells: function () {

            // Initialize
            var thisWidget = this;

            // Loop over all rows in body
            var rowIndex = 0, rowLength = thisWidget.options.BodyRows.length;
            for ( ; rowIndex < rowLength; rowIndex++) {
                var cells = Common.QueryAll('th, td', thisWidget.options.BodyRows[rowIndex]);

                // Loop over all cells in row
                var cellIndex = 0, cellLength = cells.length;
                for ( ; cellIndex < cellLength; cellIndex++) {
                    var cell = cells[cellIndex];
                    var columnId = Common.GetAttr(cell, 'data-columnid');

                    // Get column
                    var column = Common.Query('#' + columnId, thisWidget.options.TableScrollWrapper);

                    // Copy priority attribute from column
                    var dataPriority = Common.GetAttr(column, 'data-priority');
                    if (dataPriority) {
                        Common.SetAttr(cell, 'data-priority', dataPriority);
                    }
                }
            }

        },

        _updateStickyHeaderValues: function () {

            // Initialize
            var thisWidget = this;

            // Remove events
            Events.Off(window, 'scroll.responsivetable-' + thisWidget.options.ElementId + ' resize.responsivetable-' + thisWidget.options.ElementId);
            Events.Off(thisWidget.options.TableScrollWrapper, 'scroll');

            // Remove current stickey header
            Common.Remove(thisWidget.options.StickyTableHeader);

            // Recreate sticky header
            thisWidget._setupStickyHeader();

        },

        _setupStickyHeader: function () {

            // Initialize
            var thisWidget = this;

            // Clone table
            thisWidget.options.TableClone = thisWidget.options.Table.cloneNode(true);

            // Replace ids
            Common.SetAttr(thisWidget.options.TableClone, 'id', thisWidget.options.ElementId + '-Clone');
            var cloneIds = Common.QueryAll('[id]', thisWidget.options.TableClone);
            var cloneId, index = 0, length = cloneIds.length;
            for ( ; index < length; index++) {
                cloneId = cloneIds[index];
                Common.SetAttr(cloneId, 'id', cloneId.id + '-Clone');
            }

            // Wrap table clone to be sticky header
            Common.Wrap(thisWidget.options.TableClone, Common.GenerateHTML('<div class="gtc-sticky-table-header"></div>'));
            thisWidget.options.StickyTableHeader = thisWidget.options.TableClone.parentNode;

            // Give same height as original header
            thisWidget.options.StickyTableHeader.style.height = (Common.Height(thisWidget.options.TableHead) + 2) + 'px';

            // Insert sticky table header and position it
            thisWidget.options.Table.parentNode.insertBefore(thisWidget.options.StickyTableHeader, thisWidget.options.Table);
            thisWidget._updateStickyHeader();

            // Bind scroll and resize to update sticky header
            Events.On(window, 'scroll.responsivetable-' + thisWidget.options.ElementId + ' resize.responsivetable-' + thisWidget.options.ElementId + '.' + thisWidget.options.ElementId,
                function () {
                    thisWidget._updateStickyHeader();
                }
            );
            Events.On(thisWidget.options.TableScrollWrapper, 'scroll',
                function () {
                    thisWidget._updateStickyHeader();
                }
            );

        },

        _updateStickyHeader: function () {

            // Initialize
            var thisWidget = this;
            var top = 0;
            var offsetTop = Common.Offset(thisWidget.options.Table).top;
            var header = Common.Get('PageHeader');
            if (Common.IsDefined(header) && Common.GetStyle(header, 'position') == 'fixed') {
                var headerHeight = Common.Height(header, true);
                top += headerHeight;
                offsetTop -= headerHeight;
            }
            var pageYOffset = window.pageYOffset;
            var scrollTop = pageYOffset - 1;
            var tableHeight = Common.Height(thisWidget.options.Table);
            var stickyHeaderHeight = Common.Height(thisWidget.options.StickyTableHeader);
            var maxTop = tableHeight - stickyHeaderHeight;
            var rubberBandOffset = (scrollTop + Common.Height(window)) - Common.Height(document);
            var useFixedSolution = !thisWidget.options.iOS;
            var shouldBeVisible = (pageYOffset != 0) && (scrollTop > offsetTop) && (scrollTop < offsetTop + tableHeight);

            var stickyHeaderStyle = thisWidget.options.StickyTableHeader.style;
            if (useFixedSolution) {
                thisWidget.options.StickyTableHeader.scrollLeft = thisWidget.options.TableScrollWrapper.scrollLeft;
                Common.AddClass(thisWidget.options.StickyTableHeader, 'gtc-fixed-solution');

                // Move sticky header up when table passes it
                if (((scrollTop - offsetTop) > maxTop)) {
                    top -= ((scrollTop - offsetTop) - maxTop);
                    Common.AddClass(thisWidget.options.StickyTableHeader, 'gtc-border-radius-fix');
                }
                else {
                    Common.RemoveClass(thisWidget.options.StickyTableHeader, 'gtc-border-radius-fix');
                }

                if (shouldBeVisible) {
                    stickyHeaderStyle.visibility = 'visible';
                    stickyHeaderStyle.top = top + 'px';
                    // TODO: Calculate without borders? innerWidth
                    stickyHeaderStyle.width = Common.Width(thisWidget.options.TableScrollWrapper) + 'px';
                    return;
                }
                else {
                    stickyHeaderStyle.visibility = 'hidden';
                    stickyHeaderStyle.width = 'auto';
                }
            }
            else {
                var animationDuration = 400;
                Common.RemoveClass(thisWidget.options.StickyTableHeader, 'gtc-fixed-solution');
                top = scrollTop - offsetTop - 1;

                // Determine if header is too high or low
                if (top < 0) {
                    top = 0;
                }
                else if (top > maxTop) {
                    top = maxTop;
                }
                if (rubberBandOffset > 0) {
                    top = top - rubberBandOffset;
                }

                if (shouldBeVisible) {
                    stickyHeaderStyle.visibility = 'visible';
                    Velocity(thisWidget.options.StickyTableHeader, { 'top': top + 'px' }, animationDuration);
                    thisWidget.options.TableHead.style.visibility = 'hidden';
                }
                else {
                    Velocity(thisWidget.options.StickyTableHeader, { 'top': '0' }, animationDuration,
                        function () {
                            thisWidget.options.TableHead.style.visibility = 'visible';
                            stickyHeaderStyle.visibility = 'hidden';
                        }
                    );
                }
            }

        },

        _clearAllFocus: function () {

            // Initialize
            var thisWidget = this;
            Common.RemoveClassFromElements(thisWidget.options.BodyRows, 'gtc-unfocused');
            Common.RemoveClassFromElements(thisWidget.options.BodyRows, 'gtc-focused');

        },

        _activateFocus: function () {

            // Initialize
            var thisWidget = this;
            thisWidget._clearAllFocus();
            if (thisWidget.options.FocusButton) {
                Common.ToggleClass(thisWidget.options.FocusButton, 'gtc-btn-isselected');
            }
            Common.ToggleClass(thisWidget.options.Table, 'gtc-focus-on');

        },

        _focusOnRow: function (row) {

            // Initialize
            var thisWidget = this;
            if (Common.HasClass(thisWidget.options.Table, 'gtc-focus-on')) {
                var alreadyFocused = Common.HasClass(row, 'gtc-focused');
                thisWidget._clearAllFocus();
                if (!alreadyFocused) {
                    Common.AddClassToElements(thisWidget.options.BodyRows, 'gtc-unfocused');
                    Common.AddClass(row, 'gtc-focused');
                }
            }

        },

        _displayAll: function () {

            // Initialize
            var thisWidget = this;
            if (thisWidget.options.DisplayAllButton) {
                Common.ToggleClass(thisWidget.options.DisplayAllButton, 'gtc-btn-isselected');
            }
            Common.ToggleClass(thisWidget.options.Table, 'gtc-display-all');
            if (thisWidget.options.TableClone) {
                Common.ToggleClass(thisWidget.options.TableClone, 'gtc-display-all');
            }
            Events.Trigger(window, thisWidget.options.DisplayAllEventName);

        },

        _preserveDisplayAll: function () {

            // Initialize
            var thisWidget = this;
            var headerDataCells = Common.QueryAll('th, td', thisWidget.options.Table);
            var index = 0, length = headerDataCells.length;
            for ( ; index < length; index++) {
                headerDataCells[index].style.display = 'table-cell';
            }
            if (thisWidget.options.TableClone) {
                headerDataCells = Common.QueryAll('th, td', thisWidget.options.TableClone);
                index = 0, length = headerDataCells.length;
                for ( ; index < length; index++) {
                    headerDataCells[index].style.display = 'table-cell';
                }
            }

        },

        _hasTouch: function () {

            if ('ontouchstart' in window) {
                Common.AddClass(Common.Query('html'), 'gtc-touch');
            }
            else {
                Common.AddClass(Common.Query('html'), 'gtc-no-touch');
            }

        },

        _destroy: function () {

            // Initialize
            var thisWidget = this;

            // Unbind events
            Events.Off(thisWidget.options.BodyRows, 'click');
            Events.Off(window, 'orientationchange.responsivetable-' + thisWidget.options.ElementId + ' resize.responsivetable-' + thisWidget.options.ElementId + ' ' + thisWidget.options.DisplayAllEventName);
            Events.Off(window, 'scroll.responsivetable-' + thisWidget.options.ElementId + ' resize.responsivetable-' + thisWidget.options.ElementId);
            Events.Off(thisWidget.options.TableScrollWrapper, 'scroll');

            // Remove all added markup
            Common.RemoveClasses(Common.Query('html'), 'gtc-touch gtc-no-touch');

            if (thisWidget.options.CanHideColumns) {
                Common.Remove(thisWidget.options.ColumnDisplaySelectbox);
                Common.Remove(thisWidget.options.DisplayAllButton);
            }
            if (thisWidget.options.CanFocus) {
                Common.Remove(thisWidget.options.FocusButton);
            }
            Common.Unwrap(thisWidget.element);
            Common.Remove(thisWidget.options.StickyTableHeader);
            var tds = [], index = 0, length = thisWidget.options.BodyRows.length;
            for ( ; index < length; index++) {
                tds = tds.concat(Common.QueryAll('td', thisWidget.options.BodyRows[index]));
            }
            var td, index = 0, length = tds.length;
            for ( ; index < length; index++) {
                td = tds[index];
                Common.RemoveAttr(td, 'data-priority');
            }

        },

        _isIOS: function () {

            return !!(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i));

        },

        _init: function () {

        },

        _create: function () {

            // Initialize
            var thisWidget = this;
            thisWidget._hasTouch();
            thisWidget.options.TableScrollWrapper = thisWidget.element;
            thisWidget.options.Table = Common.Query('table', thisWidget.element);
            thisWidget.options.TableHead = Common.Query('thead', thisWidget.element);
            thisWidget.options.TableBody = Common.Query('tbody', thisWidget.element);
            thisWidget.options.HeaderCells = Common.QueryAll('th', thisWidget.options.TableHead);
            thisWidget.options.BodyRows = Common.QueryAll('tr', thisWidget.options.TableBody);
            thisWidget.options.iOS = thisWidget._isIOS();
            thisWidget.options.ElementId = thisWidget.element.id;
            thisWidget.options.DisplayAllEventName = 'display-all-' + thisWidget.options.ElementId;

            // Wrap the table for responsive
            thisWidget._wrapTable();

            // Create toolbar with buttons
            thisWidget._createDisplayButtons();

            // Setup header cells
            if (thisWidget.options.CanHideColumns) {
                thisWidget._setupHeader();
            }

            // Setup body cells
            thisWidget._setupCells();

            // Create sticky table header
            thisWidget._setupStickyHeader();

            // Hide column display button if no columns can be hidden
            if (thisWidget.options.CanHideColumns && Common.IsEmptyElement(thisWidget.options.ColumnDisplayOptions)) {
                thisWidget.options.ColumnDisplaySelectbox.style.display = 'none';
                thisWidget.options.DisplayAllButton.style.display = 'none';
            }

            // Setup orientationchange, resize and display all click event
            Events.On(window, 'orientationchange.responsivetable-' + thisWidget.options.ElementId + ' resize.responsivetable-' + thisWidget.options.ElementId + '.' + thisWidget.options.ElementId + ' ' + thisWidget.options.DisplayAllEventName,
                function () {
                    Events.Trigger(Common.QueryAll('input', thisWidget.options.ColumnDisplayOptions), 'UpdateCheckboxes');
                }
            );

            // Update sticky header height if table is hidden during initialization
            if (thisWidget.options.InitiallyHidden) {
                Common.AttachVisibilityEvent(thisWidget.options.ElementId,
                    function (event, eventData) {
                        if (eventData.Visible == true) {
                            thisWidget.options.StickyTableHeader.style.height = (Common.Height(thisWidget.options.TableHead) + 2) + 'px';
                            Common.DetachVisibilityEvent(eventData);
                        }
                    }, null, null, 'No'
                );
            }

        }

    };

    WidgetFactory.Register('gtc.table', TableWidget);

} (window, document, Common, Cache, Events, Velocity));

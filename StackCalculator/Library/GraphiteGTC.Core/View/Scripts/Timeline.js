// Timeline
// Based On: Timeline -> ViewElement
(function (Timeline, window, document, Common, Cache, Events, Velocity, undefined) {

    // Options
    Timeline.Options = {
        MonthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        ShortMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        DataCache: {},
        Range: null
    };

    // Public Methods
    Timeline.Render = function (timeline) {

        // Sanity Check
        if (Common.IsNotDefined(timeline.InitialDate)) {
            timeline.InitialDate = '/Date(' + (new Date()).getTime().toString() + ')/';
        }

        // Initialize Per Element Cache (No DOM object to cache jQuery data on yet)
        Timeline.Options.Range = GetDisplayRange();
        Timeline.Options.DataCache[timeline.Name] = {};
        Timeline.Options.DataCache[timeline.Name].OriginalObject = timeline;
        Timeline.Options.DataCache[timeline.Name].CurrentView = timeline.InitialView;
        Timeline.Options.DataCache[timeline.Name].InitialDate = timeline.InitialDate;
        Timeline.Options.DataCache[timeline.Name].CurrentDate = Timeline.Options.DataCache[timeline.Name].InitialDate;

        // Div<, TabIndex@, Class@, Id@, Data-ControllerPath/ActionName@, Wire OnClick!
        var timelineMarkup = '<div class="gtc-timeline" data-namespace="Timeline"' + ViewElement.RenderAttributes(timeline);

        // On Change Event
        if (Common.IsEventViewElementDefined(timeline.OnChange)) {
            // Data-ControllerPath/ActionName
            timelineMarkup += ' data-change=\'' + JSON.stringify(timeline.OnChange) + '\'';
        }

        // On Click Event
        if (Common.IsEventViewElementDefined(timeline.OnClick)) {
            // Data-ControllerPath/ActionName
            timelineMarkup += ' data-click=\'' + JSON.stringify(timeline.OnClick) + '\'';
        }

        // Setup last date initial values
        var initialDate = new Date(parseInt(Timeline.Options.DataCache[timeline.Name].InitialDate.replace(/\/Date\((-?\d+)\)\//, '$1'), 10));
        initialDate = Common.AddTimezone(initialDate);
        var lastDateId = timeline.Name + '-Date' + (initialDate.getMonth() + 1).toString() + initialDate.getDate().toString() + initialDate.getFullYear().toString();
        var lastDateRaw = GetRawDataForDate(initialDate).replace(/\/Date\((-?\d+)\)\//, '$1');
        timelineMarkup += ' data-clickeddateid="' + lastDateId + '"';
        timelineMarkup += ' data-clickeddateraw="' + lastDateRaw + '"';
        timelineMarkup += '>';

        // Anchor<, Class@, Id@, Anchor>
        timelineMarkup += '<a class="gtc-mobile-nav-btn gtc-timeline-nav-btn" id="' + timeline.Name + 'MobileMenuLink"><i class="gtc-icon-styles fa fa-bars"></i></a>';

        // Filter Bar: Div<>
        timelineMarkup += '<div id="' + timeline.Name + '-TimelineFilterBar" class="gtc-timeline-filterbar">';

        // configuremobilemenu event: Setup configuring of mobile display (triggered from Page.Configure)
        Events.On(document.body, 'configuremobilemenu.' + timeline.Name + 'MobileMenuLink', '#' + timeline.Name + 'MobileMenuLink',
            function (event) {
                Widgets.mobilemenu(this, { MenuType: 'DropDown', TargetName: timeline.Name + '-TimelineFilterBar', ParentName: timeline.Name });
            }
        );

        // Filter Bar: Div</>
        timelineMarkup += '<div class="gtc-timeline-filters"><span class="gtc-timeline-showing" data-translate="Showing">' + Common.TranslateKey('Showing') + '</span></div>';

        if (Common.IsDefined(timeline.FilterSelectField1)) {
            timeline.FilterSelectField1.OnChange = null;
            timelineMarkup += '<div class="gtc-timeline-filters">';
            timelineMarkup += SelectField.Render(timeline.FilterSelectField1);
            timelineMarkup += '</div>';
            Events.On(document.body, 'change.' + timeline.FilterSelectField1.Name, '#' + timeline.FilterSelectField1.Name, Timeline.OnChange);
        }
        if (Common.IsDefined(timeline.FilterSelectField2)) {
            timeline.FilterSelectField2.OnChange = null;
            timelineMarkup += '<div class="gtc-timeline-filters">';
            timelineMarkup += SelectField.Render(timeline.FilterSelectField2);
            timelineMarkup += '</div>';
            Events.On(document.body, 'change.' + timeline.FilterSelectField2.Name, '#' + timeline.FilterSelectField2.Name, Timeline.OnChange);
        }
        if (Common.IsDefined(timeline.FilterSelectField3)) {
            timeline.FilterSelectField3.OnChange = null;
            timelineMarkup += '<div class="gtc-timeline-filters">';
            timelineMarkup += SelectField.Render(timeline.FilterSelectField3);
            timelineMarkup += '</div>';
            Events.On(document.body, 'change.' + timeline.FilterSelectField3.Name, '#' + timeline.FilterSelectField3.Name, Timeline.OnChange);
        }

        // Filter Bar: Date Range Description: Span<>, Span</>
        var timelineDateRange = GetDateRange('Initial', timeline.Name, Timeline.Options.Range, null);
        var firstDate = Common.AddTimezone(new Date(timelineDateRange[0]));
        var lastDate = Common.AddTimezone(new Date(timelineDateRange[timelineDateRange.length - 1]));
        var firstPart = '';
        var lastPart = '';
        switch (Timeline.Options.DataCache[timeline.Name].CurrentView) {
            case 'Day':
                firstPart = Timeline.Options.ShortMonthNames[firstDate.getMonth()] + ' ' + Common.GetOrdinalDay(firstDate.getDate()) + ', ';
                lastPart = Timeline.Options.ShortMonthNames[lastDate.getMonth()] + ' ' + Common.GetOrdinalDay(lastDate.getDate()) + ', ';
                break;
            case 'Month':
                firstPart = Timeline.Options.ShortMonthNames[firstDate.getMonth()] + ', ';
                lastPart = Timeline.Options.ShortMonthNames[lastDate.getMonth()] + ', ';
                break;
        }
        timelineMarkup += '<div class="gtc-timeline-filters"><span id="' + timeline.Name + '-CurrentDateRange" class="gtc-timeline-currentdaterange">';
        timelineMarkup += firstPart + firstDate.getFullYear() + ' - ' + lastPart + lastDate.getFullYear();
        timelineMarkup += '</span></div>';

        // Filter Bar: Div</>
        timelineMarkup += '</div>';

        // Date Bar: Div<>
        timelineMarkup += '<div class="gtc-timeline-datebar" id="' + timeline.Name + '-TimelineDateBar">';

        // Date Bar: List of Dates: Left Arrow: Div<>, Div<>, Anchor</>, Div<>, Ul<>
        timelineMarkup += '<div class="gtc-timeline-slider"><div class="gtc-classDivArrowSliderLeft"><a  id="' + timeline.Name + '-SlideDatesLeft" class="gtc-timeline-slider-arrowleft"></a></div><ul class="gtc-timeline-slider-datelist">';

        // Date Bar: List of Dates: Dates :Li</>s
        var timelineDate, index = 0, length = timelineDateRange.length;
        for ( ; index < length; index++) {
            timelineDate = timelineDateRange[index];

            // Li<, Data-RawDate@
            timelineDate = Common.AddTimezone(timelineDate);
            timelineMarkup += '<li data-rawdate="' + GetRawDataForDate(timelineDate) + '"';

            // Class@, Li>, Date, Li</>
            var timelineDateMarkup;
            var timelineDateId = timeline.Name + '-Date';
            var isSelectedDate = false;
            switch (Timeline.Options.DataCache[timeline.Name].CurrentView) {
                case 'Day':
                    if (timelineDate.getDate() == initialDate.getDate() && timelineDate.getMonth() == initialDate.getMonth() && timelineDate.getFullYear() == initialDate.getFullYear()) {
                        isSelectedDate = true;
                    }
                    timelineDateId += (timelineDate.getMonth() + 1).toString() + timelineDate.getDate().toString() + timelineDate.getFullYear().toString();
                    timelineDateMarkup = BuildDateMarkup(timelineDateId, Timeline.Options.ShortMonthNames[timelineDate.getMonth()] + ' ' + timelineDate.getDate(), isSelectedDate, timeline.Name);
                    break;
                case 'Month':
                    if (timelineDate.getMonth() == initialDate.getMonth() && timelineDate.getFullYear() == initialDate.getFullYear()) {
                        isSelectedDate = true;
                    }
                    timelineDateId += (timelineDate.getMonth() + 1).toString() + timelineDate.getFullYear().toString();
                    timelineDateMarkup = BuildDateMarkup(timelineDateId, Timeline.Options.ShortMonthNames[timelineDate.getMonth()] + ' ' + timelineDate.getFullYear().toString().slice(2), isSelectedDate, timeline.Name);
                    break;
                case 'Year':
                    if (timelineDate.getFullYear() == initialDate.getFullYear()) {
                        isSelectedDate = true;
                    }
                    timelineDateId += timelineDate.getFullYear().toString();
                    timelineDateMarkup = BuildDateMarkup(timelineDateId, timelineDate.getFullYear(), isSelectedDate, timeline.Name);
                    break;
            }
            timelineMarkup += ' class="gtc-timeline-slider-date';
            if (isSelectedDate) {
                timelineMarkup += ' gtc-page-theme-background gtc-timeline-selecteddate';
            }
            timelineMarkup += '"';
            timelineMarkup += '>' + timelineDateMarkup + '</li>';
        }

        // Date Bar: List of Dates: Select Date Arrow and Right Arrow: Ul</>, Div</>, Div<>, Anchor</>, Div</>
        timelineMarkup += '</ul><div class="gtc-classDivArrowSliderRight"><a id="' + timeline.Name + '-SlideDatesRight" class="gtc-timeline-slider-arrowright"></a></div></div>';

        // Attach Arrow click events
        Events.On(document.body, 'click.' + timeline.Name + '-SlideDatesLeft.' + timeline.Name + '-SlideDatesRight', '#' + timeline.Name + '-SlideDatesLeft, #' + timeline.Name + '-SlideDatesRight', Timeline.OnClickSlideDateRange);

        // Date Bar: View Options: Div<, Span</>, Select</>, Options</>s, Select>, Div</>
        timelineMarkup += '<div class="gtc-timeline-slider-view"><span class="gtc-timeline-slider-viewlabel" data-translate="View">' + Common.TranslateKey('View') + '</span><select id="' + timeline.Name + '-TimelineChangeViewSelectbox" class="gtc-input-selectbox gtc-classViewType">';
        switch (Timeline.Options.DataCache[timeline.Name].CurrentView) {
            case 'Day':
                timelineMarkup += '<option value="Day" selected>Day</option><option value="Month">Month</option><option value="Year">Year</option>';
                break;
            case 'Month':
                timelineMarkup += '<option value="Day">Day</option><option value="Month" selected>Month</option><option value="Year">Year</option>';
                break;
            case 'Year':
                timelineMarkup += '<option value="Day">Day</option><option value="Month">Month</option><option value="Year" selected>Year</option>';
                break;
        }
        timelineMarkup += '</select></div>';
        Events.On(document.body, 'change.' + timeline.Name + '-TimelineChangeViewSelectbox', '#' + timeline.Name + '-TimelineChangeViewSelectbox', Timeline.OnChangeView);

        // Window Resize
        SetupUpdateOnWindowResize(timeline);

        // Date Bar: Div</>
        timelineMarkup += '</div>';

        // Div</>
        timelineMarkup += '</div>';
        return timelineMarkup;

    };

    Timeline.OnClickSlideDateRange = function (event) {

        // Get timeline id
        var sliderArrow = event.target;
        var timelineId = Common.Closest('.gtc-timeline', sliderArrow).id;

        // Get Date Range
        var timelineDateRange = GetDateRange('Slide', timelineId, Timeline.Options.Range, sliderArrow);
        if (Common.IsNotDefined(timelineDateRange)) {
            return;
        }

        // Unbind all date slider click events to stop multiple server calls
        Events.Off(document.body, 'click.TimelineDateLinks' + timelineId);

        // Update Date Bar
        UpdateDateRangeSlider(timelineDateRange, sliderArrow.id, timelineId);

    };

    Timeline.OnClickDate = function (event) {

        // Prevent Default
        event.preventDefault();

        // Get Timeline object and id
        var timelineObject = Common.Closest('.gtc-timeline', event.target);
        var timelineId = timelineObject.id;

        // Sanity Check
        var selectedDate = Common.Query('.gtc-timeline-slider-datelist li.gtc-timeline-selecteddate', timelineObject);
        if (Common.Query('a', selectedDate).id == this.id) {
            return;
        }

        // Scroll to top and Set up Timeline (for Trasitions)
        Velocity(Common.QueryAll('html'), 'scroll', 100);
        Timeline.Options.DataCache[timelineId].CurrentDate = Common.GetAttr(this.parentNode, 'data-rawdate');
        var clickedDateId = Common.GetAttr(this, 'href');
        var lastDateId = Common.GetAttr(timelineObject, 'data-clickeddateid');
        var clickedDateRaw = Timeline.Options.DataCache[timelineId].CurrentDate.replace(/\/Date\((-?\d+)\)\//, '$1');
        var lastDateRaw = Common.GetAttr(timelineObject, 'data-clickeddateraw').replace(/\/Date\((-?\d+)\)\//, '$1');
        Common.SetAttr(timelineObject, 'data-clickeddateid', clickedDateId);
        Common.SetAttr(timelineObject, 'data-lastdateid', lastDateId);
        Common.SetAttr(timelineObject, 'data-clickeddateraw', clickedDateRaw);
        Common.SetAttr(timelineObject, 'data-lastdateraw', lastDateRaw);

        // Get OnClick object
        var onClickEvent = JSON.parse(Common.GetAttr(timelineObject, 'data-click'));

        // Run event?
        if (Common.IsDefined(onClickEvent)) {

            // Setup Dates
            var clickedDate = new Date(parseInt(Timeline.Options.DataCache[timelineId].CurrentDate.replace(/\/Date\((-?\d+)\)\//, '$1'), 10));
            var fromDate = '';
            var toDate = '';

            // Calculate date boundaries for loading Events
            switch (Timeline.Options.DataCache[timelineId].CurrentView) {
                case 'Day':
                    fromDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate(), 0);
                    toDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate() + 1, 0);
                    break;
                case 'Month':
                    fromDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), 1);
                    toDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth() + 1, 1);
                    break;
                case 'Year':
                    fromDate = new Date(clickedDate.getFullYear(), 0);
                    toDate = new Date(clickedDate.getFullYear() + 1, 0);
                    break;
            }
            var fromDateString = '/Date(' + Common.RemoveTimezone(Date.parse(fromDate)).toString() + ')/';
            var toDateString = '/Date(' + Common.RemoveTimezone(Date.parse(toDate)).toString() + ')/';

            // Click Parameters
            var onClickParameters = [
                {
                    'Name': 'FromDate',
                    'Value': fromDateString
                },
                {
                    'Name': 'ToDate',
                    'Value': toDateString
                }
            ];

            // Get filters
            var onClickParameter;
            var originalTimelineObject = Timeline.Options.DataCache[timelineId].OriginalObject;
            if (Common.IsDefined(originalTimelineObject.FilterSelectField1)) {
                onClickParameter = {
                    'Name': originalTimelineObject.FilterSelectField1.Name,
                    'Value': Common.Get(originalTimelineObject.FilterSelectField1.Name).value
                };
                onClickParameters.push(onClickParameter);
            }
            if (Common.IsDefined(originalTimelineObject.FilterSelectField2)) {
                onClickParameter = {
                    'Name': originalTimelineObject.FilterSelectField2.Name,
                    'Value': Common.Get(originalTimelineObject.FilterSelectField2.Name).value
                };
                onClickParameters.push(onClickParameter);
            }
            if (Common.IsDefined(originalTimelineObject.FilterSelectField3)) {
                onClickParameter = {
                    'Name': originalTimelineObject.FilterSelectField3.Name,
                    'Value': Common.Get(originalTimelineObject.FilterSelectField3.Name).value
                };
                onClickParameters.push(onClickParameter);
            }

            // Serialize Form?
            if (Common.IsDefined(onClickEvent.FormToSerialize)) {
                onClickParameters = onClickParameters.concat(Form.SerializeArray(Common.Get(onClickEvent.FormToSerialize)));
            }

            // Extra UiParameters?
            if (Common.IsDefined(onClickEvent.UiParameters)) {
                onClickParameters = onClickParameters.concat(onClickEvent.UiParameters);
            }

            // Execute View Behavior
            Common.ExecuteViewBehavior(onClickEvent.ControllerPath + onClickEvent.ActionName, onClickParameters, Page.RunInstructions, timelineObject);
        }
        else {
            TransitionTimeline(timelineObject);
        }

    };

    Timeline.OnChangeView = function (firstEvent) {

        // Get Timeline object and id
        var timelineObject = Common.Closest('.gtc-timeline', firstEvent.target);
        var timelineId = timelineObject.id;
        var timelineDateBar = Common.Get(timelineId + '-TimelineDateBar');

        // Unbind
        Events.Off(document.body, 'click.TimelineDateLinks' + timelineId);

        // Switch view
        Timeline.Options.DataCache[timelineId].CurrentView = this.value;

        // Hide bar
        Velocity(timelineDateBar, 'slideUp', 700).then(
            function (secondEvent) {
                var timelineDateRange = GetDateRange('ViewChange', timelineId, Timeline.Options.Range, null);
                RenderDateSliderMarkup(timelineDateRange, timelineId);

                // Show bar
                Velocity(timelineDateBar, 'slideDown', 700).then(
                    function (thirdEvent) {
                        // Update Date Range Description
                        var timelineSliderDatelist = Common.Query('.gtc-timeline-slider-datelist', timelineObject);
                        UpdateDateRangeDescription(timelineId, timelineSliderDatelist);
                        Timeline.OnChange(firstEvent);
                    }
                );
            }
        );

    };

    Timeline.OnChange = function (event) {

        // Prevent Default
        event.preventDefault();

        // Get Timeline object and id
        var timelineObject = Common.Closest('.gtc-timeline', event.target);
        var timelineId = timelineObject.id;

        // Sanity Check
        var selectedDate = Common.Query('.gtc-timeline-slider-datelist li.gtc-timeline-selecteddate', timelineObject);
        if (Common.Query('a', selectedDate).id == event.target.id) {
            return;
        }

        // Setup Dates
        var clickedDate = new Date(parseInt(Timeline.Options.DataCache[timelineId].CurrentDate.replace(/\/Date\((-?\d+)\)\//, '$1'), 10));
        var fromDate = '';
        var toDate = '';

        // Calculate date boundaries for loading Events
        switch (Timeline.Options.DataCache[timelineId].CurrentView) {
            case 'Day':
                fromDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate(), 0);
                toDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate() + 1, 0);
                break;
            case 'Month':
                fromDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), 1);
                toDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth() + 1, 1);
                break;
            case 'Year':
                fromDate = new Date(clickedDate.getFullYear(), 0);
                toDate = new Date(clickedDate.getFullYear() + 1, 0);
                break;
        }
        var fromDateString = '/Date(' + Common.RemoveTimezone(Date.parse(fromDate)).toString() + ')/';
        var toDateString = '/Date(' + Common.RemoveTimezone(Date.parse(toDate)).toString() + ')/';

        // Change Parameters
        var onChangeParameters = [
            {
                'Name': 'FromDate',
                'Value': fromDateString
            },
            {
                'Name': 'ToDate',
                'Value': toDateString
            }
        ];

        // Get filters
        var onChangeParameter;
        var originalTimelineObject = Timeline.Options.DataCache[timelineId].OriginalObject;
        if (Common.IsDefined(originalTimelineObject.FilterSelectField1)) {
            onChangeParameter = {
                'Name': originalTimelineObject.FilterSelectField1.Name,
                'Value': Common.Get(originalTimelineObject.FilterSelectField1.Name).value
            };
            onChangeParameters.push(onChangeParameter);
        }
        if (Common.IsDefined(originalTimelineObject.FilterSelectField2)) {
            onChangeParameter = {
                'Name': originalTimelineObject.FilterSelectField2.Name,
                'Value': Common.Get(originalTimelineObject.FilterSelectField2.Name).value
            };
            onChangeParameters.push(onChangeParameter);
        }
        if (Common.IsDefined(originalTimelineObject.FilterSelectField3)) {
            onChangeParameter = {
                'Name': originalTimelineObject.FilterSelectField3.Name,
                'Value': Common.Get(originalTimelineObject.FilterSelectField3.Name).value
            };
            onChangeParameters.push(onChangeParameter);
        }

        // Get OnChange object
        var onChangeEvent = JSON.parse(Common.GetAttr(timelineObject, 'data-click'));

        // Run event?
        if (Common.IsDefined(onChangeEvent)) {
            if (Common.IsDefined(onChangeEvent.UiParameters)) {
                onChangeParameters = onChangeParameters.concat(onChangeEvent.UiParameters);
            }

            // Execute View Behavior
            Common.ExecuteViewBehavior(onChangeEvent.ControllerPath + onChangeEvent.ActionName, onChangeParameters, Page.RunInstructions, timelineObject);
        }

    };

    Timeline.ShowPinwheel = function () {

        // Show Pinwheel
        Common.ShowPinwheel(null, false, true);

    };

    Timeline.HidePinwheel = function (timeline) {

        TransitionTimeline(timeline);

        // Translate
        Common.RetranslatePage();

        // Remove Pinwheel
        Common.HidePinwheel();

    };

    // Private Methods
    function GetDateRange (type, timelineId, range, slide) {

        var timelineObject = Common.Get(timelineId);

        // Build date range
        var dateArray = [];
        var startingDate, endingDate, parsedInitialDate = parseInt(Timeline.Options.DataCache[timelineId].InitialDate.replace(/\/Date\((-?\d+)\)\//, '$1'), 10);
        switch (Timeline.Options.DataCache[timelineId].CurrentView) {
            case 'Day':
                if (type == 'Initial') {
                    startingDate = new Date(parsedInitialDate);
                    endingDate = new Date(parsedInitialDate);
                    startingDate.setDate(startingDate.getDate() - range.Low);
                    endingDate.setDate(endingDate.getDate() + range.High);
                }
                else if (type == 'ViewChange') {
                    if (Common.IsDefined(Common.GetAttr(timelineObject, 'data-clickeddateraw'))) {
                        var firstOfMonth = new Date(parseInt(Common.GetAttr(timelineObject, 'data-clickeddateraw'), 10));
                        startingDate = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), 1);
                        endingDate = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), 1);
                        Timeline.Options.DataCache[timelineId].CurrentDate = GetRawDataForDate(startingDate);
                    }
                    else {
                        startingDate = new Date(parsedInitialDate);
                        endingDate = new Date(parsedInitialDate);
                    }
                    startingDate.setDate(startingDate.getDate() - range.Low);
                    endingDate.setDate(endingDate.getDate() + range.High);
                }
                else {
                    if (slide.id == timelineId + '-SlideDatesLeft') {
                        endingDate = new Date(parseInt(Common.GetAttr(Common.Query('.gtc-timeline-slider-datelist', timelineObject).firstChild, 'data-rawdate').replace(/\/Date\((-?\d+)\)\//, '$1'), 10));
                        endingDate.setDate(endingDate.getDate() - 1);
                        startingDate = new Date(new Date(endingDate).setDate(endingDate.getDate() - range.Slide));
                    }
                    else {
                        startingDate = new Date(parseInt(Common.GetAttr(Common.Query('.gtc-timeline-slider-datelist', timelineObject).lastChild, 'data-rawdate').replace(/\/Date\((-?\d+)\)\//, '$1'), 10));
                        startingDate.setDate(startingDate.getDate() + 1);
                        endingDate = new Date(new Date(startingDate).setDate(startingDate.getDate() + range.Slide));
                    }
                }
                while (startingDate <= endingDate) {
                    dateArray.push(new Date(startingDate));
                    startingDate.setDate(startingDate.getDate() + 1);
                }
                break;
            case 'Month':
                if (type == 'Initial') {
                    startingDate = new Date(parsedInitialDate);
                    endingDate = new Date(parsedInitialDate);
                    startingDate.setMonth(startingDate.getMonth() - range.Low);
                    endingDate.setMonth(endingDate.getMonth() + range.High);
                }
                else if (type == 'ViewChange') {
                    if (Common.IsDefined(Common.GetAttr(timelineObject, 'data-clickeddateraw'))) {
                        var firstMonthOfYear = new Date(parseInt(Common.GetAttr(timelineObject, 'data-clickeddateraw'), 10));
                        startingDate = new Date(firstMonthOfYear.getFullYear(), 0);
                        endingDate = new Date(firstMonthOfYear.getFullYear(), 0);
                        Timeline.Options.DataCache[timelineId].CurrentDate = GetRawDataForDate(startingDate);
                    }
                    else {
                        startingDate = new Date(parsedInitialDate);
                        endingDate = new Date(parsedInitialDate);
                    }
                    startingDate.setMonth(startingDate.getMonth() - range.Low);
                    endingDate.setMonth(endingDate.getMonth() + range.High);
                }
                else {
                    if (slide.id == timelineId + '-SlideDatesLeft') {
                        endingDate = new Date(parseInt(Common.GetAttr(Common.Query('.gtc-timeline-slider-datelist', timelineObject).firstChild, 'data-rawdate').replace(/\/Date\((-?\d+)\)\//, '$1'), 10));
                        endingDate.setMonth(endingDate.getMonth() - 1);
                        startingDate = new Date(new Date(endingDate).setMonth(endingDate.getMonth() - range.Slide));
                    }
                    else {
                        startingDate = new Date(parseInt(Common.GetAttr(Common.Query('.gtc-timeline-slider-datelist', timelineObject).lastChild, 'data-rawdate').replace(/\/Date\((-?\d+)\)\//, '$1'), 10));
                        startingDate.setMonth(startingDate.getMonth() + 1);
                        endingDate = new Date(new Date(startingDate).setMonth(startingDate.getMonth() + range.Slide));
                    }
                }
                while (startingDate <= endingDate) {
                    dateArray.push(new Date(startingDate));
                    startingDate.setMonth(startingDate.getMonth() + 1);
                }
                break;
            case 'Year':
                if (type == 'Initial') {
                    startingDate = new Date(parsedInitialDate);
                    endingDate = new Date(parsedInitialDate);
                    startingDate.setFullYear(startingDate.getFullYear() - range.Low);
                    endingDate.setFullYear(endingDate.getFullYear() + range.High);
                }
                else if (type == 'ViewChange') {
                    if (Common.IsDefined(Common.GetAttr(timelineObject, 'data-clickeddateraw'))) {
                        var firstMonthOfYear = new Date(parseInt(Common.GetAttr(timelineObject, 'data-clickeddateraw'), 10));
                        startingDate = new Date(firstMonthOfYear.getFullYear(), 0);
                        endingDate = new Date(firstMonthOfYear.getFullYear(), 0);
                        Timeline.Options.DataCache[timelineId].CurrentDate = GetRawDataForDate(startingDate);
                    }
                    else {
                        startingDate = new Date(parsedInitialDate);
                        endingDate = new Date(parsedInitialDate);
                    }
                    startingDate.setFullYear(startingDate.getFullYear() - range.Low);
                    endingDate.setFullYear(endingDate.getFullYear() + range.High);
                }
                else {
                    if (slide.id == timelineId + '-SlideDatesLeft') {
                        endingDate = new Date(parseInt(Common.GetAttr(Common.Query('.gtc-timeline-slider-datelist', timelineObject).firstChild, 'data-rawdate').replace(/\/Date\((-?\d+)\)\//, '$1'), 10));
                        endingDate.setFullYear(endingDate.getFullYear() - 1);
                        startingDate = new Date(new Date(endingDate).setFullYear(endingDate.getFullYear() - range.Slide));
                    }
                    else {
                        startingDate = new Date(parseInt(Common.GetAttr(Common.Query('.gtc-timeline-slider-datelist', timelineObject).lastChild, 'data-rawdate').replace(/\/Date\((-?\d+)\)\//, '$1'), 10));
                        startingDate.setFullYear(startingDate.getFullYear() + 1);
                        endingDate = new Date(new Date(startingDate).setFullYear(startingDate.getFullYear() + range.Slide));
                    }
                }
                while (startingDate <= endingDate) {
                    dateArray.push(new Date(startingDate));
                    startingDate.setFullYear(startingDate.getFullYear() + 1);
                }
                break;
        }
        return dateArray;

    };

    function BuildDateMarkup (timelineDateId, displayValue, isSelectedDate, timelineId) {

        var timelineDateMarkup = '';
        if (isSelectedDate) {
            timelineDateMarkup += '<div id="' + timelineId + '-LeftCircle' + timelineDateId + 'Anchor" class="gtc-timeline-selecteddate-circleleft"></div>';
        }
        timelineDateMarkup += '<a id="' + timelineDateId + 'Anchor" href="' + timelineDateId + '"';
        timelineDateMarkup += '>' + displayValue + '</a>';
        if (isSelectedDate) {
            timelineDateMarkup += '<div id="' + timelineId + '-RightCircle' + timelineDateId + 'Anchor" class="gtc-timeline-selecteddate-circleright"></div>';
        }

        // Attach click for date
        Events.On(document.body, 'click.TimelineDateLinks' + timelineId + '.' + timelineDateId + 'Anchor', '#' + timelineDateId + 'Anchor', Timeline.OnClickDate);

        // Return
        return timelineDateMarkup;

    };

    function UpdateDateRangeSlider (dateArray, slideDirectionId, timelineId) {

        var currentDate = new Date(parseInt(Timeline.Options.DataCache[timelineId].CurrentDate.replace(/\/Date\((-?\d+)\)\//, '$1'), 10));
        currentDate = Common.AddTimezone(currentDate);

        // Build markup for slider
        var liMarkup = '', timelineDate, index = 0, length = dateArray.length;
        for ( ; index < length; index++) {
            timelineDate = dateArray[index];

            // Li<, @Data-RawDate
            liMarkup += '<li data-rawdate="' + GetRawDataForDate(timelineDate) + '"';

            // @Class, Div</>, A</>, Div</>
            var timelineDateMarkup;
            var isSelectedDate = false;
            var timelineDateId = timelineId + '-Date';
            switch (Timeline.Options.DataCache[timelineId].CurrentView) {
                case 'Day':
                    timelineDateId += (timelineDate.getMonth() + 1).toString() + timelineDate.getDate().toString() + timelineDate.getFullYear().toString();
                    if (timelineDate.getDate() == currentDate.getDate() && timelineDate.getMonth() == currentDate.getMonth() && timelineDate.getFullYear() == currentDate.getFullYear()) {
                        isSelectedDate = true;
                    }
                    timelineDateMarkup = BuildDateMarkup(timelineDateId, Timeline.Options.ShortMonthNames[timelineDate.getMonth()] + ' ' + timelineDate.getDate(), isSelectedDate, timelineId);
                    break;
                case 'Month':
                    timelineDateId += (timelineDate.getMonth() + 1).toString() + timelineDate.getFullYear().toString();
                    if (timelineDate.getMonth() == currentDate.getMonth() && timelineDate.getFullYear() == currentDate.getFullYear()) {
                        isSelectedDate = true;
                    }
                    timelineDateMarkup = BuildDateMarkup(timelineDateId, Timeline.Options.ShortMonthNames[timelineDate.getMonth()] + ' ' + timelineDate.getFullYear().toString().slice(2), isSelectedDate, timelineId);
                    break;
                case 'Year':
                    timelineDateId += timelineDate.getFullYear().toString();
                    if (timelineDate.getFullYear() == currentDate.getFullYear()) {
                        isSelectedDate = true;
                    }
                    timelineDateMarkup = BuildDateMarkup(timelineDateId, timelineDate.getFullYear(), isSelectedDate, timelineId);
                    break;
            }
            liMarkup += ' class="gtc-timeline-slider-date';
            if (isSelectedDate) {
                liMarkup += ' gtc-page-theme-background gtc-timeline-selecteddate';
            }
            liMarkup += '"';
            liMarkup += '>' + timelineDateMarkup + '</li>';
        }

        // Transition in new Dates and hide old ones
        var timelineObject = Common.Get(timelineId);
        var timelineSliderDatelist = Common.Query('.gtc-timeline-slider-datelist', timelineObject);
        var currentLis = Common.NodeListToArray(Common.GetChildren(timelineSliderDatelist));
        var timelineSliderDatelistWidth = Common.Width(timelineSliderDatelist);
        var selectedDate = Common.Query('.gtc-timeline-selecteddate', timelineObject);
        if (slideDirectionId == timelineId + '-SlideDatesLeft') {
            Common.InsertHTMLString(timelineSliderDatelist, Common.InsertType.Prepend, liMarkup);
            timelineSliderDatelist.style.left = '-' + timelineSliderDatelistWidth + 'px';
            Velocity(timelineSliderDatelist, { 'left': '+=' + timelineSliderDatelistWidth + 'px' }, 'fast',
                function () {
                    Common.Remove(currentLis);
                    UpdateDateRangeDescription(timelineId, timelineSliderDatelist);
                }
            );
        }
        else {
            Common.InsertHTMLString(timelineSliderDatelist, Common.InsertType.Append, liMarkup);
            Velocity(timelineSliderDatelist, { 'left': '-=' + timelineSliderDatelistWidth + 'px' }, 'fast',
                function () {
                    Common.Remove(currentLis);
                    timelineSliderDatelist.style.left = '0px';
                    UpdateDateRangeDescription(timelineId, timelineSliderDatelist);
                }
            );
        }
    };

    function UpdateDateRangeDescription (timelineId, timelineSliderDatelist) {

        var firstDate = new Date(parseInt(Common.GetAttr(timelineSliderDatelist.firstChild, 'data-rawdate').replace(/\/Date\((-?\d+)\)\//, '$1'), 10));
        var lastDate = new Date(parseInt(Common.GetAttr(timelineSliderDatelist.lastChild, 'data-rawdate').replace(/\/Date\((-?\d+)\)\//, '$1'), 10));
        var timelineDateRange = Common.Get(timelineId + '-CurrentDateRange');
        switch (Timeline.Options.DataCache[timelineId].CurrentView) {
            case 'Day':
                var firstMonthDayYear = Timeline.Options.ShortMonthNames[firstDate.getMonth()] + ' ' + Common.GetOrdinalDay(firstDate.getDate()) + ', ' + firstDate.getFullYear();
                var lastMonthDayYear = Timeline.Options.ShortMonthNames[lastDate.getMonth()] + ' ' + Common.GetOrdinalDay(lastDate.getDate()) + ', ' + lastDate.getFullYear();
                Common.Slide(timelineDateRange, 'hide', 'right', 400,
                    function () {
                        timelineDateRange.innerHTML = firstMonthDayYear + ' - ' + lastMonthDayYear;
                        Common.Slide(timelineDateRange, 'show', 'right', 400);
                    }
                );
                break;
            case 'Month':
                var firstMonthYear = Timeline.Options.ShortMonthNames[firstDate.getMonth()] + ', ' + firstDate.getFullYear();
                var lastMonthYear = Timeline.Options.ShortMonthNames[lastDate.getMonth()] + ', ' + lastDate.getFullYear();
                Common.Slide(timelineDateRange, 'hide', 'right', 400,
                    function () {
                        timelineDateRange.innerHTML = firstMonthYear + ' - ' + lastMonthYear;
                        Common.Slide(timelineDateRange, 'show', 'right', 400);
                    }
                );
                break;
            case 'Year':
                var firstYear = firstDate.getFullYear();
                var lastYear = lastDate.getFullYear();
                Common.Slide(timelineDateRange, 'hide', 'right', 400,
                    function () {
                        timelineDateRange.innerHTML = firstYear + ' - ' + lastYear;
                        Common.Slide(timelineDateRange, 'show', 'right', 400);
                    }
                );
                break;
        }

    };

    function RenderDateSliderMarkup (timelineDateRange, timelineId) {

        // Get timeline object
        var timelineObject = Common.Get(timelineId);

        // Date Bar: List of Dates: Left Arrow: Div<>, Div<>, Anchor</>, Div<>, Ul<>
        var sliderMarkup = '<div class="gtc-timeline-slider"><div class="gtc-classDivArrowSliderLeft"><a  id="' + timelineId + '-SlideDatesLeft" class="gtc-timeline-slider-arrowleft"></a></div><ul class="gtc-timeline-slider-datelist">';

        // Date Bar: List of Dates: Dates :Li</>s
        var currentDate = new Date(parseInt(Timeline.Options.DataCache[timelineId].CurrentDate.replace(/\/Date\((-?\d+)\)\//, '$1'), 10));
        currentDate = Common.AddTimezone(currentDate);

        // Date Bar: List of Dates: Dates :Li</>s
        var timelineDate, index = 0, length = timelineDateRange.length;
        for ( ; index < length; index++) {
            timelineDate = timelineDateRange[index];

            // Li<, Data-RawDate@
            timelineDate = Common.AddTimezone(timelineDate);
            sliderMarkup += '<li data-rawdate="' + GetRawDataForDate(timelineDate) + '"';

            // Class@, Li>, Date, Li</>
            var timelineDateMarkup;
            var timelineDateId = timelineId + '-Date';
            var isSelectedDate = false;
            switch (Timeline.Options.DataCache[timelineId].CurrentView) {
                case 'Day':
                    if (timelineDate.getDate() == currentDate.getDate() && timelineDate.getMonth() == currentDate.getMonth() && timelineDate.getFullYear() == currentDate.getFullYear()) {
                        isSelectedDate = true;
                    }
                    timelineDateId += (timelineDate.getMonth() + 1).toString() + timelineDate.getDate().toString() + timelineDate.getFullYear().toString();
                    timelineDateMarkup = BuildDateMarkup(timelineDateId, Timeline.Options.ShortMonthNames[timelineDate.getMonth()] + ' ' + timelineDate.getDate(), isSelectedDate, timelineId);
                    break;
                case 'Month':
                    if (timelineDate.getMonth() == currentDate.getMonth() && timelineDate.getFullYear() == currentDate.getFullYear()) {
                        isSelectedDate = true;
                    }
                    timelineDateId += (timelineDate.getMonth() + 1).toString() + timelineDate.getFullYear().toString();
                    timelineDateMarkup = BuildDateMarkup(timelineDateId, Timeline.Options.ShortMonthNames[timelineDate.getMonth()] + ' ' + timelineDate.getFullYear().toString().slice(2), isSelectedDate, timelineId);
                    break;
                case 'Year':
                    if (timelineDate.getFullYear() == currentDate.getFullYear()) {
                        isSelectedDate = true;
                    }
                    timelineDateId += timelineDate.getFullYear().toString();
                    timelineDateMarkup = BuildDateMarkup(timelineDateId, timelineDate.getFullYear(), isSelectedDate, timelineId);
                    break;
            }
            sliderMarkup += ' class="gtc-timeline-slider-date';
            if (isSelectedDate) {
                sliderMarkup += ' gtc-page-theme-background gtc-timeline-selecteddate';
            }
            sliderMarkup += '"';
            sliderMarkup += '>' + timelineDateMarkup + '</li>';
        }

        // Date Bar: List of Dates: Select Date Arrow and Right Arrow: Ul</>, Div</>, Div<>, Anchor</>, Div</>
        sliderMarkup += '</ul><div class="gtc-classDivArrowSliderRight"><a id="' + timelineId + '-SlideDatesRight" class="gtc-timeline-slider-arrowright"></a></div></div>';

        // Replace Markup
        var timelineSlider = Common.Query('.gtc-timeline-slider', timelineObject);
        Common.InsertHTMLString(timelineSlider, Common.InsertType.After, sliderMarkup);
        Common.Remove(timelineSlider);

    };

    function TransitionTimeline(timeline, isViewChange) {

        // Get timeline id
        var timelineId = timeline.id;

        // Date Bar: Highlight Selected Date
        var clickedDateId = Common.GetAttr(timeline, 'data-clickeddateid');
        var selectedDate = Common.Query('a', Common.Query('.gtc-timeline-selecteddate', timeline));
        if (Common.GetAttr(selectedDate, 'id') != clickedDateId + 'Anchor' && !isViewChange) {
            var clickedDate = Common.Get(clickedDateId + 'Anchor');
            if (Common.IsDefined(clickedDate)) {
                // Delight Last Date and remove circles
                var oldEventAnchorId = Common.GetAttr(selectedDate, 'id');
                var oldEventAnchor = Common.Get(oldEventAnchorId);
                Common.RemoveClasses(oldEventAnchor.parentNode, 'gtc-page-theme-background gtc-timeline-selecteddate');

                // Remove circles?
                var leftCircle = Common.Get(timelineId + '-LeftCircle' + oldEventAnchorId);
                var rightCircle = Common.Get(timelineId + '-RightCircle' + oldEventAnchorId);
                if (leftCircle) {
                    Common.Remove(leftCircle);
                }
                if (rightCircle) {
                    Common.Remove(rightCircle);
                }

                // Highlight New Date and add circles
                Common.AddClasses(clickedDate.parentNode, 'gtc-page-theme-background gtc-timeline-selecteddate');

                // Insert and show circles
                var leftCircle = Common.InsertHTMLString(clickedDate, Common.InsertType.Before, '<div id="' + timelineId + '-LeftCircle' + clickedDateId + 'Anchor" class="gtc-timeline-selecteddate-circleleft"></div>', timelineId + '-LeftCircle' + clickedDateId + 'Anchor');
                var rightCircle = Common.InsertHTMLString(clickedDate, Common.InsertType.After, '<div id="' + timelineId + '-RightCircle' + clickedDateId + 'Anchor" class="gtc-timeline-selecteddate-circleright"></div>', timelineId + '-RightCircle' + clickedDateId + 'Anchor');
                Velocity(leftCircle, 'fadeIn', 'slow');
                Velocity(rightCircle, 'fadeIn', 'slow');
            }
        }

    };

    function GetRawDataForDate (timelineDate) {

        var msFrom1970 = Date.parse((timelineDate.getMonth() + 1) + '/' + timelineDate.getDate() + '/' + timelineDate.getFullYear());
        var rawData = '/Date(' + msFrom1970.toString() + ')/';
        return rawData;

    };

    function GetDisplayRange (recache) {

        var range = {};
        if (Common.CheckMedia('Desktop', recache) || Common.CheckMedia('HighResolution', recache)) {
            range.Low = 5;
            range.High = 4;
            range.Slide = 9;
            range.Length = 10;
        }
        else if (Common.CheckMedia('Tablet', recache)) {
            range.Low = 5;
            range.High = 4;
            range.Slide = 9;
            range.Length = 10;
        }
        else if (Common.CheckMedia('Mobile', recache)) {
            range.Low = 2;
            range.High = 2;
            range.Slide = 4;
            range.Length = 5;
        }
        return range;

    };

    function SetupUpdateOnWindowResize (timeline) {

        var onResizeEndFunction = function (event) {
            // Reinitialize range
            Timeline.Options.Range = GetDisplayRange(true);

            // Get Timeline object and id
            var timelineObject = Common.Get(timeline.Name);
            var timelineId = timeline.Name;

            // Unbind
            Events.Off(document.body, 'click.TimelineDateLinks' + timelineId);

            // Switch view
            Timeline.Options.DataCache[timelineId].CurrentView = Common.Get(timeline.Name + '-TimelineChangeViewSelectbox').value;
            var timlineDateBar = Common.Get(timelineId + '-TimelineDateBar');
            Velocity(timlineDateBar, 'slideUp', { duration: 700, queue: false,
                complete: function (secondEvent) {
                    var timelineDateRange = GetDateRange('ViewChange', timelineId, Timeline.Options.Range, null);
                    RenderDateSliderMarkup(timelineDateRange, timelineId);
                    Velocity(timlineDateBar, 'slideDown', { duration: 700, queue: false,
                        complete: function (thirdEvent) {
                            // Update Date Range Description
                            var timelineSliderDatelist = Common.Query('.gtc-timeline-slider-datelist', timelineObject);
                            UpdateDateRangeDescription(timelineId, timelineSliderDatelist);

                            // TODO: Needed? By default window resize has this already on all pages but might need to set it again after timline animations
                            Page.SetPageHeight();
                        }
                    });
                }
            });
        };
        Common.AttachWindowResizingEvent(onResizeEndFunction, 'onTimelineResize');

    };

} (window.Timeline = window.Timeline || {}, window, document, Common, Cache, Events, Velocity));

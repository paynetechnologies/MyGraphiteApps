// DayPlanner
// Based On: DayPlanner -> ViewElement
(function (DayPlanner, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Variables
    DayPlanner.FullCalendarList = [];

    // Public Methods
    DayPlanner.Render = function (dayPlanner) {

        var dayPlannerMarkup = '';

        // Div<, Class@, Id@, Data-DayPlanner@
        dayPlannerMarkup += '<div class="gtc-dayplanner-container" data-namespace="DayPlanner"' + ViewElement.RenderAttributes(dayPlanner) + ' data-dayplanner=\'' + JSON.stringify(dayPlanner) + '\'';

        // OnRefresh
        dayPlannerMarkup += EventElement.AttachEvent(dayPlanner.Name, 'refresh', dayPlanner.OnRefresh);

        // DayPlanner style
        dayPlannerMarkup += ' style="';
        if (Common.IsDefined(dayPlanner.Dimension)) {
            // Width
            if (Common.IsDefined(dayPlanner.Dimension.Width)) {
                dayPlannerMarkup += 'width: ' + dayPlanner.Dimension.Width + 'px;';
            }
        }

        // Configure DayPlanner
        Events.One(document.body, 'configuredayplanner.' + dayPlanner.Name, '#' + dayPlanner.Name,
            function (event) {
                var dataDayPlanner = JSON.parse(Common.GetAttr(event.target, 'data-dayplanner'));
                var defaultDate = GetDefaultDate(dataDayPlanner);
                var headerLeft = BuildHeader(dataDayPlanner);
                var currentLanguage = Common.GetLanguage();
                var fullCalendar = new FullCalendar.Calendar(event.target, {
                    buttonIcons: {
                        prevYear: 'ReplaceWithFA fa fa-backward',
                        prev: 'ReplaceWithFA fa fa-arrow-left',
                        next: 'ReplaceWithFA fa fa-arrow-right',
                        nextYear: 'ReplaceWithFA fa fa-forward',
                        addAppointment: 'ReplaceWithFA fa fa-calendar-plus-o',
                        addMeeting: 'ReplaceWithFA gtc-icon-styles gtc-icon gtc-icon-adddate'
                    },
                    buttonText: {
                        month: 'Month',
                        week: 'Week',
                        day: 'Day',
                        today: 'Today'
                    },
                    customButtons: {
                        addAppointment: {
                            click: function(event) {
                                AddAppointment(this, fullCalendar);
                            }
                        },
                        addMeeting: {
                            click: function(event) {
                                AddMeeting(this, fullCalendar);
                            }
                        }
                    },
                    defaultView: dataDayPlanner.DefaultView,
                    defaultDate: defaultDate,
                    eventLimit: true,
                    header: {
                        left: headerLeft,
                        center: 'title',
                        right: 'today,prevYear,prev,next,nextYear'
                    },
                    height: parseInt(dataDayPlanner.Dimension.Height),
                    locale: currentLanguage,
                    nowIndicator: true,
                    selectable: true,
                    timeFormat: 'h:mmt',
                    eventRender: function(eventRenderInfo) {
                        // Unescape HTML characters
                        eventRenderInfo.el.getElementsByClassName('fc-title')[0].innerText = Common.Decode(eventRenderInfo.event.title);
                    },
                    select: function(selectInfo) {
                        var dataSelectedInfo = {
                            StartDateTime: DateToString(selectInfo.start),
                            EndDateTime: DateToString(selectInfo.end),
                        };
                        Common.SetAttr(event.target, 'data-selectedinfo', JSON.stringify(dataSelectedInfo));
                    },
                    eventClick: function(eventClickInfo) {
                        HandleEventClick(this, eventClickInfo.el, eventClickInfo.event);
                    },
                    events: function(eventsInfo, successCallback, failureCallback) {
                        var onRefreshEvent = JSON.parse(Common.GetAttr(event.target, 'data-refresh'));
                        if (Common.IsEventViewElementDefined(onRefreshEvent)) {
                            var onRefreshParameters = [
                                {
                                    Name: 'StartTime',
                                    Value: DateToString(eventsInfo.start),
                                    UiParameters: null
                                },
                                {
                                    Name: 'EndTime',
                                    Value: DateToString(eventsInfo.end),
                                    UiParameters: null
                                }
                            ];

                            // Merge OnRefresh Parameters
                            if (Common.IsDefined(onRefreshEvent.UiParameters)) {
                                onRefreshParameters = onRefreshParameters.concat(onRefreshEvent.UiParameters);
                            }
                            Common.ExecuteViewBehavior(onRefreshEvent.ControllerPath + onRefreshEvent.ActionName, onRefreshParameters,
                                function (onRefreshModel) {
                                    if (Common.IsDefined(onRefreshModel.PageInstructions[0]) && Common.IsDefined(onRefreshModel.PageInstructions[0].ViewElements[0])) {
                                        successCallback(BuildEvents(onRefreshModel.PageInstructions[0].ViewElements[0].Events));
                                    }
                                },
                                event.target
                            );
                        }
                    }
                });
                fullCalendar.render();
                CleanupUpCalendar(fullCalendar);
                var fullCalendarItem = {
                    Name: event.target.id,
                    Calendar: fullCalendar
                };
                DayPlanner.FullCalendarList.push(fullCalendarItem);
            }
        );

        // Div</>
        dayPlannerMarkup += '"></div>';

        // Return markup
        return dayPlannerMarkup;

    };

    DayPlanner.ShowPinwheel = function (dayPlanner) {

        SpinKit.Show(dayPlanner, 'FadingCircle');

    };

    DayPlanner.HidePinwheel = function (dayPlanner) {

        setTimeout(
            function () {
                SpinKit.Hide(dayPlanner);
            }, 1000
        );

    };

    DayPlanner.TranslatePlanners = function (plannerArray) {

        var currentLanguage = Common.GetLanguage();
        var index = 0, length = DayPlanner.FullCalendarList.length;
        for ( ; index < length; index++) {
            var fullCalendarItem = DayPlanner.FullCalendarList[index];
            fullCalendarItem.Calendar.setOption('locale', currentLanguage);
            CleanupUpCalendar(fullCalendarItem.Calendar);
        }

    };

    // Private Methods
    function StringToDate (dateTimeString) {

        var dateTimeDate = eval(dateTimeString.replace(/\/Date\((-?\d+)\)\//, 'new Date($1)'));
        dateTimeDate = Common.AddTimezone(dateTimeDate);
        return dateTimeDate;

    };

    function DateToString (dateTimeDate) {

        return '/Date(' + Common.RemoveTimezone(dateTimeDate) + ')/';

    };

    function GetDefaultDate (dataDayPlanner) {

        var defaultDate = new Date();
        if (Common.IsDefined(dataDayPlanner.DefaultDate)) {
            defaultDate = StringToDate(dataDayPlanner.DefaultDate);
        }
        return defaultDate;

    };

    function BuildHeader (dataDayPlanner) {

        var headerLeft = '';
        if (dataDayPlanner.ShowMonth == 'Yes') {
            headerLeft += 'month';
        }
        if (dataDayPlanner.ShowWeek == 'Yes') {
            if (headerLeft != '') {
                headerLeft += ',';
            }
            headerLeft += 'agendaWeek';
        }
        if (dataDayPlanner.ShowDay == 'Yes') {
            if (headerLeft != '') {
                headerLeft += ',';
            }
            headerLeft += 'agendaDay';
        }
        if (Common.IsDefined(dataDayPlanner.AppointmentModal)) {
            if (headerLeft != '') {
                headerLeft += ',';
            }
            headerLeft += 'addAppointment';
        }
        if (Common.IsDefined(dataDayPlanner.MeetingModal)) {
            if (headerLeft != '') {
                headerLeft += ',';
            }
            headerLeft += 'addMeeting';
        }
        return headerLeft;

    };

    function BuildEvents (dayPlannerEvents) {

        var fullCalendarEvents = [];
        if (Common.IsDefined(dayPlannerEvents)) {
            var fullCalendarEvent, dayPlannerEvent, index = 0, length = dayPlannerEvents.length;
            for ( ; index < length; index++) {
                dayPlannerEvent = dayPlannerEvents[index];
                fullCalendarEvent = {
                    id: dayPlannerEvent.Id,
                    title: dayPlannerEvent.Subject,
                    start: StringToDate(dayPlannerEvent.StartTime),
                };
                if (Common.IsDefined(dayPlannerEvent.EndTime)) {
                    fullCalendarEvent.end = StringToDate(dayPlannerEvent.EndTime);
                }
                if (dayPlannerEvent.AllDay == 'Yes') {
                    fullCalendarEvent.allDay = true;
                }
                if (Common.IsDefined(dayPlannerEvent.TextColor)) {
                    fullCalendarEvent.textColor = dayPlannerEvent.TextColor;
                }
                if (Common.IsDefined(dayPlannerEvent.BackgroundColor)) {
                    fullCalendarEvent.backgroundColor = dayPlannerEvent.BackgroundColor;
                    fullCalendarEvent.borderColor = dayPlannerEvent.BackgroundColor;
                }
                if (Common.IsDefined(dayPlannerEvent.EventModal)) {
                    fullCalendarEvent.eventModal = dayPlannerEvent.EventModal;
                }
                fullCalendarEvents.push(fullCalendarEvent);
            }
        }
        return fullCalendarEvents;

    };

    function CleanupUpCalendar (fullCalendar) {

        // Remove suprious classes
        Common.RemoveClassesFromElements(Common.GetByClass('fc-icon-ReplaceWithFA', fullCalendar.el), 'fc-icon fc-icon-ReplaceWithFA');

        // Add data-translate attributes
        var monthButtons = Common.GetByClass('fc-month-button', fullCalendar.el);
        var monthIndex = 0, monthLength = monthButtons.length;
        for ( ; monthIndex < monthLength; monthIndex++) {
            Common.SetAttr(monthButtons[monthIndex], 'data-translate', 'Month');
        }
        var weekButtons = Common.GetByClass('fc-agendaWeek-button', fullCalendar.el);
        var weekIndex = 0, weekLength = weekButtons.length;
        for ( ; weekIndex < weekLength; weekIndex++) {
            Common.SetAttr(weekButtons[weekIndex], 'data-translate', 'Week');
        }
        var dayButtons = Common.GetByClass('fc-agendaDay-button', fullCalendar.el);
        var dayIndex = 0, dayLength = dayButtons.length;
        for ( ; dayIndex < dayLength; dayIndex++) {
            Common.SetAttr(dayButtons[dayIndex], 'data-translate', 'Day');
        }
        var todayButtons = Common.GetByClass('fc-today-button', fullCalendar.el);
        var todayIndex = 0, todayLength = todayButtons.length;
        for ( ; todayIndex < todayLength; todayIndex++) {
            Common.SetAttr(todayButtons[todayIndex], 'data-translate', 'Today');
        }

    };

    function AddAppointment (addAppointmentButton, fullCalendar) {

        event.preventDefault();
        var dayPlanner = Common.Closest('.gtc-dayplanner-container', addAppointmentButton);
        var dataDayPlanner = JSON.parse(Common.GetAttr(dayPlanner, 'data-dayplanner'));
        var addAppointmentLink = Common.Create('a');
        var dataSelectedInfo = JSON.parse(Common.GetAttr(dayPlanner, 'data-selectedinfo'));
        var startDateTime = null;
        var endDateTime = null;
        if (Common.IsDefined(dataSelectedInfo)) {
            startDateTime = dataSelectedInfo.StartDateTime;
            endDateTime = dataSelectedInfo.EndDateTime;
        }
        var uiParameters = [
            {
                Name: 'StartDateTime',
                Value: startDateTime,
                UiParameters: null
            },
            {
                Name: 'EndDateTime',
                Value: endDateTime,
                UiParameters: null
            }
        ];
        if (Common.IsDefined(dataDayPlanner.AppointmentModal.UiParameters)) {
            uiParameters = uiParameters.concat(dataDayPlanner.AppointmentModal.UiParameters);
        }
        Common.SetAttr(addAppointmentLink, 'href', dataDayPlanner.AppointmentModal.View);
        Common.SetAttr(addAppointmentLink, 'data-load', JSON.stringify(uiParameters));
        Common.SetOnLoadEvent(addAppointmentLink, true, false);
        Common.SetAttr(addAppointmentButton, 'id', dataDayPlanner.Name + 'AddAppointment');
        Modals.ShowModalDialog('AppointmentModal', dataDayPlanner.AppointmentModal.View, dataDayPlanner.Name + 'AddAppointment');
        Events.One(document, 'modalclosecomplete',
            function (event, data) {
                fullCalendar.refetchEvents();
            }
        );

    };

    function AddMeeting (addMeetingButton, fullCalendar) {

        event.preventDefault();
        var dayPlanner = Common.Closest('.gtc-dayplanner-container', addMeetingButton);
        var dataDayPlanner = JSON.parse(Common.GetAttr(dayPlanner, 'data-dayplanner'));
        var addMeetingLink = Common.Create('a');
        var dataSelectedInfo = JSON.parse(Common.GetAttr(dayPlanner, 'data-selectedinfo'));
        var startDateTime = null;
        var endDateTime = null;
        if (Common.IsDefined(dataSelectedInfo)) {
            startDateTime = dataSelectedInfo.StartDateTime;
            endDateTime = dataSelectedInfo.EndDateTime;
        }
        var uiParameters = [
            {
                Name: 'StartDateTime',
                Value: startDateTime,
                UiParameters: null
            },
            {
                Name: 'EndDateTime',
                Value: endDateTime,
                UiParameters: null
            }
        ];
        if (Common.IsDefined(dataDayPlanner.MeetingModal.UiParameters)) {
            uiParameters = uiParameters.concat(dataDayPlanner.MeetingModal.UiParameters);
        }
        Common.SetAttr(addMeetingLink, 'href', dataDayPlanner.MeetingModal.View);
        Common.SetAttr(addMeetingLink, 'data-load', JSON.stringify(uiParameters));
        Common.SetOnLoadEvent(addMeetingLink, true, false);
        Common.SetAttr(addMeetingButton, 'id', dataDayPlanner.Name + 'AddMeeting');
        Modals.ShowModalDialog('MeetingModal', dataDayPlanner.MeetingModal.View, dataDayPlanner.Name + 'AddMeeting');
        Events.One(document, 'modalclosecomplete',
            function (event, data) {
                fullCalendar.refetchEvents();
            }
        );

    };

    function HandleEventClick (fullCalendar, fullCalendarEventLink, fullCalendarEvent) {

        event.preventDefault();
        if (Common.IsNotDefined(fullCalendarEvent.extendedProps.eventModal)) {
            return;
        }
        var dayPlanner = Common.Closest('.gtc-dayplanner-container', fullCalendarEventLink);
        var dataDayPlanner = JSON.parse(Common.GetAttr(dayPlanner, 'data-dayplanner'));
        var eventClickLink = Common.Create('a');
        Common.SetAttr(eventClickLink, 'href', fullCalendarEvent.extendedProps.eventModal.View);
        Common.SetAttr(eventClickLink, 'data-load', JSON.stringify(fullCalendarEvent.extendedProps.eventModal.UiParameters));
        Common.SetOnLoadEvent(eventClickLink, true, false);
        Common.SetAttr(fullCalendarEventLink, 'id', dataDayPlanner.Name + 'EventClick');
        Modals.ShowModalDialog('EventModal', fullCalendarEvent.extendedProps.eventModal.View, dataDayPlanner.Name + 'EventClick');
        Events.One(document, 'modalclosecomplete',
            function (event, data) {
                fullCalendar.refetchEvents();
            }
        );

    };

} (window.DayPlanner = window.DayPlanner || {}, window, document, Common, Cache, Events, Velocity));

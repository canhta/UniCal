# EventCalendar Library Guide for AI Agents

This document provides a concise overview of the `@event-calendar/core` library, focusing on information useful for AI code generation and understanding.

## Core Concepts

### Installation
```bash
npm install --save-dev @event-calendar/core
```

### Initialization

**JavaScript Module:**
```javascript
import {createCalendar, destroyCalendar, TimeGrid} from '@event-calendar/core';
import '@event-calendar/core/index.css'; // If build tool supports CSS imports

const ec = createCalendar(
    document.getElementById('ec'), // HTML element
    [TimeGrid], // Array of plugins
    { /* options */ }
);

// To destroy:
// destroyCalendar(ec);
```

**Svelte 5 Component:**
```html
<script>
    import {Calendar, TimeGrid} from '@event-calendar/core';
    let options = $state({ /* ... Svelte reactive options ... */ });
</script>
<Calendar plugins={[TimeGrid]} {options} />
```

**Standalone Bundle (via CDN):**
Include CSS and JS from CDN (e.g., jsDelivr).
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@event-calendar/build/dist/event-calendar.min.css">
<script src="https://cdn.jsdelivr.net/npm/@event-calendar/build/dist/event-calendar.min.js"></script>
```
```javascript
let ec = EventCalendar.create(document.getElementById('ec'), { /* options */ });
// To destroy:
// EventCalendar.destroy(ec);
```

### Plugins
At least one view plugin is required.
*   `DayGrid`
*   `List`
*   `ResourceTimeline`
*   `ResourceTimeGrid`
*   `TimeGrid`
*   `Interaction` (doesn't provide a view, enables interactive features like drag-and-drop, click, select)

### Modifying Options
Use `ec.setOption('optionName', value)` or update the reactive `options` object in Svelte.

## Options

Below is a list of available options for the calendar.

*   **`allDayContent`**:
    *   Type: `Content` or `function(arg: {text: string}) => Content`
    *   Default: `'all-day'`
    *   Description: Content for the title of the `all-day` slot.
*   **`allDaySlot`**:
    *   Type: `boolean`
    *   Default: `true`
    *   Description: Toggles the display of the `all-day` slot. If `false`, all-day events are not shown in `timeGrid`/`resourceTimeGrid` views.
*   **`buttonText`**:
    *   Type: `object` or `function(defaultText: object) => object`
    *   Default: (complex object with keys like `today`, `month`, `week`, `day`, `list`, `next`, `prev`; specific view overrides exist)
    *   Description: Text for header toolbar buttons.
*   **`customButtons`**:
    *   Type: `object`
    *   Default: `{}`
    *   Description: Defines custom buttons for the `headerToolbar`. Each button entry: `{ text: Content, click: function(mouseEvent), active?: boolean }`.
*   **`date`**:
    *   Type: `Date` or `string` (ISO8601)
    *   Default: `new Date()`
    *   Description: The date currently displayed on the calendar.
*   **`dateClick`**:
    *   Type: `function(info: object) => void`
    *   Default: `undefined`
    *   Requires: `Interaction` plugin
    *   Description: Callback for clicks on a date/time.
    *   `info` properties: `date` (Date), `dateStr` (string), `allDay` (boolean), `dayEl` (HTMLElement), `jsEvent` (MouseEvent), `view` (View object), `resource?` (Resource object).
*   **`datesAboveResources`**:
    *   Type: `boolean`
    *   Default: `false`
    *   Description: If `true`, date headings render above resource headings in resource views.
*   **`datesSet`**:
    *   Type: `function(info: object) => void`
    *   Default: `undefined`
    *   Description: Callback when the calendar's visible date range changes.
    *   `info` properties: `start` (Date), `end` (Date, exclusive), `startStr` (string), `endStr` (string), `view` (View object).
*   **`dayCellFormat`**:
    *   Type: `object` (Intl.DateTimeFormat options) or `function(date: Date) => Content`
    *   Default: `{day: 'numeric'}`
    *   Description: Text format for day cells in `dayGrid` view.
*   **`dayHeaderAriaLabelFormat`**:
    *   Type: `object` (Intl.DateTimeFormat options) or `function(date: Date) => string`
    *   Default: `{dateStyle: 'long'}` (View-specific overrides exist, e.g., `dayGridMonth`: `{weekday: 'long'}`)
    *   Description: `aria-label` for calendar column headings.
*   **`dayHeaderFormat`**:
    *   Type: `object` (Intl.DateTimeFormat options) or `function(date: Date) => Content`
    *   Default: `{weekday: 'short', month: 'numeric', day: 'numeric'}` (View-specific overrides exist)
    *   Description: Text for calendar column headings.
*   **`dayMaxEvents`**:
    *   Type: `boolean`
    *   Default: `false` (If `true`, limits to cell height and shows "+N more" link)
    *   Description: Limits stacked event levels in `dayGrid` view.
*   **`dayPopoverFormat`**:
    *   Type: `object` (Intl.DateTimeFormat options) or `function(date: Date) => Content`
    *   Default: `{month: 'long', day: 'numeric', year: 'numeric'}`
    *   Description: Date format for the title of the "more" link popover.
*   **`displayEventEnd`**:
    *   Type: `boolean`
    *   Default: `true` (View-specific overrides make it `false` for some views like `dayGridMonth`)
    *   Description: Whether to display an event's end time.
*   **`dragConstraint`**:
    *   Type: `function(eventDropInfo) => boolean`
    *   Default: `undefined`
    *   Requires: `Interaction` plugin
    *   Description: Limits where events can be dragged. Return `true` if allowed. `eventDropInfo` is same as `eventDrop` callback argument.
*   **`dragScroll`**:
    *   Type: `boolean`
    *   Default: `true`
    *   Requires: `Interaction` plugin
    *   Description: Enables auto-scroll when dragging events near edges.
*   **`duration`**:
    *   Type: `string`, `integer`, or `object` (parsable to Duration object)
    *   Default: `{weeks: 1}` (View-specific overrides exist, e.g., `dayGridMonth`: `{months: 1}`)
    *   Description: Duration of a view (e.g., `{days: 7}`).
*   **`editable`**:
    *   Type: `boolean`
    *   Default: `false`
    *   Requires: `Interaction` plugin
    *   Description: Enables event dragging and resizing. Use `eventStartEditable` and `eventDurationEditable` for finer control.
*   **`events`**:
    *   Type: `array` of plain objects
    *   Default: `[]`
    *   Description: Array of event data. Not used if `eventSources` is provided.
*   **`eventAllUpdated`**:
    *   Type: `function(info: {view: View object}) => void`
    *   Default: `undefined`
    *   Description: (Experimental) Callback when all events finish updating/rendering.
*   **`eventBackgroundColor`**:
    *   Type: `string` (CSS color)
    *   Default: `undefined`
    *   Description: Default background color for events.
*   **`eventClassNames`**:
    *   Type: `string`, `array` of strings, or `function(info: {event: Event object, view: View object}) => string | array`
    *   Default: `undefined`
    *   Description: Additional CSS classes for events.
*   **`eventClick`**:
    *   Type: `function(info: object) => void`
    *   Default: `undefined`
    *   Description: Callback for event clicks.
    *   `info` properties: `el` (HTMLElement), `event` (Event object), `jsEvent` (MouseEvent), `view` (View object).
*   **`eventColor`**:
    *   Type: `string` (CSS color)
    *   Default: `undefined`
    *   Description: Alias for `eventBackgroundColor`.
*   **`eventContent`**:
    *   Type: `Content` or `function(info: {event: Event object, timeText: string, view: View object}) => Content | undefined`
    *   Default: `undefined`
    *   Description: Custom content for event elements. Return `undefined` for default rendering.
*   **`eventDidMount`**:
    *   Type: `function(info: {el: HTMLElement, event: Event object, timeText: string, view: View object}) => void`
    *   Default: `undefined`
    *   Description: Callback after an event element is added to DOM.
*   **`eventDragMinDistance`**:
    *   Type: `integer` (pixels)
    *   Default: `5`
    *   Requires: `Interaction` plugin
    *   Description: Pixels mouse must move before dragging starts.
*   **`eventDragStart`**:
    *   Type: `function(info: {event: Event object, jsEvent: MouseEvent, view: View object}) => void`
    *   Default: `undefined`
    *   Requires: `Interaction` plugin
    *   Description: Callback when event dragging starts.
*   **`eventDragStop`**:
    *   Type: `function(info: {event: Event object, jsEvent: MouseEvent, view: View object}) => void`
    *   Default: `undefined`
    *   Requires: `Interaction` plugin
    *   Description: Callback when event dragging stops (before `eventDrop`).
*   **`eventDrop`**:
    *   Type: `function(info: object) => void`
    *   Default: `undefined`
    *   Requires: `Interaction` plugin
    *   Description: Callback after an event is dropped.
    *   `info` properties: `event` (Event object), `oldEvent` (Event object state before drop), `delta` (Duration object), `jsEvent` (MouseEvent), `view` (View object), `revert` (function to undo drop), `oldResource?` (Resource object), `newResource?` (Resource object).
*   **`eventDurationEditable`**:
    *   Type: `boolean`
    *   Default: (derived from `editable` if not set, effectively `false`)
    *   Requires: `Interaction` plugin
    *   Description: Allows resizing event duration.
*   **`eventFilter`**:
    *   Type: `function(event: Event object) => boolean`
    *   Default: `undefined`
    *   Description: Filters events. Return `true` to show, `false` to hide.
*   **`eventLongPressDelay`**:
    *   Type: `integer` (milliseconds)
    *   Default: `1000`
    *   Requires: `Interaction` plugin
    *   Description: Delay for long-press to initiate drag on touch devices.
*   **`eventMouseEnter`**:
    *   Type: `function(info: {el: HTMLElement, event: Event object, jsEvent: MouseEvent, view: View object}) => void`
    *   Default: `undefined`
    *   Description: Callback when mouse enters an event element.
*   **`eventMouseLeave`**:
    *   Type: `function(info: {el: HTMLElement, event: Event object, jsEvent: MouseEvent, view: View object}) => void`
    *   Default: `undefined`
    *   Description: Callback when mouse leaves an event element.
*   **`eventResizableFromStart`**:
    *   Type: `boolean`
    *   Default: `false`
    *   Requires: `Interaction` plugin
    *   Description: Allows resizing events from their start.
*   **`eventResize`**:
    *   Type: `function(info: object) => void`
    *   Default: `undefined`
    *   Requires: `Interaction` plugin
    *   Description: Callback after an event is resized.
    *   `info` properties: `event` (Event object), `oldEvent` (Event object state before resize), `startDelta` (Duration object), `endDelta` (Duration object), `jsEvent` (MouseEvent), `view` (View object), `revert` (function to undo resize).
*   **`eventResizeStart`**:
    *   Type: `function(info: {event: Event object, jsEvent: MouseEvent, view: View object}) => void`
    *   Default: `undefined`
    *   Requires: `Interaction` plugin
    *   Description: Callback when event resizing starts.
*   **`eventResizeStop`**:
    *   Type: `function(info: {event: Event object, jsEvent: MouseEvent, view: View object}) => void`
    *   Default: `undefined`
    *   Requires: `Interaction` plugin
    *   Description: Callback when event resizing stops (before `eventResize`).
*   **`eventSources`**:
    *   Type: `array` of event source objects (plain array, function, JSON feed URL)
    *   Default: `undefined`
    *   Description: Specifies sources for events. Overrides `events` option.
*   **`eventStartEditable`**:
    *   Type: `boolean`
    *   Default: (derived from `editable` if not set, effectively `false`)
    *   Requires: `Interaction` plugin
    *   Description: Allows dragging events (changing start time).
*   **`eventTextColor`**:
    *   Type: `string` (CSS color)
    *   Default: `undefined`
    *   Description: Default text color for events.
*   **`eventTimeFormat`**:
    *   Type: `object` (Intl.DateTimeFormat options) or `function(start: Date, end: Date, view: View object) => string`
    *   Default: (complex, view-dependent, e.g., `{hour: 'numeric', minute: '2-digit'}`)
    *   Description: Format for event times within event elements.
*   **`filterEventsWithResources`**:
    *   Type: `boolean`
    *   Default: `false`
    *   Description: If `true`, only events associated with visible resources are displayed.
*   **`filterResourcesWithEvents`**:
    *   Type: `boolean`
    *   Default: `false`
    *   Description: If `true`, only resources with events in the current date range are displayed.
*   **`firstDay`**:
    *   Type: `integer` (0=Sunday, 1=Monday, ...)
    *   Default: `0` (Sunday)
    *   Description: The first day of the week.
*   **`flexibleSlotTimeLimits`**:
    *   Type: `boolean`
    *   Default: `false`
    *   Description: If `true`, `slotMinTime`/`slotMaxTime` are ignored for days with events outside this range.
*   **`headerToolbar`**:
    *   Type: `object {start?: string, center?: string, end?: string}` or `false`
    *   Default: `{start: 'title', center: '', end: 'today prev,next'}` (View-specific overrides exist)
    *   Description: Configures header toolbar. `false` to hide. String values are comma/space separated keywords (e.g., `title`, `prev`, `next`, `today`, view names, custom button keys).
*   **`height`**:
    *   Type: `string` (CSS value like `'500px'`), `integer` (pixels), or `'auto'`
    *   Default: `'auto'`
    *   Description: Overall calendar height.
*   **`hiddenDays`**:
    *   Type: `array` of integers (0=Sunday, ..., 6=Saturday)
    *   Default: `[]`
    *   Description: Hides specified days of the week.
*   **`highlightedDates`**:
    *   Type: `array` of `Date` | `string` (ISO8601) | `object { date: Date|string, color?: string, classNames?: string|array }`
    *   Default: `[]`
    *   Description: Dates to highlight with custom background or CSS classes.
*   **`lazyFetching`**:
    *   Type: `boolean`
    *   Default: `true`
    *   Description: If `true`, event sources fetched when needed. If `false`, fetched on init.
*   **`listDayFormat`**:
    *   Type: `object` (Intl.DateTimeFormat options) or `function(date: Date) => Content` or `false`
    *   Default: `{month: 'long', day: 'numeric', year: 'numeric'}`
    *   Description: Format for day headings in `list` view. `false` to hide.
*   **`listDaySideFormat`**:
    *   Type: `object` (Intl.DateTimeFormat options) or `function(date: Date) => Content` or `false`
    *   Default: `{weekday: 'long'}`
    *   Description: Format for "day of week" text next to day headings in `list` view. `false` to hide.
*   **`loading`**:
    *   Type: `function(isLoading: boolean) => void`
    *   Default: `undefined`
    *   Description: Callback when event source fetching starts/stops.
*   **`locale`**:
    *   Type: `string` (locale code, e.g., `'en-US'`, `'fr'`)
    *   Default: Browser's locale
    *   Description: Localization for dates and texts.
*   **`longPressDelay`**:
    *   Type: `integer` (milliseconds)
    *   Default: `1000`
    *   Requires: `Interaction` plugin
    *   Description: Delay for long-press to trigger date selection or event drag on touch.
*   **`moreLinkContent`**:
    *   Type: `Content` or `function(arg: {num: number, text: string, view: View object}) => Content`
    *   Default: `undefined` (uses `+num more`)
    *   Description: Content for the "+N more" link in `dayGrid` view.
*   **`noEventsClick`**:
    *   Type: `function(info: {jsEvent: MouseEvent, view: View object}) => void`
    *   Default: `undefined`
    *   Description: Callback for clicks on the "no events" message.
*   **`noEventsContent`**:
    *   Type: `Content` or `function(info: {view: View object}) => Content`
    *   Default: `'No events'`
    *   Description: Content displayed when there are no events.
*   **`nowIndicator`**:
    *   Type: `boolean`
    *   Default: `false`
    *   Description: Displays an indicator for the current time.
*   **`pointer`**:
    *   Type: `boolean`
    *   Default: `false`
    *   Requires: `Interaction` plugin
    *   Description: If `true`, day cells/events appear "clickable" via CSS.
*   **`resizeConstraint`**:
    *   Type: `function(eventResizeInfo) => boolean`
    *   Default: `undefined`
    *   Requires: `Interaction` plugin
    *   Description: Limits how events can be resized. Return `true` if allowed. `eventResizeInfo` is same as `eventResize` callback argument.
*   **`resources`**:
    *   Type: `array` of Resource objects | `function(fetchInfo, successCb, failureCb)` | `string` (URL)
    *   Default: `[]`
    *   Description: Defines resources for resource views.
*   **`resourceLabelContent`**:
    *   Type: `Content` or `function(info: {resource: Resource object, view: View object}) => Content`
    *   Default: `undefined` (uses `resource.title`)
    *   Description: Custom content for resource labels.
*   **`resourceLabelDidMount`**:
    *   Type: `function(info: {el: HTMLElement, resource: Resource object, view: View object}) => void`
    *   Default: `undefined`
    *   Description: Callback after a resource label element is added to DOM.
*   **`scrollTime`**:
    *   Type: `string` (time string like `'08:00:00'`) or `Duration object`
    *   Default: `'06:00:00'`
    *   Description: Initial scroll position for time-based views.
*   **`select`**:
    *   Type: `function(info: object) => void`
    *   Default: `undefined`
    *   Requires: `Interaction` plugin
    *   Description: Callback after a date/time range is selected.
    *   `info` properties: `start` (Date), `end` (Date, exclusive), `startStr` (string), `endStr` (string), `allDay` (boolean), `jsEvent` (MouseEvent), `view` (View object), `resource?` (Resource object).
*   **`selectable`**:
    *   Type: `boolean`
    *   Default: `false`
    *   Requires: `Interaction` plugin
    *   Description: Allows date/time range selection.
*   **`selectBackgroundColor`**:
    *   Type: `string` (CSS color)
    *   Default: `undefined` (uses a default highlight)
    *   Description: Background color for date selections.
*   **`selectConstraint`**:
    *   Type: `string` (event ID or `{ groupId: string }`) or `function(selectInfo) => boolean`
    *   Default: `undefined`
    *   Requires: `Interaction` plugin
    *   Description: Limits where date selections can be made. `selectInfo` is same as `select` callback argument.
*   **`selectLongPressDelay`**:
    *   Type: `integer` (milliseconds)
    *   Default: `undefined` (uses `longPressDelay`)
    *   Requires: `Interaction` plugin
    *   Description: Specific long-press delay for selections.
*   **`selectMinDistance`**:
    *   Type: `integer` (pixels)
    *   Default: `5`
    *   Requires: `Interaction` plugin
    *   Description: Pixels mouse must move before selection starts.
*   **`slotDuration`**:
    *   Type: `string` (time string like `'00:30:00'`) or `Duration object`
    *   Default: `'00:30:00'`
    *   Description: Frequency for displaying time slots.
*   **`slotEventOverlap`**:
    *   Type: `boolean`
    *   Default: `true`
    *   Description: If `true`, timed events can overlap. If `false`, they stack horizontally.
*   **`slotHeight`**:
    *   Type: `integer` (pixels)
    *   Default: `undefined` (auto-calculated)
    *   Description: Height of time slots in `timeGrid` / `resourceTimeGrid`.
*   **`slotLabelFormat`**:
    *   Type: `object` (Intl.DateTimeFormat options) or `function(date: Date, view: View object) => Content`
    *   Default: `{hour: 'numeric', minute: '2-digit'}` (view-dependent variations)
    *   Description: Format for time slot labels.
*   **`slotLabelInterval`**:
    *   Type: `string` (time string) or `Duration object`
    *   Default: `slotDuration`
    *   Description: Frequency of time slot labels.
*   **`slotMaxTime`**:
    *   Type: `string` (time string like `'24:00:00'`) or `Duration object`
    *   Default: `'24:00:00'`
    *   Description: Maximum time displayed in time-based views.
*   **`slotMinTime`**:
    *   Type: `string` (time string like `'00:00:00'`) or `Duration object`
    *   Default: `'00:00:00'`
    *   Description: Minimum time displayed in time-based views.
*   **`slotWidth`**:
    *   Type: `integer` (pixels)
    *   Default: `undefined`
    *   Description: Width of slots in `resourceTimeline` view.
*   **`theme`**:
    *   Type: `object` or `false`
    *   Default: `undefined` (uses default styling)
    *   Description: Customizes CSS class names. `false` to disable all theming classes for manual styling.
*   **`titleFormat`**:
    *   Type: `object` (Intl.DateTimeFormat options) or `function(start: Date, end: Date, view: View object) => string`
    *   Default: `{year: 'numeric', month: 'long'}` (view-dependent variations)
    *   Description: Format for the title text in the header.
*   **`unselect`**:
    *   Type: `function(info: {jsEvent: MouseEvent, view: View object}) => void`
    *   Default: `undefined`
    *   Requires: `Interaction` plugin
    *   Description: Callback when a selection is cleared.
*   **`unselectAuto`**:
    *   Type: `boolean`
    *   Default: `true`
    *   Requires: `Interaction` plugin
    *   Description: If `true`, selection cleared when clicking outside it.
*   **`unselectCancel`**:
    *   Type: `string` (CSS selector)
    *   Default: `undefined`
    *   Requires: `Interaction` plugin
    *   Description: Prevents unselecting when clicking elements matching this selector.
*   **`validRange`**:
    *   Type: `object {start?: Date|string, end?: Date|string}` or `function(nowDate: Date) => {start?: Date, end?: Date}`
    *   Default: `undefined`
    *   Description: Limits the date range users can navigate to.
*   **`view`**:
    *   Type: `string` (view name, e.g., `'timeGridWeek'`, `'dayGridMonth'`)
    *   Default: `'dayGridMonth'`
    *   Description: The initial view displayed.
*   **`viewDidMount`**:
    *   Type: `function(info: {el: HTMLElement, view: View object}) => void`
    *   Default: `undefined`
    *   Description: Callback after the view's main element is added to DOM.
*   **`views`**:
    *   Type: `object`
    *   Default: `{}`
    *   Description: Customizes options for specific views. Keys are view names (e.g., `timeGridWeek`), values are option objects.
*   **`weekNumberContent`**:
    *   Type: `Content` or `function(arg: {num: number, text: string, date: Date, view: View object}) => Content`
    *   Default: `undefined` (uses `num`)
    *   Description: Content for week number cells.
*   **`weekNumbers`**:
    *   Type: `boolean` or `'right'`
    *   Default: `false`
    *   Description: Displays week numbers. `true` (left), `'right'` (right side).

## Methods

*   **`getOption(name: string)`**:
    *   Returns: `any`
    *   Description: Retrieves the current value of an option.
*   **`setOption(name: string, value: any)`**:
    *   Description: Sets an option after initialization.
*   **`addEvent(event: object, sourceId?: string)`**:
    *   Description: Adds a new event. `event` is a plain object or Event object.
*   **`getEventById(id: string)`**:
    *   Returns: `Event object | null`
    *   Description: Retrieves an event by its ID.
*   **`getEvents()`**:
    *   Returns: `array` of `Event object`
    *   Description: Retrieves all events currently on the calendar.
*   **`removeEventById(id: string)`**:
    *   Description: Removes an event by its ID.
*   **`updateEvent(event: object)`**:
    *   Description: Updates an existing event. `event` must have an `id`.
*   **`refetchEvents()`**:
    *   Description: Refetches events from all event sources.
*   **`dateFromPoint(x: number, y: number)`**:
    *   Returns: `{date: Date, resource?: Resource object} | null`
    *   Description: Gets date/resource from pixel coordinates relative to calendar container.
*   **`getView()`**:
    *   Returns: `View object`
    *   Description: Gets the current View object.
*   **`next()`**:
    *   Description: Navigates to the next date range.
*   **`prev()`**:
    *   Description: Navigates to the previous date range.
*   **`unselect()`**: (method version)
    *   Description: Clears the current date selection.

## Content Definition
`Content` can be:
*   A string of HTML.
*   A string of plain text (will be escaped).
*   An array of DOM nodes.
*   A single DOM node.
*   A function that returns any of the above.

## Event Object
Common properties:

*   **`id`**: `string` (Unique identifier)
*   **`allDay`**: `boolean` (If true, start/end times ignored)
*   **`start`**: `string` (ISO8601) or `Date`
*   **`end`**: `string` (ISO8601) or `Date` (exclusive)
*   **`title`**: `string`
*   **`editable`**: `boolean` (Overrides global `editable`)
*   **`startEditable`**: `boolean`
*   **`durationEditable`**: `boolean`
*   **`backgroundColor`**: `string` (CSS color)
*   **`borderColor`**: `string` (CSS color)
*   **`textColor`**: `string` (CSS color)
*   **`classNames`**: `string` or `array` of strings
*   **`display`**: `string` (`'auto'`, `'block'`, `'list-item'`, `'background'`, `'inverse-background'`, `'none'`)
*   **`resourceId`**: `string`
*   **`resourceIds`**: `array` of `string`
*   **`extendedProps`**: `object` (Custom data)

**Parsing:** Plain objects are parsed into Event objects. Dates from ISO8601 strings or Date objects.

## Duration Object
Represents a time span. Parsed from:
*   ISO8601 duration string (e.g., `'P2DT12H30M'`).
*   Time string (e.g., `'24:00:00'`, `'1.00:00:00'`).
*   Integer (milliseconds).
*   Object (e.g., `{days: 1, hours: 12}`). Keys: `years`, `months`, `weeks`, `days`, `hours`, `minutes`, `seconds`, `milliseconds`.

## Resource Object
*   **`id`**: `string` (Unique identifier)
*   **`title`**: `string`
*   **`eventBackgroundColor`**: `string`
*   **`eventBorderColor`**: `string`
*   **`eventTextColor`**: `string`
*   **`eventClassNames`**: `string` or `array`
*   **`children`**: `array` of Resource objects
*   **`parentId`**: `string`
*   **`businessHours`**: `object` or `array` (Defines working hours)
*   **`extendedProps`**: `object`

**Parsing:** Plain objects are parsed into Resource objects.

## View Object
Represents the current calendar view. Properties include:
*   **`type`**: `string` (e.g., `'timeGridWeek'`)
*   **`title`**: `string` (Formatted title, e.g., "June 2025")
*   **`activeStart`**: `Date` (Start of view's date range)
*   **`activeEnd`**: `Date` (End of view's date range, exclusive)
*   **`currentStart`**: `Date` (Start of currently displayed interval)
*   **`currentEnd`**: `Date` (End of currently displayed interval, exclusive)

## Theming
Customize appearance by:
1.  Using `theme` option to map standard CSS class keys to custom classes.
2.  Overriding default CSS variables.
3.  Setting `theme: false` to remove built-in theming classes for manual styling.

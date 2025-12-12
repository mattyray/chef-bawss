# Chef Bawss — Complete Wireframes (v2)

---

## 1. Layout Shell

### Mobile (< 768px)

```
┌─────────────────────────────────┐
│  Business Name             [◯]  │
├─────────────────────────────────┤
│                                 │
│                                 │
│                                 │
│         Page Content            │
│                                 │
│                                 │
│                                 │
│                                 │
├─────────────────────────────────┤
│ [◇]    [▢]    [+]   [◯]   [•••]│
│ Home  Calendar Add  Clients More│
└─────────────────────────────────┘
```

**Header**
- Business name (left)
- Profile avatar (right) → tapping opens dropdown: Settings, Log Out

**Bottom Tab Bar (Admin)**
- Dashboard (home icon)
- Calendar (calendar icon)
- Add Event (plus icon, center, prominent/raised)
- Clients (people icon)
- More (three dots) → Chefs, Finances, Settings

**Bottom Tab Bar (Chef)**
- Dashboard (home icon)
- Calendar (calendar icon)
- Events (list icon)
- Profile (user icon)

---

### Desktop (≥ 768px)

```
┌────────────────────────────────────────────────────────────────────┐
│ [≡] Chef Bawss                                      [Profile ▾]    │
├────────────┬───────────────────────────────────────────────────────┤
│            │                                                       │
│  ◇ Dashboard                                                       │
│  ▢ Calendar│                                                       │
│  ☰ Events  │                  Page Content                         │
│  ◯ Clients │                                                       │
│  ◎ Chefs   │                                                       │
│  $ Finances│                                                       │
│            │                                                       │
│            │                                                       │
│ ───────────│                                                       │
│  ⚙ Settings│                                                       │
└────────────┴───────────────────────────────────────────────────────┘
```

**Sidebar**
- Collapse toggle at top (hamburger icon)
- Logo/app name
- Main nav with icons + labels
- Settings pinned to bottom
- Active page highlighted
- Collapsed state shows icons only

**Header**
- Collapse toggle
- App name or business name
- Profile dropdown (right): Settings, Log Out

---

## 2. Admin Dashboard

### Mobile

```
┌─────────────────────────────────┐
│  Robyn's Kitchen           [◯]  │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐    │
│  │      December 2024      │    │
│  │  Su Mo Tu We Th Fr Sa   │    │
│  │   1  2  3  4  5  6  7   │    │
│  │   8  9 10 11 12 13 ●    │    │
│  │  15 ● 17 18 19 20 21    │    │
│  │  22 23 ● 25 26 27 28    │    │
│  │  29 30 31               │    │
│  └─────────────────────────┘    │
│   Tap to view full calendar     │
│                                 │
│  This Month                     │
│  ┌───────────┬───────────┐      │
│  │ $12,400   │ $8,200    │      │
│  │ Revenue   │ Paid Out  │      │
│  ├───────────┼───────────┤      │
│  │ $4,200    │ 14        │      │
│  │ Profit    │ Events    │      │
│  └───────────┴───────────┘      │
│                                 │
│  Upcoming Events                │
│  ┌─────────────────────────┐    │
│  │ ● Dec 14 · 6pm          │    │
│  │   Johnson Holiday Party │    │
│  │   Chef: Maria           │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ ● Dec 16 · 7pm          │    │
│  │   Smith Anniversary     │    │
│  │   Chef: Marcus          │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ ○ Dec 18 · 5pm          │    │
│  │   Chen Corporate        │    │
│  │   Chef: —               │    │
│  └─────────────────────────┘    │
│                                 │
│  [View All Events →]            │
│                                 │
├─────────────────────────────────┤
│ [◇]   [▢]    [+]   [◯]   [•••] │
└─────────────────────────────────┘
```

**Mini Calendar**
- Current month grid
- Days with events show colored dot (chef's color)
- Multiple events on same day = multiple dots or stacked
- Tap anywhere → navigates to full Calendar page

**Stats Cards**
- 2x2 grid
- Revenue, Paid Out, Profit, Event Count (all this month)

**Upcoming Events**
- List of next 3-5 events
- Colored dot = chef color (gray if unassigned)
- Shows: date, time, client/event name, chef name
- Tap card → Event detail page
- "View All Events" link at bottom

---

### Desktop

```
┌────────────┬───────────────────────────────────────────────────────────────┐
│            │  Dashboard                                                    │
│  Sidebar   │                                                               │
│            │  ┌──────────────┐  ┌──────────┬──────────┬──────────┬───────┐ │
│            │  │ December 2024│  │ $12,400  │  $8,200  │  $4,200  │  14   │ │
│            │  │ Su Mo Tu We  │  │ Revenue  │ Paid Out │  Profit  │Events │ │
│            │  │  1  2  3  4  │  └──────────┴──────────┴──────────┴───────┘ │
│            │  │  8  9 10 11  │                                             │
│            │  │ 15 ● 17 18   │  Upcoming Events                            │
│            │  │ 22 23 ● 25   │  ┌─────────────────────────────────────────┐│
│            │  │ 29 30 31     │  │ ● Dec 14 · 6pm · Johnson Holiday Party  ││
│            │  └──────────────┘  │   Maria Santos                   $2,400 ││
│            │   Click for        └─────────────────────────────────────────┘│
│            │   full calendar    ┌─────────────────────────────────────────┐│
│            │                    │ ● Dec 16 · 7pm · Smith Anniversary      ││
│            │                    │   Marcus Thompson                $1,800 ││
│            │                    └─────────────────────────────────────────┘│
│            │                    ┌─────────────────────────────────────────┐│
│            │                    │ ○ Dec 18 · 5pm · Chen Corporate         ││
│            │                    │   Unassigned                     $4,200 ││
│            │                    └─────────────────────────────────────────┘│
│            │                                                               │
│            │  Recently Completed                                           │
│            │  ┌─────────────────────────────────────────────────────────┐  │
│            │  │ ✓ Dec 10 · Chen Dinner · Maria Santos · $2,200         │  │
│            │  └─────────────────────────────────────────────────────────┘  │
└────────────┴───────────────────────────────────────────────────────────────┘
```

**Layout**
- Mini calendar top-left (clickable → Calendar page)
- Stats row top-right (4 horizontal cards)
- Upcoming events list
- Recently completed section

---

## 3. Chef Dashboard

### Mobile

```
┌─────────────────────────────────┐
│  Robyn's Kitchen           [◯]  │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐    │
│  │      December 2024      │    │
│  │  Su Mo Tu We Th Fr Sa   │    │
│  │   1  2  3  4  5  6  7   │    │
│  │   8  9 10 11 12 13 ●    │    │
│  │  15 16 17 18 ● 20 21    │    │
│  │  22 23 24 25 26 27 28   │    │
│  │  29 30 31               │    │
│  └─────────────────────────┘    │
│   Tap to view full calendar     │
│                                 │
│  My Earnings                    │
│  ┌───────────┬───────────┐      │
│  │ $2,400    │ $18,600   │      │
│  │ This Month│ This Year │      │
│  └───────────┴───────────┘      │
│                                 │
│  My Upcoming Events             │
│  ┌─────────────────────────┐    │
│  │ Dec 14 · Saturday       │    │
│  │ 6:00 PM - 10:00 PM      │    │
│  │ Johnson Holiday Party   │    │
│  │ 123 Oak Street          │    │
│  │ 24 guests               │    │
│  │                         │    │
│  │ Your pay: $350          │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Dec 19 · Thursday       │    │
│  │ 7:00 PM - 10:00 PM      │    │
│  │ Martinez Birthday       │    │
│  │ 456 Pine Avenue         │    │
│  │ 12 guests               │    │
│  │                         │    │
│  │ Your pay: $275          │    │
│  └─────────────────────────┘    │
│                                 │
├─────────────────────────────────┤
│ [◇]    [▢]     [☰]      [◯]    │
│ Home  Calendar Events  Profile  │
└─────────────────────────────────┘
```

**Mini Calendar**
- Same component as admin
- Only shows dots for THIS chef's assigned events
- Tap → Calendar page (filtered to their events)

**Earnings Cards**
- This Month / This Year (YTD)

**Upcoming Events**
- More detail since chef needs logistics
- Date with day name, time range, event name, address, guest count, their pay
- Tap → Event detail

**Chef NEVER sees:** client pay, profit, other chefs' info, internal notes

---

### Desktop

Same layout as admin desktop:
- Mini calendar top-left
- Earnings cards top-right (2 cards instead of 4)
- Upcoming events list with more detail per card

---

## 4. Calendar Page (Google Calendar Style)

### Desktop — Full View

```
┌────────────┬────────────────────────────────────────────────────────────────┐
│            │  [<]  December 2024  [>]      [Today]       [Month][Week][Day] │
│  Dashboard ├────────────────────────────────────────────────────────────────┤
│  Calendar  │                                                                │
│  Events    │  ┌──────────────┐    Sun    Mon    Tue    Wed    Thu    Fri    │
│  Clients   │  │ December 2024│   ┌──────┬──────┬──────┬──────┬──────┬──────┐│
│  Chefs     │  │ Su Mo Tu We  │   │      │      │      │      │      │      ││
│  Finances  │  │  1  2  3  4  │   │  1   │  2   │  3   │  4   │  5   │  6   ││
│            │  │  8  9 10 11  │   │      │      │      │      │      │      ││
│            │  │ 15 16 17 18  │   ├──────┼──────┼──────┼──────┼──────┼──────┤│
│            │  │ 22 23 24 25  │   │      │      │      │      │      │      ││
│            │  │ 29 30 31     │   │  8   │  9   │  10  │  11  │  12  │  13  ││
│            │  └──────────────┘   │      │      │      │      │      │ ●━━━ ││
│  Settings  │                     ├──────┼──────┼──────┼──────┼──────┼──────┤│
│            │  ───────────────    │ ●━━━ │      │      │      │      │      ││
│            │                     │  14  │  15  │  16  │  17  │  18  │  19  ││
│            │  Show Chefs         │Johnson│     │ ●━━━ │      │      │      ││
│            │  ┌──────────────┐   ├──────┼──────┼──────┼──────┼──────┼──────┤│
│            │  │[✓] ● Maria   │   │      │      │      │      │      │      ││
│            │  │[✓] ● Marcus  │   │  21  │  22  │  23  │  24  │  25  │  26  ││
│            │  │[✓] ● Jessica │   │      │      │ ●━━━ │      │      │      ││
│            │  │[✓] ○ Unassign│   ├──────┼──────┼──────┼──────┼──────┼──────┤│
│            │  └──────────────┘   │      │      │      │      │      │      ││
│            │                     │  28  │  29  │  30  │  31  │      │      ││
│            │                     │      │      │      │      │      │      ││
│            │                     └──────┴──────┴──────┴──────┴──────┴──────┘│
└────────────┴────────────────────────────────────────────────────────────────┘
```

**Left Sidebar (within calendar page)**
- Mini month calendar
  - Click any date → main calendar jumps to that date
  - Current day highlighted
  - Days with events have subtle indicator
- Chef filter checkboxes
  - Each chef has colored checkbox
  - Unchecking hides their events from view
  - "Unassigned" filter for events without chef
  - Admin only (chefs only see their own events anyway)

**Top Bar**
- Prev/Next month arrows
- Current month/year display
- Today button (jumps to current date)
- View toggle: Month / Week / Day

**Calendar Grid**
- Events show as colored bars/pills
- Color = assigned chef's color
- Gray = unassigned
- Event text truncates if too long
- Multiple events per day stack vertically

---

### Desktop — Week View

```
┌────────────┬────────────────────────────────────────────────────────────────┐
│            │  [<]  Dec 15-21, 2024  [>]    [Today]       [Month][Week][Day] │
│  Sidebar   ├────────────────────────────────────────────────────────────────┤
│            │        Sun 15   Mon 16   Tue 17   Wed 18   Thu 19   Fri 20    │
│  Mini Cal  │       ┌────────┬────────┬────────┬────────┬────────┬────────┐  │
│            │  12pm │        │        │        │        │        │        │  │
│  ────────  │       │        │        │        │        │        │        │  │
│            │   1pm │        │        │        │        │        │        │  │
│  Filters   │       │        │        │        │        │        │        │  │
│            │   2pm │        │        │        │        │        │        │  │
│            │       │        │        │        │        │        │        │  │
│            │   3pm │        │        │        │        │        │        │  │
│            │       │        │        │        │        │        │        │  │
│            │   4pm │        │        │        │        │        │        │  │
│            │       │        │        │        │        │        │        │  │
│            │   5pm │        │        │ ●━━━━━ │        │        │        │  │
│            │       │        │        │ Chen   │        │        │        │  │
│            │   6pm │ ●━━━━━ │        │ Corp   │        │        │        │  │
│            │       │ Johnson│        │ ━━━━━━ │        │        │        │  │
│            │   7pm │ Holiday│ ●━━━━━ │ ━━━━━━ │        │        │        │  │
│            │       │ ━━━━━━ │ Smith  │ ━━━━━━ │        │        │        │  │
│            │   8pm │ ━━━━━━ │ Anniv  │ ━━━━━━ │        │        │        │  │
│            │       │ ━━━━━━ │ ━━━━━━ │        │        │        │        │  │
│            │   9pm │ ━━━━━━ │ ━━━━━━ │        │        │        │        │  │
│            │       │ ━━━━━━ │        │        │        │        │        │  │
│            │  10pm │        │        │        │        │        │        │  │
│            │       └────────┴────────┴────────┴────────┴────────┴────────┘  │
└────────────┴────────────────────────────────────────────────────────────────┘
```

**Week View Features**
- Time slots on left (scrollable)
- Events span their actual duration visually
- Click-drag empty space to select time range → opens create form
- Drag event to different day/time → moves event
- Drag event edge up/down → resize duration

---

### Desktop — Day View

```
┌────────────┬────────────────────────────────────────────────────────────────┐
│            │  [<]  Sunday, December 15  [>]  [Today]     [Month][Week][Day] │
│  Sidebar   ├────────────────────────────────────────────────────────────────┤
│            │                                                                │
│  Mini Cal  │                    Sunday, Dec 15                              │
│            │       ┌────────────────────────────────────────────────────┐   │
│  ────────  │  12pm │                                                    │   │
│            │       │                                                    │   │
│  Filters   │   1pm │                                                    │   │
│            │       │                                                    │   │
│            │   2pm │                                                    │   │
│            │       │                                                    │   │
│            │   3pm │                                                    │   │
│            │       │                                                    │   │
│            │   4pm │                                                    │   │
│            │       │                                                    │   │
│            │   5pm │                                                    │   │
│            │       │                                                    │   │
│            │   6pm │ ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│            │       │ Johnson Holiday Party                              │   │
│            │   7pm │ Maria Santos · 24 guests                           │   │
│            │       │ 123 Oak Street, Brooklyn                           │   │
│            │   8pm │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│            │       │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│            │   9pm │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│            │       │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│            │  10pm │                                                    │   │
│            │       └────────────────────────────────────────────────────┘   │
└────────────┴────────────────────────────────────────────────────────────────┘
```

**Day View Features**
- Single day focus
- Events show more detail inline
- Same drag interactions as week view

---

### Click Event → Quick Popup

```
                         ┌────────────────────────────────┐
                         │ Johnson Holiday Party       [x]│
                         │                                │
                         │ ● Maria Santos                 │
                         │                                │
                         │ Sat, Dec 14                    │
                         │ 6:00 PM - 10:00 PM             │
                         │                                │
                         │ 123 Oak Street, Brooklyn       │
                         │ 24 guests                      │
                         │                                │
                         │ ┌────────────┐ ┌────────────┐  │
                         │ │   View     │ │    Edit    │  │
                         │ └────────────┘ └────────────┘  │
                         └────────────────────────────────┘
```

**Popup Behavior**
- Single click event → shows popup near the event
- Quick summary: title, chef, datetime, location, guests
- "View" → opens side panel with full details
- "Edit" → opens edit form
- Click outside or X → closes popup
- Admin sees both buttons; chef sees only "View"

---

### Side Panel (Full Details)

```
┌────────────┬─────────────────────────────────────┬──────────────────────────┐
│            │                                     │  Johnson Holiday     [x] │
│  Sidebar   │                                     │  ● Upcoming              │
│            │         Calendar Grid               │                          │
│            │         (still visible)             │  Sat, December 14, 2024  │
│            │                                     │  6:00 PM - 10:00 PM      │
│            │                                     │                          │
│            │                                     │  123 Oak Street          │
│            │                                     │  Brooklyn, NY 11201      │
│            │                                     │  [View Map]              │
│            │                                     │                          │
│            │                                     │  ────────────────────    │
│            │                                     │                          │
│            │                                     │  Client                  │
│            │                                     │  Sarah Johnson           │
│            │                                     │  sarah@email.com    [→]  │
│            │                                     │  (555) 123-4567     [→]  │
│            │                                     │                          │
│            │                                     │  ────────────────────    │
│            │                                     │                          │
│            │                                     │  24 guests               │
│            │                                     │  Allergies: Shellfish    │
│            │                                     │                          │
│            │                                     │  ────────────────────    │
│            │                                     │                          │
│            │                                     │  Chef: Maria Santos      │
│            │                                     │  Chef Pay: $350          │
│            │                                     │                          │
│            │                                     │  ────────────────────    │
│            │                                     │                          │
│            │                                     │  Client Pays: $2,400     │
│            │                                     │  Profit: $2,050          │
│            │                                     │                          │
│            │                                     │  ────────────────────    │
│            │                                     │                          │
│            │                                     │  [Edit]  [Mark Complete] │
│            │                                     │                          │
└────────────┴─────────────────────────────────────┴──────────────────────────┘
```

**Side Panel Behavior**
- Opens from right edge
- Calendar remains visible and interactive
- Can navigate calendar while panel is open
- X or click outside → closes panel
- Admin sees all fields + Edit button
- Chef sees limited fields, no Edit button

---

### Mobile — Month View

```
┌─────────────────────────────────┐
│  Calendar              [Today]  │
├─────────────────────────────────┤
│  [<]    December 2024     [>]   │
├─────────────────────────────────┤
│  Su   Mo   Tu   We   Th   Fr  Sa│
├─────────────────────────────────┤
│   1    2    3    4    5    6   7│
│                                 │
├─────────────────────────────────┤
│   8    9   10   11   12   13  14│
│                                ●│
├─────────────────────────────────┤
│  15   16   17   18   19   20  21│
│   ●    ●                        │
├─────────────────────────────────┤
│  22   23   24   25   26   27  28│
│             ●                   │
├─────────────────────────────────┤
│  29   30   31                   │
│                                 │
├─────────────────────────────────┤
│                                 │
│  December 14                    │
│  ┌─────────────────────────┐    │
│  │ ● 6pm - Johnson Holiday │    │
│  │   Maria · 24 guests     │    │
│  └─────────────────────────┘    │
│                                 │
│  [Month]  [Week]  [Day]         │
│                                 │
├─────────────────────────────────┤
│ [◇]   [▢]    [+]   [◯]   [•••] │
└─────────────────────────────────┘
```

**Mobile Calendar Features**
- Compact month grid
- Dots on days with events
- Tap day → shows that day's events below the calendar
- Tap event card → full page event detail
- View toggle at bottom
- NO drag interactions (not practical on touch)

---

### Mobile — Week View

```
┌─────────────────────────────────┐
│  Calendar              [Today]  │
├─────────────────────────────────┤
│  [<]   Dec 15 - 21, 2024  [>]   │
├─────────────────────────────────┤
│       Su  Mo  Tu  We  Th  Fr  Sa│
│       15  16  17  18  19  20  21│
├─────────────────────────────────┤
│  12pm                           │
│   1pm                           │
│   2pm                           │
│   3pm                           │
│   4pm                           │
│   5pm          ●━               │
│   6pm  ●━      ━━               │
│   7pm  ━━  ●━  ━━               │
│   8pm  ━━  ━━                   │
│   9pm  ━━  ━━                   │
│  10pm                           │
├─────────────────────────────────┤
│  [Month]  [Week]  [Day]         │
├─────────────────────────────────┤
│ [◇]   [▢]    [+]   [◯]   [•••] │
└─────────────────────────────────┘
```

**Mobile Week Features**
- Scrollable time grid
- Tap event → full page detail
- Tap empty space → nothing (use + button to create)

---

### Mobile — Day View

```
┌─────────────────────────────────┐
│  Calendar              [Today]  │
├─────────────────────────────────┤
│  [<]  Sunday, Dec 15, 2024 [>]  │
├─────────────────────────────────┤
│                                 │
│  12pm                           │
│                                 │
│   1pm                           │
│                                 │
│   2pm                           │
│                                 │
│   3pm                           │
│                                 │
│   4pm                           │
│                                 │
│   5pm                           │
│                                 │
│   6pm  ┌─────────────────────┐  │
│        │ ● Johnson Holiday   │  │
│   7pm  │   Party             │  │
│        │   Maria Santos      │  │
│   8pm  │   123 Oak Street    │  │
│        │                     │  │
│   9pm  │                     │  │
│        └─────────────────────┘  │
│  10pm                           │
│                                 │
├─────────────────────────────────┤
│  [Month]  [Week]  [Day]         │
├─────────────────────────────────┤
│ [◇]   [▢]    [+]   [◯]   [•••] │
└─────────────────────────────────┘
```

---

### Calendar Interaction Summary

| Interaction | Desktop | Mobile |
|-------------|---------|--------|
| Click event | Quick popup | Full page detail |
| View details | Side panel | Full page detail |
| Click empty day (month) | Create event form | Nothing (use + button) |
| Click-drag time range | Create event form | Not supported |
| Drag event to move | Updates event | Not supported |
| Drag edge to resize | Updates duration | Not supported |
| Filter by chef | Checkbox toggles | Not available |

---

## 5. Events List

### Mobile

```
┌─────────────────────────────────┐
│  Events                   [+]   │
├─────────────────────────────────┤
│ [All ▾]  [All Chefs ▾] [Search] │
├─────────────────────────────────┤
│                                 │
│  December 2024                  │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ● Sat, Dec 14 · 6pm     │    │
│  │   Johnson Holiday Party │    │
│  │   Maria · 24 guests     │    │
│  │                  $2,400 │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ● Mon, Dec 16 · 7pm     │    │
│  │   Smith Anniversary     │    │
│  │   Marcus · 12 guests    │    │
│  │                  $1,800 │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ○ Wed, Dec 18 · 5pm     │    │
│  │   Chen Corporate        │    │
│  │   Unassigned · 40 guests│    │
│  │                  $4,200 │    │
│  └─────────────────────────┘    │
│                                 │
│  November 2024                  │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ✓ Sat, Nov 30 · 7pm     │    │
│  │   Williams Wedding      │    │
│  │   Maria · 80 guests     │    │
│  │                  $5,500 │    │
│  └─────────────────────────┘    │
│                                 │
├─────────────────────────────────┤
│ [◇]   [▢]    [+]   [◯]   [•••] │
└─────────────────────────────────┘
```

**Header**
- Title
- Add button (admin only)

**Filters**
- Status: All, Upcoming, Completed, Cancelled
- Chef: All Chefs, or specific chef (admin only)
- Search: by client/event name

**List**
- Grouped by month
- Each card: colored dot, date/time, name, chef, guests, amount
- Completed events show checkmark
- Tap → Event detail

**Chef View**
- Only sees their events
- No chef filter
- Shows their pay, not client pay

---

### Desktop

```
┌────────────┬───────────────────────────────────────────────────────────────┐
│            │  Events                                            [+ Add]    │
│  Sidebar   ├───────────────────────────────────────────────────────────────┤
│            │  [Status ▾]  [Chef ▾]  [Date Range ▾]           [Search...]   │
│            ├───────────────────────────────────────────────────────────────┤
│            │                                                               │
│            │  Date          Event                Chef      Guests  Amount  │
│            │  ─────────────────────────────────────────────────────────────│
│            │  ● Dec 14      Johnson Holiday      Maria        24   $2,400  │
│            │  ● Dec 16      Smith Anniversary    Marcus       12   $1,800  │
│            │  ○ Dec 18      Chen Corporate       —            40   $4,200  │
│            │  ✓ Nov 30      Williams Wedding     Maria        80   $5,500  │
│            │  ✓ Nov 22      Parker Engagement    Jessica      30   $2,800  │
│            │                                                               │
└────────────┴───────────────────────────────────────────────────────────────┘
```

- Table format
- Sortable columns
- Click row → side panel or full page detail

---

## 6. Event Detail

### Mobile (Admin View)

```
┌─────────────────────────────────┐
│  [←]  Event Detail      [Edit]  │
├─────────────────────────────────┤
│                                 │
│  Johnson Holiday Party          │
│  ● Upcoming                     │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Date & Time                    │
│  Saturday, December 14, 2024    │
│  6:00 PM - 10:00 PM             │
│                                 │
│  Location                       │
│  123 Oak Street                 │
│  Brooklyn, NY 11201             │
│  [View Map]                     │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Client                         │
│  Sarah Johnson                  │
│  sarah@email.com           [→]  │
│  (555) 123-4567            [→]  │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Details                        │
│  Guests: 24                     │
│  Allergies: Shellfish, Tree nuts│
│                                 │
│  Menu Notes                     │
│  Holiday dinner, 4 courses.     │
│  Client wants beef wellington   │
│  as main course.                │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Assigned Chef                  │
│  ┌─────────────────────────┐    │
│  │ ● Maria Santos          │    │
│  │   maria@email.com  [→]  │    │
│  │   (555) 987-6543   [→]  │    │
│  │   Pay: $350             │    │
│  └─────────────────────────┘    │
│  [Change Chef]                  │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Financials                     │
│  Client Pays:     $2,400        │
│  Chef Pay:        $350          │
│  Profit:          $2,050        │
│                                 │
│  Deposit:         $800          │
│  [✓] Deposit Received           │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Internal Notes (admin only)    │
│  VIP client, referred by Smith. │
│  Very particular about timing.  │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Chef Notes                     │
│  Confirmed menu with client.    │
│  Will arrive at 3pm for prep.   │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  [Mark Complete]                │
│                                 │
│  [Cancel Event]                 │
│                                 │
├─────────────────────────────────┤
│ [◇]   [▢]    [+]   [◯]   [•••] │
└─────────────────────────────────┘
```

---

### Mobile (Chef View)

```
┌─────────────────────────────────┐
│  [←]  Event Detail              │
├─────────────────────────────────┤
│                                 │
│  Johnson Holiday Party          │
│  ● Upcoming                     │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Date & Time                    │
│  Saturday, December 14, 2024    │
│  6:00 PM - 10:00 PM             │
│                                 │
│  Location                       │
│  123 Oak Street                 │
│  Brooklyn, NY 11201             │
│  [View Map]                     │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Client                         │
│  Sarah Johnson                  │
│  sarah@email.com           [→]  │
│  (555) 123-4567            [→]  │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Details                        │
│  Guests: 24                     │
│  Allergies: Shellfish, Tree nuts│
│                                 │
│  Menu Notes                     │
│  Holiday dinner, 4 courses.     │
│  Client wants beef wellington   │
│  as main course.                │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Your Pay                       │
│  $350                           │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  My Notes                       │
│  ┌─────────────────────────┐    │
│  │ Confirmed menu with     │    │
│  │ client. Will arrive at  │    │
│  │ 3pm for prep.           │    │
│  │                    [Edit]│    │
│  └─────────────────────────┘    │
│                                 │
├─────────────────────────────────┤
│ [◇]    [▢]     [☰]      [◯]    │
└─────────────────────────────────┘
```

**Chef sees:**
- Date, time, location
- Client contact info (needs it for the job)
- Guest count, allergies, menu notes
- Their own pay
- Chef notes (editable)

**Chef does NOT see:**
- Client pay
- Profit
- Internal notes
- Change chef / Mark complete / Cancel buttons

---

### Desktop

Two-column layout in side panel or full page:
- Left: Date/time, location, client info, details, menu notes
- Right: Chef assignment, financials, notes, actions

---

## 7. Create/Edit Event Form

### Mobile

```
┌─────────────────────────────────┐
│  [×]  New Event         [Save]  │
├─────────────────────────────────┤
│                                 │
│  Client *                       │
│  ┌─────────────────────────┐    │
│  │ Select client...      ▾ │    │
│  └─────────────────────────┘    │
│  [+ Add New Client]             │
│                                 │
│  Event Name                     │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  └─────────────────────────┘    │
│  Optional - defaults to         │
│  "[Client Name] Event"          │
│                                 │
│  Date *                         │
│  ┌─────────────────────────┐    │
│  │ December 14, 2024     ▾ │    │
│  └─────────────────────────┘    │
│                                 │
│  Start Time *                   │
│  ┌─────────────────────────┐    │
│  │ 6:00 PM               ▾ │    │
│  └─────────────────────────┘    │
│                                 │
│  End Time                       │
│  ┌─────────────────────────┐    │
│  │ 10:00 PM              ▾ │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Location                       │
│  [✓] Same as client address     │
│  ┌─────────────────────────┐    │
│  │ 123 Oak Street          │    │
│  │ Brooklyn, NY 11201      │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Number of Guests *             │
│  ┌─────────────────────────┐    │
│  │ 24                      │    │
│  └─────────────────────────┘    │
│                                 │
│  Allergies / Dietary            │
│  From client: Shellfish         │
│  ┌─────────────────────────┐    │
│  │ Add event-specific...   │    │
│  └─────────────────────────┘    │
│                                 │
│  Menu Notes                     │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Assign Chef                    │
│  ┌─────────────────────────┐    │
│  │ Select chef...        ▾ │    │
│  └─────────────────────────┘    │
│                                 │
│  Chef Pay                       │
│  ┌─────────────────────────┐    │
│  │ $                       │    │
│  └─────────────────────────┘    │
│  Maria's default: $45/hr        │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Client Pays *                  │
│  ┌─────────────────────────┐    │
│  │ $2,400                  │    │
│  └─────────────────────────┘    │
│                                 │
│  Deposit Amount                 │
│  ┌─────────────────────────┐    │
│  │ $800                    │    │
│  └─────────────────────────┘    │
│                                 │
│  [ ] Deposit Received           │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Internal Notes                 │
│  ┌─────────────────────────┐    │
│  │ Admin only...           │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  [Delete Event]                 │
│  (only shown when editing)      │
│                                 │
├─────────────────────────────────┤
│ [◇]   [▢]    [+]   [◯]   [•••] │
└─────────────────────────────────┘
```

**Smart Defaults**
- Selecting client auto-fills address and allergies
- Selecting chef shows their default pay rate as hint
- "Same as client address" checkbox

**Required Fields**
- Client
- Date
- Start time
- Guest count
- Client pay

---

### Desktop

Same form in modal or side panel, two columns:
- Left: Event details (client, date, time, location, guests, menu)
- Right: Assignment and financials (chef, pay, deposit, notes)

---

## 8. Clients List

### Mobile

```
┌─────────────────────────────────┐
│  Clients                  [+]   │
├─────────────────────────────────┤
│ ┌─────────────────────────┐     │
│ │ Search clients...       │     │
│ └─────────────────────────┘     │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐    │
│  │ Sarah Johnson           │    │
│  │ sarah@email.com         │    │
│  │ 3 events                │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Michael Smith           │    │
│  │ mike@email.com          │    │
│  │ 7 events                │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ David Chen              │    │
│  │ dchen@company.com       │    │
│  │ 2 events                │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Lisa Martinez           │    │
│  │ lisa.m@email.com        │    │
│  │ 1 event                 │    │
│  └─────────────────────────┘    │
│                                 │
├─────────────────────────────────┤
│ [◇]   [▢]    [+]   [◯]   [•••] │
└─────────────────────────────────┘
```

- Search bar
- Simple cards: name, email, event count
- Tap → Client detail
- Add button (admin only)
- Chef can view but not add/edit

---

### Desktop

Table: Name, Email, Phone, Events, Added Date

---

## 9. Client Detail

### Mobile (Admin)

```
┌─────────────────────────────────┐
│  [←]  Client            [Edit]  │
├─────────────────────────────────┤
│                                 │
│  Sarah Johnson                  │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Contact                        │
│  sarah@email.com           [→]  │
│  (555) 123-4567            [→]  │
│                                 │
│  Address                        │
│  123 Oak Street                 │
│  Brooklyn, NY 11201             │
│  [View Map]                     │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Allergies / Dietary            │
│  Shellfish, Tree nuts           │
│                                 │
│  Notes                          │
│  Prefers organic ingredients.   │
│  Always tips well.              │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Events (3)                     │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ● Dec 14 · Holiday Party│    │
│  │   Maria · $2,400        │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ✓ Aug 22 · Summer BBQ   │    │
│  │   Marcus · $1,600       │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ✓ Mar 15 · Birthday     │    │
│  │   Maria · $2,100        │    │
│  └─────────────────────────┘    │
│                                 │
│  Total Revenue: $6,100          │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  [+ Create Event for Client]    │
│                                 │
│  [Delete Client]                │
│                                 │
├─────────────────────────────────┤
│ [◇]   [▢]    [+]   [◯]   [•••] │
└─────────────────────────────────┘
```

---

### Mobile (Chef)

Same but without:
- Edit button
- Revenue totals
- Create Event button
- Delete button

Chef can still see contact info (they need it for events).

---

## 10. Create/Edit Client Form

### Mobile

```
┌─────────────────────────────────┐
│  [×]  New Client        [Save]  │
├─────────────────────────────────┤
│                                 │
│  Name *                         │
│  ┌─────────────────────────┐    │
│  │ Sarah Johnson           │    │
│  └─────────────────────────┘    │
│                                 │
│  Email                          │
│  ┌─────────────────────────┐    │
│  │ sarah@email.com         │    │
│  └─────────────────────────┘    │
│                                 │
│  Phone                          │
│  ┌─────────────────────────┐    │
│  │ (555) 123-4567          │    │
│  └─────────────────────────┘    │
│                                 │
│  Address                        │
│  ┌─────────────────────────┐    │
│  │ 123 Oak Street          │    │
│  │ Brooklyn, NY 11201      │    │
│  └─────────────────────────┘    │
│                                 │
│  Allergies / Dietary            │
│  ┌─────────────────────────┐    │
│  │ Shellfish, Tree nuts    │    │
│  └─────────────────────────┘    │
│                                 │
│  Notes                          │
│  ┌─────────────────────────┐    │
│  │ Prefers organic...      │    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
├─────────────────────────────────┤
│ [◇]   [▢]    [+]   [◯]   [•••] │
└─────────────────────────────────┘
```

---

## 11. Chefs List (Admin Only)

### Mobile

```
┌─────────────────────────────────┐
│  Chefs                    [+]   │
├─────────────────────────────────┤
│ ┌─────────────────────────┐     │
│ │ Search chefs...         │     │
│ └─────────────────────────┘     │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐    │
│  │ ● Maria Santos          │    │
│  │   $45/hr · Active       │    │
│  │   12 events this year   │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ● Marcus Thompson       │    │
│  │   $40/hr · Active       │    │
│  │   8 events this year    │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ ○ Jessica Lee           │    │
│  │   $50/hr · Inactive     │    │
│  │   3 events this year    │    │
│  └─────────────────────────┘    │
│                                 │
├─────────────────────────────────┤
│ [◇]   [▢]    [+]   [◯]   [•••] │
└─────────────────────────────────┘
```

- Colored dot = chef's calendar color
- Shows default pay rate, status, event count
- Tap → Chef detail

---

## 12. Chef Detail (Admin Only)

### Mobile

```
┌─────────────────────────────────┐
│  [←]  Chef              [Edit]  │
├─────────────────────────────────┤
│                                 │
│  ● Maria Santos                 │
│    Active                       │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Contact                        │
│  maria@email.com           [→]  │
│  (555) 987-6543            [→]  │
│                                 │
│  Address                        │
│  456 Chef Lane                  │
│  Queens, NY 11375               │
│                                 │
│  Default Pay Rate               │
│  $45/hr                         │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Notes (private)                │
│  Very reliable. Great with      │
│  large parties. Prefers         │
│  weekend events.                │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Stats                          │
│  ┌───────────┬───────────┐      │
│  │ 12        │ $5,400    │      │
│  │ Events    │ Paid YTD  │      │
│  └───────────┴───────────┘      │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Upcoming Events                │
│  ┌─────────────────────────┐    │
│  │ Dec 14 · Johnson Holiday│    │
│  │ $350                    │    │
│  └─────────────────────────┘    │
│                                 │
│  [View All Events]              │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  [Deactivate Chef]              │
│                                 │
├─────────────────────────────────┤
│ [◇]   [▢]    [+]   [◯]   [•••] │
└─────────────────────────────────┘
```

---

## 13. Invite Chef Form (Admin Only)

### Mobile

```
┌─────────────────────────────────┐
│  [×]  Invite Chef       [Send]  │
├─────────────────────────────────┤
│                                 │
│  Email *                        │
│  ┌─────────────────────────┐    │
│  │ maria@email.com         │    │
│  └─────────────────────────┘    │
│                                 │
│  First Name *                   │
│  ┌─────────────────────────┐    │
│  │ Maria                   │    │
│  └─────────────────────────┘    │
│                                 │
│  Last Name *                    │
│  ┌─────────────────────────┐    │
│  │ Santos                  │    │
│  └─────────────────────────┘    │
│                                 │
│  Phone                          │
│  ┌─────────────────────────┐    │
│  │ (555) 987-6543          │    │
│  └─────────────────────────┘    │
│                                 │
│  Address                        │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  Default Pay Rate               │
│  ┌─────────────────────────┐    │
│  │ $45                     │    │
│  └─────────────────────────┘    │
│  per hour                       │
│                                 │
│  Notes (private)                │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  An invitation email will be    │
│  sent with a link to set up     │
│  their account.                 │
│                                 │
├─────────────────────────────────┤
│ [◇]   [▢]    [+]   [◯]   [•••] │
└─────────────────────────────────┘
```

---

## 14. Finances Page (Admin Only)

### Mobile

```
┌─────────────────────────────────┐
│  Finances                       │
├─────────────────────────────────┤
│  ┌─────────────────────────┐    │
│  │ This Month            ▾ │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Summary                        │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  │      $12,400            │    │
│  │      Revenue            │    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌───────────┬───────────┐      │
│  │ $8,200    │ $4,200    │      │
│  │ Paid Out  │ Profit    │      │
│  └───────────┴───────────┘      │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  By Chef                        │
│  ┌─────────────────────────┐    │
│  │ ● Maria Santos          │    │
│  │   6 events · $3,200     │    │
│  ├─────────────────────────┤    │
│  │ ● Marcus Thompson       │    │
│  │   4 events · $2,800     │    │
│  ├─────────────────────────┤    │
│  │ ● Jessica Lee           │    │
│  │   2 events · $2,200     │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Events                         │
│  ┌─────────────────────────┐    │
│  │ Dec 14 · Johnson        │    │
│  │ Revenue: $2,400         │    │
│  │ Chef: $350 · Profit: $2,050  │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ Dec 10 · Chen           │    │
│  │ Revenue: $4,200         │    │
│  │ Chef: $500 · Profit: $3,700  │
│  └─────────────────────────┘    │
│                                 │
├─────────────────────────────────┤
│ [◇]   [▢]    [+]   [◯]   [•••] │
└─────────────────────────────────┘
```

**Date Filter**
- This Month
- Last Month
- This Quarter
- This Year
- Custom Range

---

### Desktop

Add visualizations:
- Revenue over time chart
- Profit margin chart
- Chef utilization breakdown

---

## 15. Settings Page (Admin)

### Mobile

```
┌─────────────────────────────────┐
│  Settings                       │
├─────────────────────────────────┤
│                                 │
│  Business                       │
│  ┌─────────────────────────┐    │
│  │ Business Name           │    │
│  │ Robyn's Kitchen       → │    │
│  ├─────────────────────────┤    │
│  │ Timezone                │    │
│  │ Eastern Time          → │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Account                        │
│  ┌─────────────────────────┐    │
│  │ Your Profile           →│    │
│  ├─────────────────────────┤    │
│  │ Change Password        →│    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Notifications                  │
│  ┌─────────────────────────┐    │
│  │ Email Preferences      →│    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Support                        │
│  ┌─────────────────────────┐    │
│  │ Help / FAQ             →│    │
│  ├─────────────────────────┤    │
│  │ Contact Support        →│    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Log Out                 │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Danger Zone                    │
│  ┌─────────────────────────┐    │
│  │ Delete Account          │    │
│  └─────────────────────────┘    │
│                                 │
├─────────────────────────────────┤
│ [◇]   [▢]    [+]   [◯]   [•••] │
└─────────────────────────────────┘
```

---

## 16. Chef Profile (Chef's Own View)

### Mobile

```
┌─────────────────────────────────┐
│  Profile                [Edit]  │
├─────────────────────────────────┤
│                                 │
│           ┌─────┐               │
│           │  M  │               │
│           └─────┘               │
│        Maria Santos             │
│        Chef at Robyn's Kitchen  │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Contact                        │
│  ┌─────────────────────────┐    │
│  │ Email                   │    │
│  │ maria@email.com         │    │
│  ├─────────────────────────┤    │
│  │ Phone                   │    │
│  │ (555) 987-6543          │    │
│  └─────────────────────────┘    │
│                                 │
│  Address                        │
│  ┌─────────────────────────┐    │
│  │ 456 Chef Lane           │    │
│  │ Queens, NY 11375        │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  My Stats                       │
│  ┌───────────┬───────────┐      │
│  │ 12        │ $5,400    │      │
│  │ Events    │ Earned    │      │
│  │ This Year │ This Year │      │
│  └───────────┴───────────┘      │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Account                        │
│  ┌─────────────────────────┐    │
│  │ Change Password        →│    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Log Out                 │    │
│  └─────────────────────────┘    │
│                                 │
├─────────────────────────────────┤
│ [◇]    [▢]     [☰]      [◯]    │
└─────────────────────────────────┘
```

**Chef can edit:** name, email, phone, address
**Chef cannot see/edit:** pay rate, admin notes

---

## 17. Landing Page

### Mobile

```
┌─────────────────────────────────┐
│  Chef Bawss            [Login]  │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  │    [Hero Illustration   │    │
│  │     or App Screenshot]  │    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  Run Your Private Chef          │
│  Business Like a Bawss          │
│                                 │
│  Schedule events, assign        │
│  chefs, track payments —        │
│  all in one place.              │
│                                 │
│  ┌─────────────────────────┐    │
│  │    Get Started Free     │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Everything You Need            │
│                                 │
│  ┌─────────────────────────┐    │
│  │ [icon]                  │    │
│  │ Client Management       │    │
│  │ Contacts, addresses,    │    │
│  │ dietary restrictions.   │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ [icon]                  │    │
│  │ Chef Scheduling         │    │
│  │ Assign your team,       │    │
│  │ auto-notify them.       │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ [icon]                  │    │
│  │ Calendar View           │    │
│  │ Google Calendar style   │    │
│  │ event management.       │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ [icon]                  │    │
│  │ Financial Tracking      │    │
│  │ Revenue, expenses,      │    │
│  │ profit at a glance.     │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ [icon]                  │    │
│  │ Auto Reminders          │    │
│  │ Chefs get notified      │    │
│  │ before every event.     │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ [icon]                  │    │
│  │ Separate Portals        │    │
│  │ You see everything,     │    │
│  │ chefs see their jobs.   │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  How It Works                   │
│                                 │
│  ① Sign up and name your        │
│    business                     │
│                                 │
│  ② Add your clients and chefs   │
│                                 │
│  ③ Create events and assign     │
│    chefs                        │
│                                 │
│  ④ Track your money — we        │
│    handle the reminders         │
│                                 │
│  ┌─────────────────────────┐    │
│  │    Get Started Free     │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Support Development            │
│                                 │
│  Chef Bawss is free to use.     │
│  If it helps your business,     │
│  consider buying me a coffee.   │
│                                 │
│  ┌─────────────────────────┐    │
│  │    ☕ Support            │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  About · GitHub · Contact       │
│  Built by [Your Name]           │
│                                 │
└─────────────────────────────────┘
```

---

### Desktop

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Chef Bawss                                       [Login] [Get Started]  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Run Your Private Chef              ┌──────────────────────────────┐     │
│  Business Like a Bawss              │                              │     │
│                                     │    [App Screenshot or        │     │
│  Schedule events, assign            │     Hero Illustration]       │     │
│  chefs, track payments —            │                              │     │
│  all in one place.                  │                              │     │
│                                     └──────────────────────────────┘     │
│  ┌──────────────────┐                                                    │
│  │ Get Started Free │                                                    │
│  └──────────────────┘                                                    │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                         Everything You Need                              │
│                                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐              │
│  │     [icon]     │  │     [icon]     │  │     [icon]     │              │
│  │    Clients     │  │     Chefs      │  │    Calendar    │              │
│  │   Management   │  │   Scheduling   │  │      View      │              │
│  └────────────────┘  └────────────────┘  └────────────────┘              │
│                                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐              │
│  │     [icon]     │  │     [icon]     │  │     [icon]     │              │
│  │   Financial    │  │     Auto       │  │    Separate    │              │
│  │   Tracking     │  │   Reminders    │  │    Portals     │              │
│  └────────────────┘  └────────────────┘  └────────────────┘              │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  How It Works                                                            │
│                                                                          │
│      ①                  ②                  ③                  ④          │
│   Sign up &          Add your           Create &           Track $,      │
│   name biz           clients &          assign             we handle     │
│                      chefs              events             reminders     │
│                                                                          │
│                       ┌──────────────────┐                               │
│                       │ Get Started Free │                               │
│                       └──────────────────┘                               │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Support Development                                                     │
│  Chef Bawss is free. If it helps, consider supporting.                   │
│                                                                          │
│                        ┌─────────────────┐                               │
│                        │  ☕ Support      │                               │
│                        └─────────────────┘                               │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│  About · GitHub · Contact                          Built by [Your Name]  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 18. Auth Pages

### Login

```
┌─────────────────────────────────┐
│  [←]                            │
├─────────────────────────────────┤
│                                 │
│         Chef Bawss              │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Welcome back                   │
│                                 │
│  Email                          │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  Password                       │
│  ┌─────────────────────────┐    │
│  │ ••••••••           [👁]  │    │
│  └─────────────────────────┘    │
│  [Forgot password?]             │
│                                 │
│  ┌─────────────────────────┐    │
│  │        Log In           │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Don't have an account?         │
│  [Sign up]                      │
│                                 │
└─────────────────────────────────┘
```

---

### Register

```
┌─────────────────────────────────┐
│  [←]                            │
├─────────────────────────────────┤
│                                 │
│         Chef Bawss              │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Create your account            │
│                                 │
│  Business Name *                │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  Your Name *                    │
│  ┌────────────┬────────────┐    │
│  │ First      │ Last       │    │
│  └────────────┴────────────┘    │
│                                 │
│  Email *                        │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  Password *                     │
│  ┌─────────────────────────┐    │
│  │ ••••••••           [👁]  │    │
│  └─────────────────────────┘    │
│  Min 8 characters               │
│                                 │
│  Confirm Password *             │
│  ┌─────────────────────────┐    │
│  │ ••••••••                │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │     Create Account      │    │
│  └─────────────────────────┘    │
│                                 │
│  By signing up, you agree to    │
│  our Terms and Privacy Policy.  │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Already have an account?       │
│  [Log in]                       │
│                                 │
└─────────────────────────────────┘
```

---

### Forgot Password

```
┌─────────────────────────────────┐
│  [←]                            │
├─────────────────────────────────┤
│                                 │
│         Chef Bawss              │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Reset your password            │
│                                 │
│  Enter your email and we'll     │
│  send you a reset link.         │
│                                 │
│  Email                          │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │    Send Reset Link      │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  [← Back to login]              │
│                                 │
└─────────────────────────────────┘
```

---

### Set Password (Invitation / Reset)

```
┌─────────────────────────────────┐
│                                 │
├─────────────────────────────────┤
│                                 │
│         Chef Bawss              │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Set your password              │
│                                 │
│  Welcome, Maria! Create a       │
│  password to access your        │
│  account.                       │
│                                 │
│  Password                       │
│  ┌─────────────────────────┐    │
│  │ ••••••••           [👁]  │    │
│  └─────────────────────────┘    │
│  Min 8 characters               │
│                                 │
│  Confirm Password               │
│  ┌─────────────────────────┐    │
│  │ ••••••••                │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │     Set Password        │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

---

### Verify Email Pending

```
┌─────────────────────────────────┐
│                                 │
├─────────────────────────────────┤
│                                 │
│         Chef Bawss              │
│                                 │
│  ─────────────────────────────  │
│                                 │
│         [✉ icon]                │
│                                 │
│  Check your email               │
│                                 │
│  We sent a verification link    │
│  to sarah@email.com             │
│                                 │
│  Click the link to verify       │
│  your account.                  │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Didn't get the email?          │
│  [Resend verification email]    │
│                                 │
└─────────────────────────────────┘
```

---

### Email Verified

```
┌─────────────────────────────────┐
│                                 │
├─────────────────────────────────┤
│                                 │
│         Chef Bawss              │
│                                 │
│  ─────────────────────────────  │
│                                 │
│         [✓ icon]                │
│                                 │
│  Email Verified!                │
│                                 │
│  Your account is ready.         │
│                                 │
│  ┌─────────────────────────┐    │
│  │    Go to Dashboard      │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

---

## 19. Empty States

### No Events Yet

```
┌─────────────────────────────────┐
│                                 │
│         [calendar icon]         │
│                                 │
│     No events yet               │
│                                 │
│     Create your first event     │
│     to get started.             │
│                                 │
│     ┌─────────────────────┐     │
│     │  + Create Event     │     │
│     └─────────────────────┘     │
│                                 │
└─────────────────────────────────┘
```

### No Clients Yet

```
┌─────────────────────────────────┐
│                                 │
│         [people icon]           │
│                                 │
│     No clients yet              │
│                                 │
│     Add your first client       │
│     to start booking events.    │
│                                 │
│     ┌─────────────────────┐     │
│     │  + Add Client       │     │
│     └─────────────────────┘     │
│                                 │
└─────────────────────────────────┘
```

### No Chefs Yet

```
┌─────────────────────────────────┐
│                                 │
│         [chef hat icon]         │
│                                 │
│     No chefs yet                │
│                                 │
│     Invite chefs to your team   │
│     so you can assign events.   │
│                                 │
│     ┌─────────────────────┐     │
│     │  + Invite Chef      │     │
│     └─────────────────────┘     │
│                                 │
└─────────────────────────────────┘
```

### No Search Results

```
┌─────────────────────────────────┐
│                                 │
│         [search icon]           │
│                                 │
│     No results for "xyz"        │
│                                 │
│     Try a different search      │
│     or clear filters.           │
│                                 │
│     [Clear filters]             │
│                                 │
└─────────────────────────────────┘
```

---

## 20. Toast / Notification Patterns

```
┌─────────────────────────────────────┐
│ ✓ Event created successfully    [x] │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Event moved to Dec 17         [x] │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ Chef assigned · Maria notified[x] │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ⚠ Could not save changes. Retry?[x] │
└─────────────────────────────────────┘
```

- Appear top-center (desktop) or top (mobile)
- Auto-dismiss after 4 seconds
- Can be manually dismissed

---

## 21. Confirmation Dialogs

### Delete Confirmation

```
┌─────────────────────────────────────┐
│                                     │
│  Delete this event?                 │
│                                     │
│  "Johnson Holiday Party" will be    │
│  permanently deleted. This cannot   │
│  be undone.                         │
│                                     │
│  ┌───────────┐  ┌─────────────────┐ │
│  │  Cancel   │  │  Delete Event   │ │
│  └───────────┘  └─────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### Cancel Event Confirmation

```
┌─────────────────────────────────────┐
│                                     │
│  Cancel this event?                 │
│                                     │
│  "Johnson Holiday Party" will be    │
│  marked as cancelled. Maria will    │
│  be notified.                       │
│                                     │
│  ┌───────────┐  ┌─────────────────┐ │
│  │  Go Back  │  │  Cancel Event   │ │
│  └───────────┘  └─────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### Unsaved Changes

```
┌─────────────────────────────────────┐
│                                     │
│  Unsaved changes                    │
│                                     │
│  You have unsaved changes. Do you   │
│  want to save before leaving?       │
│                                     │
│  ┌─────────┐ ┌────────┐ ┌────────┐  │
│  │ Discard │ │ Cancel │ │  Save  │  │
│  └─────────┘ └────────┘ └────────┘  │
│                                     │
└─────────────────────────────────────┘
```

---

## Appendix: Design Notes

### Color System (Chef Calendar Colors)

Auto-assigned palette for chef identification:
```
#4A90D9  - Blue
#7B68EE  - Purple  
#E57373  - Red/Coral
#4DB6AC  - Teal
#FFB74D  - Orange
#81C784  - Green
#F06292  - Pink
#64B5F6  - Light Blue
```

Unassigned events: `#9E9E9E` (Gray)

### Typography

- Headings: Semi-bold
- Body: Regular
- Labels: Medium
- Numbers/Money: Tabular figures

### Spacing

- Card padding: 16px
- Section gaps: 24px
- Form field gaps: 16px
- List item gaps: 12px

### Breakpoints

- Mobile: < 768px
- Desktop: ≥ 768px

### Icons

Use a consistent icon set (Lucide, Heroicons, or similar):
- Home (dashboard)
- Calendar
- Plus (add)
- Users (clients)
- ChefHat (chefs)
- DollarSign (finances)
- Settings (gear)
- User (profile)
- MoreHorizontal (more menu)

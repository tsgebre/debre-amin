---
# Template for one event or announcement. Copy this file, rename it without
# the leading underscore (e.g. "2027-01-15-parish-picnic.md"), and fill in
# real values. Files whose name starts with "_" are never published, so this
# template itself never ships, no matter what "draft" below says.

# "event" (something happening at a place and time) or "announcement" (a
# notice with no specific venue).
type: event

# Required, and both languages are required — this is what the events list
# and detail pages show.
title:
  en: 'EXAMPLE — Parish Picnic'
  am: 'ምሳሌ — የደብር ፒክኒክ'

summary:
  en: 'EXAMPLE — Join us after Divine Liturgy for food and fellowship.'
  am: 'ምሳሌ — ከቅዳሴ በኋላ ለምሳና ለኅብረት ይቀላቀሉን።'

# Required. Plain YYYY-MM-DD text, not a date field — this avoids any
# time-zone shift. Must be a real Gregorian calendar date.
date: '2027-01-15'

# Optional. Only for multi-day events. Must be on or after "date" above.
# endDate: '2027-01-16'

# Optional, free text (this project doesn't standardize time formats).
# time: '1:00 PM'

# Optional. Both languages are required if this field is present at all.
# location:
#   en: 'EXAMPLE — Fellowship Hall'
#   am: 'ምሳሌ — የኅብረት አዳራሽ'

# Which language the body text below (if any) is written in. Defaults to
# "en". The other locale's page will show a small note pointing this out.
bodyLang: en

# Keep this true until the event is ready to publish. (This template is
# already excluded by its "_" filename regardless of this value.)
draft: true
---

EXAMPLE body text goes here, in the language named by `bodyLang` above. This
section is optional — omit it entirely if the summary above says everything
that needs saying.

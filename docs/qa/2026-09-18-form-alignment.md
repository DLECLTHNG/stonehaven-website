# Desktop form alignment audit

Reviewed all 103 HTML pages containing public forms, in English and Spanish. Source inventory contains 108 forms; the browser adds two HELOC save-estimate forms, for 110 rendered form instances.

At a 1280px desktop viewport, measured every form against its parent and every rendered submit button against its form after page load. All 100 initially rendered submit controls and all form containers were centered within 2px after correction. Ten controls belong to hidden wizard/quiz steps; their shared CSS and markup were reviewed separately. Also progressed through the English DSCR review using sample numbers, without submitting, and measured its final button at zero offset.

Corrections:
- Stack shared consent text and submit buttons centrally rather than using a space-between row.
- Center the final DSCR submission action independently of the Back/Continue controls.
- Center the desktop HELOC save-estimate action beneath its phone field.
- Define the off-screen honeypot style in the main stylesheet so pages without funnel.css do not show an empty anti-spam field in the input grid.
- Fix the HELOC growth generator's stylesheet path matching, including Spanish nested routes.
- Version shared CSS and the HELOC wizard script so existing visitors receive the corrected layouts. Generated pages and templates use the same versions.

Visually inspected the contact form field grid and centered submit action. Preserved mobile full-width submit rules. No test leads submitted; submission routing and field names were not changed.

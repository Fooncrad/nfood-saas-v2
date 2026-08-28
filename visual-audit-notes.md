# Visual audit notes — offline POS and direction pass

- Desktop dashboard captured in French (LTR): the sidebar is anchored on the left and the main canvas reserves the left margin; the header remains visible.
- Mobile dashboard captured in French (LTR): the compact header and metric grid render without global horizontal overflow in the captured viewport.
- Public menu captured in English (LTR): the header and waiter-call action are visible; the menu drawer trigger is present and the product area begins below the hero.
- Public menu on mobile: the bottom navigation remains visible and the waiter-call panel is visible. The screenshot shows the page content continuing below the viewport, which is expected; no runtime crash was observed.
- Follow-up visual validation should include an Arabic RTL session and an offline POS browser session after the service worker has been installed in production-like mode.

## RTL follow-up

- Desktop dashboard with `?lang=ar`: the sidebar is visibly on the right, the main dashboard content reserves the right-side width, and the header controls mirror correctly.
- Desktop public menu with `?lang=ar`: the waiter-call action and social rail mirror to the right, while the reservation/menu actions remain readable.
- Mobile dashboard with `?lang=ar`: the menu trigger is on the right and the metric/content layout remains inside the viewport.
- Mobile public menu with `?lang=ar`: the header, waiter-call panel, menu title, and bottom navigation are visible without an RTL horizontal overflow in the captured viewport.

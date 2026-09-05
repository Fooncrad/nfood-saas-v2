# Card bounds verification — 2026-09-05

On the live dev preview `/menu/nssercafa`, the first `.nfood-menu-item-card` was measured at x=822.5, y=957.125, width=350, height=127.5. Its image child is inside the same card at x=1075, width=97.5, height=127.5; its content child is adjacent at x=822.5, width=252.5, height=127.5. Computed display is flex for the content and the image/content are contiguous. This confirms the browser DOM layout is no longer detached; the very tall full-page screenshot is visually downscaled by the screenshot renderer.

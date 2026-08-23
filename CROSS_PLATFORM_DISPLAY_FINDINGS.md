# Cross-platform display verification

After the compatibility pass, the preview route `/tv/30002?kiosk=1` rendered correctly at 1280×720 desktop and 390×844 portrait mobile sizes.

The desktop view shows the display image, QR, connected status, and Kiosk control without clipping. The mobile view wraps the header controls, scales the title, keeps the QR visible, and preserves the footer status. The page uses a screen-height fallback plus `100dvh`, safe localStorage access, optional Fullscreen, keyboard `F` support when available, and continues operating without Fullscreen or WebSocket support through the existing periodic tRPC refresh.

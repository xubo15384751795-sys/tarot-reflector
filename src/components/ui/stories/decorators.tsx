import type { Decorator } from "@storybook/react";

/** Storybook viewport decorator for mobile width stories */
export const mobileViewport: Decorator = (Story) => (
  <div style={{ width: 390, maxWidth: "100%" }}>
    <Story />
  </div>
);

/** Force hover-like state via class (for static screenshot review) */
export const forceHover: Decorator = (Story) => (
  <div className="storybook-force-hover">
    <Story />
  </div>
);

/** Force reduced-motion preview */
export const reducedMotion: Decorator = (Story) => (
  <div className="storybook-reduced-motion">
    <Story />
  </div>
);

/** Force active/pressed state */
export const forceActive: Decorator = (Story) => (
  <div className="storybook-force-active">
    <Story />
  </div>
);

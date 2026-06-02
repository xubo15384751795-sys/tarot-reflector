import type { Preview, ReactRenderer } from "@storybook/react";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: {
      test: "todo",
    },
    viewport: {
      viewports: {
        mobile390: {
          name: "Mobile 390",
          styles: { width: "390px", height: "844px" },
        },
      },
    },
  },
  decorators: [
    withThemeByDataAttribute<ReactRenderer>({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "dark",
      attributeName: "data-theme",
    }),
    (Story) => (
      <div
        style={{
          minWidth: 320,
          padding: 24,
          background: "var(--bg-base)",
          color: "var(--text-primary)",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;

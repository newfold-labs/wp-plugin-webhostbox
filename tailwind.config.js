import { TAILWINDCSS_PRESET } from "@newfold/ui-component-library";

module.exports = {
    presets: [TAILWINDCSS_PRESET],
    content: [
        // Include all JS files inside the UI library in your content.
        ...TAILWINDCSS_PRESET.content,
        "./src/**/*.js", // all source files
        "./node_modules/@newfold/wp-module-*/build/index.js", // all npmjs sourced module builds
        "./node_modules/@newfold-labs/wp-module-*/build/index.js", // all github npm sourced module builds
        "./vendor/newfold-labs/wp-module-*/components/**/*.js", // all composer sourced module components
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                   DEFAULT: '#3498DB',
					dark: '#2980B9',
					light: '#CCDCF4',
					lighter: '#949FB1',
                },
                secondary: {
                    DEFAULT: "#1F2937",
                    dark: "#111827",
                    light: "#4B5563",
                    lighter: "#F3F4F6",
                },
                title: "#1F2937",
                body: "#374151",
                link: "#2980B9",
                line: "#E2E8F0",
                white: "#FFFFFF",
                offWhite: "#F5F6F8",
                black: "#000000",
                canvas: "#F5F6F8",
            },
        },
    },
    plugins: [],
}
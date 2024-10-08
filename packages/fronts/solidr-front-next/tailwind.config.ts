import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            colors: {
                customBlue: '#3950a0',
                customBlueLight: '#333e83',
                customPinkLight: '#CCA3FE',
                solanaGreen: '#00FFA3',
                solanaPurple: '#9945FF',
            },
        },
    },
    darkMode: 'class',
    plugins: [],
};
export default config;

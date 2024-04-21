/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary-dark': "#0d290c",
                'primary-light': "#77e65a",
                'primary-main': "#1c9409",

                'secondary-dark': "#0d290c",
                'secondary-light': "#77e65a",
                'secondary-main': "#1c9409",

                'common-dark': "#726f7e",
                'common-light': "#a19fad",
                'common-main': "#fff",
                'common-black': "#3b3b3b",

            },
        },
    },
  plugins: [],
}


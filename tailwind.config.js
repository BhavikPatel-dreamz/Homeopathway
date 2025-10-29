/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./app/**/*.{js,ts,jsx,tsx}", // For Next.js App Router
        "./pages/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          // Connects to CSS variables from next/font
          sans: ['var(--font-geist-sans)', 'sans-serif'],
          mono: ['var(--font-geist-mono)', 'monospace'],
          montserrat: ['var(--font-montserrat)', 'sans-serif'],
        },
        fontSize: {
            // 👇 custom font sizes
            '40': '40px', // 10px
        },
        colors: {
          // Optional: example custom color palette
          primary: "#2B2B2B",
          secondary: "#D3D6D1",
        },
      },
    },
    plugins: [],
  };
  
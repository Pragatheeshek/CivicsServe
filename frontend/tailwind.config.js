/** @type {import('tailwindcss').Config} */
export default {
  content: ["./public/index.html", "./src/**/*.{js,jsx}"] ,
  theme: {
    extend: {
      colors: {
        ink: "#0b0b0b",
        mist: "#f4f0e6",
        brass: "#b9853b",
        clay: "#c26a5a",
        river: "#2b5c7a",
      },
      boxShadow: {
        glow: "0 0 25px rgba(185, 133, 59, 0.35)",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Space Grotesk'", "sans-serif"],
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        rise: {
          "0%": { opacity: 0, transform: "translateY(14px)" },
          "100%": { opacity: 1, transform: "translateY(0px)" },
        },
      },
      animation: {
        floaty: "floaty 8s ease-in-out infinite",
        rise: "rise 0.35s ease-out",
      },
    },
  },
  plugins: [],
};

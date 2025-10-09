import { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "375px", // Breakpoint extra small para mobile
      },
      spacing: {
        "13": "3.25rem", // 52px para altura da logo
      },
      animation: {
        "fade-in-up": "fadeInUp 0.8s ease-out",
        "fade-in-up-delay": "fadeInUp 0.8s ease-out 0.2s both",
        "fade-in-up-delay-2": "fadeInUp 0.8s ease-out 0.4s both",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeInUp: {
          from: {
            opacity: "0",
            transform: "translateY(30px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 4px 20px rgba(236, 72, 153, 0.3)",
          },
          "50%": {
            boxShadow: "0 4px 30px rgba(236, 72, 153, 0.6)",
          },
        },
      },
      colors: {
        fuchsia: {
          850: "#a21caf",
          900: "#86198f",
        },
      },
    },
  },
  plugins: [],
};

export default config;

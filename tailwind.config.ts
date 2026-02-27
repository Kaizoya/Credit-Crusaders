import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#0b0e12",
        panel: "#161a21",
        panelSoft: "#1c222b",
        stroke: "#2a323d",
        blueGlow: "#3fbf9a",
      },
      boxShadow: {
        glass: "0 10px 30px rgba(0, 0, 0, 0.4)",
      },
      backgroundImage: {
        "fintech-gradient":
          "radial-gradient(circle at 85% 10%, rgba(73,92,125,0.22), transparent 40%), linear-gradient(160deg, #0b0e12 0%, #10141b 55%, #0c1016 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;

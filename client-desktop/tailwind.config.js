/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        canvas:{
          dark: '#0A0A0A', // Deep, tactical black/charcoal
          panel: '#171717', // Slightly lighter for containers/sidebars
          border: '#262626', // Subtle boundaries
        },
        tactical:{
          red: '#DC2626', // High-contrast, legible action color
          hover: '#991B1B',
        },
        ui:{
          text: '#FAFAFA', // Stark white for main text
          muted: '#A3A3A3', // Muted gray for secondary info
        }
      }
    },
  },
  plugins: [],
}
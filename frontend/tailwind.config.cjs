/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			animation: {
				"skeleton-pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
			},
			keyframes: {
				"skeleton-pulse": {
					"0%, 100%": { backgroundColor: "#ffffff" }, // white
					"50%": { backgroundColor: "#f9fafb" },
				},
			},
		},
	},
	plugins: [],
};


import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['Inter', 'system-ui', 'sans-serif'],
				'heading': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(220, 91%, 28%)',
					foreground: 'hsl(var(--primary-foreground))',
					50: 'hsl(220, 91%, 97%)',
					100: 'hsl(220, 91%, 93%)',
					200: 'hsl(220, 91%, 85%)',
					300: 'hsl(220, 91%, 75%)',
					400: 'hsl(220, 91%, 60%)',
					500: 'hsl(220, 91%, 45%)',
					600: 'hsl(220, 91%, 28%)',
					700: 'hsl(220, 91%, 20%)',
					800: 'hsl(220, 91%, 15%)',
					900: 'hsl(220, 91%, 10%)',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(185, 85%, 50%)',
					foreground: 'hsl(var(--accent-foreground))',
					50: 'hsl(185, 85%, 97%)',
					100: 'hsl(185, 85%, 93%)',
					200: 'hsl(185, 85%, 85%)',
					300: 'hsl(185, 85%, 75%)',
					400: 'hsl(185, 85%, 65%)',
					500: 'hsl(185, 85%, 50%)',
					600: 'hsl(185, 85%, 40%)',
					700: 'hsl(185, 85%, 30%)',
					800: 'hsl(185, 85%, 25%)',
					900: 'hsl(185, 85%, 20%)',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				success: {
					DEFAULT: 'hsl(142, 76%, 36%)',
					50: 'hsl(142, 76%, 97%)',
					100: 'hsl(142, 76%, 93%)',
					200: 'hsl(142, 76%, 85%)',
					300: 'hsl(142, 76%, 75%)',
					400: 'hsl(142, 76%, 60%)',
					500: 'hsl(142, 76%, 45%)',
					600: 'hsl(142, 76%, 36%)',
					700: 'hsl(142, 76%, 28%)',
					800: 'hsl(142, 76%, 20%)',
					900: 'hsl(142, 76%, 15%)',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'soft': '0 2px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
				'medium': '0 4px 30px -5px rgba(0, 0, 0, 0.15), 0 20px 20px -5px rgba(0, 0, 0, 0.08)',
				'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.2), 0 30px 30px -10px rgba(0, 0, 0, 0.1)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				'fade-out': {
					from: { opacity: '1' },
					to: { opacity: '0' }
				},
				'slide-up': {
					from: { transform: 'translateY(10px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				},
				'scale-in': {
					from: { transform: 'scale(0.95)', opacity: '0' },
					to: { transform: 'scale(1)', opacity: '1' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'slide-up': 'slide-up 0.4s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'shimmer': 'shimmer 2s infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
        extend: {
                borderRadius: {
                        lg: 'var(--radius)',
                        md: 'calc(var(--radius) - 2px)',
                        sm: 'calc(var(--radius) - 4px)',
                        '2xl': '1.25rem',
                        '3xl': '1.75rem',
                        '4xl': '2.25rem'
                },
			colors: {
				primary: {
					DEFAULT: '#275B99',
					hover: '#1F4B80',
					light: '#F0F5FA',
					subtle: '#D9E6F5',
				},
				'primary-container': '#F0F5FA',
				'on-primary': '#ffffff',
				secondary: {
					DEFAULT: '#4D9B2A',
					hover: '#3F8222',
					light: '#F2F9EE',
					subtle: '#DCF0D3',
				},
				'on-secondary': '#ffffff',
				surface: '#ffffff',
				'surface-container': '#f8fafc',
				'surface-container-low': '#ffffff',
				'surface-container-lowest': '#ffffff',
				'on-surface': '#1e293b',
				'on-surface-variant': '#334155',
				error: '#275B99',
				'error-container': '#F0F5FA',
				'on-error': '#ffffff',
				'on-error-container': '#1F4B80',
				outline: '#cbd5e1',
				'outline-variant': '#e2e8f0',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				healthcare: {
					blue: {
						DEFAULT: '#275B99',
						dark: '#1F4B80',
						light: '#F0F5FA',
						subtle: '#D9E6F5'
					},
					emerald: {
						DEFAULT: '#4D9B2A',
						light: '#F2F9EE',
						glow: 'rgba(77, 155, 42, 0.15)'
					},
					surface: '#FFFFFF',
					dark: '#163861'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': '#275B99',
					'2': '#4D9B2A',
					'3': '#1F4B80',
					'4': '#3F8222',
					'5': '#3B82F6'
				}
			},
                fontFamily: {
                        headline: ['Manrope', 'sans-serif'],
                        body: ['Inter', 'sans-serif'],
                        label: ['Inter', 'sans-serif']
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
                        'fade-in-up': {
                                '0%': { opacity: '0', transform: 'translateY(16px)' },
                                '100%': { opacity: '1', transform: 'translateY(0)' }
                        },
                        'float': {
                                '0%, 100%': { transform: 'translateY(0px)' },
                                '50%': { transform: 'translateY(-6px)' }
                        },
                        'pulse-glow': {
                                '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                                '50%': { opacity: '0.7', transform: 'scale(1.05)' }
                        }
                },
                animation: {
                        'accordion-down': 'accordion-down 0.2s ease-out',
                        'accordion-up': 'accordion-up 0.2s ease-out',
                        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                        'float': 'float 4s ease-in-out infinite',
                        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite'
                }
        }
  },
  plugins: [require("tailwindcss-animate")],
};

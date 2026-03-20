/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#71c4ef',
        secondary: '#00668c',
        background: '#0a0a0f',
        foreground: '#ffffff',
        card: '#1a1a2e',
        'card-foreground': '#ffffff',
        popover: '#1a1a2e',
        'popover-foreground': '#ffffff',
        muted: '#1e1e36',
        'muted-foreground': '#b6ccd8',
        accent: '#00668c',
        'accent-foreground': '#ffffff',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
        border: '#3b3c3d',
        input: '#1a1a2e',
        ring: '#71c4ef',
        success: '#22c55e',
        warning: '#eab308',
        sidebar: '#0a0a0f',
        'sidebar-foreground': '#ffffff',
        'sidebar-primary': '#71c4ef',
        'sidebar-primary-foreground': '#0a0a0f',
        'sidebar-accent': '#1a1a2e',
        'sidebar-accent-foreground': '#ffffff',
        'sidebar-border': '#3b3c3d',
        'sidebar-ring': '#71c4ef',
      },
      borderRadius: {
        DEFAULT: '0.625rem',
        sm: '0.5rem',
        md: '0.625rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-in-from-bottom': 'slideInFromBottom 300ms ease-out',
        'slide-in-from-right': 'slideInFromRight 300ms ease-out',
        'slide-in-from-right-8': 'slideInFromRight8 300ms ease-out',
        'zoom-in-95': 'zoomIn95 300ms ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInFromBottom: {
          from: { transform: 'translateY(1rem)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideInFromRight: {
          from: { transform: 'translateX(1rem)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideInFromRight8: {
          from: { transform: 'translateX(2rem)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        zoomIn95: {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

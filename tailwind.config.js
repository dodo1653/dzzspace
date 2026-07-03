/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dzz: {
          bg: '#0a0a0f',
          panel: '#12121a',
          border: '#1e1e2a',
          'border-hover': '#2a2a3a',
          text: '#e8e8ed',
          muted: '#6b6b7b',
          dim: '#3a3a48',
          accent: '#f59e0b',
          success: '#22c55e',
          error: '#ef4444',
          warning: '#eab308'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'sans-serif']
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '24px',
        '6': '32px',
        '8': '48px',
        '10': '64px'
      },
      borderRadius: {
        'pane': '2px',
        'modal': '8px'
      }
    }
  },
  plugins: []
}

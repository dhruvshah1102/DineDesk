export const DesignDNA = {
  colors: {
    brand: {
      DEFAULT: '#C8853A',
      light: '#DDA15E',
      dark: '#BC6C25',
    },
    customer: {
      background: '#1A0800', // Dark warm background
      card: '#2A1105',
      text: '#FFF0E5',
      textMuted: '#B3917F',
    },
    dashboard: {
      sidebar: '#111827',
      background: '#F9FAFB',
      card: '#FFFFFF',
      text: '#111827',
      textMuted: '#6B7280',
    },
    status: {
      new: '#F97316', // orange
      preparing: '#F59E0B', // amber
      ready: '#10B981', // green
      served: '#64748B', // slate
    }
  },
  typography: {
    fontFamily: {
      sans: ['var(--font-inter)', 'sans-serif'],
      heading: ['var(--font-outfit)', 'sans-serif'],
    }
  },
  spacing: {
    navbar: '64px',
    sidebar: '240px',
  },
  animation: {
    pulseActive: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  }
};

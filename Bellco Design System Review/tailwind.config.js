/** Bellco Rénovation — design tokens (drop into tailwind.config.js) */
module.exports = {
  theme: {
    extend: {
      colors: {
        ink: { 900: '#2A2522', 700: '#4A423D', 500: '#6B625B' },        // text primary / secondary / muted
        sand: { 50: '#F6F1E9', 100: '#EDE6DA', 200: '#DED4C4', 300: '#C9BDAB', 400: '#8C8079' }, // ground / surface / line / border-strong / photo fallback
        paper: '#FFFDF9',                                                // cards, inputs
        clay: { 50: '#F4E4DC', 300: '#E0906F', 600: '#A8452A', 700: '#8E3A22' }, // tint / accent-on-dark / accent / accent-hover
        // semantic aliases
        ground: '#F6F1E9', surface: '#EDE6DA', line: '#DED4C4',
        primary: '#2A2522', 'on-primary': '#F6F1E9', 'primary-muted': '#C9BDAB',
        accent: '#A8452A', 'accent-hover': '#8E3A22', 'accent-on-dark': '#E0906F', 'on-accent': '#FFFDF9',
      },
      fontFamily: {
        display: ['Newsreader', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['"Instrument Sans"', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'Menlo', 'monospace'],
      },
      fontSize: {
        // [size, {lineHeight, letterSpacing, fontWeight}] — desktop; mobile via clamp/md: prefix
        'display':   ['clamp(40px, 5.6vw, 76px)', { lineHeight: '1.02', letterSpacing: '-0.02em', fontWeight: '400' }],
        'h1':        ['clamp(36px, 4.6vw, 64px)', { lineHeight: '1.04', letterSpacing: '-0.02em', fontWeight: '400' }],
        'h2':        ['clamp(32px, 3.4vw, 48px)', { lineHeight: '1.10', letterSpacing: '-0.015em', fontWeight: '400' }],
        'h3':        ['clamp(24px, 2.6vw, 36px)', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '400' }],
        'h4':        ['clamp(22px, 2vw, 26px)',   { lineHeight: '1.20', fontWeight: '400' }],
        'title':     ['20px',                    { lineHeight: '1.30', fontWeight: '600' }],   // sans
        'lead':      ['clamp(19px, 1.4vw, 21px)', { lineHeight: '1.50', fontWeight: '400' }],
        'body':      ['clamp(17px, 1.2vw, 18px)', { lineHeight: '1.65', fontWeight: '400' }],
        'body-sm':   ['16px',                    { lineHeight: '1.60', fontWeight: '400' }],
        'small':     ['15px',                    { lineHeight: '1.50', fontWeight: '400' }],
        'caption':   ['13.5px',                  { lineHeight: '1.45', fontWeight: '400' }],
        'overline':  ['13px',                    { lineHeight: '1.20', letterSpacing: '0.14em', fontWeight: '600' }], // uppercase
        'stat':      ['34px',                    { lineHeight: '1', letterSpacing: '-0.01em', fontWeight: '400' }],
        'step-num':  ['64px',                    { lineHeight: '0.9', letterSpacing: '-0.03em', fontWeight: '400' }],
        'quote':     ['clamp(21px, 2vw, 26px)',  { lineHeight: '1.40', fontWeight: '400' }], // italic display
      },
      maxWidth: { measure: '66ch', 'measure-narrow': '48ch', site: '1320px' },
      spacing: {
        '1': '4px', '2': '8px', '3': '12px', '4': '16px', '5': '20px', '6': '24px', '7': '28px', '8': '32px',
        '10': '40px', '12': '48px', '14': '56px', '16': '64px', '20': '80px', '24': '96px', '28': '112px', '32': '128px',
        'gutter': 'clamp(20px, 4vw, 48px)',
        'section': 'clamp(72px, 9vw, 128px)',
        'section-sm': 'clamp(64px, 8vw, 112px)',
        'header': '76px',
      },
      borderRadius: { none: '0', xs: '2px', sm: '3px', DEFAULT: '4px', md: '6px', lg: '8px', xl: '12px', full: '999px' },
      boxShadow: {
        menu: '0 24px 48px -24px rgba(42,37,34,0.25)',
        card: '0 2px 6px -2px rgba(42,37,34,0.12)',
        modal: '0 40px 80px -24px rgba(42,37,34,0.5)',
        'bar-up': '0 -12px 32px -16px rgba(42,37,34,0.25)',
        handle: '0 8px 24px -8px rgba(42,37,34,0.5)',
      },
      transitionDuration: { fast: '150ms', DEFAULT: '200ms', slow: '350ms' },
      backgroundImage: {
        'hero-scrim': 'linear-gradient(180deg, rgba(42,37,34,.35) 0%, rgba(42,37,34,0) 30%, rgba(42,37,34,.75) 100%)',
      },
      screens: { sm: '480px', md: '860px', lg: '1120px', xl: '1320px' },
    },
  },
};

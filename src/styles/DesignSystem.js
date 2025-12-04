// src/styles/DesignSystem.js

export const theme = {
    colors: {
        primary: '#06b6d4', // Cyan 500
        primaryHover: '#0891b2', // Cyan 600
        secondary: '#8b5cf6', // Violet 500
        accent: '#f472b6', // Pink 400
        background: '#0f172a', // Slate 900
        surface: 'rgba(30, 41, 59, 0.7)', // Slate 800 with opacity
        surfaceHover: 'rgba(51, 65, 85, 0.8)', // Slate 700 with opacity
        text: {
            main: '#f8fafc', // Slate 50
            muted: '#94a3b8', // Slate 400
            inverted: '#0f172a',
        },
        success: '#10b981', // Emerald 500
        error: '#ef4444', // Red 500
        warning: '#f59e0b', // Amber 500
    },
    glass: {
        default: {
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        },
        card: {
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            borderRadius: '16px',
        },
        input: {
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f8fafc',
            backdropFilter: 'blur(4px)',
        }
    },
    gradients: {
        primary: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
        secondary: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        dark: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
    },
    typography: {
        fontFamily: '"Inter", "Roboto", sans-serif',
        h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
        h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3 },
        h3: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
        body: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.6 },
        small: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5 },
    },
    spacing: (factor) => `${factor * 0.25}rem`, // 1 = 0.25rem (4px)
    breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
    }
};

export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  :root {
    --color-primary: ${theme.colors.primary};
    --color-bg: ${theme.colors.background};
    --color-text: ${theme.colors.text.main};
  }

  body {
    margin: 0;
    padding: 0;
    font-family: ${theme.typography.fontFamily};
    background-color: ${theme.colors.background};
    color: ${theme.colors.text.main};
    background-image: 
      radial-gradient(at 0% 0%, rgba(6, 182, 212, 0.15) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.15) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(244, 114, 182, 0.15) 0px, transparent 50%);
    background-attachment: fixed;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  * {
    box-sizing: border-box;
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: color 0.2s;
  }
  a:hover {
    color: ${theme.colors.primaryHover};
  }

  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

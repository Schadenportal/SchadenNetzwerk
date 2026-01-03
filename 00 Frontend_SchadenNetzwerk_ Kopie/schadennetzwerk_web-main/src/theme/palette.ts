import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

export type ColorSchema = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

declare module '@mui/material/styles/createPalette' {
  interface TypeBackground {
    neutral: string;
    tableHeader: string;
  }
  interface TypeText {
    tableText: string;
    contrastColor: string;
  }
  interface SimplePaletteColorOptions {
    lighter: string;
    darker: string;
  }
  interface PaletteColor {
    lighter: string;
    darker: string;
  }
}

// SETUP COLORS

export const grey = {
  0: '#FFFFFF',
  100: '#F9FAFB',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB',
  600: '#637381',
  700: '#454F5B',
  800: '#212B36',
  900: '#161C24',
};

export const primary = {
  lighter: '#C8FAD6',
  light: '#5BE49B',
  main: '#00A76F',
  dark: '#007867',
  darker: '#004B50',
  contrastText: '#000E00',
};

export const secondary = {
  lighter: '#E3F0FD',
  light: '#7DB3E8',
  main: '#003478',
  dark: '#002D5A',
  darker: '#001E3C',
  contrastText: '#FFFFFF',
};

export const info = {
  lighter: '#E3F2FD',
  light: '#64B5F6',
  main: '#2196F3',
  dark: '#1976D2',
  darker: '#0D47A1',
  contrastText: '#FFFFFF',
};

export const success = {
  lighter: '#D3FCD2',
  light: '#77ED8B',
  main: '#22C55E',
  dark: '#118D57',
  darker: '#065E49',
  contrastText: '#ffffff',
};

export const warning = {
  lighter: '#FFF5CC',
  light: '#FFD666',
  main: '#FFAB00',
  dark: '#B76E00',
  darker: '#7A4100',
  contrastText: grey[800],
};

export const error = {
  lighter: '#FFE9D5',
  light: '#FFAC82',
  main: '#FF5630',
  dark: '#B71D18',
  darker: '#7A0916',
  contrastText: '#FFFFFF',
};

export const common = {
  black: '#000000',
  white: '#FFFFFF',
  tuvBack: '#f2efed',
  tuvFore: '#0046ad',
  dekraGreen: '#00A651',
  dekraSecondary: '#009639',
  // New color scheme variables
  primaryBlue: '#005B9F',
  accentBlue: '#0072BC',
  lightGray: '#F5F5F5',
  textDark: '#333333',
};

export const action = {
  hover: alpha(grey[500], 0.08),
  selected: alpha(grey[500], 0.16),
  disabled: alpha(grey[500], 0.8),
  disabledBackground: alpha(grey[500], 0.24),
  focus: alpha(grey[500], 0.24),
  hoverOpacity: 0.08,
  disabledOpacity: 0.48,
};

const base = {
  primary,
  secondary,
  info,
  success,
  warning,
  error,
  grey,
  common,
  divider: alpha(grey[500], 0.2),
  action,
};

// ----------------------------------------------------------------------

export function palette(mode: 'light' | 'dark' | 'green' | 'blue' | 'stellantis' | 'red') {
  const green = {
    ...base,
    mode: 'light',
    text: {
      primary: '#FFFFFF', // White text for DEKRA green backgrounds
      secondary: grey[200], // Light grey for secondary text
      disabled: grey[400], // Light grey for disabled text,
      tableText: '#FFFFFF', // White text for table headers
      contrastColor: '#ffffff', // Contrast color for primary text
    },
    background: {
      paper: '#016b52', // DEKRA green for cards
      default: grey[900], // Dark background for DEKRA mode
      neutral: alpha(grey[500], 0.12), // Light grey for neutral elements
      tableHeader: '#016b77', // DEKRA green for table headers
    },
    action: {
      ...base.action,
      active: '#016b52', // DEKRA green
      hover: alpha('#016b52', 0.08), // DEKRA green with transparency
      selected: alpha('#016b52', 0.16), // DEKRA green with transparency
    },
  };

  const blue = {
    ...base,
    mode: 'dark',
    text: {
      primary: '#FFFFFF', // Dark text like TÜV SÜD website
      secondary: '#E0E0FF', // Medium gray for secondary text
      disabled: '#E0E0E0', // White but darker for disabled text
      tableText: '#000', // White text for table
      contrastColor: '#000', // Contrast color for primary text
    },
    background: {
      paper: '#005B9F', // Pure white cards/surfaces like TÜV SÜD website
      default: '#ffffff', // Light gray background like TÜV SÜD website
      neutral: alpha('#E0E0E0', 0.6), // Light neutral elements
      tableHeader: "#005B79", // TÜV blue for table headers
    },
    action: {
      ...base.action,
      active: '#005B9F', // TÜV blue for active states
      hover: alpha('#005B9F', 0.08), // TÜV blue hover
      selected: alpha('#005B9F', 0.12), // TÜV blue selection
      focus: alpha('#005B9F', 0.24), // TÜV blue focus
    },
  };

  const stellantis = {
    ...base,
    mode: 'dark',
    text: {
      primary: '#FFFFFF',
      secondary: '#E0E0FF', // Medium gray for secondary text
      disabled: '#E0E0E0', // White but darker for disabled text
      tableText: '#000', // White text for table
      contrastColor: '#000', // Contrast color for primary text
    },
    background: {
      paper: '#243782', // Pure white cards/surfaces like TÜV SÜD website
      default: '#ffffff', // Light gray background like TÜV SÜD website
      neutral: alpha('#E0E0E0', 0.6), // Light neutral elements
      tableHeader: "#251781", // TÜV blue for table headers
    },
    action: {
      ...base.action,
      active: '#005B9F', // TÜV blue for active states
      hover: alpha('#005B9F', 0.08), // TÜV blue hover
      selected: alpha('#005B9F', 0.12), // TÜV blue selection
      focus: alpha('#005B9F', 0.24), // TÜV blue focus
    },
  };

  const light = {
    ...base,
    mode: 'light',
    text: {
      primary: "#1f1f1f", // Black text for light mode
      secondary: grey[700],
      disabled: grey[600],
      tableText: '#000',
      contrastColor: '#000E00', // Contrast color for primary text
    },
    background: {
      paper: '#fdfdfd',
      default: '#f2f1f2', // Brighter grey for light mode background
      neutral: grey[200],
      tableHeader: '#f0eeef',
    },
    action: {
      ...base.action,
      active: grey[600],
    },
  };

  const dark = {
    ...base,
    mode: 'dark',
    text: {
      primary: '#FFFFFF',
      secondary: grey[500],
      disabled: grey[600],
      tableText: '#FFFFFF',
      contrastColor: '#000E00', // Contrast color for primary text
    },
    background: {
      paper: grey[800],
      default: grey[900],
      neutral: alpha(grey[500], 0.12),
    },
    action: {
      ...base.action,
      active: grey[500],
    },
  };

  // Color mode for default
  const red = {
    ...base,
    mode: 'red',
    text: {
      primary: '#FFFFFF',
      secondary: grey[200],
      disabled: grey[400],
      tableText: '#FFFFFF',
      contrastColor: '#000E00',
    },
    background: {
      paper: '#8b1e26', // Darker version of #bd2732
      default: '#1a1a1a',
      neutral: alpha(grey[500], 0.12),
      tableHeader: '#8b1e26', // Darker red for table headers
    },
    action: {
      ...base.action,
      active: '#8b1e26', // Darker version of #bd2732
      hover: alpha('#8b1e26', 0.08),
      selected: alpha('#8b1e26', 0.16),
    },
  }

  switch (mode) {
    case 'light':
      return light;
    case 'dark':
      return dark;
    case 'green':
      return green;
    case 'red':
      return red;
    case 'stellantis':
      return stellantis;
    default:
      return blue;
  }
}

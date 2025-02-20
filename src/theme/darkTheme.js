import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7248e1',
      light: '#9373e9',
    },
    background: {
      default: '#1c232b',
      paper: '#2b2d31',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a3a6aa',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#1c232b',
          minHeight: '100vh',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#2b2d31',
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#383a40',
          },
          '&.Mui-selected': {
            backgroundColor: '#7248e1',
            borderLeft: '4px solid #9373e9',
          },
        },
      },
    },
  },
});

export default darkTheme; 
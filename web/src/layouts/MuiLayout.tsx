import { createTheme, ThemeProvider } from '@mui/material/styles';

interface Props {
  children: React.ReactNode;
}

const MuiLayout: React.FC<Props> = ({ children }) => {
  const theme = createTheme({
    palette: {
      primary: { main: '#1a72af' },
      secondary: { main: '#2990ce' },
    },
  });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default MuiLayout;

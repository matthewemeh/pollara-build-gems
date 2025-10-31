import { createContext, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export const AppContext = createContext<AppContext | null>(null);

const AppProvider: React.FC<Props> = ({ children }) => {
  const [snackbarColor, setSnackbarColor] = useState<string>();
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);
  const [snackbarDuration, setSnackbarDuration] = useState<number>();
  const [snackbarContent, setSnackbarContent] = useState<React.ReactNode>(null);

  return (
    <AppContext.Provider
      value={{
        snackbarColor,
        snackbarContent,
        snackbarDuration,
        setSnackbarColor,
        isSnackbarVisible,
        setSnackbarContent,
        setSnackbarDuration,
        setIsSnackbarVisible,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;

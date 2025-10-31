interface AppContext {
  snackbarColor?: string;
  snackbarDuration?: number;
  isSnackbarVisible: boolean;
  snackbarContent: React.ReactNode;
  setIsSnackbarVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setSnackbarContent: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  setSnackbarColor: React.Dispatch<React.SetStateAction<string | undefined>>;
  setSnackbarDuration: React.Dispatch<React.SetStateAction<number | undefined>>;
}

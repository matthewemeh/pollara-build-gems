import { useContext } from 'react';
import { Platform } from 'react-native';

import { showAlert } from '@/utils';
import { AppContext } from '@/contexts/app-context';

const useAlert = () => {
  const { setIsSnackbarVisible, setSnackbarDuration, setSnackbarColor, setSnackbarContent } =
    useContext(AppContext)!;

  const triggerAlert = (props: AlertProps) => {
    if (Platform.OS === 'web') {
      return showAlert(props);
    }

    setSnackbarDuration(props.duration);
    setSnackbarColor(props.bgColor);
    setSnackbarContent(props.msg);
    setIsSnackbarVisible(true);
  };

  return triggerAlert;
};

export default useAlert;

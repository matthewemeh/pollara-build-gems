import { Portal } from 'react-native-paper';
import { ActivityIndicator, useColorScheme } from 'react-native';

import constants from '@/constants';
import ThemedView from '../themed-view';

const { COLORS } = constants;

const LoadingScreen = () => {
  const colorScheme = useColorScheme();

  return (
    <Portal>
      <ThemedView className='flex-1 items-center justify-center !bg-[rgba(0,0,0,0.5)]'>
        <ActivityIndicator
          size={60}
          className='text-primary-500 size-32 rounded-xl'
          style={{ backgroundColor: colorScheme === 'dark' ? COLORS.PRIMARY.dark : '#ffffff' }}
        />
      </ThemedView>
    </Portal>
  );
};

export default LoadingScreen;

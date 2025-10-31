import { Button } from 'react-native-paper';
import { Image, useColorScheme } from 'react-native';

import ThemedView from '../themed-view';
import ThemedText from '../themed-text';

interface Props {
  onReload: (isRefresh?: boolean) => void;
}

const ErrorScreen: React.FC<Props> = ({ onReload }) => {
  const colorScheme = useColorScheme();

  return (
    <ThemedView className='flex-1 items-center justify-center'>
      <Image
        width={100}
        height={100}
        className='size-40 mb-4 rounded-xl'
        source={
          colorScheme === 'dark'
            ? require('@/assets/images/icon.png')
            : require('@/assets/images/pollara-logo.png')
        }
      />
      <ThemedText className='text-lg text-[#333]'>Failed to load page 😕</ThemedText>
      <Button mode='contained' onPress={() => onReload()} className='my-2'>
        RELOAD
      </Button>
      <ThemedText className='text-sm opacity-50'>You can pull to reload as well</ThemedText>
    </ThemedView>
  );
};

export default ErrorScreen;

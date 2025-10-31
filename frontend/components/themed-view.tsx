import { View, useColorScheme, type ViewProps } from 'react-native';

import constants from '@/constants';

const { COLORS } = constants;

const ThemedView: React.FC<ViewProps> = props => {
  const colorScheme = useColorScheme();

  return (
    <View
      style={{ backgroundColor: colorScheme === 'dark' ? COLORS.PRIMARY.dark : '#ffffff' }}
      {...props}
    />
  );
};

export default ThemedView;

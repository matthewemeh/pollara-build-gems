import { Text, useColorScheme, type TextProps } from 'react-native';

const ThemedText: React.FC<TextProps> = props => {
  const colorScheme = useColorScheme();

  return <Text style={{ color: colorScheme === 'dark' ? '#ffffff' : '#000000' }} {...props} />;
};

export default ThemedText;

import { useContext } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaperProvider, Snackbar, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

import '@/styles/globals.css';
import constants from '@/constants';
import AppProvider, { AppContext } from '@/contexts/app-context';

const { COLORS } = constants;

function AppContent() {
  const colorScheme = useColorScheme();
  const MD3Theme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  const theme = {
    ...MD3Theme,
    roundness: 1.5,
    colors: {
      ...MD3Theme.colors,
      secondary: COLORS.PRIMARY[500],
      primary: colorScheme === 'dark' ? COLORS.PRIMARY[500] : COLORS.PRIMARY[600],

      // text on primary-colored buttons
      onPrimary: '#ffffff',

      // text color for background and surfaces
      onSurface: '#1a1a1a',
      onBackground: '#000000',
    },
  };

  const {
    snackbarColor,
    snackbarContent,
    snackbarDuration,
    isSnackbarVisible,
    setIsSnackbarVisible,
  } = useContext(AppContext)!;

  const onDismissSnackBar = () => setIsSnackbarVisible(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <Stack>
          <Stack.Screen name='index' options={{ headerShown: false }} />
        </Stack>

        {/* @ts-ignore */}
        <StatusBar style={colorScheme} />

        <Snackbar
          visible={isSnackbarVisible}
          duration={snackbarDuration}
          onDismiss={onDismissSnackBar}
          theme={{ colors: { inverseOnSurface: '#fff' } }}
          style={{ backgroundColor: snackbarColor || COLORS.PRIMARY[500] }}
        >
          {snackbarContent}
        </Snackbar>
      </PaperProvider>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

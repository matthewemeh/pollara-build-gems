import { WebView } from 'react-native-webview';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { ScrollView, BackHandler, RefreshControl } from 'react-native';

import { useAlert } from '@/hooks';
import constants from '@/constants';
import { ErrorScreen, LoadingScreen } from '@/components';

const { COLORS } = constants;

// keep splash screen up
SplashScreen.preventAutoHideAsync();

export default function App() {
  const showAlert = useAlert();
  const webViewRef = useRef<WebView>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const handleReload = (isRefresh?: boolean) => {
    if (!isConnected) {
      showAlert({ msg: 'No Internet Connection', bgColor: COLORS.ERROR });
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 1000);
    }

    setError(false);
    webViewRef.current?.reload();
  };

  const handleLoadEnd = async () => {
    await SplashScreen.hideAsync(); // hide when ready
  };

  useEffect(() => {
    const backAction = () => {
      if (webViewRef.current) {
        webViewRef.current.goBack();
        return true; // prevent app from closing
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
      if (!state.isConnected) showAlert({ msg: 'No Internet Connection', bgColor: COLORS.ERROR });
    });
    return () => unsubscribe();
  }, []);

  return (
    <ScrollView
      contentContainerClassName='flex-1'
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          colors={[COLORS.PRIMARY[500]]}
          onRefresh={() => handleReload(true)}
        />
      }
    >
      {error ? (
        <ErrorScreen onReload={handleReload} />
      ) : (
        <WebView
          ref={webViewRef}
          domStorageEnabled
          javaScriptEnabled
          className='flex-1'
          startInLoadingState
          onLoadEnd={handleLoadEnd}
          onError={() => setError(true)}
          allowsBackForwardNavigationGestures
          renderLoading={() => <LoadingScreen />}
          source={{ uri: 'https://pollara-nu.vercel.app/' }}
        />
      )}
    </ScrollView>
  );
}

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { store } from './src/store/store';
import { theme } from './src/theme/theme';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor={theme.colors.primary} />
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );
} 
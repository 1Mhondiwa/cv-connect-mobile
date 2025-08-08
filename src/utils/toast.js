import { Platform, ToastAndroid, Alert } from 'react-native';

export const showToast = (msg) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    Alert.alert('Notification', msg);
  }
};

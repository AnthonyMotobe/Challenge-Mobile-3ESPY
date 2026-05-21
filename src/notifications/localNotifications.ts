import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let configured = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (!configured) {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 200, 100, 200],
        lightColor: '#0A1F44',
      });
    }
    configured = true;
  }
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const request = await Notifications.requestPermissionsAsync();
  return request.granted;
}

export async function notifyExtractionComplete(params: {
  brand: string;
  model: string;
  version: string;
  attributesFound: number;
}): Promise<void> {
  const granted = await ensureNotificationPermission();
  if (!granted) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Ficha técnica pronta',
      body: `${params.brand} ${params.model} ${params.version} — ${params.attributesFound} atributo(s) encontrado(s)`,
      data: { kind: 'extraction.completed' },
    },
    trigger: null,
  });
}

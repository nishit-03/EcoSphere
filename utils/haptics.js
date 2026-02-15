import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const impactAsync = (style = Haptics.ImpactFeedbackStyle.Medium) => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(style);
};

export const notificationAsync = (type = Haptics.NotificationFeedbackType.Success) => {
    if (Platform.OS === 'web') return;
    Haptics.notificationAsync(type);
};

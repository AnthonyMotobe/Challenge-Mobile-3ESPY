import Constants from 'expo-constants';

export const isMockMode: boolean =
  Constants.expoConfig?.extra?.mockMode === true;

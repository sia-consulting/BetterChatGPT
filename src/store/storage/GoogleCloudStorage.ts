import { PersistStorage, StorageValue, StateStorage } from 'zustand/middleware';
import useGoogleCloudAuthStore from '@store/google-cloud-auth-store';
import useStore from '@store/store';
import {
  deleteDriveFile,
  getDriveFile,
  updateDriveFileDebounced,
  validateGoogleOath2AccessToken,
} from '@api/google-api';

const createGoogleCloudStorage = <S>(): PersistStorage<S> | undefined => {
  const accessToken = useGoogleCloudAuthStore.getState().googleAccessToken;
  const fileId = useGoogleCloudAuthStore.getState().fileId;
  if (!accessToken || !fileId) return;

  try {
    const authenticated = validateGoogleOath2AccessToken(accessToken);
    if (!authenticated) return;
  } catch (e) {
    // prevent error if the storage is not defined (e.g. when server side rendering a page)
    return;
  }
  const persistStorage: PersistStorage<S> = {
    getItem: async (name) => {
      useGoogleCloudAuthStore.getState().setSyncStatus('syncing');
      try {
        const accessToken = useGoogleCloudAuthStore.getState().googleAccessToken;
        const fileId = useGoogleCloudAuthStore.getState().fileId;
        if (!accessToken || !fileId) return null;

        const data: StorageValue<S> = await getDriveFile(fileId, accessToken);
        useGoogleCloudAuthStore.getState().setSyncStatus('synced');
        return data;
      } catch (e: unknown) {
        useGoogleCloudAuthStore.getState().setSyncStatus('unauthenticated');
        useStore.getState().setToastMessage((e as Error).message);
        useStore.getState().setToastShow(true);
        useStore.getState().setToastStatus('error');
        return null;
      }
    },
    setItem: async (name, newValue): Promise<void> => {
      const accessToken = useGoogleCloudAuthStore.getState().googleAccessToken;
      const fileId = useGoogleCloudAuthStore.getState().fileId;
      if (!accessToken || !fileId) return;

      const blob = new Blob([JSON.stringify(newValue)], {
        type: 'application/json',
      });
      const file = new File([blob], 'better-chatgpt.json', {
        type: 'application/json',
      });

      if (useGoogleCloudAuthStore.getState().syncStatus !== 'unauthenticated') {
        useGoogleCloudAuthStore.getState().setSyncStatus('syncing');

        await updateDriveFileDebounced(file, fileId, accessToken);
      }
    },

    removeItem: async (name): Promise<void> => {
      const accessToken = useGoogleCloudAuthStore.getState().googleAccessToken;
      const fileId = useGoogleCloudAuthStore.getState().fileId;
      if (!accessToken || !fileId) return;

      await deleteDriveFile(accessToken, fileId);
    },
  };
  return persistStorage;
};

export default createGoogleCloudStorage;

import { SyncStatus } from '@type/google-api';
import { StoreSlice } from './google-cloud-auth-store';

export interface GoogleCloudAuthSlice {
  googleAccessToken?: string;
  googleRefreshToken?: string;
  cloudSync: boolean;
  syncStatus: SyncStatus;
  fileId?: string;
  setGoogleAccessToken: (googleAccessToken?: string) => void;
  setGoogleRefreshToken: (googleRefreshToken?: string) => void;
  setFileId: (fileId?: string) => void;
  setCloudSync: (cloudSync: boolean) => void;
  setSyncStatus: (syncStatus: SyncStatus) => void;
}

export const createGoogleCloudAuthSlice: StoreSlice<GoogleCloudAuthSlice> = (set, get) => ({
  cloudSync: false,
  syncStatus: 'unauthenticated',
  setGoogleAccessToken: (googleAccessToken?: string) => {
    set((prev: GoogleCloudAuthSlice) => ({
      ...prev,
      googleAccessToken: googleAccessToken,
    }));
  },
  setGoogleRefreshToken: (googleRefreshToken?: string) => {
    set((prev: GoogleCloudAuthSlice) => ({
      ...prev,
      googleRefreshToken: googleRefreshToken,
    }));
  },
  setFileId: (fileId?: string) => {
    set((prev: GoogleCloudAuthSlice) => ({
      ...prev,
      fileId: fileId,
    }));
  },
  setCloudSync: (cloudSync: boolean) => {
    set((prev: GoogleCloudAuthSlice) => ({
      ...prev,
      cloudSync: cloudSync,
    }));
  },
  setSyncStatus: (syncStatus: SyncStatus) => {
    set((prev: GoogleCloudAuthSlice) => ({
      ...prev,
      syncStatus: syncStatus,
    }));
  },
});

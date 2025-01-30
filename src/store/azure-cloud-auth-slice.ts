import { StoreSlice } from './azure-cloud-auth-store';

export type SyncStatus = 'unauthenticated' | 'syncing' | 'synced';

export interface AzureCloudAuthSlice {
  azureAccessToken?: string;
  cosmosAccessToken?: string;
  cloudSync: boolean;
  syncStatus: SyncStatus;
  userId?: string;
  setAzureAccessToken: (azureAccessToken?: string) => void;
  setCosmosAccessToken: (cosmosAccessToken?: string) => void;
  // in the future this might also support azure storage accounts
  //useCosmosDb: boolean;
  //fileId?: string;
  //setFileId: (fileId?: string) => void;
  setUserId: (userId?: string) => void;
  setCloudSync: (cloudSync: boolean) => void;
  setSyncStatus: (syncStatus: SyncStatus) => void;
}

export const createAzureCloudAuthSlice: StoreSlice<AzureCloudAuthSlice> = (set, get) => ({
  useCosmosDb: true,
  isRunningInAzure: import.meta.env.VITE_RUNNING_IN_AZURE ? true : false,
  cloudSync: false,
  syncStatus: 'unauthenticated',
  setAzureAccessToken: (azureAccessToken?: string) => {
    set((prev: AzureCloudAuthSlice) => ({
      ...prev,
      azureAccessToken: azureAccessToken,
    }));
  },
  setFileId: (fileId?: string) => {
    set((prev: AzureCloudAuthSlice) => ({
      ...prev,
      fileId: fileId,
    }));
  },
  setCloudSync: (cloudSync: boolean) => {
    set((prev: AzureCloudAuthSlice) => ({
      ...prev,
      cloudSync: cloudSync,
    }));
  },
  setSyncStatus: (syncStatus: SyncStatus) => {
    set((prev: AzureCloudAuthSlice) => ({
      ...prev,
      syncStatus: syncStatus,
    }));
  },
  setUserId: (userId?: string) => {
    set((prev: AzureCloudAuthSlice) => ({
      ...prev,
      userId: userId,
    }));
  },
  setCosmosAccessToken: (cosmosAccessToken?: string) => {
    set((prev: AzureCloudAuthSlice) => ({
      ...prev,
      cosmosAccessToken: cosmosAccessToken,
    }));
  }
});

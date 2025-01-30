import { StoreApi, create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AzureCloudAuthSlice, createAzureCloudAuthSlice } from './azure-cloud-auth-slice';

export type StoreState = AzureCloudAuthSlice;

export type StoreSlice<T> = (
  set: StoreApi<StoreState>['setState'],
  get: StoreApi<StoreState>['getState']
) => T;

const useAzureCloudAuthStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...createAzureCloudAuthSlice(set, get),
    }),
    {
      name: 'cloud',
      partialize: (state) => ({
        cloudSync: state.cloudSync,
        userId: state.userId,
      }),
      version: 1,
    }
  )
);

export default useAzureCloudAuthStore;

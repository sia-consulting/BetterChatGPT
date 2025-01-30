import { StoreApi, create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GoogleCloudAuthSlice, createGoogleCloudAuthSlice } from './google-cloud-auth-slice';

export type StoreState = GoogleCloudAuthSlice;

export type StoreSlice<T> = (
  set: StoreApi<StoreState>['setState'],
  get: StoreApi<StoreState>['getState']
) => T;

const useGoogleCloudAuthStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...createGoogleCloudAuthSlice(set, get),
    }),
    {
      name: 'cloud',
      partialize: (state) => ({
        cloudSync: state.cloudSync,
        fileId: state.fileId,
      }),
      version: 1,
    }
  )
);

export default useGoogleCloudAuthStore;

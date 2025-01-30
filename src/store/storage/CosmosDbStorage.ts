import { PersistStorage, StorageValue, StateStorage } from 'zustand/middleware';
import useAzureCloudAuthStore from '@store/azure-cloud-auth-store';
import useStore from '@store/store';
import { CosmosClient } from '@azure/cosmos';

const cosmosEndpoint = import.meta.env.VITE_COSMOS_ENDPOINT;
const cosmosKey = import.meta.env.VITE_COSMOS_KEY;
const cosmosClient = cosmosKey && cosmosEndpoint ? new CosmosClient({
  endpoint: cosmosEndpoint,
  //key: cosmosKey,
  tokenProvider: (request) => {
    return new Promise((resolve, reject) => {
      const token = useAzureCloudAuthStore.getState().cosmosAccessToken;
      if(token) {
        console.log('token', `type=aad&ver=1.0&sig=${token}`);
        resolve(`type=aad&ver=1.0&sig=${token}`);
      }
      else {
        reject(new Error('No token available'));
      }
    });
  }
}) : undefined;

interface CosmosItem<S> extends PersistStorage<S>{
    id: string;
    userId: string;
}


const createCosmosCloudStorage = <S>(): PersistStorage<S> | undefined => {
  const accessToken = useAzureCloudAuthStore.getState().azureAccessToken;
  const userId = useAzureCloudAuthStore.getState().userId;
  if (!accessToken || !userId) return;
  const cosmosContainer = cosmosClient?.database('siaconsultingchat').container('chathistory');

  const persistStorage: PersistStorage<S> = {
    getItem: async (name) => {
        useAzureCloudAuthStore.getState().setSyncStatus('syncing');
      try {
        const accessToken = useAzureCloudAuthStore.getState().azureAccessToken;
        const userId = useAzureCloudAuthStore.getState().userId;
        if (!accessToken || !userId) return null;

        const data: CosmosItem<S> | undefined = cosmosContainer ? (await cosmosContainer.item(name, userId).read<CosmosItem<S>>()).resource : undefined;
        useAzureCloudAuthStore.getState().setSyncStatus('synced');
        return (data || {}) as StorageValue<S>;
      } catch (e: unknown) {
        useAzureCloudAuthStore.getState().setSyncStatus('unauthenticated');
        useStore.getState().setToastMessage((e as Error).message);
        useStore.getState().setToastShow(true);
        useStore.getState().setToastStatus('error');
        return null;
      }
    },
    setItem: async (name, newValue): Promise<void> => {
      const accessToken = useAzureCloudAuthStore.getState().azureAccessToken;
      const userId = useAzureCloudAuthStore.getState().userId;
      if (!accessToken || !userId) return;

      if (useAzureCloudAuthStore.getState().syncStatus !== 'unauthenticated') {
        useAzureCloudAuthStore.getState().setSyncStatus('syncing');

        if(cosmosContainer) {
            await cosmosContainer.items.upsert({
                id: name,
                userId: userId,
                ...newValue,
            });
        }
      }
    },

    removeItem: async (name): Promise<void> => {
      const accessToken = useAzureCloudAuthStore.getState().azureAccessToken;
      const userId = useAzureCloudAuthStore.getState().userId;
      if (!accessToken || !userId) return;
      if(cosmosContainer) {
        await cosmosContainer.item(name, userId).delete();
      }
    },
  };
  return persistStorage;
};

export default createCosmosCloudStorage;

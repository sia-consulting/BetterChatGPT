import React, { useEffect, useState } from 'react';
import useStore, { StoreState } from '@store/store';
import i18n from './i18n';

import Chat from '@components/Chat';
import Menu from '@components/Menu';

import useInitialiseNewChat from '@hooks/useInitialiseNewChat';
import { ChatInterface } from '@type/chat';
import { Theme } from '@type/theme';
import ApiPopup from '@components/ApiPopup';
import Toast from '@components/Toast';
import { InteractiveBrowserCredential } from '@azure/identity';
import { jwtDecode } from 'jwt-decode';
import { EntraDebugJwt } from '@type/entra';
import useAzureCloudAuthStore from '@store/azure-cloud-auth-store';
import createCosmosCloudStorage from '@store/storage/CosmosDbStorage';

function App() {
  const initialiseNewChat = useInitialiseNewChat();
  const setChats = useStore((state) => state.setChats);
  const setTheme = useStore((state) => state.setTheme);
  const setApiKey = useStore((state) => state.setApiKey);
  const setUserId = useAzureCloudAuthStore((state) => state.setUserId);
  const setAzureAccessToken = useAzureCloudAuthStore((state) => state.setAzureAccessToken);
  const setCosmosAccessToken = useAzureCloudAuthStore((state) => state.setCosmosAccessToken);
  const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);
  const [authenticationInProcess, setAuthenticationInProcess] = useState<boolean>(() => false);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    i18n.on('languageChanged', (lng) => {
      document.documentElement.lang = lng;
    });
  }, []);

  useEffect(() => {
    if(!authenticationInProcess) {
      setAuthenticationInProcess(true);
      const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
      const scope = import.meta.env.VITE_AZURE_SCOPE_CLIENT_ID;
      var azureCredentials = new InteractiveBrowserCredential({
        clientId: clientId,
        tenantId: import.meta.env.VITE_AZURE_TENANT_ID,
        redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI,
        
      });
      azureCredentials.getToken([`api://${scope}/user_impersonation`]).then((token) => {
        setAzureAccessToken(token.token);
        const decodedToken = jwtDecode<EntraDebugJwt>(token.token);
        if(decodedToken.oid) {
          setUserId(decodedToken.oid);
        }
      }).then(() => {
        azureCredentials.getToken(['https://cosmos.azure.com/user_impersonation']).then((token) => {
          setCosmosAccessToken(token.token);
          useStore.persist.setOptions({
            storage: createCosmosCloudStorage(),
          });
          useStore.persist.rehydrate();
        });
      }).finally(() => {
        setAuthenticationInProcess(false);
      });      
    }
  });

  useEffect(() => {
    // legacy local storage
    const oldChats = localStorage.getItem('chats');
    const apiKey = localStorage.getItem('apiKey');
    const theme = localStorage.getItem('theme');

    if (apiKey) {
      // legacy local storage
      setApiKey(apiKey);
      localStorage.removeItem('apiKey');
    }

    if (theme) {
      // legacy local storage
      setTheme(theme as Theme);
      localStorage.removeItem('theme');
    }

    if (oldChats) {
      // legacy local storage
      try {
        const chats: ChatInterface[] = JSON.parse(oldChats);
        if (chats.length > 0) {
          setChats(chats);
          setCurrentChatIndex(0);
        } else {
          initialiseNewChat();
        }
      } catch (e: unknown) {
        console.log(e);
        initialiseNewChat();
      }
      localStorage.removeItem('chats');
    } else {
      // existing local storage
      const chats = useStore.getState().chats;
      const currentChatIndex = useStore.getState().currentChatIndex;
      if (!chats || chats.length === 0) {
        initialiseNewChat();
      }
      if (
        chats &&
        !(currentChatIndex >= 0 && currentChatIndex < chats.length)
      ) {
        setCurrentChatIndex(0);
      }
    }
  }, []);

  return (
    <div className='overflow-hidden w-full h-full relative'>
      <Menu />
      <Chat />
      <ApiPopup />
      <Toast />
    </div>
  );
}

export default App;

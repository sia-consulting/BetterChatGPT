export const officialAPIEndpoint = 'https://api.openai.com/v1/chat/completions';
export const siaConsultingAPIEndpoint = 'https://gptworkshop2.openai.azure.com/';
const customAPIEndpoint =
  import.meta.env.VITE_CUSTOM_API_ENDPOINT || 'https://chatgpt-api.shn.hk/v1/';
export const defaultAPIEndpoint =
  import.meta.env.VITE_DEFAULT_API_ENDPOINT || siaConsultingAPIEndpoint;

export const availableEndpoints = [siaConsultingAPIEndpoint,officialAPIEndpoint, customAPIEndpoint];

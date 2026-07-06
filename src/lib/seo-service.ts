import { cache } from 'react';
import { grpcSeoClient } from './grpc';

export const getCachedGlobalConfig = cache(async () => {
  try {
    const response = await grpcSeoClient.getGlobalConfig({});
    if (response && response.success && response.data) {
      return response.data;
    }
  } catch (error) {
    console.error('[gRPC SEO] Error fetching global SEO config:', error);
  }
  return null;
});

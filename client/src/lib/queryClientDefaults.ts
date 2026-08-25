export const queryClientDefaults = {
  queries: {
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  },
  mutations: {
    retry: 0,
  },
} as const;

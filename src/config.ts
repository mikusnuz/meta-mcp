export interface MetaConfig {
  appId: string;
  appSecret: string;
  instagramAccessToken: string;
  instagramUserId: string;
  threadsAccessToken: string;
  threadsUserId: string;
}

export function loadConfig(): MetaConfig {
  return {
    appId: process.env.META_APP_ID || "",
    appSecret: process.env.META_APP_SECRET || "",
    instagramAccessToken: process.env.INSTAGRAM_ACCESS_TOKEN || "",
    instagramUserId: process.env.INSTAGRAM_USER_ID || "",
    threadsAccessToken: process.env.THREADS_ACCESS_TOKEN || "",
    threadsUserId: process.env.THREADS_USER_ID || "",
  };
}

declare interface ImportMetaEnv {
  VITE_API_GATEWAY_URL?: string;
  VITE_API_KEY?: string;
  VITE_PAYMENTS_ENABLED?: string;
  VITE_STRIPE_PUBLIC_KEY?: string;
  VITE_STRIPE_PUBLISHABLE_KEY?: string;
  VITE_PAYPAL_CLIENT_ID?: string;
  [key: string]: string | undefined;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    __VISITJO_RUNTIME_CONFIG__?: any;
    paypal?: any;
    gtag?: (...args: any[]) => void;
    openChatBot?: () => void;
    "__VISIT-JO_rum"?: any;
    [key: string]: any;
  }
}

export {};

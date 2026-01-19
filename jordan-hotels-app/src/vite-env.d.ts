/// <reference types="vite/client" />

declare global {
  interface Window {
    AuthContext: any;
    debugCurrentUser: any;
  }
}
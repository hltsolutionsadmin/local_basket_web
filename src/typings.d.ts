// src/typings.d.ts
interface Window {
  initMap: () => void;
  electronAPI: {
    ping: () => string;
    getCurrentLocation: () => Promise<{ lat: number; lng: number }>;
    getPrinters: () => Promise<{
      success: boolean;
      printers?: Array<{
        name: string;
        description: string;
        status: number;
        isDefault: boolean;
        options: object;
      }>;
      message?: string;
    }>;
    getDefaultPrinter: () => Promise<string | null>;
    print: (html: string, deviceName?: string) => Promise<{ success: boolean; error?: string }>;
  };
}
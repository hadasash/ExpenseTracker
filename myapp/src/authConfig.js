import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "YOUR_CLIENT_ID",
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID",
    redirectUri: "/redirect", // ה-redirect URI כמו שמוגדר בפורטל Azure
  },
};

export const instance = new PublicClientApplication(msalConfig);

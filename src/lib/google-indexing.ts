import { GoogleAuth } from "google-auth-library";

const INDEXING_API_URL =
  "https://indexing.googleapis.com/v3/urlNotifications:publish";

const SCOPES = ["https://www.googleapis.com/auth/indexing"];

type NotificationType = "URL_UPDATED" | "URL_DELETED";

let authClient: GoogleAuth | null = null;

function getAuthClient(): GoogleAuth | null {
  const privateKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY;
  const clientEmail = process.env.GOOGLE_INDEXING_CLIENT_EMAIL;

  if (!privateKey || !clientEmail) {
    console.warn(
      "[Google Indexing] GOOGLE_INDEXING_PRIVATE_KEY oder GOOGLE_INDEXING_CLIENT_EMAIL nicht gesetzt – Indexierung deaktiviert."
    );
    return null;
  }

  if (!authClient) {
    authClient = new GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, "\n"),
      },
      scopes: SCOPES,
    });
  }

  return authClient;
}

async function notifyGoogle(
  url: string,
  type: NotificationType
): Promise<{ success: boolean; status?: number; error?: string }> {
  const auth = getAuthClient();
  if (!auth) {
    return { success: false, error: "Indexing API nicht konfiguriert" };
  }

  try {
    const client = await auth.getClient();
    const response = await client.request({
      url: INDEXING_API_URL,
      method: "POST",
      data: { url, type },
    });

    console.log(
      `[Google Indexing] ${type} für ${url} – Status: ${response.status}`
    );
    return { success: true, status: response.status };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unbekannter Fehler";
    console.error(`[Google Indexing] Fehler bei ${type} für ${url}:`, message);
    return { success: false, error: message };
  }
}

export async function notifyUrlUpdated(url: string) {
  return notifyGoogle(url, "URL_UPDATED");
}

export async function notifyUrlDeleted(url: string) {
  return notifyGoogle(url, "URL_DELETED");
}

const BASE_URL = "https://www.motorrad.news";

export function buildArticleUrl(categorySlug: string, articleSlug: string) {
  return `${BASE_URL}/${categorySlug}/${articleSlug}`;
}

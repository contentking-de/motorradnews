import { GoogleAuth } from "google-auth-library";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";

const INDEXING_API_URL =
  "https://indexing.googleapis.com/v3/urlNotifications:publish";

const SCOPES = ["https://www.googleapis.com/auth/indexing"];

type NotificationType = "URL_UPDATED" | "URL_DELETED";

export type IndexingResult = {
  success: boolean;
  status?: number;
  error?: string;
};

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
): Promise<IndexingResult> {
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

/**
 * Notify Google that a URL was updated, persist the result in the DB.
 */
export async function notifyUrlUpdated(
  url: string,
  articleId?: string
): Promise<IndexingResult> {
  const result = await notifyGoogle(url, "URL_UPDATED");

  if (articleId) {
    await db
      .update(articles)
      .set(
        result.success
          ? { googleIndexedAt: new Date(), googleIndexingError: null }
          : { googleIndexingError: result.error ?? "Unbekannter Fehler" }
      )
      .where(eq(articles.id, articleId));
  }

  return result;
}

/**
 * Notify Google that a URL was deleted, persist the result in the DB.
 */
export async function notifyUrlDeleted(
  url: string,
  articleId?: string
): Promise<IndexingResult> {
  const result = await notifyGoogle(url, "URL_DELETED");

  if (articleId) {
    await db
      .update(articles)
      .set(
        result.success
          ? { googleIndexedAt: null, googleIndexingError: null }
          : { googleIndexingError: result.error ?? "Unbekannter Fehler" }
      )
      .where(eq(articles.id, articleId));
  }

  return result;
}

const BASE_URL = "https://www.motorrad.news";

export function buildArticleUrl(categorySlug: string, articleSlug: string) {
  return `${BASE_URL}/${categorySlug}/${articleSlug}`;
}

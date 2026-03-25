"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ConsentCategory = "necessary" | "statistics" | "marketing";

export type ConsentState = Record<ConsentCategory, boolean>;

const COOKIE_NAME = "mn_consent";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  statistics: false,
  marketing: false,
};

type ConsentContextValue = {
  consent: ConsentState | null;
  hasDecided: boolean;
  showBanner: boolean;
  accept: (categories: Partial<ConsentState>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  openSettings: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

function readCookie(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`)
  );
  if (!match) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]));
    return { ...DEFAULT_CONSENT, ...parsed, necessary: true };
  } catch {
    return null;
  }
}

function writeCookie(state: ConsentState) {
  const value = encodeURIComponent(JSON.stringify(state));
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    const stored = readCookie();
    if (stored) {
      setConsent(stored);
    } else {
      setBannerVisible(true);
    }
  }, []);

  const accept = useCallback((categories: Partial<ConsentState>) => {
    const next: ConsentState = {
      ...DEFAULT_CONSENT,
      ...categories,
      necessary: true,
    };
    setConsent(next);
    writeCookie(next);
    setBannerVisible(false);
  }, []);

  const acceptAll = useCallback(() => {
    accept({ necessary: true, statistics: true, marketing: true });
  }, [accept]);

  const rejectAll = useCallback(() => {
    accept({ necessary: true, statistics: false, marketing: false });
  }, [accept]);

  const openSettings = useCallback(() => {
    setBannerVisible(true);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      hasDecided: consent !== null,
      showBanner: bannerVisible,
      accept,
      acceptAll,
      rejectAll,
      openSettings,
    }),
    [consent, bannerVisible, accept, acceptAll, rejectAll, openSettings]
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used within <ConsentProvider>");
  }
  return ctx;
}

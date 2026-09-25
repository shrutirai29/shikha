import { useEffect } from "react";

const SITE = "Knottiingale";

/**
 * Sets the browser tab title for the current page and restores a sensible
 * default on unmount.
 */
export const usePageTitle = (title?: string) => {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE}` : SITE;

    return () => {
      document.title = SITE;
    };
  }, [title]);
};

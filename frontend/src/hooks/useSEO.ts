import { useEffect } from "react";

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "product";
  productData?: {
    name: string;
    price: number;
    currency?: string;
    inStock: boolean;
    image?: string;
    rating?: number;
    reviewCount?: number;
  };
}

const DEFAULT_TITLE = "Knottiingale — Artisanal Handmade Crochet Treasures";
const DEFAULT_DESCRIPTION =
  "Discover bespoke handmade crochet treasures, cuddly plushies, aesthetic torans, and cozy warm throws stitched with love by Shikha Rai. Secure checkout with COD and Razorpay.";
const DEFAULT_IMAGE = "https://knottiingale.com/og-image.jpg";
const BASE_URL = "https://knottiingale.com";

const setMetaTag = (selector: string, attr: string, value: string) => {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    const [attrName, attrVal] = selector
      .replace(/^meta\[/, "")
      .replace(/\]$/, "")
      .split("=");
    element.setAttribute(attrName, attrVal.replace(/['"]/g, ""));
    document.head.appendChild(element);
  }
  element.setAttribute(attr, value);
};

export const useSEO = ({
  title,
  description,
  image,
  url,
  type = "website",
  productData,
}: SEOProps) => {
  useEffect(() => {
    const fullTitle = title
      ? `${title} — Knottiingale`
      : DEFAULT_TITLE;
    const metaDesc = description || DEFAULT_DESCRIPTION;
    const metaImg = image || DEFAULT_IMAGE;
    const metaUrl = url
      ? url.startsWith("http")
        ? url
        : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`
      : window.location.href;

    // Document title
    document.title = fullTitle;

    // Standard Description
    setMetaTag('meta[name="description"]', "content", metaDesc);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", metaUrl);

    // Open Graph Tags
    setMetaTag('meta[property="og:title"]', "content", fullTitle);
    setMetaTag('meta[property="og:description"]', "content", metaDesc);
    setMetaTag('meta[property="og:image"]', "content", metaImg);
    setMetaTag('meta[property="og:url"]', "content", metaUrl);
    setMetaTag('meta[property="og:type"]', "content", type);

    // Twitter Card Tags
    setMetaTag('meta[name="twitter:title"]', "content", fullTitle);
    setMetaTag('meta[name="twitter:description"]', "content", metaDesc);
    setMetaTag('meta[name="twitter:image"]', "content", metaImg);

    // Inject Product JSON-LD Schema if applicable
    let scriptTag = document.getElementById("product-jsonld") as HTMLScriptElement | null;
    if (productData) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = "product-jsonld";
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }

      scriptTag.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: productData.name,
        image: productData.image || metaImg,
        description: metaDesc,
        brand: {
          "@type": "Brand",
          name: "Knottiingale",
        },
        offers: {
          "@type": "Offer",
          price: productData.price,
          priceCurrency: productData.currency || "INR",
          availability: productData.inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url: metaUrl,
        },
        ...(productData.rating && productData.rating > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: productData.rating,
                reviewCount: productData.reviewCount || 1,
              },
            }
          : {}),
      });
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      document.title = DEFAULT_TITLE;
      const productScript = document.getElementById("product-jsonld");
      if (productScript) productScript.remove();
    };
  }, [title, description, image, url, type, productData]);
};

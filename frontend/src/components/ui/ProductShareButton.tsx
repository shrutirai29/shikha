import React, { useState } from "react";
import { Share2, Link as LinkIcon, Check } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

interface ProductShareButtonProps {
  title?: string;
  url?: string;
  className?: string;
}

export const ProductShareButton: React.FC<ProductShareButtonProps> = ({
  title = "Knottiingale Handmade Crochet",
  url,
  className,
}) => {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareText = `Check out "${title}" on Knottiingale — handmade crochet treasures!`;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Product link copied to clipboard!");
        setTimeout(() => setCopied(false), 2500);
      } else {
        toast.info(shareUrl);
      }
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleTwitterShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={cn("share-btn", className)}
      role="region"
      aria-label="Share product"
      tabIndex={0}
    >
      {/* Default Label Pill */}
      <span className="share-pill">
        <Share2 className="size-3.5" />
        <span>Share</span>
      </span>

      {/* Hover Reveal Social Icons */}
      <div className="share-container" role="toolbar" aria-label="Share options">
        {/* 1. Twitter / X (from Uiverse snippet) */}
        <button
          type="button"
          onClick={handleTwitterShare}
          className="share-icon-link text-slate-700 hover:text-[#1DA1F2] dark:text-slate-300 dark:hover:text-[#1DA1F2]"
          title="Share on X / Twitter"
          aria-label="Share on X"
        >
          <svg
            className="size-5 fill-current"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M962.267429 233.179429q-38.253714 56.027429-92.598857 95.451429 0.585143 7.972571 0.585143 23.990857 0 74.313143-21.723429 148.260571t-65.974857 141.970286-105.398857 120.32-147.456 83.456-184.539429 31.158857q-154.843429 0-283.428571-82.870857 19.968 2.267429 44.544 2.267429 128.585143 0 229.156571-78.848-59.977143-1.170286-107.446857-36.864t-65.170286-91.136q18.870857 2.852571 34.889143 2.852571 24.576 0 48.566857-6.290286-64-13.165714-105.984-63.707429t-41.984-117.394286l0-2.267429q38.838857 21.723429 83.456 23.405714-37.741714-25.161143-59.977143-65.682286t-22.308571-87.990857q0-50.322286 25.161143-93.110857 69.12 85.138286 168.301714 136.265143t212.260571 56.832q-4.534857-21.723429-4.534857-42.276571 0-76.580571 53.979429-130.56t130.56-53.979429q80.018286 0 134.875429 58.294857 62.317714-11.995429 117.174857-44.544-21.138286 65.682286-81.115429 101.741714 53.174857-5.705143 106.276571-28.598857z" />
          </svg>
        </button>

        {/* 2. WhatsApp Share */}
        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="share-icon-link text-slate-700 hover:text-[#25D366] dark:text-slate-300 dark:hover:text-[#25D366]"
          title="Share via WhatsApp"
          aria-label="Share via WhatsApp"
        >
          <svg
            className="size-5 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
          </svg>
        </button>

        {/* 3. Copy Link */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="share-icon-link text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
          title={copied ? "Link Copied!" : "Copy Product Link"}
          aria-label="Copy link"
        >
          {copied ? (
            <Check className="size-4.5 text-emerald-500" />
          ) : (
            <LinkIcon className="size-4.5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductShareButton;

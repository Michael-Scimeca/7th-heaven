import { useState, useCallback } from "react";

export function useCopyToClipboard(resetDelay = 2000) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (!navigator?.clipboard) {
        console.warn("Clipboard unavailable");
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopiedText(text);
        setIsCopied(true);

        setTimeout(() => {
          setIsCopied(false);
          setCopiedText(null);
        }, resetDelay);

        return true;
      } catch (error) {
        console.warn("Copy failed", error);
        setIsCopied(false);
        setCopiedText(null);
        return false;
      }
    },
    [resetDelay],
  );

  return { copy, isCopied, copiedText };
}

export default useCopyToClipboard;

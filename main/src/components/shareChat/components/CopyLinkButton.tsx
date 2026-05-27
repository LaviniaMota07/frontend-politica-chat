import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { buttonStyles, formStyles } from "../../../utils/tailwindStyles";

const CopyLinkButton = () => {
  const [sharedLink, setSharedLink] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  function handleGenerateLink() {
    alert("Link gerado com sucesso!");
    setSharedLink("https://exemplo.com/link-compartilhado");
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(sharedLink);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }

  return (
    <div className="border-t border-white/10 px-6 py-5">
      <button type="button" className={buttonStyles.secondary} onClick={handleGenerateLink}>
        Gerar link
      </button>
      {sharedLink != "" && (
        <div className="mt-3 flex gap-2 max-[640px]:flex-col">
          <input className={formStyles.input} type="text" value={sharedLink} readOnly aria-label="Link compartilhável" />
          <button type="button" className={buttonStyles.primary} onClick={handleCopyLink}>
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            {isCopied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CopyLinkButton;

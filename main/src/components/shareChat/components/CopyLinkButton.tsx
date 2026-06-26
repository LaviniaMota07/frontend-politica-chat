import { Check, Copy } from "lucide-react";
import { useState } from "react";

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
    <div className="chat-share-link-area">
      <button type="button" className="chat-share-generate" onClick={handleGenerateLink}>
        Gerar link
      </button>
      {sharedLink != "" && (
        <div className="chat-share-link-box">
          <input type="text" value={sharedLink} readOnly aria-label="Link compartilhável" />
          <button type="button" onClick={handleCopyLink}>
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            {isCopied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CopyLinkButton;

import { useEffect, useState } from "react";

function isStandaloneMode() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem("pwaInstallDismissed") === "true";
  });

  useEffect(() => {
    if (isStandaloneMode() || isDismissed) {
      return undefined;
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    setShowIosHelp(isIosDevice());

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [isDismissed]);

  const dismissPrompt = () => {
    localStorage.setItem("pwaInstallDismissed", "true");
    setIsDismissed(true);
  };

  const installApp = async () => {
    if (!installPrompt) {
      return;
    }

    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    dismissPrompt();
  };

  if (isDismissed || isStandaloneMode() || (!installPrompt && !showIosHelp)) {
    return null;
  }

  return (
    <aside className="install-prompt" aria-label="Install app prompt">
      <div>
        <strong>Install this portal</strong>
        <p>
          {installPrompt
            ? "Add it to your home screen for quick mobile access."
            : "On iPhone, use Share and then Add to Home Screen."}
        </p>
      </div>
      <div className="install-actions">
        {installPrompt ? (
          <button type="button" onClick={installApp}>
            Install
          </button>
        ) : null}
        <button type="button" className="install-dismiss" onClick={dismissPrompt}>
          Later
        </button>
      </div>
    </aside>
  );
}

export default InstallPrompt;

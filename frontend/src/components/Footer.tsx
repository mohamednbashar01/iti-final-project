import { useLanguage } from "../i18n/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="footer-iti">
          {/* Drop the institute logo at frontend/public/iti.png (served at the site root as /iti.png) */}
          <img src="/iti.png" alt="ITI" className="iti-logo" />
          <p>{t("footer.itiCredit")}</p>
        </div>
        <div className="footer-meta">
          <p>{t("footer.builtWith")}</p>
          <a
            href="https://github.com/mohamednbashar01/iti-final-project"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-github"
          >
            {t("footer.github")}
          </a>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { t } = useLanguage();

  return (
    <header className="app-header">
      <Link to="/" className="app-header-title">
        {t("app.title")}
      </Link>
      <div className="app-header-controls">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}

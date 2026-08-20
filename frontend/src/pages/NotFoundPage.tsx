import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <main className="page">
      <div className="card result-card">
        <h1>{t("notFound.title")}</h1>
        <p>{t("notFound.body")}</p>
        <Link to="/" className="btn-link">
          {t("result.backHome")}
        </Link>
      </div>
    </main>
  );
}

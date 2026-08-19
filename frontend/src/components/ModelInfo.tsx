import { useLanguage } from "../i18n/LanguageContext";

export default function ModelInfo() {
  const { t } = useLanguage();

  return (
    <section className="page-section">
      <div className="info-card">
        <h2 className="section-heading">{t("modelInfo.title")}</h2>
        <p>{t("modelInfo.body")}</p>
        <p className="disclaimer">{t("modelInfo.disclaimer")}</p>
      </div>
    </section>
  );
}

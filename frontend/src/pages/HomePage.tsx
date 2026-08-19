import PredictionForm from "../components/PredictionForm";
import HowItWorks from "../components/HowItWorks";
import ModelInfo from "../components/ModelInfo";
import Faq from "../components/Faq";
import { useLanguage } from "../i18n/LanguageContext";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <>
      <div className="hero">
        <h1>{t("app.title")}</h1>
        <p className="subtitle">{t("app.subtitle")}</p>
      </div>
      <main className="page">
        <PredictionForm />
        <HowItWorks />
        <ModelInfo />
        <Faq />
      </main>
    </>
  );
}

import { useLanguage } from "../i18n/LanguageContext";

export default function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    { title: t("howItWorks.step1Title"), body: t("howItWorks.step1Body") },
    { title: t("howItWorks.step2Title"), body: t("howItWorks.step2Body") },
    { title: t("howItWorks.step3Title"), body: t("howItWorks.step3Body") },
  ];

  return (
    <section className="page-section">
      <h2 className="section-heading">{t("howItWorks.title")}</h2>
      <div className="steps-grid">
        {steps.map((step, index) => (
          <div className="step" key={step.title}>
            <span className="step-number">{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

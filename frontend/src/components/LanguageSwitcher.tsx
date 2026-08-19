import { useLanguage } from "../i18n/LanguageContext";
import { LANGUAGE_NAMES, LOCALES } from "../i18n/translations";
import type { Locale } from "../i18n/translations";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <select
      className="language-switcher"
      aria-label={t("language.label")}
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
    >
      {LOCALES.map((loc) => (
        <option key={loc} value={loc}>
          {LANGUAGE_NAMES[loc]}
        </option>
      ))}
    </select>
  );
}

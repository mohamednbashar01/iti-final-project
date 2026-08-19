import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

interface ResultLocationState {
  predictedPrice?: number;
}

function formatIndianPrice(price: number): string {
  const crore = 1_00_00_000;
  const lac = 1_00_000;

  if (price >= crore) {
    return `₹ ${(price / crore).toFixed(2)} Cr`;
  }
  if (price >= lac) {
    return `₹ ${(price / lac).toFixed(2)} Lac`;
  }
  return `₹ ${price.toLocaleString("en-IN")}`;
}

export default function ResultPage() {
  const location = useLocation();
  const { t } = useLanguage();
  const state = location.state as ResultLocationState | null;
  const predictedPrice = state?.predictedPrice;

  if (predictedPrice === undefined) {
    return (
      <main className="page">
        <div className="card result-card">
          <h1>{t("result.notFoundTitle")}</h1>
          <p>{t("result.notFoundBody")}</p>
          <Link to="/" className="btn-link">
            {t("result.backHome")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="card result-card">
        <span className="result-label">{t("result.label")}</span>
        <p className="predicted-price">{formatIndianPrice(predictedPrice)}</p>
        <Link to="/" className="btn-link">
          {t("result.another")}
        </Link>
      </div>
    </main>
  );
}

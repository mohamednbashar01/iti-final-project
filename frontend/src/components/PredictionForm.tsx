import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getPrediction } from "../api/predictionClient";
import type { PredictionRequest } from "../types/prediction";
import { useLanguage } from "../i18n/LanguageContext";
import type { TranslationKey } from "../i18n/translations";
// TODO: replace with real locations.json exported from the notebook
import locations from "../data/locations.json";

// The `value` sent to the API must stay a fixed, untranslated string —
// only the `labelKey` (display text) changes with the selected UI language.
const FURNISHING_OPTIONS: { value: PredictionRequest["furnishing"]; labelKey: TranslationKey }[] = [
  { value: "Furnished", labelKey: "furnishing.furnished" },
  { value: "Semi-Furnished", labelKey: "furnishing.semiFurnished" },
  { value: "Unfurnished", labelKey: "furnishing.unfurnished" },
];

const TRANSACTION_OPTIONS: { value: PredictionRequest["transaction"]; labelKey: TranslationKey }[] = [
  { value: "New Property", labelKey: "transaction.newProperty" },
  { value: "Resale", labelKey: "transaction.resale" },
];

// Values confirmed from the actual dataset (df["Ownership"].unique() / df["facing"].unique()). Keep exact spelling/spacing — must match what the model was trained on.
const OWNERSHIP_OPTIONS: { value: string; labelKey: TranslationKey }[] = [
  { value: "Freehold", labelKey: "ownership.freehold" },
  { value: "Co-operative Society", labelKey: "ownership.coopSociety" },
  { value: "Power Of Attorney", labelKey: "ownership.powerOfAttorney" },
  { value: "Leasehold", labelKey: "ownership.leasehold" },
];

// Values confirmed from the actual dataset (df["Ownership"].unique() / df["facing"].unique()). Keep exact spelling/spacing — must match what the model was trained on.
// `value` is sent to the API byte-for-byte as-is; `labelKey` is only for display and may be reformatted/translated.
const FACING_OPTIONS: { value: string; labelKey: TranslationKey }[] = [
  { value: "East", labelKey: "facing.east" },
  { value: "West", labelKey: "facing.west" },
  { value: "North", labelKey: "facing.north" },
  { value: "North - East", labelKey: "facing.northEast" },
  { value: "North - West", labelKey: "facing.northWest" },
  { value: "South", labelKey: "facing.south" },
  { value: "South -West", labelKey: "facing.southWest" },
  { value: "South - East", labelKey: "facing.southEast" },
];

interface FormState {
  location: string;
  carpet_area_sqft: string;
  floor_num: string;
  bathroom: string;
  balcony: string;
  furnishing: string;
  transaction: string;
  ownership: string;
  facing: string;
}

const INITIAL_STATE: FormState = {
  location: "",
  carpet_area_sqft: "",
  floor_num: "",
  bathroom: "",
  balcony: "",
  furnishing: "",
  transaction: "",
  ownership: "",
  facing: "",
};

type FieldErrors = Partial<Record<keyof FormState, TranslationKey>>;

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.location) errors.location = "validation.locationRequired";
  if (!form.furnishing) errors.furnishing = "validation.furnishingRequired";
  if (!form.transaction) errors.transaction = "validation.transactionRequired";
  if (!form.ownership) errors.ownership = "validation.ownershipRequired";
  if (!form.facing) errors.facing = "validation.facingRequired";

  const carpetArea = Number(form.carpet_area_sqft);
  if (form.carpet_area_sqft.trim() === "" || Number.isNaN(carpetArea)) {
    errors.carpet_area_sqft = "validation.carpetAreaRequired";
  } else if (carpetArea <= 0) {
    errors.carpet_area_sqft = "validation.carpetAreaPositive";
  }

  for (const field of ["floor_num", "bathroom", "balcony"] as const) {
    const raw = form[field];
    const value = Number(raw);
    if (raw.trim() === "" || Number.isNaN(value)) {
      errors[field] = "validation.fieldRequired";
    } else if (value < 0) {
      errors[field] = "validation.nonNegative";
    }
  }

  return errors;
}

export default function PredictionForm() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    const payload: PredictionRequest = {
      location: form.location,
      carpet_area_sqft: Number(form.carpet_area_sqft),
      floor_num: Number(form.floor_num),
      bathroom: Number(form.bathroom),
      balcony: Number(form.balcony),
      furnishing: form.furnishing as PredictionRequest["furnishing"],
      transaction: form.transaction as PredictionRequest["transaction"],
      ownership: form.ownership,
      facing: form.facing,
    };

    setIsSubmitting(true);
    try {
      const result = await getPrediction(payload);
      navigate("/result", { state: { predictedPrice: result.predicted_price } });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="prediction-form card" onSubmit={handleSubmit} noValidate>
      <div className="form-section">
        <h2 className="section-title">{t("section.locationArea")}</h2>
        <div className="field-grid">
          <div className="form-field field-wide">
            <label htmlFor="location">{t("field.location")}</label>
            <select
              id="location"
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
            >
              <option value="">{t("field.locationPlaceholder")}</option>
              {(locations as string[]).map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            {errors.location && <span className="field-error">{t(errors.location)}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="carpet_area_sqft">{t("field.carpetArea")}</label>
            <input
              id="carpet_area_sqft"
              type="number"
              value={form.carpet_area_sqft}
              onChange={(e) => handleChange("carpet_area_sqft", e.target.value)}
            />
            {errors.carpet_area_sqft && (
              <span className="field-error">{t(errors.carpet_area_sqft)}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="floor_num">{t("field.floorNum")}</label>
            <input
              id="floor_num"
              type="number"
              value={form.floor_num}
              onChange={(e) => handleChange("floor_num", e.target.value)}
            />
            {errors.floor_num && <span className="field-error">{t(errors.floor_num)}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2 className="section-title">{t("section.roomsFurnishing")}</h2>
        <div className="field-grid">
          <div className="form-field">
            <label htmlFor="bathroom">{t("field.bathroom")}</label>
            <input
              id="bathroom"
              type="number"
              value={form.bathroom}
              onChange={(e) => handleChange("bathroom", e.target.value)}
            />
            {errors.bathroom && <span className="field-error">{t(errors.bathroom)}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="balcony">{t("field.balcony")}</label>
            <input
              id="balcony"
              type="number"
              value={form.balcony}
              onChange={(e) => handleChange("balcony", e.target.value)}
            />
            {errors.balcony && <span className="field-error">{t(errors.balcony)}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="furnishing">{t("field.furnishing")}</label>
            <select
              id="furnishing"
              value={form.furnishing}
              onChange={(e) => handleChange("furnishing", e.target.value)}
            >
              <option value="">{t("field.furnishingPlaceholder")}</option>
              {FURNISHING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>
            {errors.furnishing && <span className="field-error">{t(errors.furnishing)}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2 className="section-title">{t("section.transactionDetails")}</h2>
        <div className="field-grid">
          <div className="form-field">
            <label htmlFor="transaction">{t("field.transaction")}</label>
            <select
              id="transaction"
              value={form.transaction}
              onChange={(e) => handleChange("transaction", e.target.value)}
            >
              <option value="">{t("field.transactionPlaceholder")}</option>
              {TRANSACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>
            {errors.transaction && <span className="field-error">{t(errors.transaction)}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="ownership">{t("field.ownership")}</label>
            <select
              id="ownership"
              value={form.ownership}
              onChange={(e) => handleChange("ownership", e.target.value)}
            >
              <option value="">{t("field.ownershipPlaceholder")}</option>
              {OWNERSHIP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>
            {errors.ownership && <span className="field-error">{t(errors.ownership)}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="facing">{t("field.facing")}</label>
            <select
              id="facing"
              value={form.facing}
              onChange={(e) => handleChange("facing", e.target.value)}
            >
              <option value="">{t("field.facingPlaceholder")}</option>
              {FACING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>
            {errors.facing && <span className="field-error">{t(errors.facing)}</span>}
          </div>
        </div>
      </div>

      {submitError && <div className="submit-error">{submitError}</div>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("submit.loading") : t("submit.button")}
      </button>
    </form>
  );
}

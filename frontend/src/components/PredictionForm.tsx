import { useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getPrediction } from "../api/predictionClient";
import type { PredictionRequest } from "../types/prediction";
import { useLanguage } from "../i18n/LanguageContext";
import type { TranslationKey } from "../i18n/translations";
// Real location slugs confirmed from the dataset (df["location"].unique()).
import locations from "../data/locations.json";

// The "Carpet area" field always submits area_source: "carpet" — the backend
// also accepts "super" (built-up area), but this form only collects carpet area.
const AREA_SOURCE: PredictionRequest["area_source"] = "carpet";

// Locations are raw dataset slugs (e.g. "new-delhi") — format only for display,
// the value sent to the API stays the exact slug.
function formatLocationLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Number inputs must never accept a "-" (or exponent) keystroke — this is a
// UX guard on top of the >=0 / >0 checks in validate() below.
function blockInvalidNumberKeys(e: KeyboardEvent<HTMLInputElement>) {
  if (["-", "+", "e", "E"].includes(e.key)) {
    e.preventDefault();
  }
}

// The `value` sent to the API must stay a fixed, untranslated string —
// only the `labelKey` (display text) changes with the selected UI language.
const FURNISHING_OPTIONS: { value: PredictionRequest["furnishing"]; labelKey: TranslationKey }[] = [
  { value: "Furnished", labelKey: "furnishing.furnished" },
  { value: "Semi-Furnished", labelKey: "furnishing.semiFurnished" },
  { value: "Unfurnished", labelKey: "furnishing.unfurnished" },
  { value: "Unknown", labelKey: "option.unknown" },
];

const TRANSACTION_OPTIONS: { value: PredictionRequest["transaction"]; labelKey: TranslationKey }[] = [
  { value: "New Property", labelKey: "transaction.newProperty" },
  { value: "Resale", labelKey: "transaction.resale" },
  { value: "Other", labelKey: "option.other" },
];

// Values confirmed from the actual dataset (df["Ownership"].unique() / df["facing"].unique()). Keep exact spelling/spacing — must match what the model was trained on.
const OWNERSHIP_OPTIONS: { value: string; labelKey: TranslationKey }[] = [
  { value: "Freehold", labelKey: "ownership.freehold" },
  { value: "Co-operative Society", labelKey: "ownership.coopSociety" },
  { value: "Power Of Attorney", labelKey: "ownership.powerOfAttorney" },
  { value: "Leasehold", labelKey: "ownership.leasehold" },
  { value: "Unknown", labelKey: "option.unknown" },
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
  { value: "Unknown", labelKey: "option.unknown" },
];

interface FormState {
  location: string;
  area_sqft: string;
  bhk: string;
  current_floor: string;
  total_floors: string;
  bathroom: string;
  balcony: string;
  furnishing: string;
  transaction: string;
  ownership: string;
  facing: string;
}

const INITIAL_STATE: FormState = {
  location: "",
  area_sqft: "",
  bhk: "",
  current_floor: "",
  total_floors: "",
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

  const carpetArea = Number(form.area_sqft);
  if (form.area_sqft.trim() === "" || Number.isNaN(carpetArea)) {
    errors.area_sqft = "validation.carpetAreaRequired";
  } else if (carpetArea <= 0) {
    errors.area_sqft = "validation.carpetAreaPositive";
  }

  for (const field of ["bhk", "total_floors"] as const) {
    const value = Number(form[field]);
    if (form[field].trim() === "" || Number.isNaN(value) || value <= 0) {
      errors[field] = "validation.mustBePositive";
    }
  }

  for (const field of ["current_floor", "bathroom", "balcony"] as const) {
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
      area_sqft: Number(form.area_sqft),
      area_source: AREA_SOURCE,
      bhk: Number(form.bhk),
      current_floor: Number(form.current_floor),
      total_floors: Number(form.total_floors),
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
                  {formatLocationLabel(loc)}
                </option>
              ))}
            </select>
            {errors.location && <span className="field-error">{t(errors.location)}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="area_sqft">{t("field.carpetArea")}</label>
            <input
              id="area_sqft"
              type="number"
              min={0}
              value={form.area_sqft}
              onChange={(e) => handleChange("area_sqft", e.target.value)}
              onKeyDown={blockInvalidNumberKeys}
            />
            {errors.area_sqft && <span className="field-error">{t(errors.area_sqft)}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="current_floor">{t("field.floorNum")}</label>
            <input
              id="current_floor"
              type="number"
              min={0}
              value={form.current_floor}
              onChange={(e) => handleChange("current_floor", e.target.value)}
              onKeyDown={blockInvalidNumberKeys}
            />
            {errors.current_floor && <span className="field-error">{t(errors.current_floor)}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="total_floors">{t("field.totalFloors")}</label>
            <input
              id="total_floors"
              type="number"
              min={0}
              value={form.total_floors}
              onChange={(e) => handleChange("total_floors", e.target.value)}
              onKeyDown={blockInvalidNumberKeys}
            />
            {errors.total_floors && <span className="field-error">{t(errors.total_floors)}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2 className="section-title">{t("section.roomsFurnishing")}</h2>
        <div className="field-grid">
          <div className="form-field">
            <label htmlFor="bhk">{t("field.bhk")}</label>
            <input
              id="bhk"
              type="number"
              min={0}
              value={form.bhk}
              onChange={(e) => handleChange("bhk", e.target.value)}
              onKeyDown={blockInvalidNumberKeys}
            />
            {errors.bhk && <span className="field-error">{t(errors.bhk)}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="bathroom">{t("field.bathroom")}</label>
            <input
              id="bathroom"
              type="number"
              min={0}
              value={form.bathroom}
              onChange={(e) => handleChange("bathroom", e.target.value)}
              onKeyDown={blockInvalidNumberKeys}
            />
            {errors.bathroom && <span className="field-error">{t(errors.bathroom)}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="balcony">{t("field.balcony")}</label>
            <input
              id="balcony"
              type="number"
              min={0}
              value={form.balcony}
              onChange={(e) => handleChange("balcony", e.target.value)}
              onKeyDown={blockInvalidNumberKeys}
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

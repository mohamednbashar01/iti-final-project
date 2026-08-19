# Frontend Setup Brief — House Price Prediction App
**For: Claude Code**
**Current status: Vite project was created with `npm create vite@latest frontend -- --template react-ts`, but the default template files have NOT been touched, and the required project structure has NOT been built yet.**

Working directory: `frontend/` (inside the repo root `house-price-project/`, which is already a git repo on `main`, pushed to GitHub).

---

## 1. Project context

This is a student ML project: House Price Prediction (India dataset). The full stack is:
- `notebooks/` — Jupyter notebook, trains a regression model, exports `house_price.pkl` + `locations.json` (being built by teammates, **not done yet**).
- `backend/` — FastAPI app serving the model (being built by teammates, **not done yet**).
- `frontend/` — React + TypeScript + Vite app (**this is your task right now**).

Because the backend isn't built yet, the frontend must be built against the **agreed API contract** below (from the project spec), using **mock/placeholder data** where needed, so it can be swapped for the real thing later with minimal changes.

---

## 2. Tech stack

- React + TypeScript (Vite template `react-ts`, already scaffolded)
- `react-router-dom` for routing (already installed via `npm install react-router-dom`)
- No UI framework required — plain CSS is fine, keep it clean and simple

---

## 3. Required folder structure

Build exactly this structure inside `frontend/src/`:

```
frontend/src/
├── api/
│   └── predictionClient.ts     # fetch wrapper, base URL from VITE_API_BASE_URL
├── components/
│   └── PredictionForm.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── ResultPage.tsx
│   └── NotFoundPage.tsx
├── types/
│   └── prediction.ts           # TS types mirroring the backend schema
├── data/
│   └── locations.json          # PLACEHOLDER until real one is exported by the ML notebook
├── App.tsx                     # routes: "/", "/result", "*" (404)
└── main.tsx
```

Clean up the default Vite boilerplate (remove unused default counter code, default logos, etc.) but keep `App.tsx` and `main.tsx`.

---

## 4. Environment variables

Create:

**`frontend/.env`** (do NOT commit — must be in `.gitignore`):
```
VITE_API_BASE_URL=http://localhost:8000
```

**`frontend/.env.example`** (commit this one):
```
VITE_API_BASE_URL=http://localhost:8000
```

Confirm `frontend/.gitignore` (or the root one) excludes: `node_modules/`, `dist/`, `.env`, `*.log`.

---

## 5. Backend API contract (not built yet — build the frontend against this spec)

**Base URL:** `http://localhost:8000` (from `VITE_API_BASE_URL`)

**`POST /predict`**

Request body:
```ts
{
  location: string;
  carpet_area_sqft: number;
  floor_num: number;
  bathroom: number;
  balcony: number;
  furnishing: "Furnished" | "Semi-Furnished" | "Unfurnished";
  transaction: "New Property" | "Resale";
  ownership: string;   // see §7 — exact enum TBD, use placeholder options for now
  facing: string;       // see §7 — exact enum TBD, use placeholder options for now
}
```

Response (success):
```ts
{
  predicted_price: number;
}
```

**`GET /health`**
```ts
{ status: "ok" }
```

CORS on the backend will allow `http://localhost:5173` (default Vite dev port) — no frontend action needed here, just build assuming this works once backend exists.

**Error handling:** the backend may return non-200 responses (e.g. 422 for invalid input, 500 for server errors). The `predictionClient.ts` fetch wrapper should throw/reject on non-OK responses so the UI can show an error state.

---

## 6. TypeScript types (`types/prediction.ts`)

Mirror the schema above exactly:
```ts
export type Furnishing = "Furnished" | "Semi-Furnished" | "Unfurnished";
export type Transaction = "New Property" | "Resale";

export interface PredictionRequest {
  location: string;
  carpet_area_sqft: number;
  floor_num: number;
  bathroom: number;
  balcony: number;
  furnishing: Furnishing;
  transaction: Transaction;
  ownership: string;
  facing: string;
}

export interface PredictionResponse {
  predicted_price: number;
}
```

---

## 7. Placeholder data (to be swapped later — flag clearly in code comments)

### 7a. `data/locations.json` (placeholder — real file comes from the ML notebook export)
Use a small mock array of ~10 sample Indian location names, e.g.:
```json
["Mumbai Andheri West", "Pune Baner", "Bangalore Whitefield", "Delhi Dwarka", "Hyderabad Gachibowli", "Chennai OMR", "Noida Sector 62", "Gurgaon Sohna Road", "Kolkata Rajarhat", "Ahmedabad SG Highway", "other"]
```
Add a `// TODO: replace with real locations.json exported from the notebook` comment where it's loaded.

### 7b. `ownership` dropdown options — CONFIRMED from actual dataset (`df["Ownership"].unique()`)
```
"Freehold", "Co-operative Society", "Power Of Attorney", "Leasehold"
```
(The dataset also contains `nan` rows — not a valid option, just means some listings have missing data. Not needed in the dropdown since the field is required.)

### 7c. `facing` dropdown options — CONFIRMED from actual dataset (`df["facing"].unique()`)
```
"East", "West", "North", "North - East", "North - West", "South", "South -West", "South - East"
```

⚠️ **IMPORTANT — use these exact strings as the `value` of each `<option>`, spacing included.** The spacing is inconsistent in the raw data (`"North - East"` has spaces around the hyphen, but `"South -West"` only has a space before the hyphen, not after). This is not a typo to "fix" in the frontend — the backend model will be trained via `OneHotEncoder` on these exact raw strings, so the frontend must send them byte-for-byte identical or the model will treat it as an unknown category and prediction accuracy will suffer. You may still clean up the **display label** shown to the user (e.g. show "South - West" nicely formatted) as long as the underlying `value` sent to the API stays exactly `"South -West"`.

Add a comment near both: `// Values confirmed from the actual dataset (df["Ownership"].unique() / df["facing"].unique()). Keep exact spelling/spacing — must match what the model was trained on.`

---

## 8. `api/predictionClient.ts`

A small fetch wrapper:
- Reads base URL from `import.meta.env.VITE_API_BASE_URL`
- Exports a function like `getPrediction(data: PredictionRequest): Promise<PredictionResponse>`
- POSTs JSON to `/predict`
- Throws a readable error on non-OK response (try to parse and surface backend error message if present, otherwise a generic message)

---

## 9. `components/PredictionForm.tsx`

Fields and input types (per project spec):
| Field | Input type |
|---|---|
| location | `<select>` populated from `data/locations.json` |
| furnishing | `<select>` — Furnished / Semi-Furnished / Unfurnished |
| transaction | `<select>` — New Property / Resale |
| ownership | `<select>` — confirmed options from §7b |
| facing | `<select>` — confirmed options from §7c (exact string values, see warning in §7c) |
| carpet_area_sqft | numeric input |
| floor_num | numeric input |
| bathroom | numeric input |
| balcony | numeric input |

**Client-side validation:**
- All fields required
- `carpet_area_sqft` must be > 0
- `floor_num`, `bathroom`, `balcony` must be ≥ 0
- Show friendly inline error messages per field (not just a generic alert)

**On submit:**
- Call `getPrediction()` from `predictionClient.ts`
- Show a loading state while the request is in flight (disable submit button, show spinner/text)
- On success: navigate to `/result` passing the predicted price (via router state or query param — your choice, keep it simple)
- On failure: show a clear error message in the form itself (don't navigate away)

---

## 10. Pages

- **`HomePage.tsx`** — renders `PredictionForm`, maybe a short title/intro
- **`ResultPage.tsx`** — displays the predicted price, nicely formatted (e.g. `₹ 42.5 Lac` style — convert the raw rupee number into Lac/Cr formatting to match Indian currency conventions used in the dataset). If accessed directly without a prediction (no state), show a friendly message + link back to home instead of crashing.
- **`NotFoundPage.tsx`** — simple 404 message + link back to home

---

## 11. Routing (`App.tsx`)

```
"/"        → HomePage
"/result"  → ResultPage
"*"        → NotFoundPage
```

---

## 12. Verification checklist (do this at the end)

- [ ] `npm run dev` runs cleanly on port 5173
- [ ] `npm run build` succeeds with no TypeScript errors
- [ ] Form validation shows friendly errors for empty/invalid fields
- [ ] Submitting the form (with backend not running yet) shows a proper error state, not a crash
- [ ] All placeholder/TODO data (locations.json, ownership, facing) is clearly commented for later replacement
- [ ] `.env.example` committed, `.env` gitignored
- [ ] No hardcoded `http://localhost:8000` anywhere except as the `.env` default — always read from `VITE_API_BASE_URL`

---

## 13. Out of scope for this task
Do NOT touch `backend/` or `notebooks/` — those are being built by teammates. This task is `frontend/` only.
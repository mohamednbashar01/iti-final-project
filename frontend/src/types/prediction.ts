export type Furnishing = "Furnished" | "Semi-Furnished" | "Unfurnished" | "Unknown";
export type Transaction = "New Property" | "Resale" | "Other";
export type AreaSource = "carpet" | "super";

// Mirrors Backend/app/schemas/prediction.py::PredictionRequest exactly —
// field names and types must match, or FastAPI/pydantic will reject the request.
export interface PredictionRequest {
  bhk: number;
  bathroom: number;
  balcony: number;
  area_sqft: number;
  current_floor: number;
  total_floors: number;
  furnishing: Furnishing;
  transaction: Transaction;
  ownership: string;
  facing: string;
  location: string;
  area_source: AreaSource;
}

export interface PredictionResponse {
  predicted_price: number;
}

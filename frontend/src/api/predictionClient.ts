import type { PredictionRequest, PredictionResponse } from "../types/prediction";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getPrediction(
  data: PredictionRequest,
): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body && typeof body.detail === "string") {
        message = body.detail;
      } else if (body && typeof body.message === "string") {
        message = body.message;
      }
    } catch {
      // response body wasn't JSON (or was empty) — fall back to the generic message
    }
    throw new Error(message);
  }

  return response.json() as Promise<PredictionResponse>;
}

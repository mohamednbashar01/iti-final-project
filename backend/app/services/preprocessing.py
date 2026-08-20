import pandas as pd

from app.schemas.prediction import PredictionRequest


def request_to_dataframe(request: PredictionRequest) -> pd.DataFrame:
    """Convert a PredictionRequest into a one-row DataFrame with
    the exact column names used during training (see notebook:
    numeric_features + skewed_numeric_features + categorical_features)."""
    data = {
        "bhk": [request.bhk],
        "bathroom": [request.bathroom],
        "balcony": [request.balcony],
        "area_sqft": [request.area_sqft],
        "current_floor": [request.current_floor],
        "total_floors": [request.total_floors],
        "Furnishing": [request.furnishing],
        "Transaction": [request.transaction],
        "Ownership": [request.ownership],
        "facing": [request.facing],
        "location": [request.location],
        "area_source": [request.area_source],
    }
    return pd.DataFrame(data)
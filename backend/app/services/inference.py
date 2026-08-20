import json

import joblib

from app.core.config import settings

_model = None
_locations = []


def load_model():
    global _model, _locations
    _model = joblib.load(settings.model_path)
    try:
        with open(settings.locations_path, "r") as f:
            _locations = json.load(f)
    except FileNotFoundError:
        _locations = []


def predict_price(df) -> float:
    if _model is None:
        raise RuntimeError("Model not loaded")
    # full_model is a TransformedTargetRegressor: predict() already
    # applies expm1 internally, no manual inverse-transform needed
    prediction = _model.predict(df)
    return float(prediction[0])


def get_locations() -> list:
    return _locations
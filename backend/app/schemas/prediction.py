from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    bhk: float = Field(gt=0)
    bathroom: float = Field(ge=0)
    balcony: float = Field(ge=0)
    area_sqft: float = Field(gt=0)
    current_floor: float = Field(ge=0)
    total_floors: float = Field(gt=0)
    furnishing: str
    transaction: str
    ownership: str
    facing: str
    location: str
    area_source: str  # "carpet" or "super"


class PredictionResponse(BaseModel):
    predicted_price: float
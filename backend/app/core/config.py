from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_path: str = "models/Gradient_Boosting_Model.pkl"
    locations_path: str = "models/locations.json"
    allowed_origins: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
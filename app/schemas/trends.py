from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any


class TrendPoint(BaseModel):
    model_config = ConfigDict()
    period: str
    value: Any


class TrendSeries(BaseModel):
    model_config = ConfigDict()
    direction: str
    series: List[TrendPoint]

from pydantic import BaseModel
from uuid import UUID


class CategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str

    model_config = {"from_attributes": True}

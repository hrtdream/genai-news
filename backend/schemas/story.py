from datetime import datetime

from pydantic import BaseModel


class StoryItem(BaseModel):
    id: str
    headline: str
    latest_ref_article_at: datetime
    cover_images: list[str]


class Pagination(BaseModel):
    page: int
    page_size: int
    total: int
    has_next: bool


class StoriesResponse(BaseModel):
    items: list[StoryItem]
    pagination: Pagination


class RefArticle(BaseModel):
    article_id: str
    url: str
    title: str
    update_date: datetime
    source: str


class StoryDetail(BaseModel):
    id: str
    headline: str
    summary: list[str]
    cover_images: list[str]
    latest_ref_article_at: datetime
    ref_articles: list[RefArticle]

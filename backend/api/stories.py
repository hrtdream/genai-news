from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query
from pymongo import DESCENDING

from db.mongo import MONGO_COLLECTION, MONGO_DATABASE, mongo_client
from schemas.story import StoryDetail, StoriesResponse

router = APIRouter()

PAGE_SIZE = 10


def _extract_cover_images(ref_articles):
    if not ref_articles:
        return []
    images = []
    seen = set()
    for ref in ref_articles:
        image = ref.get("cover_image")
        if image and image not in seen:
            seen.add(image)
            images.append(image)
    return images


@router.get("/stories", response_model=StoriesResponse)
def get_stories(page: int = Query(1, ge=1)):
    if not mongo_client or not MONGO_DATABASE or not MONGO_COLLECTION:
        return {
            "items": [],
            "pagination": {
                "page": page,
                "page_size": PAGE_SIZE,
                "total": 0,
                "has_next": False,
            },
        }

    assert MONGO_DATABASE is not None
    assert MONGO_COLLECTION is not None
    skip = (page - 1) * PAGE_SIZE
    collection = mongo_client[MONGO_DATABASE][MONGO_COLLECTION]
    query = {"is_active": True, "is_visible": True}

    total = collection.count_documents(query)
    cursor = (
        collection.find(
            query,
            {
                "_id": 1,
                "headline": 1,
                "latest_ref_article_at": 1,
                "ref_articles": 1,
            },
        )
        .sort("latest_ref_article_at", DESCENDING)
        .skip(skip)
        .limit(PAGE_SIZE)
    )

    items = []
    for doc in cursor:
        ref_articles = doc.get("ref_articles") or []
        cover_images = _extract_cover_images(ref_articles)
        items.append(
            {
                "id": str(doc.get("_id")),
                "headline": doc.get("headline"),
                "latest_ref_article_at": doc.get("latest_ref_article_at"),
                "cover_images": cover_images,
            }
        )

    return {
        "items": items,
        "pagination": {
            "page": page,
            "page_size": PAGE_SIZE,
            "total": total,
            "has_next": skip + PAGE_SIZE < total,
        },
    }


@router.get("/story/{story_id}", response_model=StoryDetail)
def get_story_detail(story_id: str):
    if not mongo_client or not MONGO_DATABASE or not MONGO_COLLECTION:
        raise HTTPException(status_code=500, detail="Database not configured")

    assert MONGO_DATABASE is not None
    assert MONGO_COLLECTION is not None

    collection = mongo_client[MONGO_DATABASE][MONGO_COLLECTION]
    doc = collection.find_one(
        {"_id": ObjectId(story_id), "is_active": True, "is_visible": True},
        {
            "_id": 1,
            "headline": 1,
            "summary": 1,
            "latest_ref_article_at": 1,
            "ref_articles": 1,
        },
    )

    if not doc:
        raise HTTPException(status_code=404, detail="Story not found")

    ref_articles = doc.get("ref_articles") or []
    return {
        "id": str(doc.get("_id")),
        "headline": doc.get("headline"),
        "summary": doc.get("summary"),
        "cover_images": _extract_cover_images(ref_articles),
        "latest_ref_article_at": doc.get("latest_ref_article_at"),
        "ref_articles": ref_articles,
    }

from fastapi import FastAPI
from api.stories import router as stories_router

app = FastAPI(root_path="/api")


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(stories_router)

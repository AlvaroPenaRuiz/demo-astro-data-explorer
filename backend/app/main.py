from fastapi import FastAPI

app = FastAPI(title="Astro Data Explorer API", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "Welcome to the Astro Data Explorer API"}

@app.get("/health")
def health():
    return {"status": "ok"}
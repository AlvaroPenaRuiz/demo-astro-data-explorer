from fastapi import FastAPI, Query
from typing import Annotated
from .utils import simbad_search

app = FastAPI(title="Astro Data Explorer API", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "Welcome to the Astro Data Explorer API"}

@app.get("/health/")
def health():
    return {"status": "ok"}

@app.get("/search/")
async def search(
        ra: Annotated[float, Query(ge=0.0, lt=360.0, description="Right Ascension in degrees [0,360).", openapi_examples={"dense_region": {"summary": "Dense region", "value": 266.4168}, "sparse_region": {"summary": "Sparse region", "value": 10.6847}})], 
        dec: Annotated[float, Query(ge=-90.0, le=90.0, description="Declination in degrees [-90,90].", openapi_examples={"dense_region": {"summary": "Dense region", "value": -29.0078}, "sparse_region": {"summary": "Sparse region", "value": 41.2690}})], 
        radius: Annotated[float, Query(gt=0.0, le=2.0, description="Search radius in degrees (0,2].", openapi_examples={"quick_demo": {"summary": "Quick demo", "value": 0.3}, "more_results": {"summary": "More results", "value": 0.6}})]
    ):
    encountered_objects = simbad_search(ra, dec, radius)
    return {"center": {"ra": ra, "dec": dec, "radius": radius}, "count": len(encountered_objects), "results": encountered_objects}

import math

def to_float_or_none(value):
    """
    Convert a value coming from astroquery/astropy tables into a JSON-safe float.

    Returns:
      - float: when `value` can be safely converted and is finite
      - None: for missing/masked values, non-numeric inputs, NaN or infinity

    This helper prevents FastAPI/JSON serialization errors caused by NaN/Inf and handles common "masked" values returned by astropy tables.
    """
    if value is None:
        return None
    # astropy/numpy masked values often have a .mask attribute
    if getattr(value, "mask", False):
        return None
    try:
        v = float(value)
    except Exception:
        return None
    return None if (math.isnan(v) or math.isinf(v)) else v
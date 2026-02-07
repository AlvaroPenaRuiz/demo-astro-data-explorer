from astroquery.simbad import Simbad
from astropy.coordinates import SkyCoord
from astropy import units as u
from .helper import to_float_or_none

def simbad_search(ra: float, dec: float, radius: float):
    """
    Search for astronomical objects in the SIMBAD database within a circular region.

    Args:
        ra (float): Right ascension in degrees (0-360).
        dec (float): Declination in degrees (-90 to 90).
        radius (float): Search radius in degrees around the center coordinates.

    Returns:
        list[dict]: List of dictionaries containing object information with keys:
            - name (str): Object's main identifier
            - type (str | None): Object type classification
            - ra_deg (float | None): Right ascension in degrees
            - dec_deg (float | None): Declination in degrees
            - mag_v (float | None): Visual magnitude
        Returns empty list if no objects are found.
    """

    s = Simbad()

    # Add fields to SIMBAD response: object type(otype), right ascension in degrees(ra(d)), declination in degrees(dec(d)), and visual magnitude(flux(V))
    s.add_votable_fields("otype", "ra(d)", "dec(d)", "flux(V)")

    # Create celestial coordinate object with ICRS (International Celestial Reference System) frame
    # u.degree multiplies the float by astropy's degree unit, creating a Quantity object that SkyCoord understands so we understand that the input values are in degrees.
    center = SkyCoord(ra=ra * u.degree, dec=dec * u.degree, frame='icrs')
    result = s.query_region(center, radius=radius * u.deg)
    
    # In case we find nothing
    if result is None:
        return []


    encountered_objects = []

    # We parse the Simbad query results into a list of encountered objects with the information we consider relevant.
    for row in result:
        encountered_objects.append({
            "name": str(row["main_id"]).strip(),
            "type": str(row["otype"]).strip() if row["otype"] is not None else None,
            "ra_deg": to_float_or_none(row["ra"]),
            "dec_deg": to_float_or_none(row["dec"]),
            "mag_v": to_float_or_none(row["V"])
        })

    return encountered_objects
    
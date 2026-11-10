import logging

import httpx

from .config import DEFAULT_COORDS, MAP_TOKEN

log = logging.getLogger("wandernest.geocode")


async def geocode(query: str) -> tuple[float, float]:
    """Return (lng, lat). Mapbox if MAP_TOKEN set, else Nominatim, else default."""
    try:
        async with httpx.AsyncClient(timeout=6) as client:
            if MAP_TOKEN:
                r = await client.get(
                    f"https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json",
                    params={"access_token": MAP_TOKEN, "limit": 1},
                )
                feats = r.json().get("features", [])
                if feats:
                    lng, lat = feats[0]["geometry"]["coordinates"]
                    return float(lng), float(lat)
            else:
                r = await client.get(
                    "https://nominatim.openstreetmap.org/search",
                    params={"q": query, "format": "json", "limit": 1},
                    headers={"User-Agent": "WanderNest/1.0"},
                )
                data = r.json()
                if data:
                    return float(data[0]["lon"]), float(data[0]["lat"])
    except Exception as e:  # geocoder failure shouldn't block listing creation
        log.warning("Geocoding failed (%s); using default coordinates", e)
    return DEFAULT_COORDS

/* import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { featureLayer } from "esri-leaflet";

export function ArcGISFeatureLayer() {
  const map = useMap();

  useEffect(() => {
    // Asegúrate de que la URL sea correcta y apunte a un servicio que ArcGIS pueda consumir directamente
    const arcgisLayer = featureLayer({
      url: "https://geoportal.subpesca.cl/server/rest/services/IDE_INTERNO/SRMINT_ACUICULTURA_SP/MapServer/2?f=pjson"
    }).addTo(map);

    return () => {
      map.removeLayer(arcgisLayer);
    };
  }, [map]);

  return null;
} */
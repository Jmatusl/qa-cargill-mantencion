// MapEventsHandler.js
import React from 'react';
import { useMapEvents } from 'react-leaflet';

function MapEventsHandler({ onNavigateToLocation }: { onNavigateToLocation: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    locationfound(e) {
      console.log("e.latlong ",e.latlng);
      onNavigateToLocation(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export default MapEventsHandler;
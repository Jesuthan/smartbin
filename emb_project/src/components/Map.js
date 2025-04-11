import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function Map({ latitude, longitude }) {
  useEffect(() => {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (!isNaN(lat) && !isNaN(lon)) {
      const map = L.map('map').setView([lat, lon], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Custom icon
      const customIcon = L.icon({
        iconUrl: process.env.PUBLIC_URL + '/custom-marker.png', // Place your image in the public folder
        iconSize: [32, 32], // Adjust size
        iconAnchor: [16, 32], // Anchor to point of the icon
        popupAnchor: [0, -32] // Position of popup relative to icon
      });

      L.marker([lat, lon], { icon: customIcon })
        .addTo(map)
        .bindPopup('Current Location')
        .openPopup();

      return () => {
        map.remove();
      };
    }
  }, [latitude, longitude]);

  return <div id="map" style={{ height: '400px', width: '100%' }}></div>;
}

export default Map;


import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Bin } from '@/types/bin';
import { useNavigate } from 'react-router-dom';

interface BinMapProps {
  bins: Bin[];
}

const BinMap: React.FC<BinMapProps> = ({ bins }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const navigate = useNavigate();
  const [mapboxToken, setMapboxToken] = useState<string>('');

  // This is for demonstration purposes - ideally would be stored in environment variables
  useEffect(() => {
    // Prompt user for Mapbox token if not already set
    if (!mapboxToken) {
      const token = window.prompt('Please enter your Mapbox access token:', '');
      if (token) {
        setMapboxToken(token);
      }
    }
  }, [mapboxToken]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: bins.length > 0 
        ? [bins[0].location.longitude, bins[0].location.latitude] 
        : [-74.0060, 40.7128], // Default to NYC if no bins
      zoom: 12
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Cleanup function
    return () => {
      if (map.current) map.current.remove();
    };
  }, [bins, mapboxToken]);

  // Add markers when map is loaded and whenever bins change
  useEffect(() => {
    if (!map.current || !mapboxToken) return;

    // Wait for map to load
    const addMarkers = () => {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers for each bin
      bins.forEach(bin => {
        // Determine marker color based on bin status
        const markerColor = getMarkerColorByStatus(bin.status);
        
        // Create a custom marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'bin-marker';
        markerElement.style.width = '30px';
        markerElement.style.height = '30px';
        markerElement.style.borderRadius = '50%';
        markerElement.style.backgroundColor = markerColor;
        markerElement.style.border = '2px solid white';
        markerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        markerElement.style.cursor = 'pointer';
        
        // Create the marker
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([bin.location.longitude, bin.location.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <strong>${bin.name}</strong><br/>
                Status: ${bin.status}<br/>
                <button class="view-details-btn" data-bin-id="${bin.id}">View Details</button>
              `)
          )
          .addTo(map.current!);
          
        // Add to ref array for cleanup
        markersRef.current.push(marker);
      });
      
      // Add event listener for popup buttons - using event delegation
      map.current!.getContainer().addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('view-details-btn')) {
          const binId = target.getAttribute('data-bin-id');
          if (binId) {
            navigate(`/bin/${binId}`);
          }
        }
      });
    };

    if (map.current.loaded()) {
      addMarkers();
    } else {
      map.current.on('load', addMarkers);
    }
  }, [bins, mapboxToken, navigate]);

  // Helper function to get marker color based on bin status
  const getMarkerColorByStatus = (status: Bin['status']): string => {
    switch (status) {
      case 'empty':
        return '#4ade80'; // Green
      case 'half':
        return '#fbbf24'; // Yellow
      case 'full':
        return '#ef4444'; // Red
      default:
        return '#94a3b8'; // Gray
    }
  };

  return (
    <div>
      {!mapboxToken && (
        <div className="p-4 mb-4 text-amber-700 bg-amber-100 rounded-lg">
          <p>Please enter your Mapbox access token to view the interactive map.</p>
        </div>
      )}
      <div ref={mapContainer} className="h-[70vh] rounded-lg shadow-md" />
    </div>
  );
};

export default BinMap;

// Add import for useState that I forgot
import { useState } from 'react';

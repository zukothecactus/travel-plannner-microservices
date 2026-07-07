import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import axios from 'axios';
import moment from 'moment';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Sub-component to handle automatic centering and fitting bounds of visible markers.
const ChangeView = ({ bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.length > 0) {
      // Fit map view to coordinates of all visible activities
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [bounds, map]);

  return null;
};

const RouteMap = ({ activities = [] }) => {
  const [selectedDay, setSelectedDay] = useState('all');
  const [coordinatesCache, setCoordinatesCache] = useState({});
  const [loadingGeocoding, setLoadingGeocoding] = useState(false);
  const activeFetchIdRef = useRef(0);

  // 1. Extract unique days from the activities array based on 'vremePocetka'
  const uniqueDays = useMemo(() => {
    if (!activities || activities.length === 0) return [];

    // Map each activity to a YYYY-MM-DD string
    const dates = activities
      .map(a => (a.vremePocetka ? moment(a.vremePocetka).format('YYYY-MM-DD') : null))
      .filter(Boolean);

    // Filter unique and sort chronologically
    const uniqueDates = Array.from(new Set(dates)).sort((a, b) => moment(a).diff(moment(b)));

    return uniqueDates.map((dateStr, index) => {
      const formattedDate = moment(dateStr, 'YYYY-MM-DD').format('MMM D');
      return {
        key: dateStr,
        label: `Day ${index + 1} (${formattedDate})`
      };
    });
  }, [activities]);

  // 2. Filter the activities by selected day and sort chronologically
  const sortedActivities = useMemo(() => {
    let filtered = activities || [];
    if (selectedDay !== 'all') {
      filtered = filtered.filter(a => {
        if (!a.vremePocetka) return false;
        return moment(a.vremePocetka).format('YYYY-MM-DD') === selectedDay;
      });
    }

    return [...filtered].sort((a, b) => {
      const timeA = a.vremePocetka ? moment(a.vremePocetka).valueOf() : 0;
      const timeB = b.vremePocetka ? moment(b.vremePocetka).valueOf() : 0;
      return timeA - timeB;
    });
  }, [activities, selectedDay]);

  // Reset selectedDay if it's no longer present in activities
  useEffect(() => {
    if (selectedDay !== 'all') {
      const dayExists = uniqueDays.some(d => d.key === selectedDay);
      if (!dayExists) {
        setSelectedDay('all');
      }
    }
  }, [uniqueDays, selectedDay]);

  // 3 & 4. Geocoding & Rate Limit Handling (Nominatim OSM API with 1-second delay and caching)
  useEffect(() => {
    // Collect all unique locations from the current activities
    const uniqueLocations = Array.from(
      new Set(
        sortedActivities
          .map(a => a.lokacija)
          .filter(loc => loc && typeof loc === 'string' && loc.trim() !== '')
      )
    );

    // Identify which locations do not have cached coordinates yet
    const missingLocations = uniqueLocations.filter(loc => coordinatesCache[loc] === undefined);

    if (missingLocations.length === 0) {
      setLoadingGeocoding(false);
      return;
    }

    setLoadingGeocoding(true);
    const fetchId = ++activeFetchIdRef.current;

    const performGeocoding = async () => {
      for (let i = 0; i < missingLocations.length; i++) {
        if (fetchId !== activeFetchIdRef.current) return;
        const loc = missingLocations[i];

        // Nominatim policy requires at least a 1-second delay between consecutive calls
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1050));
        }

        if (fetchId !== activeFetchIdRef.current) return;

        try {
          const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
              format: 'json',
              q: loc,
              limit: 1
            },
            headers: {
              'User-Agent': 'RouteMapItineraryVisualizer/1.0 (obren@example.com)'
            }
          });

          if (fetchId !== activeFetchIdRef.current) return;

          if (response.data && response.data.length > 0) {
            const lat = parseFloat(response.data[0].lat);
            const lon = parseFloat(response.data[0].lon);
            setCoordinatesCache(prev => ({
              ...prev,
              [loc]: [lat, lon]
            }));
          } else {
            console.warn(`[Nominatim] No coordinates found for location: "${loc}"`);
            // Cache null so we do not retry querying OSM for invalid locations
            setCoordinatesCache(prev => ({
              ...prev,
              [loc]: null
            }));
          }
        } catch (error) {
          console.error(`[Nominatim] Failed to geocode location "${loc}":`, error);
          if (fetchId !== activeFetchIdRef.current) return;
          // Cache null on error to avoid looping/spamming the API on consecutive failures
          setCoordinatesCache(prev => ({
            ...prev,
            [loc]: null
          }));
        }
      }

      if (fetchId === activeFetchIdRef.current) {
        setLoadingGeocoding(false);
      }
    };

    performGeocoding();
  }, [sortedActivities]);

  // Construct active markers with resolved coordinates
  const activeMarkers = useMemo(() => {
    return sortedActivities
      .map((activity, index) => {
        const coords = coordinatesCache[activity.lokacija];
        return {
          ...activity,
          orderNumber: index + 1,
          coords
        };
      })
      .filter(item => item.coords != null);
  }, [sortedActivities, coordinatesCache]);

  // Retrieve bounds of visible markers
  const bounds = useMemo(() => {
    if (activeMarkers.length === 0) return null;
    return activeMarkers.map(m => m.coords);
  }, [activeMarkers]);

  // Prepare line positions for chronological routes
  const polylinePositions = useMemo(() => {
    return activeMarkers.map(m => m.coords);
  }, [activeMarkers]);

  // Formatter helper for activity times
  const formatTime = (start, end) => {
    if (!start) return '';
    const startTime = moment(start).format('HH:mm');
    const endTime = end ? moment(end).format('HH:mm') : '';
    return endTime ? `${startTime} - ${endTime}` : startTime;
  };

  return (
    <div className="card route-map-container" style={{ padding: '20px', borderRadius: 'var(--radius, 12px)' }}>
      {/* Dynamic CSS Styling Injector */}
      <style>{`
        .custom-map-marker {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: var(--accent-primary, #0B4C84);
          color: white !important;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 13px;
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.35);
          transition: all 0.2s ease-in-out;
        }
        .custom-map-marker:hover {
          transform: scale(1.15);
          background-color: var(--mystic-blue, #091D36);
          box-shadow: 0 3px 8px rgba(0,0,0,0.45);
        }
        .custom-div-icon {
          background: transparent !important;
          border: none !important;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .route-map-spinner {
          border: 2px solid var(--border-color, #9BC1EE);
          border-top: 2px solid var(--accent-primary, #0B4C84);
          border-radius: 50%;
          width: 12px;
          height: 12px;
          animation: spin 1s linear infinite;
          display: inline-block;
        }
        .day-filter-btn {
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid var(--border-color, #9BC1EE);
          background: transparent;
          color: var(--text-main, #091D36);
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .day-filter-btn:hover {
          background: rgba(155, 193, 238, 0.2);
          border-color: var(--accent-primary, #0B4C84);
        }
        .day-filter-btn.active {
          background: var(--accent-primary, #0B4C84);
          color: white;
          border-color: var(--accent-primary, #0B4C84);
        }
      `}</style>

      {/* Header and Day Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🗺️ Mape Rute Putovanja
        </h3>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className={`day-filter-btn ${selectedDay === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedDay('all')}
          >
            Svi dani
          </button>
          {uniqueDays.map(day => (
            <button
              key={day.key}
              className={`day-filter-btn ${selectedDay === day.key ? 'active' : ''}`}
              onClick={() => setSelectedDay(day.key)}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Element Container */}
      <div style={{ 
        height: '500px', 
        width: '100%', 
        borderRadius: '8px', 
        overflow: 'hidden', 
        position: 'relative', 
        zIndex: 1, 
        border: '1px solid var(--border-color)' 
      }}>
        {/* Subtle geocoding loading overlay */}
        {loadingGeocoding && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '6px 12px',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: 'var(--accent-primary)',
            fontWeight: 'bold',
            pointerEvents: 'none',
            border: '1px solid var(--border-color)'
          }}>
            <span className="route-map-spinner"></span> Geokodiranje...
          </div>
        )}

        <MapContainer
          center={[44.787197, 20.448922]} // Belgrade default center
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ChangeView bounds={bounds} />

          {activeMarkers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.coords}
              icon={L.divIcon({
                html: `<div class="custom-map-marker">${marker.orderNumber}</div>`,
                className: 'custom-div-icon',
                iconSize: [28, 28],
                iconAnchor: [14, 14],
                popupAnchor: [0, -14]
              })}
            >
              <Popup>
                <div style={{ fontFamily: 'var(--sans, system-ui)', minWidth: '150px' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text-main, #091D36)' }}>
                    #{marker.orderNumber} {marker.naziv}
                  </h4>
                  {marker.opis && (
                    <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: 'var(--text, #6b6375)' }}>
                      {marker.opis}
                    </p>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', borderTop: '1px solid var(--border-color)', paddingTop: '4px', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--accent-primary)' }}>
                      📍 {marker.lokacija}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      🕒 {moment(marker.vremePocetka).format('MMM D')}, {formatTime(marker.vremePocetka, marker.vremeZavrsetka)}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {polylinePositions.length > 1 && (
            <Polyline
              positions={polylinePositions}
              color="var(--accent-primary, #0B4C84)"
              weight={3}
              opacity={0.8}
              dashArray="6, 8"
            />
          )}
        </MapContainer>
      </div>
      
      {/* Information Helper */}
      <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>
          Prikazano {activeMarkers.length} od {sortedActivities.filter(a => a.lokacija).length} lokacija sa rute.
        </span>
        {activeMarkers.length === 0 && sortedActivities.filter(a => a.lokacija).length > 0 && (
          <span style={{ color: 'var(--danger)' }}>
            Učitavanje koordinata lokacija je u toku...
          </span>
        )}
      </div>
    </div>
  );
};

export default RouteMap;

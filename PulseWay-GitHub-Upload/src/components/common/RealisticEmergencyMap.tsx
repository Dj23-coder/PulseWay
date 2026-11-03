import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Navigation, 
  MapPin, 
  Hospital as HospitalIcon, 
  Activity, 
  Maximize2, 
  Minimize2, 
  LocateFixed, 
  Compass, 
  Crosshair,
  Layers
} from 'lucide-react';
import { Coordinates } from '../../types';

interface RealisticEmergencyMapProps {
  patientCoords: Coordinates;
  hospitalCoords: Coordinates;
  hospitalName?: string;
  patientName?: string;
  emergencyNature?: string;
  ambulanceCoords?: Coordinates;
  vehicleNo?: string;
  driverName?: string;
  driverPhone?: string;
  etaMinutes?: number;
  isDispatched?: boolean;
  heightClass?: string;
  height?: string;
  allowLocationPick?: boolean;
  onLocationPick?: (coords: { lat: number; lng: number; address?: string }) => void;
  showHud?: boolean;
}

export const RealisticEmergencyMap: React.FC<RealisticEmergencyMapProps> = ({
  patientCoords,
  hospitalCoords,
  hospitalName = 'Manipal Hospital',
  patientName = 'Citizen Casualty',
  emergencyNature,
  ambulanceCoords,
  vehicleNo = 'KA-04-ALS-1082',
  driverName = 'Rameshwar Patil (Paramedic)',
  driverPhone,
  etaMinutes = 5,
  isDispatched = true,
  heightClass = 'h-72 sm:h-80',
  height,
  allowLocationPick = false,
  onLocationPick,
  showHud = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const patientMarkerRef = useRef<L.Marker | null>(null);
  const hospitalMarkerRef = useRef<L.Marker | null>(null);
  const ambulanceMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  // Default to standard OpenStreetMap tiles
  const osmTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const [currentSpeed, setCurrentSpeed] = useState(48);
  const [liveEta, setLiveEta] = useState<number>(etaMinutes || 5);

  const waypointsRef = useRef<[number, number][]>([]);
  const progressRef = useRef<number>(0.25);

  // Helper to interpolate smoothly along an array of route coordinates
  const interpolateAlongPath = (points: [number, number][], t: number): [number, number] => {
    if (points.length === 0) return [patientCoords.lat, patientCoords.lng];
    if (points.length === 1 || t <= 0) return points[0];
    if (t >= 1) return points[points.length - 1];

    const totalSegments = points.length - 1;
    const segmentFraction = 1 / totalSegments;
    const segmentIndex = Math.min(Math.floor(t / segmentFraction), totalSegments - 1);
    const localT = (t - segmentIndex * segmentFraction) / segmentFraction;

    const p1 = points[segmentIndex];
    const p2 = points[segmentIndex + 1];

    return [
      p1[0] + (p2[0] - p1[0]) * localT,
      p1[1] + (p2[1] - p1[1]) * localT
    ];
  };

  // Default ambulance position between hospital and patient if not strictly specified
  const effectiveAmbCoords = ambulanceCoords || {
    lat: hospitalCoords.lat + (patientCoords.lat - hospitalCoords.lat) * 0.45,
    lng: hospitalCoords.lng + (patientCoords.lng - hospitalCoords.lng) * 0.45
  };

  const [liveAmbCoords, setLiveAmbCoords] = useState<Coordinates>(effectiveAmbCoords);

  // Smooth Active Ambulance Movement along Route when Dispatched
  useEffect(() => {
    if (!isDispatched) return;

    const moveTimer = setInterval(() => {
      // Step forward by 2.5% of total route every 1.5s
      progressRef.current = progressRef.current + 0.025;
      if (progressRef.current >= 0.96) {
        progressRef.current = 0.95; // Arrived at patient doorstep
      }

      const points = waypointsRef.current;
      if (points.length > 1) {
        const nextCoord = interpolateAlongPath(points, progressRef.current);
        setLiveAmbCoords({ lat: nextCoord[0], lng: nextCoord[1] });
        if (ambulanceMarkerRef.current) {
          ambulanceMarkerRef.current.setLatLng(nextCoord);
        }
        setLiveEta(Math.max(1, Math.round((1 - progressRef.current) * (etaMinutes || 5))));
        setCurrentSpeed(Math.floor(44 + Math.random() * 12));
      }
    }, 1500);

    return () => clearInterval(moveTimer);
  }, [isDispatched, etaMinutes]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center between patient and hospital
    const centerLat = (patientCoords.lat + hospitalCoords.lat) / 2;
    const centerLng = (patientCoords.lng + hospitalCoords.lng) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });
    mapInstanceRef.current = map;

    // Standard Free OpenStreetMap Basemap Tile Layer (Zero watermarks, completely free)
    L.tileLayer(osmTileUrl, {
      maxZoom: 19,
      subdomains: 'abc',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom HTML Icons
    const patientIcon = L.divIcon({
      className: 'custom-patient-icon',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: rgba(239, 68, 68, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 28px; height: 28px; border-radius: 9999px; background-color: #EF4444; border: 2px solid #FFFFFF; box-shadow: 0 4px 12px rgba(239,68,68,0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: bold;">
            🚨
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const hospitalIcon = L.divIcon({
      className: 'custom-hospital-icon',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="width: 30px; height: 30px; border-radius: 8px; background-color: #2563EB; border: 2px solid #FFFFFF; box-shadow: 0 4px 12px rgba(37,99,235,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 15px;">
            🏥
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const ambulanceIcon = L.divIcon({
      className: 'custom-ambulance-icon',
      html: `
        <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: -4px; border-radius: 9999px; background-color: rgba(16, 185, 129, 0.35); animation: pulse 2s infinite;"></div>
          <div style="position: relative; width: 34px; height: 34px; border-radius: 9999px; background-color: #0F9D75; border: 2.5px solid #FFFFFF; box-shadow: 0 4px 14px rgba(15,157,117,0.6); display: flex; align-items: center; justify-content: center; font-size: 17px;">
            🚑
          </div>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21]
    });

    // Place Markers
    patientMarkerRef.current = L.marker([patientCoords.lat, patientCoords.lng], { icon: patientIcon })
      .addTo(map)
      .bindPopup(`<strong style="font-size:12px;color:#EF4444;">🚨 ${patientName}</strong><br/><span style="font-size:11px;font-family:monospace;font-weight:600;">GPS: ${patientCoords.lat.toFixed(5)}° N, ${patientCoords.lng.toFixed(5)}° E</span>`);

    hospitalMarkerRef.current = L.marker([hospitalCoords.lat, hospitalCoords.lng], { icon: hospitalIcon })
      .addTo(map)
      .bindPopup(`<strong style="font-size:12px;color:#2563EB;">🏥 ${hospitalName}</strong><br/><span style="font-size:11px;font-family:monospace;font-weight:600;">GPS: ${hospitalCoords.lat.toFixed(5)}° N, ${hospitalCoords.lng.toFixed(5)}° E</span>`);

    if (isDispatched) {
      ambulanceMarkerRef.current = L.marker([effectiveAmbCoords.lat, effectiveAmbCoords.lng], { icon: ambulanceIcon })
        .addTo(map)
        .bindPopup(`<strong style="font-size:12px;color:#10B981;">🚑 ALS Unit ${vehicleNo}</strong><br/><span style="font-size:11px;">Driver: ${driverName}</span><br/><span style="font-size:11px;font-family:monospace;font-weight:bold;">GPS: ${effectiveAmbCoords.lat.toFixed(5)}° N, ${effectiveAmbCoords.lng.toFixed(5)}° E | ETA: ~${etaMinutes}m</span>`);
    }

    // Generate realistic waypoints to simulate road turns
    const hLat = hospitalCoords.lat;
    const hLng = hospitalCoords.lng;
    const pLat = patientCoords.lat;
    const pLng = patientCoords.lng;

    const defaultWaypoints: [number, number][] = [
      [hLat, hLng],
      [hLat + (pLat - hLat) * 0.25 + 0.002, hLng + (pLng - hLng) * 0.2 - 0.0015],
      [hLat + (pLat - hLat) * 0.5 - 0.0018, hLng + (pLng - hLng) * 0.5 + 0.002],
      [hLat + (pLat - hLat) * 0.75 + 0.0015, hLng + (pLng - hLng) * 0.75 - 0.001],
      [pLat, pLng]
    ];
    waypointsRef.current = defaultWaypoints;

    const polyline = L.polyline(defaultWaypoints, {
      color: '#10B981',
      weight: 5,
      opacity: 0.85,
      dashArray: '8, 8',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    polylineRef.current = polyline;

    // Fetch high-fidelity OSRM driving route between hospital and patient
    fetch(`https://router.project-osrm.org/route/v1/driving/${hLng},${hLat};${pLng},${pLat}?overview=full&geometries=geojson`, { signal: AbortSignal.timeout(3000) })
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes[0]?.geometry?.coordinates) {
          const osrmPoints: [number, number][] = data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
          if (osrmPoints.length > 2) {
            waypointsRef.current = osrmPoints;
            if (polylineRef.current) {
              polylineRef.current.setLatLngs(osrmPoints as any);
            }
          }
        }
      })
      .catch(() => {});

    // Fit bounds smoothly
    const bounds = L.latLngBounds([
      [patientCoords.lat, patientCoords.lng],
      [hospitalCoords.lat, hospitalCoords.lng],
      [effectiveAmbCoords.lat, effectiveAmbCoords.lng]
    ]);
    map.fitBounds(bounds, { padding: [40, 40] });

    // Map Click Handler for interactive location picking
    if (allowLocationPick && onLocationPick) {
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        // Move patient marker immediately
        if (patientMarkerRef.current) {
          patientMarkerRef.current.setLatLng([lat, lng]);
        }
        // Reverse geocode clicked location
        let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) {
              address = data.display_name.split(',').slice(0, 3).join(', ');
            }
          }
        } catch (err) {}
        onLocationPick({ lat, lng, address });
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update dynamic coordinates when props change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (patientMarkerRef.current) {
      patientMarkerRef.current.setLatLng([patientCoords.lat, patientCoords.lng]);
    }
    if (hospitalMarkerRef.current) {
      hospitalMarkerRef.current.setLatLng([hospitalCoords.lat, hospitalCoords.lng]);
    }
    if (ambulanceMarkerRef.current && isDispatched) {
      ambulanceMarkerRef.current.setLatLng([effectiveAmbCoords.lat, effectiveAmbCoords.lng]);
    }
  }, [patientCoords, hospitalCoords, effectiveAmbCoords, isDispatched]);

  const handleCenterAmbulance = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([liveAmbCoords.lat, liveAmbCoords.lng], 16, { animate: true });
  };

  const handleCenterPatient = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([patientCoords.lat, patientCoords.lng], 16, { animate: true });
  };

  const handleFitAll = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([
      [patientCoords.lat, patientCoords.lng],
      [hospitalCoords.lat, hospitalCoords.lng],
      [effectiveAmbCoords.lat, effectiveAmbCoords.lng]
    ]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
  };

  return (
    <div 
      style={!isFullscreen && height ? { height } : undefined}
      className={`relative w-full ${isFullscreen ? 'fixed inset-0 z-50 h-screen' : (!height ? heightClass : '')} rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-md bg-slate-900`}
    >
      
      {/* Real Interactive Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top HUD: Real-time Telemetry Overlay */}
      {showHud && (
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10 gap-2">
          
          {/* Left: GPS telemetry status */}
          <div className="bg-[#0B192C]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-white flex items-center gap-2 pointer-events-auto shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping shrink-0" />
            <div className="leading-tight">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                Live Radar Telemetry
              </span>
              <span className="text-[11px] font-mono font-semibold text-slate-100 truncate block max-w-[170px] sm:max-w-[220px]">
                {patientCoords.lat.toFixed(5)}° N, {patientCoords.lng.toFixed(5)}° E
              </span>
            </div>
          </div>

          {/* Right: Vehicle Telemetry Stats */}
          {isDispatched && (
            <div className="bg-[#0B192C]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-white flex items-center gap-3 pointer-events-auto shadow-md">
              <div className="text-right">
                <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                  ETA: ~{liveEta} MINS
                </span>
                <span className="text-[11px] font-mono text-slate-300">
                  {currentSpeed} km/h · ±{patientCoords.accuracyMeters || 3}m
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Navigation className="w-3.5 h-3.5 animate-spin" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Interactive Map Controls (Bottom-Right) */}
      <div className="absolute bottom-2.5 right-2.5 flex flex-col gap-1.5 z-10">
        <button
          type="button"
          onClick={handleCenterAmbulance}
          title="Center on Ambulance"
          className="p-2 rounded-xl bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 transition-all cursor-pointer active:scale-95"
        >
          <Navigation className="w-4 h-4 text-emerald-600" />
        </button>

        <button
          type="button"
          onClick={handleCenterPatient}
          title="Center on Patient / Emergency"
          className="p-2 rounded-xl bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 transition-all cursor-pointer active:scale-95"
        >
          <Crosshair className="w-4 h-4 text-red-600" />
        </button>

        <button
          type="button"
          onClick={handleFitAll}
          title="Fit Entire Dispatch Route"
          className="p-2 rounded-xl bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 transition-all cursor-pointer active:scale-95"
        >
          <LocateFixed className="w-4 h-4 text-blue-600" />
        </button>

        <button
          type="button"
          onClick={() => setIsFullscreen(prev => !prev)}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          className="p-2 rounded-xl bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 transition-all cursor-pointer active:scale-95"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4 text-slate-700" /> : <Maximize2 className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      {/* Pin-drop Hint Bar if allowLocationPick */}
      {allowLocationPick && (
        <div className="absolute bottom-2.5 left-2.5 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] text-white flex items-center gap-1.5 z-10 shadow-lg">
          <MapPin className="w-3.5 h-3.5 text-red-400" />
          <span>Click anywhere on the map to pin-drop exact location</span>
        </div>
      )}

    </div>
  );
};

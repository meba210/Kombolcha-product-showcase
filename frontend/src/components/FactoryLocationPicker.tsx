import { useCallback, useEffect, useRef, useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';

interface Props {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (
    latitude: number,
    longitude: number,
    address: string
  ) => void;
}

const KOMBOLCHA = {
  lat: 11.075,
  lng: 39.745,
};

/* -------------------------------------------------------
   Map controller
------------------------------------------------------- */

function MapController({
  position,
  onMapClick,
}: {
  position: { lat: number; lng: number } | null;
  onMapClick: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  // Move map when a new location is selected from search
  useEffect(() => {
    if (!map || !position) return;

    map.panTo(position);
    map.setZoom(17);
  }, [map, position]);

  // Allow user to click directly on the map
  useEffect(() => {
    if (!map) return;

    const listener = map.addListener(
      'click',
      (event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return;

        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        onMapClick(lat, lng);
      }
    );

    return () => {
      listener.remove();
    };
  }, [map, onMapClick]);

  return null;
}

/* -------------------------------------------------------
   Google Places Search
------------------------------------------------------- */

function LocationSearch({
  onPlaceSelected,
}: {
  onPlaceSelected: (
    latitude: number,
    longitude: number,
    address: string
  ) => void;
}) {
  const places = useMapsLibrary('places');

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
      fields: ['geometry', 'formatted_address', 'name'],
    });

    autocompleteRef.current = autocomplete;

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (!place.geometry?.location) {
        return;
      }

      const latitude = place.geometry.location.lat();

      const longitude = place.geometry.location.lng();

      const address = place.formatted_address || place.name || '';

      onPlaceSelected(latitude, longitude, address);
    });

    return () => {
      listener.remove();
      autocompleteRef.current = null;
    };
  }, [places, onPlaceSelected]);

  return (
    <div className="relative">
      <div className="flex items-center bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Search icon */}
        <div className="pl-4 text-slate-400">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder="Search your factory or location..."
          className="w-full px-3 py-3.5 bg-white outline-none text-sm text-slate-800 placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Main Component
------------------------------------------------------- */

export default function FactoryLocationPicker({
  latitude,
  longitude,
  onLocationSelect,
}: Props) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const [position, setPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(
    latitude !== null && longitude !== null
      ? {
          lat: latitude,
          lng: longitude,
        }
      : null
  );

  const [address, setAddress] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  /* -------------------------------------------------------
     Search result selected
  ------------------------------------------------------- */

  const handlePlaceSelected = useCallback(
    (lat: number, lng: number, selectedAddress: string) => {
      const newPosition = {
        lat,
        lng,
      };

      setPosition(newPosition);
      setAddress(selectedAddress);
      setConfirmed(false);

      onLocationSelect(lat, lng, selectedAddress);
    },
    [onLocationSelect]
  );

  /* -------------------------------------------------------
     User clicks map
  ------------------------------------------------------- */

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      const newPosition = {
        lat,
        lng,
      };

      setPosition(newPosition);
      setConfirmed(false);

      // We don't have a reverse-geocoded address yet.
      setAddress('');

      onLocationSelect(lat, lng, 'Selected map location');
    },
    [onLocationSelect]
  );

  /* -------------------------------------------------------
     Confirm
  ------------------------------------------------------- */

  const handleConfirm = () => {
    if (!position) return;

    setConfirmed(true);

    onLocationSelect(
      position.lat,
      position.lng,
      address || 'Selected map location'
    );
  };

  return (
    <APIProvider apiKey={apiKey} libraries={['places']}>
      <div className="space-y-3">
        {/* -----------------------------------------------
            MAP + SEARCH
        ------------------------------------------------ */}

        <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-slate-200">
          <Map
            defaultCenter={position || KOMBOLCHA}
            defaultZoom={position ? 17 : 14}
            mapId="DEMO_MAP_ID"
            gestureHandling="greedy"
            disableDefaultUI={false}
            zoomControl={true}
            fullscreenControl={true}
            streetViewControl={false}
            mapTypeControl={false}
          >
            <MapController position={position} onMapClick={handleMapClick} />

            {position && (
              <AdvancedMarker position={position} title="Factory location">
                <div className="w-11 h-11 rounded-full bg-[#7f4d33] border-2 border-white shadow-lg flex items-center justify-center">
                  🏭
                </div>
              </AdvancedMarker>
            )}
          </Map>

          {/* Search on map */}
          <div className="absolute top-4 left-4 right-4 z-[1000]">
            <LocationSearch onPlaceSelected={handlePlaceSelected} />
          </div>
        </div>

        {/* -----------------------------------------------
            LOCATION INFORMATION
        ------------------------------------------------ */}

        {position && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Selected Factory Location
                </p>

                {address && (
                  <p className="text-sm text-slate-600 mt-1">{address}</p>
                )}
              </div>

              {confirmed && (
                <div className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1.5 rounded-full">
                  <span>✓</span>
                  Confirmed
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-xs text-slate-500">Latitude</p>

                <p className="text-sm font-medium text-slate-800">
                  {position.lat.toFixed(6)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Longitude</p>

                <p className="text-sm font-medium text-slate-800">
                  {position.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------
            CONFIRM BUTTON
        ------------------------------------------------ */}

        {position && !confirmed && (
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full btn-primary py-3"
          >
            Confirm This Location
          </button>
        )}

        {/* -----------------------------------------------
            CONFIRMED MESSAGE
        ------------------------------------------------ */}

        {confirmed && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <span className="text-base">✓</span>

            <span>
              Factory location confirmed. You can continue with registration.
            </span>
          </div>
        )}

        {!position && (
          <p className="text-xs text-slate-500">
            Search for your factory using the search box above, or click
            directly on the map to choose the exact location.
          </p>
        )}
      </div>
    </APIProvider>
  );
}

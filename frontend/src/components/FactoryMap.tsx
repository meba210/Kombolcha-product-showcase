import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { useState } from 'react';

export interface Factory {
  factory_id: number;
  factory_name: string;
  location: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  _count?: {
    product: number;
  };
}

type MappedFactory = Factory & {
  latitude: number;
  longitude: number;
};

interface GoogleMapProps {
  factories: Factory[];
}

export default function GoogleMap({ factories }: GoogleMapProps) {
  const [selectedFactory, setSelectedFactory] =
    useState<MappedFactory | null>(null);

  const validFactories: MappedFactory[] = factories.flatMap((factory) => {
    if (
      factory.latitude === null ||
      factory.latitude === undefined ||
      factory.longitude === null ||
      factory.longitude === undefined ||
      (typeof factory.latitude === 'string' && !factory.latitude.trim()) ||
      (typeof factory.longitude === 'string' && !factory.longitude.trim())
    ) {
      return [];
    }

    const latitude = Number(factory.latitude);
    const longitude = Number(factory.longitude);
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return [];
    }

    return [{ ...factory, latitude, longitude }];
  });

  // Default center only when there are no factory coordinates yet
  const defaultCenter = {
    lat: 11.075,
    lng: 39.745,
  };

  return (
    <div className="w-full h-[550px] rounded-2xl overflow-hidden">
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={13}
          mapId="DEMO_MAP_ID"
          gestureHandling="greedy"
          disableDefaultUI={false}
          fullscreenControl
          streetViewControl={false}
          mapTypeControl={false}
        >
          {validFactories.map((factory) => (
            <AdvancedMarker
              key={factory.factory_id}
              position={{
                lat: factory.latitude,
                lng: factory.longitude,
              }}
              title={factory.factory_name}
              onClick={() => setSelectedFactory(factory)}
            >
              <div className="relative flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-[#7f4d33] border-[3px] border-white shadow-lg flex items-center justify-center">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 21h18" />
                    <path d="M5 21V9l7-4v16" />
                    <path d="M19 21V5l-7 4" />
                    <path d="M9 13h2" />
                    <path d="M9 17h2" />
                    <path d="M14 13h2" />
                    <path d="M14 17h2" />
                  </svg>
                </div>

                <div className="absolute -bottom-1 w-3 h-3 bg-[#7f4d33] rotate-45 -z-10" />
              </div>
            </AdvancedMarker>
          ))}

          {selectedFactory && (
              <InfoWindow
                position={{
                  lat: selectedFactory.latitude,
                  lng: selectedFactory.longitude,
                }}
                onCloseClick={() => setSelectedFactory(null)}
              >
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-slate-900 text-base">
                    {selectedFactory.factory_name}
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    {selectedFactory.location}
                  </p>

                  {selectedFactory._count && (
                    <p className="text-sm text-slate-600 mt-2">
                      {selectedFactory._count.product} products
                    </p>
                  )}
                </div>
              </InfoWindow>
            )}
        </Map>
      </APIProvider>
    </div>
  );
}

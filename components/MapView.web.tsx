import { useEffect, useRef } from 'react';
import {
  Map as MapLibreMap,
  NavigationControl,
  setWorkerUrl,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

setWorkerUrl('/maplibre-gl-worker.mjs');

const initialCenter: [number, number] = [-104.9903, 39.7392,];

function hideLabelLayers(map: MapLibreMap) {
  const layers = map.getStyle().layers ?? [];

  for (const layer of layers) {
    if (layer.type === 'symbol') {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  }
}

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mapContainerRef.current;

    if (!container) {
      return;
    }

    const map = new MapLibreMap({
      container,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: initialCenter,
      zoom: 14,
      attributionControl: {
        compact: true,
      },
    });

    map.addControl(
      new NavigationControl({
        showZoom: false,
        showCompass: true,
      }),
      'top-right',
    );

    map.once('load', () => {
      hideLabelLayers(map);
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 500,
      }}
    />
  );
}
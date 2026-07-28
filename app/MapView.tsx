"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";

type Shop = { id: number; name: string; lat: number; lng: number };

export function MapView({
  shops,
  selectedId,
  onSelect,
}: {
  shops: Shop[];
  selectedId: number;
  onSelect: (id: number) => void;
}) {
  const mapNode = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const markerInstances = useRef<Marker[]>([]);

  useEffect(() => {
    let active = true;

    async function createMap() {
      if (!mapNode.current || mapInstance.current) return;
      const L = await import("leaflet");
      if (!active || !mapNode.current) return;

      const map = L.map(mapNode.current, {
        center: [-3.7319, -38.5167],
        zoom: 14,
        zoomControl: false,
        attributionControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);

      markerInstances.current = shops.map((shop) => {
        const icon = L.divIcon({
          className: "",
          html: `<button class="map-pin ${shop.id === selectedId ? "is-selected" : ""}" aria-label="${shop.name}"><span>${shop.id === selectedId ? "✦" : shop.id}</span></button>`,
          iconSize: [46, 52],
          iconAnchor: [23, 48],
        });
        const marker = L.marker([shop.lat, shop.lng], { icon }).addTo(map);
        marker.on("click", () => onSelect(shop.id));
        return marker;
      });
      mapInstance.current = map;
    }

    createMap();
    return () => {
      active = false;
      mapInstance.current?.remove();
      mapInstance.current = null;
      markerInstances.current = [];
    };
  }, [shops, onSelect, selectedId]);

  useEffect(() => {
    const shop = shops.find((item) => item.id === selectedId);
    if (shop) mapInstance.current?.flyTo([shop.lat, shop.lng], 15, { duration: 0.7 });
  }, [selectedId, shops]);

  return <div ref={mapNode} className="map-canvas" aria-label="Mapa de barbearias próximas" />;
}

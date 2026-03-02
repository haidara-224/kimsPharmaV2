import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut, Crosshair } from 'lucide-react';
import { Pharmacie } from '@/types';

interface PharmaciesMapProps {
  pharmacies: Pharmacie[];
  highlightedId: number | null;
  onMarkerClick: (id: number | null) => void;
}

// Parse "lat,lng" ou "lat lng"
const parseCoords = (c: string): [number, number] | null => {
  if (!c) return null;
  const parts = c.split(/[,\s]+/).map(Number);
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return [parts[0], parts[1]];
  return null;
};

// Conakry par défaut (adapté à votre contexte)
const DEFAULT_CENTER: [number, number] = [9.5370, -13.6773];
const DEFAULT_ZOOM = 12;

export function PharmaciesMap({ pharmacies, highlightedId, onMarkerClick }: PharmaciesMapProps) {
  const mapRef        = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef    = useRef<Map<number, any>>(new Map());
  const [mapReady, setMapReady]   = useState(false);
  const [mapStyle, setMapStyle]   = useState<'streets' | 'satellite'>('streets');

  const highlighted   = pharmacies.find(p => p.id === highlightedId);
  const withCoords    = pharmacies.filter(p => p.coordonnees && parseCoords(p.coordonnees));
  const noCoords      = pharmacies.filter(p => !p.coordonnees || !parseCoords(p.coordonnees));

  // Tile layers
  const tileLayers = {
    streets:   'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  // ── Init Leaflet ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    // Import dynamique pour éviter SSR issues
    import('leaflet').then(L => {
      // Fix icônes Leaflet avec Vite/webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: DEFAULT_CENTER,
        zoom:   DEFAULT_ZOOM,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer(tileLayers.streets, { maxZoom: 19 }).addTo(map);
      L.control.attribution({ prefix: '© OpenStreetMap' }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // ── Sync marqueurs ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    import('leaflet').then(L => {
      const map = mapInstanceRef.current;

      // Créer icône personnalisée
      const makeIcon = (isHL: boolean, isOpen: boolean, isBlocked: boolean) => {
        const color = isBlocked ? '#ef4444' : isHL ? '#6366f1' : isOpen ? '#10b981' : '#94a3b8';
        const size  = isHL ? 44 : 36;
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="${isHL ? 20 : 16}" fill="${color}" opacity="0.18"/>
            <circle cx="22" cy="22" r="${isHL ? 13 : 10}" fill="${color}" stroke="white" stroke-width="2.5"/>
            ${isHL ? `<circle cx="22" cy="22" r="5" fill="white"/>` : ''}
            ${isBlocked ? `<text x="22" y="27" text-anchor="middle" font-size="10" fill="white">✕</text>` : ''}
          </svg>`;
        return L.divIcon({
          html: svg,
          iconSize:   [size, size],
          iconAnchor: [size/2, size/2],
          className:  '',
        });
      };

      // Supprimer anciens marqueurs
      markersRef.current.forEach(m => map.removeLayer(m));
      markersRef.current.clear();

      // Ajouter nouveaux marqueurs
      pharmacies.forEach(p => {
        const coords = p.coordonnees ? parseCoords(p.coordonnees) : null;
        if (!coords) return;

        const isHL      = p.id === highlightedId;
        const isOpen    = p.disponibilite === 'open';
        const isBlocked = p.is_blocked;

        const marker = L.marker(coords, {
          icon: makeIcon(isHL, isOpen, isBlocked),
          zIndexOffset: isHL ? 1000 : 0,
        });

        // Popup
        const popupHtml = `
          <div style="font-family:system-ui;min-width:180px">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">${p.name}</div>
            <div style="font-size:12px;color:#64748b;margin-bottom:6px">${p.adresse || '—'}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <span style="font-size:11px;padding:2px 8px;border-radius:999px;background:${isOpen ? '#d1fae5' : '#f1f5f9'};color:${isOpen ? '#059669' : '#64748b'}">
                ${isOpen ? '● Ouvert' : '○ Fermé'}
              </span>
              <span style="font-size:11px;padding:2px 8px;border-radius:999px;background:${p.statut === 'active' ? '#dbeafe' : '#f1f5f9'};color:${p.statut === 'active' ? '#2563eb' : '#64748b'}">
                ${p.statut === 'active' ? 'Active' : 'Inactive'}
              </span>
              ${isBlocked ? `<span style="font-size:11px;padding:2px 8px;border-radius:999px;background:#fee2e2;color:#dc2626">Bloquée</span>` : ''}
            </div>
            ${p.tel ? `<div style="font-size:12px;margin-top:6px;color:#374151">📞 ${p.tel}</div>` : ''}
          </div>`;

        marker.bindPopup(popupHtml, { maxWidth: 220, closeButton: true });
        marker.on('click', () => onMarkerClick(p.id === highlightedId ? null : p.id));
        marker.addTo(map);
        markersRef.current.set(p.id, marker);
      });

      // Fit bounds si des marqueurs existent
      if (markersRef.current.size > 0) {
        const group = L.featureGroup(Array.from(markersRef.current.values()));
        map.fitBounds(group.getBounds().pad(0.2), { maxZoom: 15 });
      }
    });
  }, [mapReady, pharmacies, highlightedId]);

  // ── Centrer sur sélection ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !highlightedId) return;
    const p = pharmacies.find(ph => ph.id === highlightedId);
    if (!p?.coordonnees) return;
    const coords = parseCoords(p.coordonnees);
    if (!coords) return;

    import('leaflet').then(() => {
      mapInstanceRef.current.flyTo(coords, 16, { duration: 1.2 });
      markersRef.current.get(highlightedId)?.openPopup();
    });
  }, [highlightedId, mapReady]);

  // ── Changer le fond de carte ───────────────────────────────────────────────
  const toggleMapStyle = () => {
    if (!mapInstanceRef.current) return;
    import('leaflet').then(L => {
      const map = mapInstanceRef.current;
      map.eachLayer((layer: any) => { if (layer._url) map.removeLayer(layer); });
      const next = mapStyle === 'streets' ? 'satellite' : 'streets';
      L.tileLayer(tileLayers[next], { maxZoom: 19 }).addTo(map);
      setMapStyle(next);
    });
  };

  const zoomIn  = () => mapInstanceRef.current?.zoomIn();
  const zoomOut = () => mapInstanceRef.current?.zoomOut();
  const resetView = () => {
    if (!mapInstanceRef.current) return;
    if (markersRef.current.size > 0) {
      import('leaflet').then(L => {
        const group = L.featureGroup(Array.from(markersRef.current.values()));
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.2), { maxZoom: 15 });
      });
    } else {
      mapInstanceRef.current.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    }
  };

  return (
    <div className="sticky top-6 space-y-3">
      {/* CSS Leaflet — injecté dynamiquement */}
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        .leaflet-popup-content-wrapper { border-radius: 12px !important; box-shadow: 0 8px 24px rgba(0,0,0,.12) !important; }
        .leaflet-popup-tip { display: none; }
      `}</style>

      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="border-b bg-muted/20 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-primary" />
              Carte des pharmacies
            </CardTitle>
            <div className="flex items-center gap-2">
              {withCoords.length < pharmacies.length && (
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                  {noCoords.length} sans GPS
                </Badge>
              )}
              <Badge variant="outline">{pharmacies.length} total</Badge>
            </div>
          </div>

          {/* Pharmacie sélectionnée */}
          {highlighted && (
            <div className="mt-2 p-2.5 bg-primary/10 rounded-xl flex items-center gap-2 border border-primary/20">
              <Navigation className="h-3.5 w-3.5 text-primary shrink-0 animate-pulse" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-primary truncate">{highlighted.name}</p>
                <p className="text-xs text-muted-foreground truncate">{highlighted.adresse || '—'}</p>
              </div>
              <button onClick={() => onMarkerClick(null)}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors text-sm">✕</button>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {/* Carte */}
          <div className="relative" style={{ height: 460 }}>
            <div ref={mapRef} className="absolute inset-0 z-0" />

            {/* Contrôles personnalisés */}
            <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5">
              <Button size="icon" variant="secondary"
                className="h-8 w-8 shadow-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
                onClick={zoomIn} title="Zoom +">
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="secondary"
                className="h-8 w-8 shadow-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
                onClick={zoomOut} title="Zoom -">
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="secondary"
                className="h-8 w-8 shadow-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
                onClick={resetView} title="Vue globale">
                <Crosshair className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="secondary"
                className="h-8 w-8 shadow-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
                onClick={toggleMapStyle} title="Changer le fond">
                <Layers className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Badge style actuel */}
            <div className="absolute bottom-3 left-3 z-[400]">
              <Badge variant="secondary"
                className="text-xs bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-sm">
                {mapStyle === 'streets' ? '🗺 Plan' : '🛰 Satellite'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pharmacies sans coordonnées GPS */}
      {noCoords.length > 0 && (
        <Card className="border-0 shadow-sm border-amber-200/50">
          <CardContent className="p-3">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2">
              ⚠ {noCoords.length} pharmacie{noCoords.length > 1 ? 's' : ''} sans coordonnées GPS
            </p>
            <div className="space-y-1">
              {noCoords.slice(0, 3).map(p => (
                <p key={p.id} className="text-xs text-muted-foreground truncate">· {p.name}</p>
              ))}
              {noCoords.length > 3 && (
                <p className="text-xs text-muted-foreground">et {noCoords.length - 3} autres…</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Légende */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">Légende</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { color: 'bg-emerald-500', label: 'Ouverte & active' },
              { color: 'bg-slate-400',   label: 'Fermée' },
              { color: 'bg-indigo-500',  label: 'Sélectionnée' },
              { color: 'bg-red-500',     label: 'Bloquée' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${color}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
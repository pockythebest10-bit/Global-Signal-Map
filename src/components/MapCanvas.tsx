import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Circle, Polyline, useMapEvents } from 'react-leaflet';
import { SignalEvent } from '../data/mockData';
import { DisplayEvent } from './AlertsSidebar';
import { cn } from '../lib/utils';
import L from 'leaflet';

import { MACRO_LAYERS, LayerType, MacroOverlay } from '../data/macroLayers';
import { Layers } from 'lucide-react';

interface MapCanvasProps {
  events: DisplayEvent[];
  selectedEventId: string | null;
  onEventSelect: (id: string) => void;
}

// Map Categories to their CSS class equivalents
const getCategorySlug = (category: string) => {
  switch (category) {
    case 'Politics & Policy': return 'politics';
    case 'Macro & Markets': return 'macro';
    case 'Corporate Actions': return 'corporate';
    case 'Technology & Infrastructure': return 'tech';
    case 'Trade & Supply Chain': return 'trade';
    default: return 'tech';
  }
};

// Custom pulsing icon for origin
const createPulseIcon = (category: string, isSelected: boolean, zoom: number, isPriority: boolean = false, isPinned: boolean = false, precision: 'exact' | 'city' | 'country' | 'region' | 'none' = 'exact') => {
  const catSlug = getCategorySlug(category);
  const isHeatZone = zoom <= 3 && !isSelected;
  const isApproximate = precision === 'country' || precision === 'region';
  
  if (isHeatZone) {
    const size = isApproximate ? (isPinned ? 160 : (isPriority ? 110 : 80)) : (isPinned ? 120 : (isPriority ? 80 : 50));
    const opacity = isApproximate ? (isPinned ? 0.2 : 0.1) : (isPinned ? 0.4 : (isPriority ? 0.3 : 0.15));
    return L.divIcon({
      className: `custom-div-icon border-none bg-transparent`,
      html: `
        <div class="relative flex items-center justify-center">
          <div class="heat-zone cat-${catSlug}" style="width: ${size}px; height: ${size}px; opacity: ${opacity}; ${isApproximate ? 'filter: blur(8px);' : ''}"></div>
          ${!isApproximate && isPinned ? `<div class="absolute w-4 h-4 bg-brand-400 rounded-full opacity-90 shadow-[0_0_25px_var(--color-brand-400)]"></div>` : 
            (!isApproximate && isPriority ? `<div class="absolute w-3 h-3 bg-white rounded-full opacity-60 shadow-[0_0_15px_white]"></div>` : '')}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  }

  const pulseSize = isApproximate ? (isSelected ? 40 : 24) : (isSelected ? 24 : (isPinned ? 20 : (isPriority ? 16 : 10)));
  const shadowSpread = isSelected ? '0 0 30px' : (isPinned ? '0 0 25px' : (isPriority ? '0 0 15px' : '0 0 8px'));

  return L.divIcon({
    className: `custom-div-icon border-none bg-transparent`,
    html: `
      <div class="relative flex items-center justify-center">
        <div class="pulse-icon cat-${catSlug} ${isSelected ? 'selected' : ''}" style="width: ${pulseSize}px; height: ${pulseSize}px; opacity: ${(isPriority || isPinned) && !isSelected ? 1 : (isApproximate ? 0.6 : 1)}; ${isApproximate ? 'border-style: dashed; border-width: 1px; background: transparent !important; box-shadow: none;' : ''}">
           <div class="pulse-ring" style="${(isPriority || isPinned) && !isSelected ? 'opacity: 1; transform: scale(2); animation-duration: 2s;' : ''} ${isApproximate ? 'border-style: dashed; opacity: 0.3;' : ''}"></div>
           ${!isApproximate && (isSelected || isPriority || isPinned) ? `<div class="pulse-core" style="box-shadow: ${shadowSpread} ${isPinned && !isSelected ? 'var(--color-brand-400)' : `var(--color-cat-${catSlug})`}; background-color: ${isPinned && !isSelected ? 'var(--color-brand-400)' : `var(--color-cat-${catSlug})`}"></div>` : ''}
        </div>
      </div>
    `,
    iconSize: [60, 60],
    iconAnchor: [30, 30]
  });
};

// Component to handle map centering and zoom tracking
function MapController({ 
  selectedEvent, 
  setZoom 
}: { 
  selectedEvent: SignalEvent | undefined, 
  setZoom: (z: number) => void
}) {
  const map = useMapEvents({
    zoom: () => {
      setZoom(map.getZoom());
    }
  });
  
  useEffect(() => {
    setZoom(map.getZoom());
  }, [map, setZoom]);
  
  useEffect(() => {
    let rafId: number;
    if (selectedEvent && selectedEvent.originLocation && typeof selectedEvent.originLocation.lat === 'number' && typeof selectedEvent.originLocation.lng === 'number' && !isNaN(selectedEvent.originLocation.lat) && !isNaN(selectedEvent.originLocation.lng)) {
      // Offset center slightly to the left so the left rail (w-280px) does not cover the pin
      // On small screens, no left rail offsetting
      const isMobile = window.innerWidth < 768;
      // Since the drawer is floating and 420px/480px, the center of the visible area shifts left
      // We offset lng by around 5 to keep the point visible but not pushed too far
      const lngOffset = isMobile ? 0 : 5;

      rafId = requestAnimationFrame(() => {
        map.setView([selectedEvent.originLocation.lat, selectedEvent.originLocation.lng - lngOffset], 4.5, { animate: true, duration: 1.5 });
      });
    } else {
      // Zoom out to see everything, center shifted right to balance the left rail
      const isMobile = window.innerWidth < 768;
      const lngOffset = isMobile ? 0 : -15;
      rafId = requestAnimationFrame(() => {
        map.setView([30, lngOffset], 2.5, { animate: true, duration: 1.5 });
      });
    }
    return () => cancelAnimationFrame(rafId);
  }, [selectedEvent?.id, map]);

  return null;
}

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Politics & Policy': return 'var(--color-cat-politics)';
    case 'Macro & Markets': return 'var(--color-cat-macro)';
    case 'Corporate Actions': return 'var(--color-cat-corporate)';
    case 'Technology & Infrastructure': return 'var(--color-cat-tech)';
    case 'Trade & Supply Chain': return 'var(--color-cat-trade)';
    default: return '#A1A1AA';
  }
};

export const MapCanvas: React.FC<MapCanvasProps> = ({ events, selectedEventId, onEventSelect }) => {
  const selectedEvent = events.find(e => e.id === selectedEventId);
  const [currentZoom, setCurrentZoom] = useState(2.5);
  const [activeLayers, setActiveLayers] = useState<Set<LayerType>>(new Set());

  const toggleLayer = (layerId: LayerType) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      return next;
    });
  };

  return (
    <div className="absolute inset-0 z-0 bg-[#050505]">
      <MapContainer 
        center={[20, -20]} 
        zoom={2.5} 
        zoomControl={false}
        className="w-full h-full"
        style={{ backgroundColor: '#050505' }}
        minZoom={2}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          opacity={0.6} // Reduced opacity for darker, more premium feel
        />

        {/* Macro Context Layers */}
        {MACRO_LAYERS.map(layer => {
          if (!activeLayers.has(layer.id)) return null;
          
          return (
            <React.Fragment key={`layer-${layer.id}`}>
              {/* Render paths */}
              {layer.paths?.map((path, idx) => (
                <Polyline
                  key={`${layer.id}-path-${idx}`}
                  positions={path.positions}
                  pathOptions={{ color: layer.color, weight: 3, opacity: 0.3, dashArray: '4, 12' }}
                  className="macro-layer-path"
                />
              ))}
              {/* Render areas */}
              {layer.areas?.map((area, idx) => (
                <Circle
                  key={`${layer.id}-area-${idx}`}
                  center={area.center}
                  radius={area.radius} // meters
                  pathOptions={{ color: layer.color, fillColor: layer.color, fillOpacity: 0.05, weight: 1, dashArray: '4, 4' }}
                />
              ))}
              {/* Render points */}
              {layer.points?.map((point, idx) => (
                <CircleMarker
                  key={`${layer.id}-point-${idx}`}
                  center={point.center}
                  radius={4}
                  pathOptions={{ color: layer.color, fillColor: '#000', fillOpacity: 1, weight: 2 }}
                />
              ))}
            </React.Fragment>
          );
        })}
        
        <MapController selectedEvent={selectedEvent} setZoom={setCurrentZoom} />

        {/* Draw connections if an event is selected */}
        {selectedEvent && selectedEvent.impactLocations && selectedEvent.impactLocations.map((loc, idx) => {
          if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number' || isNaN(loc.lat) || isNaN(loc.lng) || (loc.lat === 0 && loc.lng === 0)) return null;
          
          const origin = selectedEvent.originLocation;
          if (!origin || typeof origin.lat !== 'number' || typeof origin.lng !== 'number' || isNaN(origin.lat) || isNaN(origin.lng) || (origin.lat === 0 && origin.lng === 0)) return null;

          const linkColor = getCategoryColor(selectedEvent.category);

          return (
            <React.Fragment key={`impact-${idx}`}>
               <Polyline 
                 positions={[[origin.lat, origin.lng], [loc.lat, loc.lng]]}
                 pathOptions={{ color: linkColor, weight: 1, opacity: 0.1, dashArray: '2, 6' }}
                 className="rounded-path"
               />
               <CircleMarker
                  center={[loc.lat, loc.lng]}
                  radius={2}
                  pathOptions={{ color: linkColor, fillColor: '#111', fillOpacity: 0.8, weight: 1 }}
                >
                  {/* Invisible larger circle to make hover easier */}
                  <CircleMarker
                    center={[loc.lat, loc.lng]}
                    radius={15}
                    pathOptions={{ color: 'transparent', fillColor: 'transparent' }}
                  >
                    <Popup className="dark-popup text-center" closeButton={false} autoPan={false}>
                      <div className="text-[12px] font-medium tracking-wide font-sans text-white mb-1">{loc.name}</div>
                      <div className="text-[9px] uppercase font-mono mt-1 opacity-70" style={{ color: linkColor }}>Impact Zone</div>
                    </Popup>
                  </CircleMarker>
               </CircleMarker>
            </React.Fragment>
          );
        })}

        {/* Draw all event origins */}
        {events.map((event, index) => {
          if (!event.originLocation || typeof event.originLocation.lat !== 'number' || typeof event.originLocation.lng !== 'number' || isNaN(event.originLocation.lat) || isNaN(event.originLocation.lng) || (event.originLocation.lat === 0 && event.originLocation.lng === 0)) return null;
          
          const isSelected = event.id === selectedEventId;
          const isDimmed = selectedEventId !== null && !isSelected;
          const isPriority = ((event as any).computedRelevanceScore || 0) >= 20;
          const isPinned = event.matchReasons?.some(r => r.includes('[PINNED]')) || false;

          return (
            <React.Fragment key={event.id}>
              {isSelected && (
                <CircleMarker
                  center={[event.originLocation.lat, event.originLocation.lng]}
                  radius={20}
                  pathOptions={{ color: getCategoryColor(event.category), fillColor: 'transparent', weight: 0.5, opacity: 0.2, dashArray: '2, 4' }}
                />
              )}
              {isSelected && (
                <CircleMarker
                  center={[event.originLocation.lat, event.originLocation.lng]}
                  radius={8}
                  pathOptions={{ color: 'transparent', fillColor: getCategoryColor(event.category), fillOpacity: 0.1, weight: 0 }}
                />
              )}
              <Marker 
                position={[event.originLocation.lat, event.originLocation.lng]}
                icon={createPulseIcon(event.category, isSelected, currentZoom, isPriority, isPinned, event.originLocation.precision)}
                eventHandlers={{
                  click: () => onEventSelect(event.id)
                }}
                zIndexOffset={isSelected ? 10000 : (isPinned ? 7500 : (isPriority ? 5000 : (events.length - index)))}
                opacity={isDimmed ? 0.2 : 1}
              >
                {/* Only show popups if NOT selected AND we are zoomed in enough OR there is no global selection */}
                {!isSelected && (currentZoom > 3 || selectedEventId === null) && (
                  <Popup className="dark-popup" closeButton={false} autoPan={false}>
                     <div className="w-[280px] bg-[#0a0a0c]/98 backdrop-blur-xl p-4 rounded-[12px] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition-transform hover:scale-[1.02] cursor-pointer" onClick={(e) => { e.stopPropagation(); onEventSelect(event.id); }}>
                       <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                          <div className={cn("text-[9px] uppercase font-mono tracking-widest flex items-center gap-1.5", `text-cat-${getCategorySlug(event.category)}`)}>
                             <div className={cn("w-1.5 h-1.5 rounded-full", `bg-cat-${getCategorySlug(event.category)}`)} />
                             {event.category.split(' & ')[0]}
                          </div>
                          <div className="flex items-center gap-2">
                             {(event as any).provenance && (
                               <div className={cn(
                                 "text-[8px] font-mono uppercase tracking-widest px-1 py-[0px] rounded-[2px] border",
                                 (event as any).provenance === 'real' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                                 (event as any).provenance === 'hybrid' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                                 'border-white/20 text-white/50 bg-white/5'
                               )}>
                                 {(event as any).provenance}
                               </div>
                             )}
                             <div className="text-[9px] font-mono text-text-tertiary">
                                {event.originLocation.name.split(',')[0]}
                             </div>
                          </div>
                       </div>
                      <div className="text-[13px] font-medium leading-[1.35] text-white tracking-tight">{event.title}</div>
                    </div>
                  </Popup>
                )}
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Layer Toggles Control */}
      <div className={cn(
        "absolute bottom-6 z-[1000] flex flex-col items-end gap-2 pointer-events-none transition-all duration-500 ease-out",
        selectedEventId ? "right-6 md:right-[360px] lg:right-[400px]" : "right-6"
      )}>
        <div className="bg-[#0a0a0c]/80 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl pointer-events-auto w-64">
           <div className="flex items-center gap-2 mb-3 text-[10px] font-mono uppercase text-text-tertiary tracking-widest px-1">
             <Layers className="w-3.5 h-3.5" />
             Macro Context Overlay
           </div>
           <div className="space-y-1.5 flex flex-col items-stretch">
             {MACRO_LAYERS.map(layer => {
               const isActive = activeLayers.has(layer.id);
               return (
                 <button
                   key={layer.id}
                   onClick={(e) => { e.stopPropagation(); toggleLayer(layer.id); }}
                   className={cn(
                     "flex items-center justify-between px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-200 border w-full shrink-0",
                     isActive ? "bg-white/[0.04] border-white/10 text-white" : "bg-transparent border-transparent text-text-tertiary hover:bg-white/[0.02]"
                   )}
                 >
                   <span className="flex items-center gap-2 text-left">
                     <span 
                       className={cn("w-2 h-2 rounded-full", isActive ? "shadow-[0_0_8px_currentColor]" : "opacity-30")} 
                       style={{ backgroundColor: layer.color, color: layer.color }} 
                     />
                     {layer.label}
                   </span>
                   {isActive && <div className="text-[9px] font-mono text-brand-500 uppercase">Active</div>}
                 </button>
               );
             })}
           </div>
        </div>
      </div>
    </div>
  );
};

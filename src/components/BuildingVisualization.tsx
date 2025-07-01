import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';

interface ApartmentData {
  id: string;
  type: string;
  bedrooms: number;
  floor: number;
  area: number;
  terrace: number;
  price: number;
  status: 'available' | 'reserved' | 'sold';
  albumLink?: string;
  viewLink?: string;
  showAlbum?: boolean;
  showView?: boolean;
  showPrice?: boolean;
}

interface FilterState {
  bedrooms: number[];
  floorRange: [number, number];
  areaRange: [number, number];
  status: string[];
}

interface BuildingVisualizationProps {
  apartmentData: ApartmentData[];
  filteredData: ApartmentData[];
  onApartmentSelect: (apartment: ApartmentData | null) => void;
  selectedApartment: ApartmentData | null;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const BuildingVisualization: React.FC<BuildingVisualizationProps> = ({
  apartmentData,
  filteredData,
  onApartmentSelect,
  selectedApartment,
  filters,
  onFilterChange
}) => {
  const [currentView, setCurrentView] = useState(1);
  const [currentBackground, setCurrentBackground] = useState(1); // NEW: Track background image
  const totalViews = 2;

  const handleApartmentClick = (apartmentId: string) => {
    // Only allow apartment selection when on background 1 (not in demo mode)
    if (currentBackground === 1) {
      const apartment = apartmentData.find(apt => apt.id === apartmentId);
      onApartmentSelect(apartment || null);
    }
  };

  const switchView = (viewNumber: number) => {
    setCurrentView(viewNumber);
  };

  // NEW: Switch background function
  const switchBackground = () => {
    const newBackground = currentBackground === 1 ? 2 : 1;
    setCurrentBackground(newBackground);
    
    // Close apartment details when switching to demo mode
    if (newBackground === 2) {
      onApartmentSelect(null);
    }
    
    console.log(`🖼️ Switched to background ${newBackground} ${newBackground === 2 ? '(Demo Mode)' : '(Interactive Mode)'}`);
  };

  const getApartmentStatus = (apartmentId: string) => {
    const apartment = apartmentData.find(apt => apt.id === apartmentId);
    return apartment?.status || 'available';
  };

  const isSelected = (apartmentId: string) => {
    return selectedApartment?.id === apartmentId;
  };

  const isVisible = (apartmentId: string) => {
    const apartment = apartmentData.find(apt => apt.id === apartmentId);
    if (!apartment) return false;
    
    // FIXED: If no bedrooms are selected, hide all apartments
    const matchesBedrooms = filters.bedrooms.length > 0 && filters.bedrooms.includes(apartment.bedrooms);
    const matchesFloor = apartment.floor >= filters.floorRange[0] && apartment.floor <= filters.floorRange[1];
    const matchesArea = apartment.area >= filters.areaRange[0] && apartment.area <= filters.areaRange[1];
    const matchesStatus = filters.status.includes(apartment.status);
    
    return matchesBedrooms && matchesFloor && matchesArea && matchesStatus;
  };

  const toggleBedroomFilter = (bedrooms: number) => {
    let newBedrooms: number[];
    
    if (filters.bedrooms.includes(bedrooms)) {
      // Remove this bedroom count from filter
      newBedrooms = filters.bedrooms.filter(b => b !== bedrooms);
    } else {
      // Add this bedroom count to filter
      newBedrooms = [...filters.bedrooms, bedrooms];
    }
    
    onFilterChange({
      ...filters,
      bedrooms: newBedrooms
    });
  };

  const resetFilters = () => {
    const floors = apartmentData.map(apt => apt.floor);
    const areas = apartmentData.map(apt => apt.area);
    const minFloor = Math.min(...floors);
    const maxFloor = Math.max(...floors);
    const minArea = Math.min(...areas);
    const maxArea = Math.max(...areas);
    
    onFilterChange({
      bedrooms: [2, 3, 4], // Reset to show all bedroom types
      floorRange: [minFloor, maxFloor],
      areaRange: [minArea, maxArea],
      status: ['available', 'reserved', 'sold']
    });
  };

  const clearAllShapes = () => {
    if (filters.bedrooms.length === 0) {
      // Show all
      onFilterChange({
        ...filters,
        bedrooms: [2, 3, 4]
      });
    } else {
      // Hide all
      onFilterChange({
        ...filters,
        bedrooms: []
      });
    }
  };

  const handleInterestClick = () => {
    const subject = encodeURIComponent('Заинтересиран сум за апартман во Зграда Електра');
    const body = encodeURIComponent('Здраво,\n\nЗаинтересиран сум за повеќе информации за апартманите во Зграда Електра. Ве молам контактирајте ме.\n\nБлагодарам!');
    window.open(`mailto:info@elektra.mk?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Header with Interest Button */}
      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={handleInterestClick}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
        >
          ЗАИНТЕРЕСИРАН СУМ
        </button>
      </div>

      {/* ✅ FIXED: Background Switcher Arrow - Left side, vertically centered, ALWAYS VISIBLE */}
      <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-50">
        <button
          onClick={switchBackground}
          className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-lg border-2 border-white/30 text-white hover:bg-black/80 transition-all duration-300 flex items-center justify-center group shadow-2xl hover:shadow-white/20"
          title={currentBackground === 1 ? 'Switch to Demo View (background2.webp)' : 'Switch to Interactive View (background.webp)'}
        >
          {currentBackground === 1 ? (
            <ArrowRight className="w-8 h-8 group-hover:scale-125 transition-transform text-white" />
          ) : (
            <ArrowLeft className="w-8 h-8 group-hover:scale-125 transition-transform text-white" />
          )}
        </button>
        
        {/* Background indicator */}
        <div className="mt-3 text-center">
          <div className="px-3 py-2 rounded-full bg-black/60 backdrop-blur-lg border border-white/30 text-white text-xs font-bold shadow-lg">
            {currentBackground === 1 ? 'Interactive' : 'Demo'}
          </div>
        </div>
      </div>

      {/* Navigation Controls - Only show in interactive mode */}
      {currentBackground === 1 && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-4">
          <button
            onClick={() => switchView(currentView === 1 ? totalViews : currentView - 1)}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 flex items-center justify-center group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          
          <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
            {currentView}/{totalViews}
          </div>
          
          <button
            onClick={() => switchView(currentView === totalViews ? 1 : currentView + 1)}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 flex items-center justify-center group"
          >
            <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}

      {/* Building Container */}
      <div className="relative bg-gradient-to-br from-slate-900/20 to-slate-800/20 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Background Image - DYNAMIC SWITCHING */}
        <div className="relative w-full h-[600px] bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900">
          <img
            src={currentBackground === 1 ? "/src/assets/background.webp" : "/src/assets/background2.webp"}
            alt="Зграда Електра"
            className="w-full h-full object-cover opacity-80 transition-all duration-500"
            onError={(e) => {
              // Fallback if images don't load
              console.warn(`Failed to load background${currentBackground}.webp, using fallback`);
              e.currentTarget.src = "https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg";
            }}
          />
          
          {/* SVG Overlay with apartment shapes - ONLY SHOW IN INTERACTIVE MODE */}
          {currentBackground === 1 && (
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 2000 1178"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* View 1 Apartments */}
              {currentView === 1 && (
                <g>
                  {apartmentData.map((apartment, index) => {
                    if (index >= 4) return null; // Only show first 4 apartments in view 1
                    
                    const baseX = 300 + (index % 2) * 900;
                    const baseY = 600 + Math.floor(index / 2) * 200;
                    const points = `${baseX},${baseY + 200} ${baseX + 600},${baseY + 220} ${baseX + 900},${baseY + 200} ${baseX + 900},${baseY} ${baseX + 600},${baseY - 20} ${baseX},${baseY}`;
                    
                    return (
                      <g 
                        key={apartment.id}
                        className={`apartment-shape ${apartment.status} ${isSelected(apartment.id) ? 'selected' : ''} ${!isVisible(apartment.id) ? 'hidden' : ''}`}
                        onClick={() => handleApartmentClick(apartment.id)}
                        style={{
                          opacity: isVisible(apartment.id) ? 1 : 0.2,
                          pointerEvents: isVisible(apartment.id) ? 'all' : 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <polygon points={points} />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* View 2 Apartments */}
              {currentView === 2 && (
                <g>
                  {apartmentData.map((apartment, index) => {
                    const baseX = 200 + (index % 2) * 1000;
                    const baseY = 450 + Math.floor(index / 2) * 200;
                    const points = `${baseX},${baseY + 200} ${baseX + 400},${baseY + 220} ${baseX + 800},${baseY + 200} ${baseX + 800},${baseY} ${baseX + 400},${baseY - 20} ${baseX},${baseY}`;
                    
                    return (
                      <g 
                        key={`${apartment.id}-view2`}
                        className={`apartment-shape ${apartment.status} ${isSelected(apartment.id) ? 'selected' : ''} ${!isVisible(apartment.id) ? 'hidden' : ''}`}
                        onClick={() => handleApartmentClick(apartment.id)}
                        style={{
                          opacity: isVisible(apartment.id) ? 1 : 0.2,
                          pointerEvents: isVisible(apartment.id) ? 'all' : 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <polygon points={points} />
                      </g>
                    );
                  })}
                </g>
              )}
            </svg>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Bottom Controls - ONLY SHOW IN INTERACTIVE MODE */}
      {currentBackground === 1 && (
        <div className="mt-6 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            {/* Bedroom Filters - FIXED LOGIC */}
            <div className="flex items-center gap-3">
              <span className="text-white/70 text-sm font-medium">СПАЛНИ:</span>
              <div className="flex gap-2">
                {[2, 3, 4].map(bedrooms => (
                  <button
                    key={bedrooms}
                    onClick={() => toggleBedroomFilter(bedrooms)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                      filters.bedrooms.includes(bedrooms)
                        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                        : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                    }`}
                  >
                    {bedrooms}
                  </button>
                ))}
              </div>
            </div>

            {/* Floor Range */}
            <div className="flex items-center gap-3">
              <span className="text-white/70 text-sm font-medium">КАТОВИ:</span>
              <span className="text-white text-sm">{filters.floorRange[0]} - {filters.floorRange[1]}</span>
            </div>

            {/* Area Range */}
            <div className="flex items-center gap-3">
              <span className="text-white/70 text-sm font-medium">ПОВРШИНА:</span>
              <span className="text-white text-sm">{filters.areaRange[0]} - {filters.areaRange[1]} m²</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 text-sm font-medium transition-all duration-300"
              >
                Reset
              </button>
              <button
                onClick={clearAllShapes}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 text-sm font-medium transition-all duration-300"
              >
                {filters.bedrooms.length === 0 ? 'Show All' : 'Clear All'}
              </button>
            </div>

            {/* Status Legend */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-white/70 text-sm">Слободен</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                <span className="text-white/70 text-sm">Резервиран</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-white/70 text-sm">Продаден</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demo Mode Indicator */}
      {currentBackground === 2 && (
        <div className="mt-6 bg-purple-500/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 text-center">
          <div className="text-purple-300 font-semibold text-lg">
            🎬 Demo Mode - Background 2
          </div>
          <div className="text-white/70 text-sm mt-1">
            Click the arrow to return to interactive mode
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingVisualization;
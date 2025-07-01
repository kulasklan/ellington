import React, { useState, useEffect } from 'react';
import { Building2, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import BuildingVisualization from './components/BuildingVisualization';
import ApartmentDetails from './components/ApartmentDetails';
import FilterPanel from './components/FilterPanel';
import BottomNavigation from './components/BottomNavigation';
import { useGoogleSheets } from './hooks/useGoogleSheets';

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
  // FIXED: Add checkbox visibility flags
  showType?: boolean;
  showBedrooms?: boolean;
  showArea?: boolean;
  showTerrace?: boolean;
  showFloor?: boolean;
  noData?: boolean;
}

interface FilterState {
  bedrooms: number[];
  floorRange: [number, number];
  areaRange: [number, number];
  status: string[];
}

function App() {
  const { data: apartmentData, loading, error } = useGoogleSheets();
  const [selectedApartment, setSelectedApartment] = useState<ApartmentData | null>(null);
  const [activeTab, setActiveTab] = useState('building');
  const [filters, setFilters] = useState<FilterState>({
    bedrooms: [2, 3], // Start with 2 and 3 bedrooms active
    floorRange: [1, 2],
    areaRange: [80, 110],
    status: ['available', 'reserved', 'sold']
  });
  const [filteredData, setFilteredData] = useState<ApartmentData[]>([]);

  // Update filters when apartment data loads
  useEffect(() => {
    if (apartmentData.length > 0) {
      const floors = apartmentData.map(apt => apt.floor);
      const areas = apartmentData.map(apt => apt.area);
      const minFloor = Math.min(...floors);
      const maxFloor = Math.max(...floors);
      const minArea = Math.min(...areas);
      const maxArea = Math.max(...areas);
      
      setFilters(prev => ({
        ...prev,
        floorRange: [minFloor, maxFloor],
        areaRange: [minArea, maxArea]
      }));
    }
  }, [apartmentData]);

  // Apply filters to apartment data
  useEffect(() => {
    if (apartmentData.length > 0) {
      const filtered = apartmentData.filter(apartment => {
        // FIXED: If no bedrooms are selected, show no apartments
        const matchesBedrooms = filters.bedrooms.length > 0 && filters.bedrooms.includes(apartment.bedrooms);
        const matchesFloor = apartment.floor >= filters.floorRange[0] && apartment.floor <= filters.floorRange[1];
        const matchesArea = apartment.area >= filters.areaRange[0] && apartment.area <= filters.areaRange[1];
        const matchesStatus = filters.status.includes(apartment.status);
        
        return matchesBedrooms && matchesFloor && matchesArea && matchesStatus;
      });
      
      setFilteredData(filtered);
    }
  }, [apartmentData, filters]);

  const handleInterestClick = () => {
    window.open('mailto:info@elektra.mk?subject=Заинтересиран сум за апартман&body=Здраво, заинтересиран сум за повеќе информации за апартманите во Зграда Електра.', '_blank');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'building':
        return (
          <div className="flex-1 flex gap-6 p-6 pb-24">
            <div className="flex-1">
              <BuildingVisualization
                apartmentData={apartmentData}
                filteredData={filteredData}
                onApartmentSelect={setSelectedApartment}
                selectedApartment={selectedApartment}
                filters={filters}
                onFilterChange={setFilters}
              />
            </div>
            {selectedApartment && (
              <div className="flex-shrink-0">
                <ApartmentDetails
                  apartment={selectedApartment}
                  onClose={() => setSelectedApartment(null)}
                />
              </div>
            )}
          </div>
        );

      case 'filters':
        return (
          <div className="flex-1 p-6 pb-24 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-cyan-400" />
              Филтри за пребарување
            </h2>
            <FilterPanel
              onFilterChange={setFilters}
              apartmentData={apartmentData}
            />
          </div>
        );

      case 'analytics':
        return (
          <div className="flex-1 p-6 pb-24">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Статистики на продажба</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-2">Вкупно апартмани</h3>
                  <p className="text-3xl font-bold text-cyan-400">{apartmentData.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-2">Слободни</h3>
                  <p className="text-3xl font-bold text-green-400">
                    {apartmentData.filter(apt => apt.status === 'available').length}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-2">Продадени</h3>
                  <p className="text-3xl font-bold text-red-400">
                    {apartmentData.filter(apt => apt.status === 'sold').length}
                  </p>
                </div>
              </div>
              
              {/* Google Sheets Status */}
              <div className="mt-6 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Google Sheets Status</h3>
                <div className="space-y-2">
                  <p className="text-white/80">
                    <strong>Status:</strong> {error ? 'Error - Using Sample Data' : 'Connected Successfully'}
                  </p>
                  <p className="text-white/80">
                    <strong>Apartments Loaded:</strong> {apartmentData.length}
                  </p>
                  <p className="text-white/80">
                    <strong>Data Source:</strong> {error ? 'Sample Data' : 'Google Sheets'}
                  </p>
                  {error && (
                    <p className="text-red-400 text-sm mt-2">{error}</p>
                  )}
                  
                  {/* Show sample of loaded data with checkbox states */}
                  <div className="mt-4">
                    <h4 className="text-white font-medium mb-2">Sample Data (Checkbox States):</h4>
                    <div className="bg-black/20 rounded-lg p-3 text-xs">
                      {apartmentData.slice(0, 2).map(apt => (
                        <div key={apt.id} className="text-white/70 mb-2">
                          <div className="font-medium text-cyan-400">{apt.id}: {apt.type}, {apt.status}</div>
                          <div className="ml-2 space-y-1">
                            <div>Type: {apt.showType ? '✓' : '✗'} | Bedrooms: {apt.showBedrooms ? '✓' : '✗'} | Area: {apt.showArea ? '✓' : '✗'}</div>
                            <div>Terrace: {apt.showTerrace ? '✓' : '✗'} | Floor: {apt.showFloor ? '✓' : '✗'} | Price: {apt.showPrice ? '✓' : '✗'}</div>
                            <div>Album: {apt.showAlbum ? '✓' : '✗'} | View: {apt.showView ? '✓' : '✗'}</div>
                            {apt.showAlbum && apt.albumLink && <div className="text-cyan-300">Album Link: Available</div>}
                            {apt.showView && apt.viewLink && <div className="text-purple-300">View Link: Available</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="flex-1 p-6 pb-24">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Контакт информации</h2>
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Phone className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-semibold">Телефон</span>
                  </div>
                  <p className="text-white/80">+389 2 123 456</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-semibold">Е-пошта</span>
                  </div>
                  <p className="text-white/80">info@elektra.mk</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-semibold">Локација</span>
                  </div>
                  <p className="text-white/80">Скопје, Македонија</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'info':
        return (
          <div className="flex-1 p-6 pb-24">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">За проектот</h2>
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">Зграда Електра</h3>
                <p className="text-white/80 mb-4">
                  Модерна стамбена зграда со висок квалитет на изведба и современ дизајн. 
                  Лоцирана во срцето на градот, нуди комфорт и луксуз за вашето семејство.
                </p>
                <div className="space-y-2">
                  <p className="text-white/70"><strong>Година на изградба:</strong> 2024</p>
                  <p className="text-white/70"><strong>Број на катови:</strong> 2</p>
                  <p className="text-white/70"><strong>Вкупно апартмани:</strong> {apartmentData.length}</p>
                  <p className="text-white/70"><strong>Паркинг места:</strong> Достапни</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Се вчитуваат податоците...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
            ЗГРАДА ЕЛЕКТРА
          </h1>
          <button
            onClick={handleInterestClick}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
          >
            ЗАИНТЕРЕСИРАН СУМ
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Error Display */}
      {error && (
        <div className="fixed top-20 right-4 bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-300 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}

export default App;
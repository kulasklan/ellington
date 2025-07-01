import React, { useState, useEffect } from 'react';
import { Filter, Sliders, Home, TrendingUp } from 'lucide-react';

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
  apartmentData: any[];
}

interface FilterState {
  bedrooms: number[];
  floorRange: [number, number];
  areaRange: [number, number];
  status: string[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange, apartmentData }) => {
  const [filters, setFilters] = useState<FilterState>({
    bedrooms: [1, 2, 3, 4],
    floorRange: [1, 2],
    areaRange: [80, 110],
    status: ['available', 'reserved', 'sold']
  });

  const [bedroomOptions, setBedroomOptions] = useState<number[]>([]);
  const [floorRange, setFloorRange] = useState<[number, number]>([1, 2]);
  const [areaRange, setAreaRange] = useState<[number, number]>([80, 110]);

  useEffect(() => {
    if (apartmentData.length > 0) {
      const bedrooms = [...new Set(apartmentData.map(apt => apt.bedrooms))].sort();
      const floors = apartmentData.map(apt => apt.floor);
      const areas = apartmentData.map(apt => apt.area);

      setBedroomOptions(bedrooms);
      setFloorRange([Math.min(...floors), Math.max(...floors)]);
      setAreaRange([Math.min(...areas), Math.max(...areas)]);

      setFilters(prev => ({
        ...prev,
        bedrooms: bedrooms,
        floorRange: [Math.min(...floors), Math.max(...floors)],
        areaRange: [Math.min(...areas), Math.max(...areas)]
      }));
    }
  }, [apartmentData]);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const toggleBedroom = (bedroom: number) => {
    setFilters(prev => ({
      ...prev,
      bedrooms: prev.bedrooms.includes(bedroom)
        ? prev.bedrooms.filter(b => b !== bedroom)
        : [...prev.bedrooms, bedroom]
    }));
  };

  const toggleStatus = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Bedrooms Filter */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Home className="w-4 h-4 text-cyan-400" />
          Спални соби
        </h3>
        <div className="flex flex-wrap gap-2">
          {bedroomOptions.map(bedroom => (
            <button
              key={bedroom}
              onClick={() => toggleBedroom(bedroom)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                filters.bedrooms.includes(bedroom)
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                  : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
              }`}
            >
              {bedroom}
            </button>
          ))}
        </div>
      </div>

      {/* Floor Range */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          Катови
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-white/70">
            <span>Кат: {filters.floorRange[0]} - {filters.floorRange[1]}</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min={floorRange[0]}
              max={floorRange[1]}
              value={filters.floorRange[0]}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                floorRange: [parseInt(e.target.value), prev.floorRange[1]]
              }))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
            <input
              type="range"
              min={floorRange[0]}
              max={floorRange[1]}
              value={filters.floorRange[1]}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                floorRange: [prev.floorRange[0], parseInt(e.target.value)]
              }))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider absolute top-0"
            />
          </div>
        </div>
      </div>

      {/* Area Range */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          Квадратура
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-white/70">
            <span>Површина: {filters.areaRange[0]} - {filters.areaRange[1]} m²</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min={areaRange[0]}
              max={areaRange[1]}
              value={filters.areaRange[0]}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                areaRange: [parseInt(e.target.value), prev.areaRange[1]]
              }))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
            <input
              type="range"
              min={areaRange[0]}
              max={areaRange[1]}
              value={filters.areaRange[1]}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                areaRange: [prev.areaRange[0], parseInt(e.target.value)]
              }))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider absolute top-0"
            />
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          Статус
        </h3>
        <div className="space-y-3">
          {[
            { key: 'available', label: 'Слободен', color: 'green' },
            { key: 'reserved', label: 'Резервиран', color: 'cyan' },
            { key: 'sold', label: 'Продаден', color: 'red' }
          ].map(status => (
            <label key={status.key} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.status.includes(status.key)}
                onChange={() => toggleStatus(status.key)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                filters.status.includes(status.key)
                  ? `bg-${status.color}-500/30 border-${status.color}-500`
                  : 'border-white/30 group-hover:border-white/50'
              }`}>
                {filters.status.includes(status.key) && (
                  <div className={`w-2 h-2 rounded-full bg-${status.color}-400`} />
                )}
              </div>
              <span className="text-white/80 group-hover:text-white transition-colors">
                {status.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
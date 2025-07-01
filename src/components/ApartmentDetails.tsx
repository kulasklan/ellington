import React from 'react';
import { Building2, Users, Maximize, MapPin, Euro, X, ExternalLink } from 'lucide-react';

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

interface ApartmentDetailsProps {
  apartment: ApartmentData | null;
  onClose: () => void;
}

const ApartmentDetails: React.FC<ApartmentDetailsProps> = ({ apartment, onClose }) => {
  if (!apartment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'reserved':
        return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case 'sold':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'reserved':
        return 'Reserved';
      case 'sold':
        return 'Sold';
      default:
        return 'Unknown';
    }
  };

  // ✅ CRITICAL DEBUG: Log apartment data to see what we're working with
  console.log('🔍 REACT MOBILE DEBUG - Apartment data:', {
    id: apartment.id,
    showAlbum: apartment.showAlbum,
    showView: apartment.showView,
    albumLink: apartment.albumLink,
    viewLink: apartment.viewLink,
    showType: apartment.showType,
    showBedrooms: apartment.showBedrooms,
    showArea: apartment.showArea,
    showTerrace: apartment.showTerrace,
    showFloor: apartment.showFloor,
    showPrice: apartment.showPrice
  });

  return (
    <div className="w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-cyan-400" />
          {apartment.id}
        </h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white/70 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status Badge */}
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mb-6 ${getStatusColor(apartment.status)}`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${apartment.status === 'available' ? 'bg-green-400' : apartment.status === 'reserved' ? 'bg-cyan-400' : 'bg-red-400'}`} />
        {getStatusText(apartment.status)}
      </div>

      {/* Details Grid - FIXED: Show fields based on checkbox states */}
      <div className="space-y-3">
        {/* FIXED: Only show Type if checkbox is checked */}
        {apartment.showType && (
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-white/70 flex items-center gap-2 text-sm font-medium">
              <Users className="w-4 h-4" />
              Type
            </span>
            <span className="text-white font-semibold text-sm">{apartment.type}</span>
          </div>
        )}

        {/* FIXED: Only show Bedrooms if checkbox is checked */}
        {apartment.showBedrooms && (
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-white/70 text-sm font-medium">Bedrooms</span>
            <span className="text-white font-semibold text-sm">{apartment.bedrooms}</span>
          </div>
        )}

        {/* FIXED: Only show Floor if checkbox is checked */}
        {apartment.showFloor && (
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-white/70 flex items-center gap-2 text-sm font-medium">
              <MapPin className="w-4 h-4" />
              Floor
            </span>
            <span className="text-white font-semibold text-sm">{apartment.floor}</span>
          </div>
        )}

        {/* FIXED: Only show Net Area if checkbox is checked */}
        {apartment.showArea && (
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-white/70 flex items-center gap-2 text-sm font-medium">
              <Maximize className="w-4 h-4" />
              Area
            </span>
            <span className="text-white font-semibold text-sm">{apartment.area} m²</span>
          </div>
        )}

        {/* FIXED: Only show Terrace if checkbox is checked */}
        {apartment.showTerrace && (
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-white/70 text-sm font-medium">Terrace</span>
            <span className="text-white font-semibold text-sm">{apartment.terrace} m²</span>
          </div>
        )}

        {/* FIXED: Only show price if showPrice is true */}
        {apartment.showPrice && (
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-white/70 flex items-center gap-2 text-sm font-medium">
              <Euro className="w-4 h-4" />
              Price
            </span>
            <span className="text-white font-semibold text-sm">€{apartment.price.toLocaleString()}</span>
          </div>
        )}

        {/* ✅ CRITICAL FIX: SHOW ALBUM LINK - EXACTLY LIKE VANILLA JS VERSION */}
        {apartment.showAlbum && (
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-white/70 text-sm font-medium">Show album</span>
            <span className="text-white font-semibold text-sm">
              {apartment.albumLink && apartment.albumLink.trim() !== '' ? (
                <a
                  href={apartment.albumLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-cyan-300 transition-colors underline decoration-2 underline-offset-2 hover:decoration-cyan-300 font-bold"
                  onClick={() => console.log('🔗 REACT MOBILE Album link clicked:', apartment.albumLink)}
                >
                  Link
                </a>
              ) : (
                <span className="text-white/40 cursor-default">Link</span>
              )}
            </span>
          </div>
        )}

        {/* ✅ CRITICAL FIX: SHOW VIEW LINK - EXACTLY LIKE VANILLA JS VERSION */}
        {apartment.showView && (
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-white/70 text-sm font-medium">Show view</span>
            <span className="text-white font-semibold text-sm">
              {apartment.viewLink && apartment.viewLink.trim() !== '' ? (
                <a
                  href={apartment.viewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-purple-300 transition-colors underline decoration-2 underline-offset-2 hover:decoration-purple-300 font-bold"
                  onClick={() => console.log('🔗 REACT MOBILE View link clicked:', apartment.viewLink)}
                >
                  Link
                </a>
              ) : (
                <span className="text-white/40 cursor-default">Link</span>
              )}
            </span>
          </div>
        )}

        {/* ✅ CRITICAL DEBUG: FORCE SHOW ALBUM AND VIEW FOR TESTING */}
        {!apartment.showAlbum && (
          <div className="flex items-center justify-between py-2 border-b border-white/10 bg-red-500/10">
            <span className="text-red-300 text-sm font-medium">DEBUG: Show album</span>
            <span className="text-red-300 text-sm">FALSE (Hidden)</span>
          </div>
        )}

        {!apartment.showView && (
          <div className="flex items-center justify-between py-2 border-b border-white/10 bg-red-500/10">
            <span className="text-red-300 text-sm font-medium">DEBUG: Show view</span>
            <span className="text-red-300 text-sm">FALSE (Hidden)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApartmentDetails;
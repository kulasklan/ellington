import { useState, useEffect } from 'react';

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
  showType?: boolean;
  showBedrooms?: boolean;
  showArea?: boolean;
  showTerrace?: boolean;
  showFloor?: boolean;
  noData?: boolean;
}

const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1L93Lm227wzywjX0GCeDFBMf0-l13nzyqigizBUPCqCo/export?format=csv&gid=0';

export const useGoogleSheets = () => {
  const [data, setData] = useState<ApartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSampleData = (): ApartmentData[] => {
    console.log('🔄 REACT Loading sample data with working album/view links');
    
    return [
      {
        id: 'AP-01-KAT1',
        type: '3+1',
        bedrooms: 3,
        floor: 1,
        area: 105.4,
        terrace: 10.1,
        price: 215000,
        status: 'available',
        showAlbum: true,
        showView: true,
        showPrice: true,
        showType: true,
        showBedrooms: false,
        showArea: true,
        showTerrace: false,
        showFloor: true,
        albumLink: 'https://photos.google.com/album1',
        viewLink: 'https://photos.google.com/view1'
      },
      {
        id: 'AP-02-KAT1',
        type: '2+1',
        bedrooms: 2,
        floor: 1,
        area: 81.9,
        terrace: 8.7,
        price: 189000,
        status: 'reserved',
        showAlbum: true,
        showView: true,
        showPrice: true,
        showType: true,
        showBedrooms: false,
        showArea: true,
        showTerrace: false,
        showFloor: true,
        albumLink: 'https://photos.google.com/album2',
        viewLink: 'https://photos.google.com/view2'
      },
      {
        id: 'AP-03-KAT2',
        type: '3+1',
        bedrooms: 3,
        floor: 2,
        area: 105.4,
        terrace: 10.1,
        price: 205000,
        status: 'available',
        showAlbum: true,
        showView: true,
        showPrice: false,
        showType: true,
        showBedrooms: false,
        showArea: true,
        showTerrace: false,
        showFloor: true,
        albumLink: 'https://photos.google.com/album3',
        viewLink: 'https://photos.google.com/view3'
      },
      {
        id: 'AP-04-KAT2',
        type: '2+1',
        bedrooms: 2,
        floor: 2,
        area: 81.9,
        terrace: 8.7,
        price: 195000,
        status: 'sold',
        showAlbum: true,
        showView: true,
        showPrice: true,
        showType: true,
        showBedrooms: false,
        showArea: true,
        showTerrace: false,
        showFloor: true,
        albumLink: 'https://photos.google.com/album4',
        viewLink: 'https://photos.google.com/view4'
      }
    ];
  };

  const parseCSV = (csvText: string): ApartmentData[] => {
    try {
      const lines = csvText.split('\n').filter(line => line.trim());
      console.log(`📄 REACT Total lines in CSV: ${lines.length}`);
      
      if (lines.length < 6) {
        console.warn('⚠️ REACT CSV has less than 6 lines, using sample data');
        return [];
      }

      // ✅ CRITICAL FIX: Parse checkbox row (row 5, index 4) CORRECTLY
      console.log('🔍 REACT Raw Row 5 (checkboxes):', lines[4]);
      const checkboxRow = lines[4];
      const checkboxValues = checkboxRow.split(',').map(v => v.trim().replace(/"/g, ''));
      
      console.log('📋 REACT Checkbox values:', checkboxValues);
      
      // ✅ CRITICAL FIX: Robust checkbox parsing with detailed logging
      const parseCheckbox = (value: string, columnName: string): boolean => {
        if (!value) {
          console.log(`🔍 REACT ${columnName}: Empty value -> false`);
          return false;
        }
        const v = value.toLowerCase().trim();
        const isChecked = v === 'true' || v === '✓' || v === 'да' || v === 'yes' || v === '1' || v === 'on' || v === 'checked';
        console.log(`🔍 REACT ${columnName}: "${value}" -> ${isChecked}`);
        return isChecked;
      };

      // ✅ CRITICAL FIX: Map exact columns based on Google Sheets structure
      const showType = parseCheckbox(checkboxValues[2] || '', 'Column C (Type)');
      const showBedrooms = parseCheckbox(checkboxValues[3] || '', 'Column D (Bedrooms)');
      const showArea = parseCheckbox(checkboxValues[4] || '', 'Column E (Area)');
      const showTerrace = parseCheckbox(checkboxValues[5] || '', 'Column F (Terrace)');
      const showFloor = parseCheckbox(checkboxValues[6] || '', 'Column G (Floor)');
      const showAlbumColumn = parseCheckbox(checkboxValues[7] || '', 'Column H (Show Album)');
      const showViewColumn = parseCheckbox(checkboxValues[8] || '', 'Column I (Show View)');
      const showPriceColumn = parseCheckbox(checkboxValues[10] || '', 'Column K (Price)');

      console.log('✅ REACT FINAL CHECKBOX STATES:', {
        showType,
        showBedrooms,
        showArea,
        showTerrace,
        showFloor,
        showAlbumColumn,
        showViewColumn,
        showPriceColumn
      });

      // Find the header row
      let headerRowIndex = -1;
      for (let i = 0; i < Math.min(10, lines.length); i++) {
        const line = lines[i].toLowerCase();
        if (line.includes('апартман') || line.includes('apartment') || line.includes('description')) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        console.warn('⚠️ REACT Could not find header row, using sample data');
        return [];
      }

      console.log(`✅ REACT Found header row at index: ${headerRowIndex}`);
      
      // ✅ CRITICAL FIX: Find album and view link columns dynamically
      const headers = lines[headerRowIndex].split(',').map(h => h.trim().replace(/"/g, ''));
      console.log('📋 REACT Headers found:', headers);
      
      let albumLinkColumnIndex = -1;
      let viewLinkColumnIndex = -1;
      
      headers.forEach((header, index) => {
        const lowerHeader = header.toLowerCase();
        console.log(`📋 REACT Header[${index}]: "${header}"`);
        
        // Look for album link column
        if ((lowerHeader.includes('линк') || lowerHeader.includes('link')) && 
            (lowerHeader.includes('албум') || lowerHeader.includes('album'))) {
          albumLinkColumnIndex = index;
          console.log(`🔗 REACT Found album link column at index ${index}: "${header}"`);
        }
        
        // Look for view link column  
        if ((lowerHeader.includes('линк') || lowerHeader.includes('link')) && 
            lowerHeader.includes('поглед')) {
          viewLinkColumnIndex = index;
          console.log(`🔗 REACT Found view link column at index ${index}: "${header}"`);
        }
      });

      const apartments: ApartmentData[] = [];

      // Parse data starting from the row after headers
      for (let i = headerRowIndex + 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        
        // Skip empty rows or rows with insufficient data
        if (values.length < 15 || !values[1] || values[1].trim() === '') {
          continue;
        }

        try {
          // ✅ CRITICAL FIX: Get album and view links from correct columns
          const albumLink = albumLinkColumnIndex >= 0 ? (values[albumLinkColumnIndex] || '') : '';
          const viewLink = viewLinkColumnIndex >= 0 ? (values[viewLinkColumnIndex] || '') : '';

          console.log(`🔗 REACT Apartment ${values[1]} links:`, {
            albumLink: albumLink ? `FOUND: ${albumLink.substring(0, 50)}...` : 'EMPTY',
            viewLink: viewLink ? `FOUND: ${viewLink.substring(0, 50)}...` : 'EMPTY'
          });

          const apartment: ApartmentData = {
            id: values[1] || `AP-${i}`,
            type: values[2] || '2+1',
            bedrooms: parseInt(values[3]) || 2,
            area: parseFloat(values[4]) || 85,
            terrace: parseFloat(values[5]) || 8,
            floor: parseInt(values[6]) || 1,
            
            // ✅ CRITICAL FIX: Use checkbox states from row 5
            showType,
            showBedrooms,
            showArea,
            showTerrace,
            showFloor,
            showAlbum: showAlbumColumn,
            showView: showViewColumn,
            showPrice: showPriceColumn,
            
            price: parseInt(values[9]) || 180000,
            status: parseStatus(values[11]),
            albumLink,
            viewLink
          };
          
          apartments.push(apartment);
          console.log(`✅ REACT Parsed apartment: ${apartment.id}`, {
            showAlbum: apartment.showAlbum,
            showView: apartment.showView,
            albumLink: apartment.albumLink ? 'HAS LINK' : 'NO LINK',
            viewLink: apartment.viewLink ? 'HAS LINK' : 'NO LINK'
          });
        } catch (err) {
          console.warn(`❌ REACT Error parsing row ${i}:`, err, values);
        }
      }

      console.log(`🎉 REACT Successfully parsed ${apartments.length} apartments from Google Sheets`);
      return apartments;
    } catch (err) {
      console.error('❌ REACT Error in parseCSV:', err);
      return [];
    }
  };

  const parseStatus = (statusValue: string): 'available' | 'reserved' | 'sold' => {
    if (!statusValue) return 'available';
    
    const status = statusValue.toLowerCase().trim();
    
    if (status.includes('слободен') || status.includes('available') || status === '1') {
      return 'available';
    } else if (status.includes('резервиран') || status.includes('reserved') || status === '2') {
      return 'reserved';
    } else if (status.includes('продаден') || status.includes('sold') || status === '3') {
      return 'sold';
    }
    
    return 'available';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 REACT Fetching data from Google Sheets...');
        const response = await fetch(GOOGLE_SHEETS_URL);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const csvText = await response.text();
        console.log(`📄 REACT CSV data received, length: ${csvText.length} characters`);
        
        const parsedData = parseCSV(csvText);
        
        if (parsedData.length === 0) {
          console.warn('⚠️ REACT No data found in Google Sheets, using sample data');
          setError('No data found in Google Sheets, using sample data');
          setData(loadSampleData());
        } else {
          console.log(`✅ REACT Successfully loaded ${parsedData.length} apartments from Google Sheets`);
          setData(parsedData);
        }
      } catch (err) {
        console.error('❌ REACT Error fetching Google Sheets data:', err);
        setError('Failed to load data from Google Sheets, using sample data');
        setData(loadSampleData());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
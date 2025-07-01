// 🚀 COMPLETE APARTMENT VISUALIZATION SYSTEM - ALL ISSUES FIXED + ANALYTICS
// Global state management
let apartmentData = [];
let currentBackground = 1; // 1 = interactive, 2 = demo
let selectedApartment = null;
let currentFilters = {
    bedrooms: [],
    floorRange: [1, 24],
    areaRange: [80, 160],
    status: ['free', 'reserved', 'sold']
};

// 🔗 YOUR PUBLISHED CSV URL
const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQwYSSUeBBko88Bk_8HM2mOsNkrOcfJYKKAx5IqpoiQ8l8gBRAG_8I38mYRKvJRY5cWpctE1GW1_xrb/pub?gid=0&single=true&output=csv';

// 🎯 MASTER CSV PARSER - FIXED FOR YOUR EXACT STRUCTURE
async function loadGoogleSheetsData() {
    try {
        console.log('🔄 Loading data from Google Sheets CSV...');
        console.log('🔗 CSV URL:', GOOGLE_SHEETS_CSV_URL);
        
        const response = await fetch(GOOGLE_SHEETS_CSV_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const csvText = await response.text();
        console.log(`📄 CSV data received, length: ${csvText.length} characters`);
        console.log('📋 First 500 characters:', csvText.substring(0, 500));
        
        const parsedData = parseCSVForYourStructure(csvText);
        
        if (parsedData.length === 0) {
            console.warn('⚠️ No data found in Google Sheets CSV, using sample data');
            return loadSampleData();
        } else {
            console.log(`✅ Successfully loaded ${parsedData.length} apartments from Google Sheets CSV`);
            return parsedData;
        }
    } catch (err) {
        console.error('❌ Error fetching Google Sheets CSV data:', err);
        console.log('🔄 Falling back to sample data');
        return loadSampleData();
    }
}

// 🎯 PARSER FOR YOUR EXACT STRUCTURE
function parseCSVForYourStructure(csvText) {
    try {
        const lines = csvText.split('\n').filter(line => line.trim());
        console.log(`📄 Total lines in CSV: ${lines.length}`);
        
        if (lines.length < 7) {
            console.warn('⚠️ CSV has less than 7 lines, insufficient data');
            return [];
        }

        // STEP 1: Find 'Availability' column in row 1 (Column M)
        console.log('🔍 STEP 1: Finding Availability column in row 1...');
        const row1 = parseCSVLine(lines[0]);
        console.log('📋 Row 1:', row1);
        
        let availabilityColumnIndex = -1;
        for (let i = 0; i < row1.length; i++) {
            if (row1[i].toLowerCase().includes('availability')) {
                availabilityColumnIndex = i;
                console.log(`✅ Found 'Availability' in column ${i} (${String.fromCharCode(65 + i)})`);
                break;
            }
        }
        
        if (availabilityColumnIndex === -1) {
            console.warn('⚠️ Could not find Availability column, using default status mapping');
        }

        // STEP 2: Read status definitions from Availability column
        console.log('🔍 STEP 2: Reading status definitions...');
        const statusDefinitions = {
            '1': 'free',
            '2': 'reserved', 
            '3': 'sold'
        };
        
        if (availabilityColumnIndex >= 0) {
            const statusValuesColumnIndex = availabilityColumnIndex + 1;
            for (let i = 1; i < Math.min(6, lines.length); i++) {
                const values = parseCSVLine(lines[i]);
                const statusName = values[availabilityColumnIndex] || '';
                const statusValue = values[statusValuesColumnIndex] || '';
                
                if (statusName && statusValue) {
                    console.log(`📋 Status mapping: "${statusName}" = "${statusValue}"`);
                    
                    if (statusName.toLowerCase().includes('free')) {
                        statusDefinitions['1'] = 'free';
                    } else if (statusName.toLowerCase().includes('reserved')) {
                        statusDefinitions['2'] = 'reserved';
                    } else if (statusName.toLowerCase().includes('sold')) {
                        statusDefinitions['3'] = 'sold';
                    }
                }
            }
        }
        
        console.log('✅ Status definitions:', statusDefinitions);

        // STEP 3: Use Row 6 as headers (your structure)
        console.log('🔍 STEP 3: Using Row 6 as headers...');
        const row6 = parseCSVLine(lines[5]);
        console.log('📋 Row 6 (headers):', row6);
        
        // STEP 4: Read checkbox states from row 5
        console.log('🔍 STEP 4: Reading checkbox states from row 5...');
        const row5 = parseCSVLine(lines[4]);
        console.log('📋 Row 5 (checkboxes):', row5);
        
        const columnVisibility = {};
        row6.forEach((header, index) => {
            if (header && header.trim() !== '') {
                const checkboxValue = row5[index] || '';
                const isVisible = parseCheckboxEnhanced(checkboxValue, header);
                columnVisibility[header] = isVisible;
                console.log(`🔍 Column "${header}": ${isVisible ? '✓' : '✗'}`);
            }
        });

        // STEP 5: Parse apartment data starting from row 7
        console.log('🔍 STEP 5: Parsing apartment data from row 7 onwards...');
        const apartments = [];
        
        for (let i = 6; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            
            // Skip empty rows
            if (values.length < row6.length || !values[1]) { // Column B (Apartment Nr)
                continue;
            }

            try {
                const apartment = {
                    id: values[1] || `AP-${i-5}`, // Column B = Apartment Nr
                    columnVisibility: { ...columnVisibility }
                };
                
                // Extract data for each column
                row6.forEach((header, index) => {
                    if (!header || header.trim() === '') return;
                    
                    const value = values[index] || '';
                    
                    if (header.toLowerCase().includes('status')) {
                        // Map status value using definitions
                        const statusValue = value.trim();
                        apartment.status = statusDefinitions[statusValue] || 'free';
                        console.log(`📋 Apartment ${apartment.id}: Status ${statusValue} -> ${apartment.status}`);
                    } else {
                        // Store all other data with original column names
                        apartment[header] = value;
                        
                        // Special handling for numeric fields for filtering
                        if (header.toLowerCase().includes('bedroom')) {
                            apartment.bedrooms = parseInt(value) || 2;
                        }
                        if (header.toLowerCase().includes('floor')) {
                            apartment.floor = parseInt(value) || 1;
                        }
                        if (header.toLowerCase().includes('area') || header.toLowerCase().includes('net')) {
                            apartment.area = parseFloat(value) || 85;
                        }
                        if (header.toLowerCase().includes('bathroom')) {
                            apartment.bathrooms = parseInt(value) || 1;
                        }
                    }
                });
                
                apartments.push(apartment);
                console.log(`✅ Parsed apartment: ${apartment.id}`, apartment);
            } catch (err) {
                console.warn(`❌ Error parsing row ${i + 1}:`, err, values);
            }
        }

        console.log(`🎉 Successfully parsed ${apartments.length} apartments with your structure`);
        return apartments;
    } catch (err) {
        console.error('❌ Error in parseCSVForYourStructure:', err);
        return [];
    }
}

// CSV Line Parser - Handles quoted values properly
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// ENHANCED Checkbox Parser - Handles both checkboxes and TRUE/FALSE
function parseCheckboxEnhanced(value, columnName) {
    if (!value) {
        console.log(`🔍 ${columnName}: Empty value -> false`);
        return false;
    }
    
    const v = value.toLowerCase().trim();
    
    // Handle TRUE/FALSE text values
    if (v === 'true' || v === 'false') {
        const isChecked = v === 'true';
        console.log(`🔍 ${columnName}: "${value}" (TRUE/FALSE) -> ${isChecked}`);
        return isChecked;
    }
    
    // Handle checkbox symbols and other formats
    const isChecked = v === '✓' || v === 'да' || v === 'yes' || v === '1' || v === 'on' || v === 'checked';
    console.log(`🔍 ${columnName}: "${value}" (checkbox) -> ${isChecked}`);
    return isChecked;
}

// Sample Data Fallback
function loadSampleData() {
    console.log('🔄 Loading sample data with working album/view links');
    
    return [
        {
            id: 'AP-1A',
            'Type': '3+1',
            'Bedrooms': 3,
            'Bathrooms': 1,
            'Net area m2': 105.4,
            'Balcony m2': 10.1,
            'Floor': 1,
            'Show album': 'Линк',
            'Show view': 'Линк',
            'Price EUR': 370000,
            'Price On/Off': '☑',
            'Status': '1',
            'Link albums': 'https://aarensara.com/album1',
            status: 'free',
            bedrooms: 3,
            floor: 1,
            area: 105.4,
            bathrooms: 1,
            columnVisibility: {
                'Type': true,
                'Bedrooms': true,
                'Bathrooms': true,
                'Net area m2': true,
                'Balcony m2': false,
                'Floor': true,
                'Show album': true,
                'Show view': true,
                'Price EUR': true,
                'Price On/Off': false,
                'Link albums': true
            }
        },
        {
            id: 'AP-2A',
            'Type': '2+1',
            'Bedrooms': 3,
            'Bathrooms': 2,
            'Net area m2': 81.9,
            'Balcony m2': 8.7,
            'Floor': 2,
            'Show album': 'Линк',
            'Show view': 'Линк',
            'Price EUR': 254000,
            'Price On/Off': '☑',
            'Status': '2',
            'Link albums': 'https://aarensara.com/album2',
            status: 'reserved',
            bedrooms: 3,
            floor: 2,
            area: 81.9,
            bathrooms: 2,
            columnVisibility: {
                'Type': true,
                'Bedrooms': true,
                'Bathrooms': true,
                'Net area m2': true,
                'Balcony m2': false,
                'Floor': true,
                'Show album': true,
                'Show view': true,
                'Price EUR': true,
                'Price On/Off': false,
                'Link albums': true
            }
        },
        {
            id: 'AP-3A',
            'Type': '3+1',
            'Bedrooms': 3,
            'Bathrooms': 1,
            'Net area m2': 105.4,
            'Balcony m2': 10.1,
            'Floor': 3,
            'Show album': 'Линк',
            'Show view': 'Линк',
            'Price EUR': 205000,
            'Price On/Off': '☐',
            'Status': '1',
            'Link albums': 'https://aarensara.com/album3',
            status: 'free',
            bedrooms: 3,
            floor: 3,
            area: 105.4,
            bathrooms: 1,
            columnVisibility: {
                'Type': true,
                'Bedrooms': true,
                'Bathrooms': true,
                'Net area m2': true,
                'Balcony m2': false,
                'Floor': true,
                'Show album': true,
                'Show view': true,
                'Price EUR': false,
                'Price On/Off': false,
                'Link albums': true
            }
        },
        {
            id: 'AP-4A',
            'Type': '2+1',
            'Bedrooms': 2,
            'Bathrooms': 3,
            'Net area m2': 81.9,
            'Balcony m2': 8.7,
            'Floor': 4,
            'Show album': 'Линк',
            'Show view': 'Линк',
            'Price EUR': 195000,
            'Price On/Off': '☑',
            'Status': '3',
            'Link albums': 'https://aarensara.com/album4',
            status: 'sold',
            bedrooms: 2,
            floor: 4,
            area: 81.9,
            bathrooms: 3,
            columnVisibility: {
                'Type': true,
                'Bedrooms': true,
                'Bathrooms': true,
                'Net area m2': true,
                'Balcony m2': false,
                'Floor': true,
                'Show album': true,
                'Show view': true,
                'Price EUR': true,
                'Price On/Off': false,
                'Link albums': true
            }
        }
    ];
}

// 🎯 LOAD DATA FUNCTION
async function loadApartmentData() {
    console.log('🔄 Loading apartment data...');
    
    apartmentData = await loadGoogleSheetsData();
    
    // Update filters when apartment data loads
    if (apartmentData.length > 0) {
        const floors = apartmentData.map(apt => apt.floor || 1);
        const areas = apartmentData.map(apt => apt.area || 85);
        const bedrooms = apartmentData.map(apt => apt.bedrooms || 2);
        const minFloor = Math.min(...floors);
        const maxFloor = Math.max(...floors);
        const minArea = Math.min(...areas);
        const maxArea = Math.max(...areas);
        
        currentFilters.floorRange = [minFloor, maxFloor];
        currentFilters.areaRange = [minArea, maxArea];
        currentFilters.bedrooms = [...new Set(bedrooms)].sort();
    }
    
    initializeBedroomFilters();
    updateFilters();
    updateShapeVisibility();
    
    console.log('✅ Apartment data loaded:', apartmentData.length, 'apartments');
}

// 🎯 DYNAMIC BEDROOM FILTER INITIALIZATION
function initializeBedroomFilters() {
    const bedroomCounts = [...new Set(apartmentData.map(apt => apt.bedrooms || 2))].sort((a, b) => a - b);
    console.log('🛏️ Available bedroom counts:', bedroomCounts);
    
    const bedroomFilters = document.getElementById('bedroomFilters');
    if (bedroomFilters && bedroomCounts.length > 0) {
        bedroomFilters.innerHTML = '';
        
        bedroomCounts.forEach(count => {
            const button = document.createElement('button');
            button.className = 'bedroom-btn active';
            button.setAttribute('data-bedrooms', count);
            button.textContent = count;
            button.onclick = () => toggleBedroomFilter(count);
            bedroomFilters.appendChild(button);
        });
        
        currentFilters.bedrooms = [...bedroomCounts];
        console.log('✅ Bedroom filters initialized:', currentFilters.bedrooms);
    }
}

// 🎯 BACKGROUND SWITCHING WITH FADE EFFECT
function switchBackground() {
    const buildingImage = document.getElementById('buildingImage');
    const backgroundIndicator = document.getElementById('backgroundIndicator');
    const arrowIcon = document.getElementById('arrowIcon');
    const demoModeIndicator = document.getElementById('demoModeIndicator');
    const bottomControls = document.getElementById('bottomControls');
    const overlaySvg = document.getElementById('overlaySvg');
    
    console.log(`🖼️ Switching to background ${currentBackground === 1 ? 2 : 1}`);
    
    // ✅ FIXED: Add fade out effect
    buildingImage.style.opacity = '0.3';
    buildingImage.style.transform = 'scale(1.02)';
    
    setTimeout(() => {
        currentBackground = currentBackground === 1 ? 2 : 1;
        
        if (currentBackground === 2) {
            buildingImage.src = 'src/assets/background2.webp';
            backgroundIndicator.textContent = 'Demo';
            arrowIcon.textContent = '←';
            demoModeIndicator.style.display = 'block';
            bottomControls.style.display = 'none';
            overlaySvg.style.display = 'none';
            closeDetailsPanel();
            console.log('🎬 Demo mode activated');
        } else {
            buildingImage.src = 'src/assets/background.webp';
            backgroundIndicator.textContent = 'Interactive';
            arrowIcon.textContent = '→';
            demoModeIndicator.style.display = 'none';
            bottomControls.style.display = 'block';
            overlaySvg.style.display = 'block';
            console.log('🖱️ Interactive mode activated');
        }
        
        // ✅ FIXED: Add fade in effect
        setTimeout(() => {
            buildingImage.style.opacity = '0.85';
            buildingImage.style.transform = 'scale(1)';
        }, 100);
    }, 400); // Wait for fade out to complete
}

// 🎯 APARTMENT SHAPE INTERACTION
function setupApartmentShapeListeners() {
    console.log('🔧 Setting up apartment shape listeners...');
    
    const apartmentShapes = document.querySelectorAll('.apartment-shape');
    console.log(`🔍 Found ${apartmentShapes.length} apartment shapes`);
    
    apartmentShapes.forEach((shape, index) => {
        const apartmentId = shape.getAttribute('data-apartment');
        console.log(`🏠 Setting up listener for apartment ${apartmentId} (${index + 1}/${apartmentShapes.length})`);
        
        shape.removeEventListener('click', handleShapeClick);
        shape.addEventListener('click', handleShapeClick);
        
        shape.addEventListener('mouseenter', function() {
            if (currentBackground === 1) {
                console.log(`🖱️ Hovering over apartment ${apartmentId}`);
            }
        });
    });
    
    console.log('✅ Apartment shape listeners setup complete');
}

function handleShapeClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('🖱️ Shape clicked!', event.target);
    
    if (currentBackground !== 1) {
        console.log('🚫 Apartment interaction disabled in demo mode');
        return;
    }
    
    const apartmentId = this.getAttribute('data-apartment');
    console.log(`🏠 Apartment shape clicked: ${apartmentId}`);
    
    if (apartmentId) {
        selectApartment(apartmentId);
    } else {
        console.warn('❌ No apartment ID found on clicked shape');
    }
}

function selectApartment(apartmentId) {
    console.log(`🏠 Selecting apartment: ${apartmentId}`);
    
    const apartment = apartmentData.find(apt => apt.id === apartmentId);
    
    if (!apartment) {
        console.warn(`❌ Apartment not found: ${apartmentId}`);
        const basicApartment = {
            id: apartmentId,
            status: 'free',
            noData: true
        };
        selectedApartment = basicApartment;
    } else {
        selectedApartment = apartment;
    }
    
    updateShapeSelection();
    showApartmentDetails(selectedApartment);
}

function updateShapeSelection() {
    const apartmentShapes = document.querySelectorAll('.apartment-shape');
    
    apartmentShapes.forEach(shape => {
        const apartmentId = shape.getAttribute('data-apartment');
        
        if (selectedApartment && apartmentId === selectedApartment.id) {
            shape.classList.add('selected');
            console.log(`✅ Selected apartment shape: ${apartmentId}`);
        } else {
            shape.classList.remove('selected');
        }
    });
}

// 🎯 DYNAMIC APARTMENT DETAILS PANEL - FIXED LINKS
function showApartmentDetails(apartment) {
    const detailsPanel = document.getElementById('detailsPanel');
    const panelHeader = document.getElementById('panelHeader');
    const panelContent = document.getElementById('panelContent');
    
    console.log('📋 Showing apartment details:', apartment);
    
    if (apartment.noData) {
        panelHeader.textContent = `${apartment.id} - No Data`;
        panelContent.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 3rem; margin-bottom: 10px; opacity: 0.5;">🏢</div>
                <h3 style="color: var(--text-secondary); margin-bottom: 10px;">No Data Available</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem;">
                    This apartment shape is present but no detailed information is available yet.
                </p>
            </div>
        `;
    } else {
        panelHeader.textContent = `${apartment.id}`;
        
        let detailsHTML = '';
        
        // ✅ FIXED: Check Price On/Off column to determine if price should be shown
        const priceOnOffValue = apartment['Price On/Off'] || '';
        const shouldShowPrice = priceOnOffValue === '☑' || priceOnOffValue.toLowerCase().includes('true') || priceOnOffValue === '1';
        
        // Dynamic field display based on checkbox visibility
        Object.keys(apartment).forEach(key => {
            // Skip internal fields
            if (key === 'id' || key === 'status' || key === 'columnVisibility' || key === 'noData' || 
                key === 'bedrooms' || key === 'floor' || key === 'area' || key === 'bathrooms') {
                return;
            }
            
            // ✅ FIXED: Skip Price On/Off column (internal use only)
            if (key.toLowerCase().includes('price') && key.toLowerCase().includes('on') && key.toLowerCase().includes('off')) {
                return;
            }
            
            // ✅ FIXED: Only show price if Price On/Off is checked
            if (key.toLowerCase().includes('price') && key.toLowerCase().includes('eur')) {
                if (!shouldShowPrice) {
                    return; // Skip price if Price On/Off is unchecked
                }
            }
            
            // Check if this field should be visible
            const isVisible = apartment.columnVisibility && apartment.columnVisibility[key];
            if (!isVisible) {
                return;
            }
            
            const value = apartment[key];
            if (!value || value.toString().trim() === '') {
                return;
            }
            
            // ✅ CRITICAL FIX: Special handling for link columns - SHOW CLICKABLE "Link" TEXT
            if (key.toLowerCase().includes('link') && key.toLowerCase().includes('album')) {
                detailsHTML += `
                    <div class="detail-item">
                        <span class="detail-label">Show albums</span>
                        <span class="detail-value">
                            <a href="${value}" target="_blank" rel="noopener noreferrer" class="apartment-link">Link</a>
                        </span>
                    </div>
                `;
            } else if (key.toLowerCase().includes('link') && key.toLowerCase().includes('view')) {
                detailsHTML += `
                    <div class="detail-item">
                        <span class="detail-label">Show views</span>
                        <span class="detail-value">
                            <a href="${value}" target="_blank" rel="noopener noreferrer" class="apartment-link">Link</a>
                        </span>
                    </div>
                `;
            } else {
                // Regular field display
                detailsHTML += `
                    <div class="detail-item">
                        <span class="detail-label">${key}</span>
                        <span class="detail-value">${value}</span>
                    </div>
                `;
            }
        });
        
        // ✅ FIXED: Status display with CORRECT colors
        const statusColors = {
            free: '#10b981',       // ✅ FIXED: Green for Free
            reserved: '#3b82f6',   // ✅ FIXED: Blue for Reserved  
            sold: '#ef4444'        // ✅ FIXED: Red for Sold
        };
        
        const statusLabels = {
            free: 'Free',
            reserved: 'Reserved',
            sold: 'Sold'
        };
        
        detailsHTML += `
            <div class="detail-item">
                <span class="detail-label">Status</span>
                <span class="detail-value" style="color: ${statusColors[apartment.status]}">${statusLabels[apartment.status]}</span>
            </div>
        `;
        
        panelContent.innerHTML = detailsHTML;
    }
    
    detailsPanel.classList.add('visible');
}

function closeDetailsPanel() {
    const detailsPanel = document.getElementById('detailsPanel');
    detailsPanel.classList.remove('visible');
    
    selectedApartment = null;
    updateShapeSelection();
}

// 🎯 FILTER FUNCTIONALITY - FIXED BEDROOM FILTER LOGIC
function toggleBedroomFilter(bedrooms) {
    console.log(`🛏️ Toggling bedroom filter: ${bedrooms}`);
    console.log('🔍 Current bedroom filters before toggle:', currentFilters.bedrooms);
    
    const index = currentFilters.bedrooms.indexOf(bedrooms);
    
    if (index > -1) {
        // Remove this bedroom count
        currentFilters.bedrooms.splice(index, 1);
        console.log(`➖ Removed ${bedrooms} bedrooms from filter`);
    } else {
        // Add this bedroom count
        currentFilters.bedrooms.push(bedrooms);
        console.log(`➕ Added ${bedrooms} bedrooms to filter`);
    }
    
    console.log('🔍 Updated bedroom filters after toggle:', currentFilters.bedrooms);
    
    updateFilters();
    updateShapeVisibility();
}

// Range slider handlers
function setupRangeSliders() {
    const floorMin = document.getElementById('floorMin');
    const floorMax = document.getElementById('floorMax');
    const areaMin = document.getElementById('areaMin');
    const areaMax = document.getElementById('areaMax');
    
    if (floorMin && floorMax) {
        floorMin.addEventListener('input', function() {
            const value = parseInt(this.value);
            currentFilters.floorRange[0] = value;
            if (value > currentFilters.floorRange[1]) {
                currentFilters.floorRange[1] = value;
                floorMax.value = value;
            }
            updateFilters();
            updateShapeVisibility();
        });
        
        floorMax.addEventListener('input', function() {
            const value = parseInt(this.value);
            currentFilters.floorRange[1] = value;
            if (value < currentFilters.floorRange[0]) {
                currentFilters.floorRange[0] = value;
                floorMin.value = value;
            }
            updateFilters();
            updateShapeVisibility();
        });
    }
    
    if (areaMin && areaMax) {
        areaMin.addEventListener('input', function() {
            const value = parseInt(this.value);
            currentFilters.areaRange[0] = value;
            if (value > currentFilters.areaRange[1]) {
                currentFilters.areaRange[1] = value;
                areaMax.value = value;
            }
            updateFilters();
            updateShapeVisibility();
        });
        
        areaMax.addEventListener('input', function() {
            const value = parseInt(this.value);
            currentFilters.areaRange[1] = value;
            if (value < currentFilters.areaRange[0]) {
                currentFilters.areaRange[0] = value;
                areaMin.value = value;
            }
            updateFilters();
            updateShapeVisibility();
        });
    }
}

function updateFilters() {
    const bedroomButtons = document.querySelectorAll('.bedroom-btn');
    bedroomButtons.forEach(btn => {
        const bedrooms = parseInt(btn.getAttribute('data-bedrooms'));
        if (currentFilters.bedrooms.includes(bedrooms)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    const floorRange = document.getElementById('floorRange');
    const areaRange = document.getElementById('areaRange');
    
    if (floorRange) {
        floorRange.textContent = `${currentFilters.floorRange[0]} - ${currentFilters.floorRange[1]}`;
    }
    
    if (areaRange) {
        areaRange.textContent = `${currentFilters.areaRange[0]} - ${currentFilters.areaRange[1]} m²`;
    }
}

// ✅ FIXED: SHAPE VISIBILITY LOGIC - PROPER FILTERING
function updateShapeVisibility() {
    const apartmentShapes = document.querySelectorAll('.apartment-shape');
    
    console.log(`🔍 Updating shape visibility with filters:`, currentFilters);
    
    apartmentShapes.forEach(shape => {
        const apartmentId = shape.getAttribute('data-apartment');
        const apartment = apartmentData.find(apt => apt.id === apartmentId);
        
        // Remove all status classes first
        shape.classList.remove('free', 'reserved', 'sold', 'hidden');
        
        if (!apartment) {
            // For shapes without data, use data attributes
            const bedrooms = parseInt(shape.getAttribute('data-bedrooms')) || 0;
            const floor = parseInt(shape.getAttribute('data-floor')) || 0;
            const area = parseInt(shape.getAttribute('data-area')) || 0;
            
            // ✅ FIXED: If no bedrooms are selected, hide all shapes
            const matchesBedrooms = currentFilters.bedrooms.length > 0 && currentFilters.bedrooms.includes(bedrooms);
            const matchesFloor = floor >= currentFilters.floorRange[0] && floor <= currentFilters.floorRange[1];
            const matchesArea = area >= currentFilters.areaRange[0] && area <= currentFilters.areaRange[1];
            
            const isVisible = matchesBedrooms && matchesFloor && matchesArea;
            
            if (isVisible) {
                shape.classList.remove('hidden');
            } else {
                shape.classList.add('hidden');
            }
            return;
        }
        
        // ✅ FIXED: If no bedrooms are selected, hide all shapes
        const matchesBedrooms = currentFilters.bedrooms.length > 0 && currentFilters.bedrooms.includes(apartment.bedrooms || 2);
        const matchesFloor = (apartment.floor || 1) >= currentFilters.floorRange[0] && (apartment.floor || 1) <= currentFilters.floorRange[1];
        const matchesArea = (apartment.area || 85) >= currentFilters.areaRange[0] && (apartment.area || 85) <= currentFilters.areaRange[1];
        const matchesStatus = currentFilters.status.includes(apartment.status);
        
        const isVisible = matchesBedrooms && matchesFloor && matchesArea && matchesStatus;
        
        if (isVisible) {
            shape.classList.add(apartment.status);
            console.log(`✅ Showing apartment ${apartment.id} with status ${apartment.status}`);
        } else {
            shape.classList.add('hidden');
            console.log(`❌ Hiding apartment ${apartment.id} - bedrooms: ${matchesBedrooms}, floor: ${matchesFloor}, area: ${matchesArea}, status: ${matchesStatus}`);
        }
    });
    
    console.log(`🔍 Shape visibility update complete`);
}

function resetFilters() {
    console.log('🔄 Resetting filters');
    
    const floors = apartmentData.map(apt => apt.floor || 1);
    const areas = apartmentData.map(apt => apt.area || 85);
    const bedrooms = apartmentData.map(apt => apt.bedrooms || 2);
    const minFloor = Math.min(...floors);
    const maxFloor = Math.max(...floors);
    const minArea = Math.min(...areas);
    const maxArea = Math.max(...areas);
    
    currentFilters = {
        bedrooms: [...new Set(bedrooms)].sort(),
        floorRange: [minFloor, maxFloor],
        areaRange: [minArea, maxArea],
        status: ['free', 'reserved', 'sold']
    };
    
    const floorMin = document.getElementById('floorMin');
    const floorMax = document.getElementById('floorMax');
    const areaMin = document.getElementById('areaMin');
    const areaMax = document.getElementById('areaMax');
    
    if (floorMin) floorMin.value = minFloor;
    if (floorMax) floorMax.value = maxFloor;
    if (areaMin) areaMin.value = minArea;
    if (areaMax) areaMax.value = maxArea;
    
    updateFilters();
    updateShapeVisibility();
}

// ✅ FIXED: CLEAR ALL BUTTON - PROPER TOGGLE LOGIC
function clearAllShapes() {
    console.log('🧹 Clear All button clicked');
    console.log('🔍 Current bedroom filters:', currentFilters.bedrooms);
    
    if (currentFilters.bedrooms.length === 0) {
        // If no bedrooms are selected, show all
        const bedrooms = apartmentData.map(apt => apt.bedrooms || 2);
        currentFilters.bedrooms = [...new Set(bedrooms)].sort();
        console.log('✅ Showing all bedrooms:', currentFilters.bedrooms);
    } else {
        // If some bedrooms are selected, hide all
        currentFilters.bedrooms = [];
        console.log('❌ Hiding all bedrooms');
    }
    
    updateFilters();
    updateShapeVisibility();
}

// 🎯 ANALYTICS DASHBOARD - COMPLETE WITH USER BEHAVIOR TRACKING
function showAnalyticsDashboard() {
    console.log('📊 showAnalyticsDashboard function called');
    
    const modal = document.getElementById('analyticsModal');
    const content = document.getElementById('analyticsContent');
    
    if (!modal) {
        console.error('❌ Analytics modal element not found!');
        alert('Analytics modal not found in DOM');
        return;
    }
    
    if (!content) {
        console.error('❌ Analytics content element not found!');
        alert('Analytics content element not found in DOM');
        return;
    }
    
    console.log('📊 Modal and content elements found, proceeding...');
    
    // Calculate session analytics
    const totalApartments = apartmentData.length;
    const freeCount = apartmentData.filter(apt => apt.status === 'free').length;
    const reservedCount = apartmentData.filter(apt => apt.status === 'reserved').length;
    const soldCount = apartmentData.filter(apt => apt.status === 'sold').length;
    
    // Get analytics data from the new analytics system if available
    let analyticsData = null;
    if (window.ellingtonAnalytics) {
        analyticsData = window.ellingtonAnalytics.getAnalyticsData();
        console.log('📊 Analytics data retrieved:', analyticsData);
    } else {
        console.log('📊 No analytics data available');
    }
    
    let analyticsHTML = `
        <!-- Session Overview -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; padding: 20px; text-align: center;">
                <h3 style="color: var(--accent-gold); margin-bottom: 10px;">Analytics Status</h3>
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-primary);">${window.ellingtonAnalytics ? '✅ Active' : '❌ Inactive'}</div>
            </div>
            <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; padding: 20px; text-align: center;">
                <h3 style="color: var(--accent-gold); margin-bottom: 10px;">Total Sessions</h3>
                <div style="font-size: 2rem; font-weight: bold; color: var(--text-primary);">${analyticsData ? analyticsData.totalSessions : 0}</div>
            </div>
            <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; padding: 20px; text-align: center;">
                <h3 style="color: var(--accent-gold); margin-bottom: 10px;">Interest Clicks</h3>
                <div style="font-size: 2rem; font-weight: bold; color: var(--text-primary);">${analyticsData ? analyticsData.interestClicks : 0}</div>
            </div>
            <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; padding: 20px; text-align: center;">
                <h3 style="color: var(--accent-gold); margin-bottom: 10px;">Device Type</h3>
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-primary);">${getDeviceType()}</div>
            </div>
        </div>
        
        <!-- Apartment Status Overview -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; padding: 20px; text-align: center;">
                <h3 style="color: var(--accent-gold); margin-bottom: 10px;">Total Apartments</h3>
                <div style="font-size: 2.5rem; font-weight: bold; color: var(--text-primary);">${totalApartments}</div>
            </div>
            <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; padding: 20px; text-align: center;">
                <h3 style="color: #10b981; margin-bottom: 10px;">Free</h3>
                <div style="font-size: 2.5rem; font-weight: bold; color: #10b981;">${freeCount}</div>
            </div>
            <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; padding: 20px; text-align: center;">
                <h3 style="color: #3b82f6; margin-bottom: 10px;">Reserved</h3>
                <div style="font-size: 2.5rem; font-weight: bold; color: #3b82f6;">${reservedCount}</div>
            </div>
            <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; padding: 20px; text-align: center;">
                <h3 style="color: #ef4444; margin-bottom: 10px;">Sold</h3>
                <div style="font-size: 2.5rem; font-weight: bold; color: #ef4444;">${soldCount}</div>
            </div>
        </div>
        
        <!-- User Behavior Analytics -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; padding: 20px;">
                <h3 style="color: var(--accent-gold); margin-bottom: 15px;">Most Clicked Apartments</h3>
                ${analyticsData && Object.keys(analyticsData.apartmentClicks).length > 0 ? 
                    Object.entries(analyticsData.apartmentClicks)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([aptId, clicks]) => `
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--glass-border);">
                                <span style="color: var(--text-primary);">${aptId}</span>
                                <span style="color: var(--accent-gold);">${clicks} clicks</span>
                            </div>
                        `).join('') : 
                    '<p style="color: var(--text-secondary);">No apartment clicks tracked yet</p>'
                }
            </div>
            
            <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; padding: 20px;">
                <h3 style="color: var(--accent-gold); margin-bottom: 15px;">Filter Usage</h3>
                ${analyticsData && Object.keys(analyticsData.filterUsage).length > 0 ? 
                    Object.entries(analyticsData.filterUsage)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([filterType, count]) => `
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--glass-border);">
                                <span style="color: var(--text-primary);">${filterType.replace('_', ' ')}</span>
                                <span style="color: var(--accent-gold);">${count} uses</span>
                            </div>
                        `).join('') : 
                    '<p style="color: var(--text-secondary);">No filter usage tracked yet</p>'
                }
            </div>
        </div>
        
        <!-- Technical Information -->
        <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; padding: 20px;">
            <h3 style="color: var(--accent-gold); margin-bottom: 15px;">System Information</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <p style="color: var(--text-primary); margin-bottom: 8px;">
                        <strong>Data Source:</strong> ${apartmentData.length > 4 ? 'Google Sheets (Live)' : 'Sample Data'}
                    </p>
                    <p style="color: var(--text-primary); margin-bottom: 8px;">
                        <strong>Apartments Loaded:</strong> ${apartmentData.length}
                    </p>
                    <p style="color: var(--text-primary); margin-bottom: 8px;">
                        <strong>Analytics Module:</strong> ${window.ellingtonAnalytics ? '✅ Loaded' : '❌ Not Loaded'}
                    </p>
                    <p style="color: var(--text-primary); margin-bottom: 8px;">
                        <strong>Data Storage:</strong> Browser localStorage
                    </p>
                </div>
                <div>
                    <p style="color: var(--text-primary); margin-bottom: 8px;">
                        <strong>Parser Version:</strong> Dynamic CSV v7.0
                    </p>
                    <p style="color: var(--text-primary); margin-bottom: 8px;">
                        <strong>Features:</strong> ✅ Analytics, ✅ Links, ✅ Filters
                    </p>
                    <p style="color: var(--text-primary); margin-bottom: 8px;">
                        <strong>Status Colors:</strong> ✅ Green/Blue/Red
                    </p>
                    <p style="color: var(--text-primary); margin-bottom: 8px;">
                        <strong>Screen Resolution:</strong> ${window.screen.width}x${window.screen.height}
                    </p>
                </div>
            </div>
        </div>
    `;
    
    console.log('📊 Setting modal content...');
    content.innerHTML = analyticsHTML;
    
    console.log('📊 Adding visible class to modal...');
    modal.classList.add('visible');
    
    // Force show with inline styles as backup
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    
    console.log('✅ Analytics dashboard should now be visible');
    console.log('📊 Modal classes:', modal.className);
    console.log('📊 Modal style display:', modal.style.display);
}

function closeAnalyticsDashboard() {
    console.log('📊 Closing analytics dashboard...');
    const modal = document.getElementById('analyticsModal');
    if (modal) {
        modal.classList.remove('visible');
        modal.style.display = 'none';
        console.log('✅ Analytics dashboard closed');
    }
}

// 🎯 UTILITY FUNCTIONS
function handleInterestClick() {
    console.log('📞 Interest button clicked');
    
    const subject = encodeURIComponent('Interested in Ellington Building Apartment');
    const body = encodeURIComponent('Hello,\n\nI am interested in learning more about the apartments in Ellington Building. Please contact me with more information.\n\nThank you!');
    window.open(`mailto:info@ellington.com?subject=${subject}&body=${body}`, '_blank');
}

function getDeviceType() {
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
}

// 🎯 INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Ellington Building Visualization - Complete System v7.0');
    
    loadApartmentData().then(() => {
        setupApartmentShapeListeners();
        setupRangeSliders();
        console.log('✅ Initialization complete');
    });
    
    // Close details panel when clicking outside
    document.addEventListener('click', function(e) {
        const detailsPanel = document.getElementById('detailsPanel');
        const isClickInsidePanel = detailsPanel.contains(e.target);
        const isClickOnShape = e.target.closest('.apartment-shape');
        
        if (!isClickInsidePanel && !isClickOnShape && detailsPanel.classList.contains('visible')) {
            closeDetailsPanel();
        }
    });
    
    // ✅ CRITICAL FIX: Prevent analytics modal from closing immediately
    let analyticsModalJustOpened = false;
    
    // Close analytics modal when clicking outside - WITH DELAY
    document.addEventListener('click', function(e) {
        // Skip if modal was just opened
        if (analyticsModalJustOpened) {
            analyticsModalJustOpened = false;
            return;
        }
        
        const modal = document.getElementById('analyticsModal');
        const modalContent = modal ? modal.querySelector('.modal-content') : null;
        const analyticsButton = e.target.closest('button[onclick*="showAnalyticsDashboard"]') || 
                               e.target.closest('.cta-button.secondary');
        
        // Don't close if clicking the analytics button
        if (analyticsButton) {
            analyticsModalJustOpened = true;
            setTimeout(() => {
                analyticsModalJustOpened = false;
            }, 100);
            return;
        }
        
        // Close modal if clicking outside
        if (modal && modal.classList.contains('visible') && modalContent && !modalContent.contains(e.target)) {
            closeAnalyticsDashboard();
        }
    });
});
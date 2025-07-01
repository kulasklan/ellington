// 📊 SAFE ANALYTICS MODULE - ZERO RISK TO EXISTING FUNCTIONALITY
// This module only observes and tracks - never modifies existing behavior

class SafeAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.data = this.loadData();
        
        // ✅ CRITICAL FIX: Initialize currentSession immediately
        this.currentSession = {
            sessionId: this.sessionId,
            startTime: this.startTime,
            events: [],
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`
        };
        
        this.data.sessions.push(this.currentSession);
        this.data.totalSessions++;
        this.saveData();
        
        this.init();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    loadData() {
        try {
            const saved = localStorage.getItem('ellington_analytics');
            return saved ? JSON.parse(saved) : {
                sessions: [],
                apartmentClicks: {},
                filterUsage: {},
                interestClicks: 0,
                totalSessions: 0
            };
        } catch (e) {
            return {
                sessions: [],
                apartmentClicks: {},
                filterUsage: {},
                interestClicks: 0,
                totalSessions: 0
            };
        }
    }

    saveData() {
        try {
            localStorage.setItem('ellington_analytics', JSON.stringify(this.data));
        } catch (e) {
            console.warn('Analytics: Could not save to localStorage');
        }
    }

    trackEvent(eventType, details = {}) {
        // ✅ CRITICAL FIX: Ensure currentSession exists before using it
        if (!this.currentSession) {
            this.currentSession = {
                sessionId: this.sessionId,
                startTime: this.startTime,
                events: [],
                userAgent: navigator.userAgent,
                screenResolution: `${window.screen.width}x${window.screen.height}`
            };
            this.data.sessions.push(this.currentSession);
            this.data.totalSessions++;
        }

        const event = {
            type: eventType,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            details: details
        };

        // Update counters
        switch (eventType) {
            case 'apartment_click':
                const aptId = details.apartmentId;
                if (!this.data.apartmentClicks[aptId]) {
                    this.data.apartmentClicks[aptId] = 0;
                }
                this.data.apartmentClicks[aptId]++;
                break;

            case 'filter_change':
                const filterType = details.filterType;
                if (!this.data.filterUsage[filterType]) {
                    this.data.filterUsage[filterType] = 0;
                }
                this.data.filterUsage[filterType]++;
                break;

            case 'interest_click':
                this.data.interestClicks++;
                break;
        }

        // ✅ FIXED: Now safe to push to events array
        this.currentSession.events.push(event);
        this.saveData();

        console.log('📊 Analytics tracked:', eventType, details);
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupListeners());
        } else {
            this.setupListeners();
        }
    }

    setupListeners() {
        // Track apartment clicks (SVG shapes)
        this.setupApartmentTracking();
        
        // Track interest button clicks
        this.setupInterestTracking();
        
        // Track filter changes
        this.setupFilterTracking();

        console.log('📊 Safe Analytics initialized - tracking enabled');
    }

    setupApartmentTracking() {
        // Listen for clicks on apartment shapes
        document.addEventListener('click', (e) => {
            const apartmentShape = e.target.closest('.apartment-shape');
            if (apartmentShape) {
                const apartmentId = apartmentShape.getAttribute('data-apartment');
                if (apartmentId) {
                    this.trackEvent('apartment_click', {
                        apartmentId: apartmentId,
                        timestamp: Date.now()
                    });
                }
            }
        });
    }

    setupInterestTracking() {
        // Track interest button clicks
        document.addEventListener('click', (e) => {
            const button = e.target;
            if (button.textContent && button.textContent.includes('INTERESTED')) {
                this.trackEvent('interest_click', {
                    timestamp: Date.now()
                });
            }
        });
    }

    setupFilterTracking() {
        // Track bedroom filter clicks
        document.addEventListener('click', (e) => {
            const bedroomBtn = e.target.closest('.bedroom-btn');
            if (bedroomBtn) {
                const bedrooms = bedroomBtn.getAttribute('data-bedrooms');
                this.trackEvent('filter_change', {
                    filterType: 'bedrooms',
                    value: bedrooms,
                    timestamp: Date.now()
                });
            }
        });

        // Track range slider changes
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('range-slider')) {
                const sliderId = e.target.id;
                let filterType = 'unknown';
                
                if (sliderId.includes('floor')) {
                    filterType = 'floor_range';
                } else if (sliderId.includes('area')) {
                    filterType = 'area_range';
                }

                this.trackEvent('filter_change', {
                    filterType: filterType,
                    value: e.target.value,
                    timestamp: Date.now()
                });
            }
        });

        // Track reset and clear buttons
        document.addEventListener('click', (e) => {
            const button = e.target;
            if (button.textContent) {
                if (button.textContent.includes('Reset')) {
                    this.trackEvent('filter_change', {
                        filterType: 'reset_filters',
                        timestamp: Date.now()
                    });
                } else if (button.textContent.includes('Clear')) {
                    this.trackEvent('filter_change', {
                        filterType: 'clear_all',
                        timestamp: Date.now()
                    });
                }
            }
        });
    }

    generateStats() {
        const currentSessionDuration = Math.round((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(currentSessionDuration / 60);
        const seconds = currentSessionDuration % 60;

        // Top apartments by clicks
        const topApartments = Object.entries(this.data.apartmentClicks)
            .map(([id, clicks]) => ({ id, clicks }))
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, 5);

        // Top filters by usage
        const topFilters = Object.entries(this.data.filterUsage)
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Total events across all sessions
        const totalEvents = this.data.sessions.reduce((total, session) => {
            return total + (session.events ? session.events.length : 0);
        }, 0);

        return {
            totalSessions: this.data.totalSessions,
            currentSessionDuration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
            interestClicks: this.data.interestClicks,
            totalEvents: totalEvents,
            topApartments: topApartments,
            topFilters: topFilters
        };
    }

    getBrowserName() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    // Public method to get analytics data
    getAnalyticsData() {
        return this.data;
    }

    // Public method to clear analytics data
    clearAnalyticsData() {
        this.data = {
            sessions: [],
            apartmentClicks: {},
            filterUsage: {},
            interestClicks: 0,
            totalSessions: 0
        };
        this.saveData();
        console.log('📊 Analytics data cleared');
    }
}

// ✅ CRITICAL FIX: Proper initialization
let ellingtonAnalytics = null;

// Initialize analytics when script loads
function initializeAnalytics() {
    try {
        ellingtonAnalytics = new SafeAnalytics();
        window.ellingtonAnalytics = ellingtonAnalytics;
        console.log('✅ Analytics initialized successfully');
    } catch (error) {
        console.error('❌ Analytics initialization failed:', error);
    }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAnalytics);
} else {
    initializeAnalytics();
}
// ─── GPS Route Tracker (Strava-style) ───
// Uses expo-location for continuous GPS tracking
// with haversine distance calculation.

import * as Location from 'expo-location';

// ─── Haversine formula ───
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Calculate total distance from coordinate array ───
export function calculateTotalDistance(coordinates) {
    if (!coordinates || coordinates.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < coordinates.length; i++) {
        total += haversineDistance(
            coordinates[i - 1].lat,
            coordinates[i - 1].lng,
            coordinates[i].lat,
            coordinates[i].lng
        );
    }
    return parseFloat(total.toFixed(2));
}

// ─── Request location permissions ───
export async function requestLocationPermissions() {
    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    if (fg !== 'granted') {
        throw new Error('Location permission denied');
    }
    return true;
}

// ─── Get current location (single shot) ───
export async function getCurrentLocation() {
    await requestLocationPermissions();
    const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
    });
    return {
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        timestamp: loc.timestamp,
    };
}

// ─── Reverse geocode (optional, returns address string) ───
export async function reverseGeocode(lat, lng) {
    try {
        const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (results.length > 0) {
            const r = results[0];
            const parts = [r.name, r.street, r.district, r.city, r.region].filter(Boolean);
            return parts.slice(0, 3).join(', ');
        }
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
}

// ─── Route Tracker Class ───
// Usage:
//   const tracker = new RouteTracker(onUpdate);
//   await tracker.start();
//   const result = tracker.stop(); // { coordinates, distanceKm, durationSec }
//
export class RouteTracker {
    constructor(onUpdate) {
        this.coordinates = [];
        this.subscription = null;
        this.startTime = null;
        this.onUpdate = onUpdate || (() => { });
        this._distanceKm = 0;
    }

    async start() {
        await requestLocationPermissions();

        this.coordinates = [];
        this._distanceKm = 0;
        this.startTime = Date.now();

        // Capture initial position
        const initial = await getCurrentLocation();
        this.coordinates.push(initial);
        this.onUpdate({ coordinates: [...this.coordinates], distanceKm: 0, durationSec: 0 });

        // Watch position: every 5 seconds OR 10 meters
        this.subscription = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 5000,     // 5 seconds
                distanceInterval: 10,   // 10 meters
            },
            (location) => {
                const point = {
                    lat: location.coords.latitude,
                    lng: location.coords.longitude,
                    timestamp: location.timestamp,
                };

                // Calculate incremental distance
                const last = this.coordinates[this.coordinates.length - 1];
                const d = haversineDistance(last.lat, last.lng, point.lat, point.lng);

                // Filter out GPS jitter (ignore < 2m moves)
                if (d < 0.002) return;

                this._distanceKm += d;
                this.coordinates.push(point);

                const durationSec = Math.floor((Date.now() - this.startTime) / 1000);
                this.onUpdate({
                    coordinates: [...this.coordinates],
                    distanceKm: parseFloat(this._distanceKm.toFixed(2)),
                    durationSec,
                });
            }
        );

        return true;
    }

    stop() {
        if (this.subscription) {
            this.subscription.remove();
            this.subscription = null;
        }

        const durationSec = this.startTime
            ? Math.floor((Date.now() - this.startTime) / 1000)
            : 0;

        return {
            coordinates: [...this.coordinates],
            distanceKm: parseFloat(this._distanceKm.toFixed(2)),
            durationSec,
        };
    }

    destroy() {
        this.stop();
        this.coordinates = [];
        this._distanceKm = 0;
    }
}

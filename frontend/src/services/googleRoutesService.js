/**
 * Modern Google Maps Routes API (V2) Integration
 * Replaces the legacy google.maps.DirectionsService
 */
export async function calculateModernRoutes(originAddress, destinationAddress, apiKey, options = {}) {
    if (!apiKey) throw new Error("Missing Google Maps API Key.");

    const { departureTime, trafficModel = "BEST_GUESS" } = options;

    // Google only returns a genuinely *predicted* (as opposed to purely live)
    // traffic-aware duration when routingPreference is TRAFFIC_AWARE_OPTIMAL and a
    // future departureTime + trafficModel are supplied — plain TRAFFIC_AWARE always
    // reflects current/live conditions and silently ignores departureTime. There is
    // no Google API for genuine *past* traffic, so departureTime must be now or later.
    const isPredictive = !!departureTime;

    const requestBody = {
        origin: { address: originAddress },
        destination: { address: destinationAddress },
        travelMode: "DRIVE",
        routingPreference: isPredictive ? "TRAFFIC_AWARE_OPTIMAL" : "TRAFFIC_AWARE",
        computeAlternativeRoutes: true,
        ...(isPredictive ? { departureTime, trafficModel } : {}),
    };

    try {
        const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                // FieldMask restricts the payload to exactly what the AI Agent needs to reduce latency.
                // staticDuration (the traffic-free duration) is requested alongside duration (the
                // traffic-aware/predicted duration) so callers can derive a genuine delay/congestion
                // figure instead of fabricating one.
                "X-Goog-FieldMask": "routes.routeLabels,routes.distanceMeters,routes.duration,routes.staticDuration,routes.polyline.encodedPolyline"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Google Routes API Technical Error:", errorData);
            throw new Error("Route service unavailable. Check Google Maps Routes API configuration.");
        }

        const data = await response.json();
        
        if (!data.routes || data.routes.length === 0) {
            return [];
        }

        // Normalize the payload for the LiveTraffic.jsx UI and TrafficAgent backend
        return data.routes.map((route, index) => {
            const distanceKm = (route.distanceMeters / 1000).toFixed(1);
            
            // Duration format from Google is "1200s"
            const durationSeconds = parseInt(route.duration?.replace('s', '') || 0, 10);
            const durationMins = Math.ceil(durationSeconds / 60);

            // staticDuration is Google's traffic-free duration for the same route; comparing
            // it to duration gives a real (not invented) delay and average speed.
            const staticDurationSeconds =
                parseInt(route.staticDuration?.replace('s', '') || 0, 10) || durationSeconds;
            const delayMinutes = Math.max(
                0,
                Math.round((durationSeconds - staticDurationSeconds) / 60),
            );
            const averageSpeedKmh =
                durationSeconds > 0
                    ? Math.round((route.distanceMeters / 1000) / (durationSeconds / 3600))
                    : null;
            
            // Clean up Google's routing tags (e.g. "DEFAULT_ROUTE" -> "Default Route")
            const label = route.routeLabels && route.routeLabels.length > 0 
                ? route.routeLabels[0].replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) 
                : "Alternative Route";

            return {
                id: index,
                name: `Route ${String.fromCharCode(65 + index)}`, // Generates "Route A", "Route B"
                summary: label,
                distance: `${distanceKm} km`,
                duration: `${durationMins} mins`,
                durationSeconds: durationSeconds,
                staticDurationSeconds: staticDurationSeconds,
                delayMinutes: delayMinutes,
                averageSpeedKmh: averageSpeedKmh,
                isPredicted: isPredictive,
                polyline: route.polyline?.encodedPolyline,
                rawRoute: route
            };
        });
    } catch (error) {
        console.error("Routing Service Failure:", error);
        throw new Error("Route service unavailable. Check Google Maps Routes API configuration.");
    }
}
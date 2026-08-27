const express = require("express");
const router = express.Router();
const pool = require("../../config/db");

// GET /api/traffic/cameras
router.get("/cameras", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        entity_id as camera_id, 
        name as camera_code, 
        latitude, 
        longitude, 
        metadata->>'status' as status,
        metadata->>'road_name' as road_name,
        metadata->>'direction' as direction,
        metadata->>'stream_url' as stream_url
      FROM map_entities 
      WHERE entity_type = 'cctv'
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Traffic Cameras API Error:", error);
    res.status(500).json({ error: "Failed to fetch traffic cameras" });
  }
});

// GET /api/traffic/live
router.get('/live', async (req, res) => {
  try {
    // Query only traffic signals explicitly marked as demonstration data
    const result = await pool.query(`
      SELECT entity_id, name, latitude, longitude, metadata 
      FROM map_entities 
      WHERE entity_type = 'traffic_signal' 
      AND metadata->>'is_demo' = 'true'
    `);

    const locations = result.rows.map(row => {
      const meta = row.metadata;
      
      // Assign UI colors based on strict severity rules
      let color = "text-emerald-400";
      if (meta.traffic_level === 'SEVERE') color = "text-red-500";
      else if (meta.traffic_level === 'HIGH') color = "text-orange-400";
      else if (meta.traffic_level === 'MODERATE') color = "text-yellow-400";

      return {
        id: row.entity_id,
        name: row.name,
        lat: parseFloat(row.latitude),
        lng: parseFloat(row.longitude),
        severity: meta.traffic_level || "LOW",
        color: color,
        reason: meta.reason,
        assessment: meta.assessment,
      };
    });

    // Sort so SEVERE/HIGH appear at the top of the UI
    const severityOrder = { "SEVERE": 1, "HIGH": 2, "MODERATE": 3, "LOW": 4 };
    locations.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    res.json({
      city: "Mumbai",
      source: "DEMONSTRATION DATA",
      updatedAt: new Date().toISOString(),
      locations: locations
    });

  } catch (error) {
    console.error("Traffic Live API Error:", error);
    res.status(500).json({ error: "Failed to fetch live traffic state." });
  }
});

module.exports = router;
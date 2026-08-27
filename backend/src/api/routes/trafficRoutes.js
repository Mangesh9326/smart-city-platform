// GET /api/traffic/cameras
router.get("/cameras", async (req, res) => {
  try {
    // Queries the map_entities table specifically for CCTVs and formats the output
    const result = await db.query(`
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
    res.status(500).json({ error: "Failed to fetch traffic cameras" });
  }
});
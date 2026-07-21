const express = require("express");
const router = express.Router();
const path = require('path');
const { exec } = require("child_process");
const db = require("../../config/db");
const replayEngine = require("../../engine/replayEngine");

router.post("/start-inference", async (req, res) => {
  const { cameraId, locationName, videoFile } = req.body;

  try {
    console.log(`[AI PIPELINE] Checking cache for footage: ${videoFile}`);

    // 1. Check if this video has already been processed and saved as a scenario
    const existingScenario = await db.query(
      "SELECT id FROM scenarios WHERE name = $1 LIMIT 1",
      [videoFile],
    );

    let activeScenarioId;

    if (existingScenario.rows.length > 0) {
      activeScenarioId = existingScenario.rows[0].id;
      console.log(`[AI PIPELINE] Cache Hit. Loading existing Scenario ID: ${activeScenarioId}`);
      await replayEngine.startSimulation(activeScenarioId, locationName);

      return res.status(200).json({
        message: "Cached Timeline loaded successfully.",
        scenarioId: activeScenarioId,
        isNewProcessing: false,
      });
    }

    // 2. CACHE MISS: First time seeing this video. Trigger Python YOLO Pipeline.
    console.log(`[AI PIPELINE] Cache Miss. Initiating YOLOv8 processing for ${videoFile}...`);

    // FIXED PATHS: Go up 4 levels from backend/src/api/routes/ to reach the root ai-pipeline folder
    const pythonExecutable = path.join(
      __dirname,
      "../../../../ai-pipeline/venv/Scripts/python.exe"
    );
    const scriptPath = path.join(
      __dirname,
      "../../../../ai-pipeline/process_video.py"
    );
    const videoPath = path.join(
      __dirname, 
      "../../../../ai-pipeline", 
      videoFile
    );

    const pythonCommand = `"${pythonExecutable}" "${scriptPath}" --video "${videoPath}"`;

    exec(pythonCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error(`[AI ERROR] YOLO Processing Failed: ${error.message}`);
        console.error(`[STDERR]: ${stderr}`);
        return res.status(500).json({ message: "AI Processing Pipeline Failed." });
      }

      try {
        const detectedEvents = JSON.parse(stdout);

        // 3. Save the new Scenario to the Database
        const newScenario = await db.query(
          `INSERT INTO scenarios (name, description, duration_seconds) 
                     VALUES ($1, $2, $3) RETURNING id`,
          [
            videoFile,
            `Auto-generated timeline for ${videoFile}`,
            detectedEvents.duration || 300,
          ],
        );

        activeScenarioId = newScenario.rows[0].id;

        // 4. Save all detected events to the timeline_events table
        for (const event of detectedEvents.timeline) {
          await db.query(
            `INSERT INTO timeline_events (scenario_id, timestamp_second, event_type, payload) 
                         VALUES ($1, $2, $3, $4)`,
            [activeScenarioId, event.second, event.type, event.payload],
          );
        }

        console.log(`[AI PIPELINE] Processing Complete. Saved as Scenario ID: ${activeScenarioId}`);

        // 5. Start the engine with the newly generated timeline
        await replayEngine.startSimulation(activeScenarioId, locationName);

        res.status(200).json({
          message: "New footage processed and timeline cached.",
          scenarioId: activeScenarioId,
          isNewProcessing: true,
        });
      } catch (dbError) {
        console.error("[DATABASE ERROR] Failed to save AI generated timeline.", dbError);
        res.status(500).json({ message: "Failed to cache AI timeline." });
      }
    });
  } catch (err) {
    console.error("[SYSTEM ERROR]", err);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

module.exports = router;
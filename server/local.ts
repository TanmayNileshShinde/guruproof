import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎓 GuruProof API running on http://localhost:${PORT}`);
  console.log(`⚡ Olostep Grounding: ${process.env.OLOSTEP_API_KEY ? "LIVE" : "FALLBACK"}`);
  console.log(`====================================================`);
});

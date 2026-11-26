import express from "express";
import cors from "cors";
import { CURRICULUM_TOPICS, TutorLanguage } from "./curriculum";
import { tutorEngine } from "./tutorEngine";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "2mb" }));

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "GuruProof Diagnostic AI Tutor",
    track: "Track C3: A Tutor for Every Learner (Homingo Hackathon Edition 01)",
    integrations: {
      olostep: Boolean(process.env.OLOSTEP_API_KEY),
      gemini: Boolean(process.env.GEMINI_API_KEY),
      groq: Boolean(process.env.GROQ_API_KEY),
    },
    timestamp: new Date().toISOString(),
  });
});

router.get("/topics", (req, res) => {
  res.json({
    success: true,
    topics: CURRICULUM_TOPICS,
  });
});

router.post("/diagnose", async (req, res) => {
  try {
    const { topicId, language, preAnswerIndex, hintLevel, customCode } = req.body || {};
    if (!topicId) {
      return res.status(400).json({ success: false, error: "topicId is required" });
    }
    const result = await tutorEngine.diagnose({
      topicId,
      language: (language as TutorLanguage) || "en",
      preAnswerIndex,
      hintLevel,
      customCode,
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/verify-fix", (req, res) => {
  try {
    const { topicId, fixedCode, language } = req.body || {};
    if (!topicId || typeof fixedCode !== "string") {
      return res.status(400).json({ success: false, error: "topicId and fixedCode are required" });
    }
    const result = tutorEngine.verifyStudentFix(topicId, fixedCode, (language as TutorLanguage) || "en");
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/transfer-check", (req, res) => {
  try {
    const { topicId, preScorePct, hintsUsed, selectedIndex, language } = req.body || {};
    if (!topicId || typeof selectedIndex !== "number") {
      return res.status(400).json({ success: false, error: "topicId and selectedIndex are required" });
    }
    const report = tutorEngine.evaluateTransferQuiz({
      topicId,
      preScorePct: Number(preScorePct ?? 25),
      hintsUsed: Number(hintsUsed ?? 1),
      selectedIndex,
      language: (language as TutorLanguage) || "en",
    });
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/evals", (req, res) => {
  res.json({ success: true, data: tutorEngine.runPedagogicalEvals() });
});

app.use("/api", router);
app.use("/", router);

export default app;

import express from "express";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

const portalFeatures = [
  {
    title: "Department Announcements",
    description: "Authenticated notices for students and faculty.",
  },
  {
    title: "Academic Resources",
    description: "Protected links for course material and lab references.",
  },
  {
    title: "Achievement Submissions",
    description: "A secured area for submitting student and faculty highlights.",
  },
];

router.get("/", protect, (req, res) => {
  res.json({ features: portalFeatures });
});

export default router;

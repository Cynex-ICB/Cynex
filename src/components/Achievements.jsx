import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { API_BASE_URL, readApiJson } from "../utils/api.js";

const fallbackAchievements = [
  {
    _id: "fallback-1",
    title: "Mini Project Milestones",
    description: "Student teams completed mini projects in web development and intelligent systems.",
  },
  {
    _id: "fallback-2",
    title: "Technical Learning Events",
    description: "Department conducted technical workshops, coding activities, and seminars.",
  },
  {
    _id: "fallback-3",
    title: "Innovation Participation",
    description: "Students participated in hackathons, paper presentations, and innovation events.",
  },
];

function Achievements({ token }) {
  const [achievements, setAchievements] = useState(fallbackAchievements);

  useEffect(() => {
    if (!token) return;

    const loadAchievements = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/content?type=achievement`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await readApiJson(response);

        if (data.posts?.length) {
          setAchievements(data.posts);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadAchievements();
  }, [token]);

  return (
    <motion.section
      className="section"
      id="achievements"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
    >
      <div className="section-heading">
        <p className="eyebrow">Highlights</p>
        <h2>Achievements</h2>
      </div>

      <div className="achievement-list">
        {achievements.map((achievement, index) => (
          <motion.article
            className="card achievement-card"
            key={achievement._id || achievement.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: index * 0.06 }}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
              {achievement.link ? (
                <a href={achievement.link} target="_blank" rel="noreferrer">
                  View details
                </a>
              ) : null}
            </div>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}

export default Achievements;

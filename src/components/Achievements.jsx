import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
        const data = await response.json();

        if (response.ok && data.posts?.length) {
          setAchievements(data.posts);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadAchievements();
  }, [token]);

  return (
    <section className="section" id="achievements">
      <div className="section-heading">
        <p className="eyebrow">Highlights</p>
        <h2>Achievements</h2>
      </div>

      <div className="achievement-list">
        {achievements.map((achievement, index) => (
          <article className="card achievement-card" key={achievement._id || achievement.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
              {achievement.link ? (
                <a href={achievement.link} target="_blank" rel="noreferrer">
                  View details
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Achievements;

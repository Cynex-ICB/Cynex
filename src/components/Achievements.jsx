import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { Award, Trophy, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL, readApiJson } from "../utils/api.js";

const fallbackAchievements = [
  {
    _id: "achievement-1",
    title: "VTU State-Level Hackathon Winners",
    description: "Department student teams secured top honors for developing an autonomous LoRaWAN IoT soil monitoring node for coastal farmers.",
    category: "Hackathon Award",
    year: "2025",
  },
  {
    _id: "achievement-2",
    title: "National Cybersecurity Capture The Flag (CTF) Milestone",
    description: "Student ethical defense squad ranked in the top 5% nationally in advanced vulnerability discovery and binary exploitation challenges.",
    category: "Cyber Defense",
    year: "2025",
  },
  {
    _id: "achievement-3",
    title: "IEEE Student Research Paper Publication",
    description: "Undergraduate capstone research on smart contract formal verification was accepted and presented at an IEEE international conference.",
    category: "Research Publication",
    year: "2024",
  },
  {
    _id: "achievement-4",
    title: "CYNEX Technical Symposium & Project Exhibition",
    description: "Annual department technical conclave showcasing 25+ working hardware prototypes, blockchain dApps, and defense simulations.",
    category: "Department Conclave",
    year: "2024",
  },
];

function Achievements({ token }) {
  const [achievements, setAchievements] = useState(fallbackAchievements);

  useEffect(() => {
    let isMounted = true;

    const loadAchievements = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch(`${API_BASE_URL}/content?type=achievement`, { headers });
        const data = await readApiJson(response);

        if (isMounted && data.posts?.length) {
          setAchievements(data.posts);
        }
      } catch (error) {
        // Retain fallback achievements
      }
    };

    loadAchievements();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-12 text-academic-text">
      
      {/* Header Banner */}
      <section className="page-hero">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-academic-navy text-white text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5 text-academic-gold-light" />
            <span>Honors &amp; Recognitions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-academic-navy tracking-tight">
            Student &amp; Department Achievements
          </h1>
          <p className="text-sm sm:text-base text-academic-text-secondary mt-2 leading-relaxed">
            Celebrating technical excellence, hackathon victories, peer-reviewed research papers, and technical society initiatives in the Department of CSE (ICB).
          </p>
        </div>
      </section>

      {/* Achievement Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map((item, index) => (
          <motion.article
            key={item._id || item.title}
            className="institutional-card p-6 flex flex-col justify-between"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-academic-gold-dark uppercase tracking-wider">
                  <Trophy className="w-3.5 h-3.5 text-academic-gold" />
                  <span>{item.category || "Department Accolade"}</span>
                </span>
                <span className="text-xs font-mono text-academic-text-muted">
                  #{String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-academic-navy mb-2">
                {item.title}
              </h2>

              <p className="text-xs sm:text-sm text-academic-text-secondary leading-relaxed">
                {item.description}
              </p>
            </div>

            {item.link ? (
              <div className="pt-4 mt-4 border-t border-academic-border">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-academic-accent hover:underline inline-flex items-center gap-1"
                >
                  <span>Read verification report</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : null}
          </motion.article>
        ))}
      </div>

      {/* Technical Society Feature */}
      <section className="institutional-card p-6 sm:p-8 bg-academic-bg border-academic-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold text-academic-gold-dark uppercase tracking-wider block">
              Student Leadership
            </span>
            <h3 className="text-xl font-bold text-academic-navy">
              CYNEX — Department Student Association
            </h3>
            <p className="text-xs sm:text-sm text-academic-text-secondary max-w-2xl leading-relaxed">
              CYNEX is the official technical student society of the Department of CSE (IoT, Cyber Security &amp; Blockchain) at AIET. The association conducts weekly peer coding sprints, CTF practice drills, hardware prototyping bootcamps, and industrial tech talks.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Achievements;


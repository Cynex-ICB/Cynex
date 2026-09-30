import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { Award, Trophy } from 'lucide-react';
import { API_BASE_URL, readApiJson, resolveApiAssetUrl } from "../utils/api.js";

function Achievements({ token }) {
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadAchievements = async () => {
      setIsLoading(true);
      setError("");
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch(`${API_BASE_URL}/content?type=achievement`, { headers });
        const data = await readApiJson(response);

        if (isMounted) setAchievements(data.posts || []);
      } catch (err) {
        if (isMounted) setError(err.message || "Could not load achievements.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadAchievements();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-10 text-academic-text">
      
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

      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Achievement Cards Grid */}
      <section className="space-y-6">
        {isLoading ? (
          <div className="institutional-card p-12 text-center">
            <p className="text-sm font-medium text-academic-text-muted">Loading achievements…</p>
          </div>
        ) : achievements.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {achievements.map((achievement) => (
            <motion.div
              key={achievement._id || achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="institutional-card p-5 sm:p-6 space-y-3"
            >
              {(achievement.image?.url || achievement.imageUrl) && (
                <img
                  src={resolveApiAssetUrl(achievement.image?.url || achievement.imageUrl)}
                  alt={achievement.title}
                  className="w-full h-40 object-cover rounded-md border border-academic-border"
                  loading="lazy"
                />
              )}
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-academic-gold flex-shrink-0" />
                <h3 className="text-base font-bold text-academic-navy">
                  {achievement.title}
                </h3>
              </div>
              <p className="text-sm text-academic-text-secondary leading-relaxed">
                {achievement.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-academic-navy/10 text-academic-navy text-[10px] font-mono font-semibold uppercase">
                  {achievement.type || "Achievement"}
                </span>
                <span className="text-xs text-academic-text-muted font-mono">
                  {achievement.createdAt ? new Date(achievement.createdAt).toLocaleDateString() : ""}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        ) : (
          <div className="institutional-card p-10 text-center space-y-2">
            <h3 className="text-base font-bold text-academic-navy">No achievements published yet</h3>
            <p className="text-xs text-academic-text-muted">
              Department highlights, placements and student accolades will appear here once published.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Achievements;

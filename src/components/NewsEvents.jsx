import { useEffect, useState } from 'react';
import { Calendar, Bell, Clock, MapPin } from 'lucide-react';
import { API_BASE_URL, readApiJson } from "../utils/api.js";

function NewsEvents() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const token = localStorage.getItem("authToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const data = await readApiJson(
          await fetch(`${API_BASE_URL}/content?type=activity-alert`, { headers })
        );
        if (isMounted) setPosts(data.posts || []);
      } catch (err) {
        if (isMounted) setError(err.message || "Could not load notices.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-12 text-academic-text">
      
      {/* Header Banner */}
      <section className="page-hero">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-academic-navy text-white text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <Bell className="w-3.5 h-3.5 text-academic-gold-light" />
            <span>Notices &amp; Schedules</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-academic-navy tracking-tight">
            News, Circulars &amp; Department Events
          </h1>
          <p className="text-sm sm:text-base text-academic-text-secondary mt-2 leading-relaxed">
            Official announcements, VTU university notifications, academic evaluation schedules, and upcoming technical symposiums for the Department of CSE (ICB).
          </p>
        </div>
      </section>

      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Announcements & Circulars */}
      <section className="space-y-6">
        <div className="border-b border-academic-border pb-3 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-semibold text-academic-gold-dark uppercase tracking-wider block">
              Official Bulletin
            </span>
            <h2 className="text-2xl font-bold text-academic-navy mt-0.5">
              Department Notices &amp; Circulars
            </h2>
          </div>
        </div>

        {isLoading ? (
          <div className="institutional-card p-12 text-center">
            <p className="text-sm font-medium text-academic-text-muted">Loading notices…</p>
          </div>
        ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((item) => {
            const created = item.createdAt ? new Date(item.createdAt) : null;
            const day = created ? String(created.getDate()).padStart(2, "0") : "--";
            const monthYear = created
              ? created.toLocaleDateString([], { month: "short", year: "numeric" })
              : "";
            return (
            <article
              key={item._id || item.id}
              className="institutional-card p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start"
            >
              {/* Prominent Academic Date Badge */}
              <div className="w-16 h-16 rounded-md bg-academic-navy text-white flex flex-col items-center justify-center flex-shrink-0 text-center shadow-soft border border-academic-gold/20">
                <span className="text-xl font-extrabold leading-none text-academic-gold-light">
                  {day}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-semibold mt-0.5">
                  {monthYear}
                </span>
              </div>

              {/* Notice Content */}
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono font-semibold uppercase">
                    {item.type || "Notice"}
                  </span>
                </div>

                <h3 className="text-base font-bold text-academic-navy leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-academic-text-secondary leading-relaxed">
                  {item.description}
                </p>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noreferrer" className="text-xs font-semibold text-academic-accent hover:underline">
                    Open link →
                  </a>
                )}
              </div>
            </article>
            );
          })}
        </div>
        ) : (
          <div className="institutional-card p-10 text-center space-y-2">
            <h3 className="text-base font-bold text-academic-navy">No notices published yet</h3>
            <p className="text-xs text-academic-text-muted">
              Official circulars and department announcements will appear here once published.
            </p>
          </div>
        )}
      </section>

      {/* Upcoming Events Section */}
      <section className="space-y-6">
        <div className="border-b border-academic-border pb-3">
          <span className="text-xs font-mono font-semibold text-academic-gold-dark uppercase tracking-wider block">
            Academic Calendar
          </span>
          <h2 className="text-2xl font-bold text-academic-navy mt-0.5">
            Upcoming Technical Events &amp; Workshops
          </h2>
        </div>

        {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
           {posts.map((evt) => (
            <div key={evt._id || evt.id} className="institutional-card p-6 flex flex-col justify-between">
              <div>
                <span className="inline-block px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-mono font-semibold uppercase mb-3">
                  {evt.type || "Event"}
                </span>
                <h3 className="text-base font-bold text-academic-navy leading-snug mb-3">
                  {evt.title}
                </h3>
                
                <div className="space-y-2 text-xs text-academic-text-secondary pt-2 border-t border-academic-border">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-academic-accent flex-shrink-0" />
                    <span className="font-medium text-academic-navy">
                      {evt.createdAt ? new Date(evt.createdAt).toLocaleDateString() : "To be announced"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-academic-accent flex-shrink-0" />
                    <span>{evt.description?.slice(0, 120) || "Details to be announced"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-academic-accent flex-shrink-0" />
                    <span>{evt.name || "Department venue"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <span className="text-[11px] text-academic-text-muted block">
                  Coordinator: <strong className="text-academic-navy">{evt.roleTitle || "Department desk"}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
        ) : (
          !isLoading && (
            <div className="institutional-card p-10 text-center space-y-2">
              <h3 className="text-base font-bold text-academic-navy">No upcoming events</h3>
              <p className="text-xs text-academic-text-muted">
                Workshops, hackathons and seminars will be listed here once announced.
              </p>
            </div>
          )
        )}
      </section>

    </div>
  );
}

export default NewsEvents;

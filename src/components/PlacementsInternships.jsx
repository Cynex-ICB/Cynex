import { useEffect, useState } from "react";
import { Briefcase, Building2, TrendingUp, Award, ExternalLink, CheckCircle2 } from "lucide-react";
import { API_BASE_URL, API_ORIGIN, readApiJson } from "../utils/api.js";

const recruiterPartners = [
  "Tata Consultancy Services (TCS)",
  "Infosys",
  "Wipro Technologies",
  "Cognizant",
  "Capgemini",
  "Accenture",
  "DXC Technology",
  "SLK Software",
  "Tech Mahindra",
  "Mindtree",
  "L&T Technology Services",
  "Bosch India",
];

const careerTracks = [
  {
    title: "Embedded & IoT Systems Engineer",
    skills: "C/C++, MicroPython, RTOS, MQTT, ARM Architectures, Edge Prototyping",
    roles: "Firmware Engineer, IoT Solutions Architect, Embedded Systems Developer",
  },
  {
    title: "Cybersecurity & Security Operations (SOC)",
    skills: "Network Defense, Vulnerability Assessment, Wireshark, Snort, Linux Hardening, VAPT",
    roles: "SOC Analyst, Cybersecurity Engineer, Penetration Tester, Security Auditor",
  },
  {
    title: "Blockchain & Decentralized Applications",
    skills: "Solidity, Ethereum EVM, Web3.js, Smart Contract Auditing, Cryptography",
    roles: "Blockchain Developer, Smart Contract Engineer, Web3 Protocol Specialist",
  },
];

function PlacementsInternships({ token }) {
  const [placements, setPlacements] = useState([]);
  const [internships, setInternships] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPosts = async () => {
      setIsLoading(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch(`${API_BASE_URL}/content`, { headers });
        const data = await readApiJson(response);

        if (isMounted) {
          const placementPosts = (data.posts || []).filter((post) => post.type === "placement");
          const internshipPosts = (data.posts || []).filter((post) => post.type === "internship");

          setPlacements(placementPosts);
          setInternships(internshipPosts);
        }
      } catch (error) {
        // Graceful fallback if unauthenticated or endpoint restricted
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-16 text-academic-text">
      
      {/* Header Banner */}
      <section className="page-hero">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-academic-navy text-white text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <Briefcase className="w-3.5 h-3.5 text-academic-gold-light" />
            <span>Career Outcomes &amp; Corporate Relations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-academic-navy tracking-tight">
            Placements &amp; Industry Internships
          </h1>
          <p className="text-sm sm:text-base text-academic-text-secondary mt-2 leading-relaxed">
            Preparing engineers for specialized technical roles through campus training, industry project internships, and university recruitment drives at AIET.
          </p>
        </div>
      </section>

      {/* Career Specialization Pathways */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-mono font-semibold text-academic-gold-dark uppercase tracking-wider block">
            Career Competencies
          </span>
          <h2 className="text-2xl font-bold text-academic-navy mt-1">
            Department Industry Pathways
          </h2>
          <p className="text-xs sm:text-sm text-academic-text-muted">
            Specialized engineering profiles for CSE (ICB) graduates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {careerTracks.map((track) => (
            <div key={track.title} className="institutional-card p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-base font-bold text-academic-navy">{track.title}</h3>
                <div>
                  <span className="text-[11px] font-mono text-academic-text-muted uppercase tracking-wider block">
                    Core Technical Stack:
                  </span>
                  <p className="text-xs text-academic-text-secondary mt-0.5">{track.skills}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-academic-border mt-4">
                <span className="text-[11px] font-mono text-academic-gold-dark uppercase tracking-wider block font-semibold">
                  Target Industry Roles:
                </span>
                <p className="text-xs font-medium text-academic-navy mt-0.5">{track.roles}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recruiter Network Showcase */}
      <section className="institutional-card p-6 sm:p-8">
        <div className="max-w-2xl mb-6">
          <span className="text-xs font-mono font-semibold text-academic-gold-dark uppercase tracking-wider block">
            Placement Network
          </span>
          <h2 className="text-xl font-bold text-academic-navy mt-1">
            Prominent Recruiting Partners &amp; Campus Drives
          </h2>
          <p className="text-xs sm:text-sm text-academic-text-muted mt-1">
            Our graduates participate in tier-1 corporate recruitment drives coordinated by the AIET Central Placement Cell.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {recruiterPartners.map((company) => (
            <div
              key={company}
              className="p-3.5 rounded-md bg-academic-bg border border-academic-border text-center flex items-center justify-center"
            >
              <span className="text-xs font-semibold text-academic-navy">{company}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Placement Highlights (if items exist in database) */}
      {placements.length > 0 && (
        <ShowcaseSection title="Placement Highlights &amp; Offers" items={placements} />
      )}

      {/* Dynamic Internship Highlights (if items exist in database) */}
      {internships.length > 0 && (
        <ShowcaseSection title="Student Industry Internships" items={internships} />
      )}

      {/* Mandatory Internship Guidelines */}
      <section className="institutional-card p-6 sm:p-8 bg-academic-bg border-academic-border">
        <div className="max-w-3xl space-y-2">
          <h3 className="text-base font-bold text-academic-navy">
            VTU Mandatory Internship Program
          </h3>
          <p className="text-xs sm:text-sm text-academic-text-secondary leading-relaxed">
            Under the Visvesvaraya Technological University (VTU) curriculum, every student undergoes a mandatory 16-week industry or research internship during Semesters 7 &amp; 8. Students submit weekly work reports, faculty mentor evaluations, and a formal internship seminar presentation prior to degree completion.
          </p>
        </div>
      </section>

    </div>
  );
}

function ShowcaseSection({ title, items }) {
  const getImageSrc = (imageUrl) => {
    if (!imageUrl) return "";
    return imageUrl.startsWith("/uploads") ? `${API_ORIGIN}${imageUrl}` : imageUrl;
  };

  return (
    <section className="space-y-6">
      <div className="border-b border-academic-border pb-3">
        <h2 className="text-xl font-bold text-academic-navy">{title}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <article className="institutional-card p-5 flex flex-col justify-between" key={item._id || item.title}>
            <div>
              {item.imageUrl ? (
                <div className="w-full h-44 rounded-md overflow-hidden bg-slate-100 border border-slate-200 mb-4">
                  <img
                    src={getImageSrc(item.imageUrl)}
                    alt={item.name || item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null}

              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 uppercase">
                {item.title}
              </span>

              <h3 className="text-base font-bold text-academic-navy mt-2">
                {item.name || "Student Milestone"}
              </h3>

              {item.roleTitle && (
                <p className="text-xs text-academic-text-secondary mt-1 font-medium">
                  {item.roleTitle}
                </p>
              )}

              {item.ctcLpa && (
                <p className="text-xs font-mono font-bold text-emerald-700 mt-1">
                  Package: {item.ctcLpa}
                </p>
              )}

              {item.description && (
                <p className="text-xs text-academic-text-secondary mt-2 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>

            {item.link ? (
              <div className="pt-3 mt-4 border-t border-slate-100">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-academic-accent hover:underline inline-flex items-center gap-1"
                >
                  <span>Verification details</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export default PlacementsInternships;


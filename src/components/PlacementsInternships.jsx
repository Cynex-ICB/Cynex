import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://cynex-portal-backend.vercel.app/api";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const placeholderPlacements = [
  {
    _id: "placement-placeholder-1",
    type: "placement",
    title: "Placement Highlight",
    name: "[name]",
    roleTitle: "[role]",
    ctcLpa: "[CTC/LPA]",
    imageUrl: "",
  },
];

const placeholderInternships = [
  {
    _id: "internship-placeholder-1",
    type: "internship",
    title: "Internship Highlight",
    name: "[name]",
    roleTitle: "[role]",
    ctcLpa: "[CTC/LPA]",
    imageUrl: "",
  },
];

function PlacementsInternships({ token }) {
  const [placements, setPlacements] = useState(placeholderPlacements);
  const [internships, setInternships] = useState(placeholderInternships);

  useEffect(() => {
    if (!token) return;

    const loadPosts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/content`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!response.ok) return;

        const placementPosts = (data.posts || []).filter((post) => post.type === "placement");
        const internshipPosts = (data.posts || []).filter((post) => post.type === "internship");

        setPlacements(placementPosts.length ? placementPosts : placeholderPlacements);
        setInternships(internshipPosts.length ? internshipPosts : placeholderInternships);
      } catch (error) {
        console.error(error);
      }
    };

    loadPosts();
  }, [token]);

  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow">Career Outcomes</p>
        <h2>Placements and Internships</h2>
      </div>

      <ShowcaseSection title="Placements" items={placements} />
      <ShowcaseSection title="Internships" items={internships} />
    </section>
  );
}

function ShowcaseSection({ title, items }) {
  const getImageSrc = (imageUrl) => {
    if (!imageUrl) return "";
    return imageUrl.startsWith("/uploads") ? `${API_ORIGIN}${imageUrl}` : imageUrl;
  };

  return (
    <div className="showcase-section">
      <h3>{title}</h3>
      <div className="showcase-grid">
        {items.map((item) => (
          <article className="card showcase-card" key={item._id || item.title}>
            <div className="showcase-image">
              {item.imageUrl ? (
                <img src={getImageSrc(item.imageUrl)} alt={item.name || item.title} />
              ) : (
                <span>[image]</span>
              )}
            </div>
            <div className="showcase-content">
              <p className="eyebrow">{item.title}</p>
              <h4>{item.name || "[name]"}</h4>
              <span>{item.roleTitle || "[role]"}</span>
              <strong>{item.ctcLpa || "[CTC/LPA]"}</strong>
              {item.description ? <p>{item.description}</p> : null}
              {item.link ? (
                <a href={item.link} target="_blank" rel="noreferrer">
                  View details
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default PlacementsInternships;

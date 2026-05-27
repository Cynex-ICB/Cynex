import { useEffect, useState } from "react";
import { API_BASE_URL, readApiJson } from "../utils/api.js";

function profileValue(value) {
  return value ? value : "Not assigned yet";
}

function groupMarksBySubject(marks) {
  return marks.reduce((groups, mark) => {
    const subjectId = mark.subject?._id || mark.subject?.id || "unknown";
    const existingGroup = groups[subjectId] || {
      subject: mark.subject,
      marks: [],
      totalObtained: 0,
      totalMax: 0,
    };

    existingGroup.marks.push(mark);
    existingGroup.totalObtained += Number(mark.marksObtained || 0);
    existingGroup.totalMax += Number(mark.maxMarks || 0);

    return {
      ...groups,
      [subjectId]: existingGroup,
    };
  }, {});
}

function Profile({ token, user, onUserUpdate }) {
  const [profile, setProfile] = useState(user);
  const [cieMarks, setCieMarks] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!token) return;

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await readApiJson(response);

        if (isMounted) {
          setProfile(data.user);
          onUserUpdate?.(data.user);
        }

        if (data.user?.role === "student") {
          const marksData = await readApiJson(
            await fetch(`${API_BASE_URL}/cie-marks/me`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          );

          if (isMounted) {
            setCieMarks(marksData.marks || []);
          }
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [token, onUserUpdate]);

  const isStudent = profile?.role === "student";
  const marksBySubject = Object.values(groupMarksBySubject(cieMarks));

  return (
    <section className="section profile-section">
      <div className="section-heading profile-heading">
        <p className="eyebrow">Profile</p>
        <h2>Account details</h2>
      </div>

      <div className="card profile-card">
        <div className="profile-summary">
          <span className="profile-avatar" aria-hidden="true">
            {profile?.name?.charAt(0)?.toUpperCase() || "U"}
          </span>
          <div>
            <h3>{profile?.name || "User"}</h3>
            <p>{profile?.collegeEmail || "Email unavailable"}</p>
          </div>
        </div>

        {isLoading ? <p className="form-message success">Refreshing profile...</p> : null}
        {error ? <p className="form-message error">{error}</p> : null}

        <dl className="profile-details">
          <div>
            <dt>Name</dt>
            <dd>{profile?.name || "Unavailable"}</dd>
          </div>
          <div>
            <dt>Email ID</dt>
            <dd>{profile?.collegeEmail || "Unavailable"}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{profile?.role || "Unavailable"}</dd>
          </div>
          {isStudent ? (
            <>
              <div>
                <dt>Class Coordinator</dt>
                <dd>{profileValue(profile?.classCoordinatorName)}</dd>
              </div>
              <div>
                <dt>Mentor</dt>
                <dd>{profileValue(profile?.mentorName)}</dd>
              </div>
              <div>
                <dt>Semester</dt>
                <dd>Semester {profile?.semester || 3}</dd>
              </div>
            </>
          ) : null}
        </dl>
      </div>

      {isStudent ? (
        <div className="card profile-card profile-marks-card">
          <div className="profile-section-title">
            <p className="eyebrow">CIE Marks</p>
            <h3>Subject-wise performance</h3>
          </div>

          {marksBySubject.length ? (
            <div className="profile-marks-list">
              {marksBySubject.map((group) => (
                <article className="profile-marks-subject" key={group.subject?._id || group.subject?.code}>
                  <div className="profile-marks-subject-heading">
                    <div>
                      <h4>
                        {group.subject?.code} - {group.subject?.name}
                      </h4>
                      <span>Semester {group.subject?.semester || profile?.semester}</span>
                    </div>
                    <strong>
                      {group.totalObtained}/{group.totalMax}
                    </strong>
                  </div>

                  <div className="profile-marks-table-wrap">
                    <table className="profile-marks-table">
                      <thead>
                        <tr>
                          <th>CIE</th>
                          <th>Marks</th>
                          <th>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.marks
                          .sort((first, second) => first.cieNumber - second.cieNumber)
                          .map((mark) => (
                            <tr key={mark.id}>
                              <td>CIE {mark.cieNumber}</td>
                              <td>
                                {mark.marksObtained}/{mark.maxMarks}
                              </td>
                              <td>{mark.remarks || "-"}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state profile-empty-state">
              <h3>No CIE marks published yet</h3>
              <p>Your subject-wise CIE marks will appear here after they are added by your teacher.</p>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

export default Profile;

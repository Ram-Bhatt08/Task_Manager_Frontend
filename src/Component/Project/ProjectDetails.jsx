import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProjectDetails.css";
import API from "../../api";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // prevents duplicate fetch (React StrictMode safe)
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!id || !token || !user) {
      navigate("/");
      return;
    }

    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const controller = new AbortController();

    const fetchProject = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${API}/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        setProject(res.data);
      } catch (err) {
        const msg = err?.response?.data?.message;

        console.error(msg || err.message);

        if (err?.response?.status === 400) {
          alert("Invalid project selected");
          navigate("/project");
        } else if (err?.response?.status === 401) {
          localStorage.clear();
          navigate("/");
        } else {
          alert("Failed to load project");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();

    return () => controller.abort();
  }, [id, token, user, navigate]);

  const adminId = project?.admin?._id || project?.admin;
  const isAdmin = adminId === user?._id;

  const removeMember = async (uid) => {
    try {
      await axios.put(
        `${API}/projects/${id}/remove-member`,
        { userId: uid },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const res = await axios.get(`${API}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProject(res.data);
    } catch (err) {
      console.error(err?.response?.data || err.message);
      alert("Remove failed");
    }
  };

  if (loading) {
    return <div className="project-details status">Loading project...</div>;
  }

  if (!project) {
    return <div className="project-details status">No project found</div>;
  }

  return (
    <div className="project-details">

      <button onClick={() => navigate("/project")}>
        ← Back
      </button>

      <h2>{project.name}</h2>

      <p>
        Admin: <strong>{project.admin?.email || "Unknown"}</strong>
      </p>

      <h3>Members</h3>

      {project.members?.length === 0 ? (
        <div className="status">No members</div>
      ) : (
        project.members.map((m) => {
          const memberId = m.user?._id || m.user;
          const isAdminMember = memberId === adminId;

          return (
            <div key={m._id} className="member-card">
              <div>
                <span>{m.user?.email || "Unknown user"}</span>

                {isAdminMember && (
                  <span className="admin-badge">Admin</span>
                )}
              </div>

              {isAdmin && !isAdminMember && (
                <button
                  className="remove-btn"
                  onClick={() => removeMember(memberId)}
                >
                  Remove
                </button>
              )}
            </div>
          );
        })
      )}

      <button
        className="task-btn"
        onClick={() => navigate(`/task/${id}`)}
      >
        Manage Tasks
      </button>
    </div>
  );
};

export default ProjectDetails;

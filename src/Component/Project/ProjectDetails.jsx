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

  // ✅ prevents StrictMode double fetch
  const hasFetched = useRef(false);

  const fetchProject = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProject(res.data);
    } catch (err) {
      console.error(err?.response?.data || err.message);

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

  // ✅ SINGLE STABLE EFFECT (NO LOOP)
  useEffect(() => {
    if (!id || !token || !user) {
      navigate("/");
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // ONLY id

  const adminId = project?.admin?._id || project?.admin;
  const isAdmin = adminId === user?._id;

  // ✅ safer refresh (NO full refetch loop risk)
  const removeMember = async (uid) => {
    try {
      await axios.put(
        `${API}/projects/${id}/remove-member`,
        { userId: uid },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // refresh ONLY once
      const res = await axios.get(`${API}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProject(res.data);
    } catch (err) {
      console.error(err);
      alert("Remove failed");
    }
  };

  if (loading) return <div className="status">Loading project...</div>;
  if (!project) return <div className="status">No project found</div>;

  return (
    <div className="project-details">
      <button onClick={() => navigate("/project")}>Back</button>

      <h2>{project.name}</h2>

      <p>Admin: {project.admin?.email}</p>

      <h3>Members</h3>

      {project.members?.map((m) => {
        const memberId = m.user?._id || m.user;
        const isAdminMember = memberId === adminId;

        return (
          <div className="member-card" key={m._id}>
            <span>
              {m.user?.email}
              {isAdminMember && (
                <span className="admin-badge">Admin</span>
              )}
            </span>

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
      })}

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

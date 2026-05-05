import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../../api";
import "./Project.css";

const Project = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // ================= FETCH PROJECTS =================
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!user || !token) {
          navigate("/");
          return;
        }

        const res = await axios.get(`${API}/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProjects(res.data || []);
      } catch (err) {
        console.error(err);

        if (err?.response?.status === 401) {
          localStorage.clear();
          navigate("/");
        } else {
          alert("Failed to load projects");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
    // eslint-disable-next-line
  }, []);

  // ================= CREATE PROJECT =================
  const createProject = async () => {
    try {
      if (!name.trim()) return alert("Project name required");

      const res = await axios.post(
        `${API}/projects`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProjects((prev) => [...prev, res.data]);
      setName("");
    } catch (err) {
      console.error(err);
      alert("Create project failed");
    }
  };

  // ================= ADD MEMBER =================
  const addMember = async (id) => {
    try {
      if (!email.trim()) return alert("Email required");

      const res = await axios.put(
        `${API}/projects/${id}/add-member`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProjects((prev) =>
        prev.map((p) => (p._id === id ? res.data : p))
      );

      setEmail("");
      setActiveProject(null);
    } catch (err) {
      console.error(err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Add member failed");
    }
  };

  const isAdmin = (p) => {
    const adminId = p.admin?._id || p.admin;
    return adminId === user?._id;
  };

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div className="project-wrapper">

      {/* HEADER */}
      <div className="project-header">
        <h2>Projects</h2>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>

      {/* CREATE PROJECT */}
      <div className="create-project">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter project name"
        />
        <button onClick={createProject}>Create</button>
      </div>

      {/* EMPTY STATE */}
      {projects.length === 0 ? (
        <p className="empty-state">No projects found</p>
      ) : (
        <div className="project-grid">
          {projects.map((p) => (
            <div className="project-card" key={p._id}>

              {/* TITLE */}
              <NavLink to={`/projectdetails/${p._id}`} className="project-link">
                {p.name}
              </NavLink>

              {/* INFO */}
              <p>Members: {p.members?.length || 0}</p>

              <span className={`role ${isAdmin(p) ? "admin" : "member"}`}>
                {isAdmin(p) ? "Admin" : "Member"}
              </span>

              {/* ADD MEMBER */}
              {isAdmin(p) && (
                <div className="add-member">
                  {activeProject === p._id ? (
                    <>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter member email"
                      />
                      <button onClick={() => addMember(p._id)}>
                        Add Member
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setActiveProject(p._id)}>
                      Add Member
                    </button>
                  )}
                </div>
              )}

              {/* MEMBERS LIST */}
              <div className="members">
                {p.members?.map((m) => (
                  <div key={m._id} className="member-item">
                    {m.user?.email || "Unknown user"}
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Project;

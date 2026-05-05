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

    // ⚠️ RUN ONLY ONCE
    // eslint-disable-next-line
  }, []);

  // ================= CREATE PROJECT =================
  const createProject = async () => {
    try {
      if (!name.trim()) {
        return alert("Project name required");
      }

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
      if (!email.trim()) {
        return alert("Email required");
      }

      const res = await axios.put(
        `${API}/projects/${id}/add-member`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ update state WITHOUT refetch (prevents blinking)
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

  // ================= ADMIN CHECK =================
  const isAdmin = (p) => {
    const adminId = p.admin?._id || p.admin;
    return adminId === user?._id;
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <div>
      <button onClick={() => navigate("/dashboard")}>
        Back
      </button>

      <h2>Projects</h2>

      {/* CREATE PROJECT */}
      <div style={{ marginBottom: 10 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
        />
        <button onClick={createProject}>Create</button>
      </div>

      {/* PROJECT LIST */}
      {projects.length === 0 ? (
        <p>No projects found</p>
      ) : (
        projects.map((p) => (
          <div
            key={p._id}
            style={{
              border: "1px solid black",
              margin: 10,
              padding: 10,
              borderRadius: 6,
            }}
          >
            <NavLink to={`/projectdetails/${p._id}`}>
              <h3>{p.name}</h3>
            </NavLink>

            <p>Members: {p.members?.length || 0}</p>

            <p>
              Role: {isAdmin(p) ? "Admin" : "Member"}
            </p>

            {/* ADD MEMBER */}
            {isAdmin(p) && (
              <div>
                {activeProject === p._id ? (
                  <>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="member email"
                    />
                    <button onClick={() => addMember(p._id)}>
                      Add
                    </button>
                  </>
                ) : (
                  <button onClick={() => setActiveProject(p._id)}>
                    Add Member
                  </button>
                )}
              </div>
            )}

            {/* MEMBERS */}
            <div style={{ marginTop: 10 }}>
              {p.members?.map((m) => (
                <div key={m._id}>
                  <span>{m.user?.email || "Unknown user"}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Project;

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../../api";
import "./Task.css";

const Task = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    assignedTo: "",
  });

  // ================= AUTH GUARD =================
  useEffect(() => {
    if (!token || !currentUser) {
      navigate("/");
    }
  }, [token, currentUser, navigate]);

  // ================= FETCH =================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [projectRes, taskRes] = await Promise.all([
        axios.get(`${API}/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/tasks/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setProject(projectRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      console.error(err);

      if (err?.response?.status === 401) {
        localStorage.clear();
        navigate("/");
      } else {
        alert("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, token, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ================= INPUT =================
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ================= CREATE =================
  const handleCreateTask = async () => {
    try {
      if (!formData.title.trim()) {
        return alert("Title required");
      }

      await axios.post(
        `${API}/tasks/${projectId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchData(); // safer than trusting response

      setFormData({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium",
        assignedTo: "",
      });
    } catch (err) {
      alert(err?.response?.data?.message || "Create failed");
    }
  };

  // ================= STATUS =================
  const handleStatusChange = async (taskId, status) => {
    try {
      await axios.put(
        `${API}/tasks/${taskId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId ? { ...t, status } : t
        )
      );
    } catch (err) {
      alert("Status update failed");
    }
  };

  // ================= DELETE =================
  const handleDeleteTask = async (taskId) => {
    try {
      if (!window.confirm("Delete task?")) return;

      await axios.delete(`${API}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch {
      alert("Delete failed");
    }
  };

  const isAdmin =
    (project?.admin?._id || project?.admin) === currentUser?._id;

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="task-page">
      <button onClick={() => navigate(`/projectdetails/${projectId}`)}>
        ← Back
      </button>

      <h2>{project.name} Tasks</h2>

      {/* CREATE */}
      {isAdmin && (
        <div className="task-form">
          <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" />
          <textarea name="description" value={formData.description} onChange={handleChange} />
          <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} />

          <select name="priority" value={formData.priority} onChange={handleChange}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <select name="assignedTo" value={formData.assignedTo} onChange={handleChange}>
            <option value="">Assign To</option>
            {project.members.map((m) => (
              <option key={m.user._id} value={m.user._id}>
                {m.user.email}
              </option>
            ))}
          </select>

          <button onClick={handleCreateTask}>Create</button>
        </div>
      )}

      {/* BOARD */}
      <div className="task-board">
        {["To Do", "In Progress", "Done"].map((status) => (
          <div key={status} className="task-column">
            <h3>{status}</h3>

            {tasks
              .filter((t) => t.status === status)
              .map((task) => (
                <div key={task._id} className="task-card">
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  <p>Assigned: {task.assignedTo?.email || "Unassigned"}</p>

                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(task._id, e.target.value)
                    }
                  >
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Done</option>
                  </select>

                  {isAdmin && (
                    <button onClick={() => handleDeleteTask(task._id)}>
                      Delete
                    </button>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Task;

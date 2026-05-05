import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../../api";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ================= FETCH DASHBOARD =================
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const [statsRes, taskRes] = await Promise.all([
        axios.get(`${API}/dashboard/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/tasks/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStats(statsRes?.data || {});
      setTasks(taskRes?.data || []);
    } catch (err) {
      console.error("Dashboard error:", err?.response?.data || err.message);

      if (err?.response?.status === 401) {
        localStorage.clear();
        navigate("/");
      } else {
        alert("Failed to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  // ================= INITIAL LOAD =================
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser || !token) {
      navigate("/");
      return;
    }

    setUser(storedUser);
    loadDashboard();
  }, [navigate, loadDashboard, token]);

  // ================= FILTER MY TASKS =================
  const myTasks = useMemo(() => {
    if (!user) return [];
    return tasks.filter(
      (t) => t?.assignedTo?._id === user._id
    );
  }, [tasks, user]);

  // ================= UPDATE STATUS =================
  const handleStatus = async (taskId, status) => {
    try {
      await axios.put(
        `${API}/tasks/${taskId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId ? { ...t, status } : t
        )
      );
    } catch (err) {
      console.error(err);
      alert("Status update failed");
    }
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ================= LOADING =================
  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-wrapper">

      {/* HEADER */}
      <div className="dashboard-header">
        <h2>Welcome, {user?.name}</h2>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* PROJECT BUTTON */}
      <button
        className="project-btn"
        onClick={() => navigate("/project")}
      >
        Go to Projects
      </button>

      {/* ================= STATS ================= */}
      <div className="dashboard-stats">
        <h3>Dashboard Overview</h3>

        <div className="stats-grid">
          <div className="stat-card">
            <h4>Total Tasks</h4>
            <p>{stats?.totalTasks ?? 0}</p>
          </div>

          <div className="stat-card">
            <h4>Todo</h4>
            <p>{stats?.statusCount?.todo ?? 0}</p>
          </div>

          <div className="stat-card">
            <h4>In Progress</h4>
            <p>{stats?.statusCount?.inProgress ?? 0}</p>
          </div>

          <div className="stat-card">
            <h4>Done</h4>
            <p>{stats?.statusCount?.done ?? 0}</p>
          </div>

          <div className="stat-card">
            <h4>Overdue</h4>
            <p>{stats?.overdueTasks ?? 0}</p>
          </div>
        </div>
      </div>

      {/* ================= TASKS ================= */}
      <div className="tasks-section">
        <h3>My Tasks</h3>

        {myTasks.length === 0 ? (
          <p className="empty-state">No tasks assigned</p>
        ) : (
          myTasks.map((task) => (
            <div className="task-card" key={task._id}>
              <h4>{task.title}</h4>

              <p>
                Project:{" "}
                <strong>
                  {task.project?.name || "No Project"}
                </strong>
              </p>

              <span
                className={`status ${task.status
                  .toLowerCase()
                  .replace(" ", "")}`}
              >
                {task.status}
              </span>

              <select
                value={task.status}
                onChange={(e) =>
                  handleStatus(task._id, e.target.value)
                }
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;

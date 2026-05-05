import react from "react";
import Login from './Component/Login/Login';
import Signup from './Component/Login/signup';
import Project from './Component/Project/Project';
import Dashboard from './Component/Dashboard/Dashboard';
import Task from './Component/Task/Task';
import ProjectDetails from "./Component/Project/ProjectDetails";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/project" element={<Project />} />
        <Route path="/projectdetails/:id" element={<ProjectDetails />} />
        <Route path="/task/:projectId" element={<Task />} />
      </Routes>
    </Router>
  );
};

export default App; 
import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, Check, Calendar, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dueDate: "",
    priority: "medium",
    status: "active"
  });

  useEffect(() => {
    const stored = localStorage.getItem("taskforge_projects");
    if (stored) {
      try {
        setProjects(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse projects from localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("taskforge_projects", JSON.stringify(projects));
  }, [projects]);

  const openModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        description: project.description,
        dueDate: project.dueDate,
        priority: project.priority,
        status: project.status
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: "",
        description: "",
        dueDate: "",
        priority: "medium",
        status: "active"
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({
      name: "",
      description: "",
      dueDate: "",
      priority: "medium",
      status: "active"
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProject) {
      setProjects(projects.map(p =>
        p.id === editingProject.id
          ? { ...editingProject, ...formData }
          : p
      ));
    } else {
      const newProject = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      setProjects([...projects, newProject]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    setProjects(projects.filter(p => p.id !== id));
    setDeleteConfirm(null);
  };

  const toggleStatus = (project) => {
    setProjects(projects.map(p =>
      p.id === project.id
        ? { ...p, status: p.status === "active" ? "completed" : "active" }
        : p
    ));
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const priorityColors = {
    low: "text-blue-400 bg-blue-400/10",
    medium: "text-yellow-400 bg-yellow-400/10",
    high: "text-red-400 bg-red-400/10"
  };

  const priorityIcons = {
    low: "↓",
    medium: "→",
    high: "↑"
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">Projects</h1>
            <p className="text-zinc-400 mt-1">Manage your project portfolio</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            {["all", "active", "completed"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-4 py-2 rounded-lg capitalize transition-colors",
                  statusFilter === status
                    ? "bg-sky-500 text-white"
                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-lg">
              {searchQuery || statusFilter !== "all"
                ? "No projects match your filters"
                : "No projects yet. Create your first one!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <div
                key={project.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                      {project.name}
                    </h3>
                    <p className="text-zinc-400 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleStatus(project)}
                    className={cn(
                      "ml-2 p-1.5 rounded transition-colors flex-shrink-0",
                      project.status === "completed"
                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                    )}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                    priorityColors[project.priority]
                  )}>
                    <Flag className="w-3 h-3" />
                    {project.priority}
                  </span>

                  {project.dueDate && (
                    <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => openModal(project)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(project.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <h2 className="text-xl font-semibold text-zinc-100">
                  {editingProject ? "Edit Project" : "New Project"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-zinc-800 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-colors"
                    placeholder="Enter project name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-colors resize-none"
                    placeholder="Project description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
                  >
                    {editingProject ? "Save Changes" : "Create Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                Delete Project
              </h3>
              <p className="text-zinc-400 mb-6">
                Are you sure you want to delete this project? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
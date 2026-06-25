import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, CheckCircle2, Users, FolderKanban, Plus, Activity, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    teamMembers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [projectProgress, setProjectProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);

      // Load stats
      const { data: projects } = await supabase
        .from("projects")
        .select("id");
      
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, status, completed");
      
      const { data: users } = await supabase
        .from("profiles")
        .select("id");

      const activeTasks = tasks?.filter(t => !t.completed && t.status !== "completed").length || 0;
      const completedTasks = tasks?.filter(t => t.completed || t.status === "completed").length || 0;

      setStats({
        totalProjects: projects?.length || 0,
        activeTasks,
        completedTasks,
        teamMembers: users?.length || 0
      });

      // Load recent activity
      const { data: activity } = await supabase
        .from("tasks")
        .select("id, title, status, updated_at, project_id")
        .order("updated_at", { ascending: false })
        .limit(5);

      setRecentActivity(activity || []);

      // Load project progress
      const { data: projectsWithTasks } = await supabase
        .from("projects")
        .select("id, name, tasks(id, completed, status)")
        .limit(3);

      const progressData = projectsWithTasks?.map(project => {
        const totalTasks = project.tasks?.length || 0;
        const completedTasksCount = project.tasks?.filter(t => t.completed || t.status === "completed").length || 0;
        const progress = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

        return {
          id: project.id,
          name: project.name,
          progress,
          completedTasks: completedTasksCount,
          totalTasks
        };
      }) || [];

      setProjectProgress(progressData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: FolderKanban,
      color: "text-sky-500"
    },
    {
      title: "Active Tasks",
      value: stats.activeTasks,
      icon: Activity,
      color: "text-sky-500"
    },
    {
      title: "Completed",
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: "text-emerald-500"
    },
    {
      title: "Team Members",
      value: stats.teamMembers,
      icon: Users,
      color: "text-sky-500"
    }
  ];

  const quickActions = [
    {
      title: "New Project",
      description: "Create a new project",
      icon: FolderKanban,
      onClick: () => navigate("/projects/new")
    },
    {
      title: "New Task",
      description: "Add a task to a project",
      icon: Plus,
      onClick: () => navigate("/tasks/new")
    },
    {
      title: "View All Projects",
      description: "Browse all projects",
      icon: LayoutDashboard,
      onClick: () => navigate("/projects")
    }
  ];

  function getActivityIcon(status) {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "in_progress":
        return <Activity className="w-4 h-4 text-sky-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  }

  function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's what's happening with your projects.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-sky-500/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <TrendingUp className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-500" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              ) : (
                recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/tasks/${item.id}`)}
                  >
                    <div className="mt-1">{getActivityIcon(item.status)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{item.title}</p>
                      <p className="text-sm text-gray-400 capitalize">{item.status?.replace("_", " ")}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatRelativeTime(item.updated_at)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="w-full flex items-start gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-sky-500/50 transition-all text-left"
                >
                  <action.icon className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-gray-400">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Project Progress */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-sky-500" />
            Project Progress
          </h2>
          <div className="space-y-6">
            {projectProgress.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No projects yet</p>
            ) : (
              projectProgress.map((project) => (
                <div
                  key={project.id}
                  className="cursor-pointer hover:bg-gray-800/50 p-4 rounded-lg transition-colors"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">{project.name}</h3>
                    <span className="text-sm text-gray-400">
                      {project.completedTasks} / {project.totalTasks} tasks
                    </span>
                  </div>
                  <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className="text-sm font-semibold text-sky-500">{project.progress}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
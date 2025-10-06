'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { userAPI, taskAPI } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  startDate: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  assignedTo: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  type: 'daily' | 'form';
  createdAt: string;
  updatedAt: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [usersResponse, tasksResponse] = await Promise.all([
        userAPI.getAllUsers({ role: 'user' }),
        taskAPI.getAllTasks(),
      ]);

      if (usersResponse.success && usersResponse.data) {
        const users = usersResponse.data.map((u: any) => ({
          id: u._id || u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          startDate: u.startDate,
        }));
        setEmployees(users);
      }

      if (tasksResponse.success && tasksResponse.data) {
        setAllTasks(tasksResponse.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setEmployees([]);
      setAllTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Get today's tasks (due today) - remove duplicates by title and description
  const getTodaysTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysTasksFiltered = allTasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate >= today && taskDate < tomorrow;
    });

    // Remove duplicates by grouping tasks with same title and description
    const uniqueTasks = todaysTasksFiltered.reduce((acc: Task[], current) => {
      const existing = acc.find(task =>
        task.title === current.title && task.description === current.description
      );
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, []);

    return uniqueTasks;
  };

  // Get basic stats
  const getStats = () => {
    const totalEmployees = employees.length;
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'completed').length;
    const pendingTasks = allTasks.filter(t => t.status === 'pending').length;
    const todaysTasks = getTodaysTasks();

    return {
      totalEmployees,
      totalTasks,
      completedTasks,
      pendingTasks,
      todaysTasks: todaysTasks.length,
    };
  };

  const stats = getStats();
  const todaysTasks = getTodaysTasks();

  return (
    <ProtectedRoute requiredRole="admin">
      <Layout>
        <div className="space-y-6">
          {/* Enhanced Welcome Section */}
          <div className="glass-card p-8 rounded-2xl relative overflow-hidden bg-gradient-to-br from-surface via-surface to-accent/5">
            {/* Enhanced background elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-accent/15 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-accent/5 to-transparent rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-8 mb-6 lg:mb-0">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-xl shadow-accent/20">
                  <span className="text-3xl">👨‍💼</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-text-primary mb-2 bg-gradient-to-r from-text-primary to-accent bg-clip-text">
                    Welcome back, {user?.name}
                  </h1>
                  <p className="text-text-secondary text-xl font-medium">
                    Here's what's happening with your team today
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse shadow-lg shadow-success/30"></div>
                      <span className="text-success text-sm font-semibold">System Online</span>
                    </div>
                    <div className="w-1 h-1 bg-text-muted rounded-full"></div>
                    <span className="text-text-muted text-sm">Admin Dashboard</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2 bg-surface/30 backdrop-blur-sm rounded-xl p-4 border border-accent/10">
                <div className="text-text-primary font-bold text-lg">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-text-muted text-base font-medium">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-accent text-sm font-medium">
                  {new Date().getFullYear()}
                </div>
              </div>
            </div>
          </div>



          {/* Today's Tasks Section */}
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Today's Tasks</h2>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {todaysTasks.slice(0, 4).map((task) => (
                  <div key={task._id} className="flex-shrink-0 w-64 p-4 rounded-xl bg-surface border border-accent/10 hover:border-accent/20 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <span className={`status-badge text-xs ${task.status === 'completed' ? 'status-completed' :
                          task.status === 'in-progress' ? 'status-in-progress' : 'status-pending'
                        }`}>
                        {task.status.replace('-', ' ')}
                      </span>
                      <span className="text-text-muted text-xs">
                        {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="font-medium text-text-primary mb-2 line-clamp-2">{task.title}</h3>
                    <p className="text-text-muted text-sm line-clamp-3">{task.description}</p>
                    <div className="mt-3 pt-3 border-t border-accent/10">
                      <span className={`text-xs px-2 py-1 rounded ${task.type === 'daily' ? 'bg-info/20 text-info' : 'bg-warning/20 text-warning'
                        }`}>
                        {task.type}
                      </span>
                    </div>
                  </div>
                ))}

                {/* View All Tasks Card */}
                <div
                  className="flex-shrink-0 w-64 p-4 rounded-xl bg-gradient-accent hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => window.location.href = '/admin/tasks'}
                >
                  <div className="flex flex-col items-center justify-center h-full text-white text-center">
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📋</div>
                    <h3 className="font-semibold mb-2">View All Tasks</h3>
                    <p className="text-white/80 text-sm">
                      Manage all {stats.totalTasks} tasks
                    </p>
                    <div className="mt-3 flex items-center text-sm">
                      <span>Go to Tasks</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Empty State */}
                {todaysTasks.length === 0 && (
                  <div className="flex-shrink-0 w-64 p-4 rounded-xl bg-surface border border-accent/10 flex flex-col items-center justify-center text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-text-muted text-sm">No tasks due today</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Access Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-text-primary">Quick Access</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => window.location.href = '/admin/tasks'}
                className="glass-card p-4 rounded-xl hover:border-accent/30 transition-all text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📋</div>
                <div className="text-text-primary font-medium text-sm">Tasks</div>
              </button>
              <button
                onClick={() => window.location.href = '/admin/employees'}
                className="glass-card p-4 rounded-xl hover:border-accent/30 transition-all text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">👥</div>
                <div className="text-text-primary font-medium text-sm">Employees</div>
              </button>
              <button
                onClick={() => window.location.href = '/admin/resources'}
                className="glass-card p-4 rounded-xl hover:border-accent/30 transition-all text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📁</div>
                <div className="text-text-primary font-medium text-sm">Resources</div>
              </button>
              <button
                onClick={() => window.location.href = '/admin/feedback'}
                className="glass-card p-4 rounded-xl hover:border-accent/30 transition-all text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📝</div>
                <div className="text-text-primary font-medium text-sm">Feedback</div>
              </button>
            </div>
          </div>


        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
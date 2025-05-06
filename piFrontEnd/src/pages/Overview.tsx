import React, { useState } from 'react';
import { 
  AlertCircle, 
  UserCheck, 
  Activity, 
  Calendar, 
  Users, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Flag,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface OverviewProps {
  stats: {
    totalUsers?: number;
    activeExperts?: number;
    pendingApplications?: number;
    activeReports?: number;
  };
  users: any[];
  reports: any[];
}

// Helper function to get recent users
const getRecentUsers = (users: any[], limit = 5) => {
  return [...users]
    .sort((a, b) => new Date(b.dateInscription).getTime() - new Date(a.dateInscription).getTime())
    .slice(0, limit);
};

// Helper function to get pending reports
const getPendingReports = (reports: any[], limit = 5) => {
  return reports
    .filter(report => report.status.toLowerCase() === 'pending')
    .slice(0, limit);
};

const Overview: React.FC<OverviewProps> = ({ stats, users, reports }) => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  // Mock data for charts
  const dates = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const recentMonths = dates.slice(-7);

  const userGrowthData = {
    labels: recentMonths,
    datasets: [
      {
        label: 'New Users',
        data: [65, 78, 90, 115, 130, 167, stats.totalUsers],
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const expertApplicationsData = {
    labels: recentMonths,
    datasets: [
      {
        label: 'Expert Applications',
        data: [12, 19, 15, 17, 21, 25, stats.pendingApplications],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.7)',
      },
    ],
  };

  const userActivityData = {
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        data: [85, 15],
        backgroundColor: [
          'rgba(52, 211, 153, 0.8)',
          'rgba(209, 213, 219, 0.8)',
        ],
        borderColor: [
          'rgb(52, 211, 153)',
          'rgb(209, 213, 219)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const recentUsers = getRecentUsers(users);
  const pendingReports = getPendingReports(reports);

  return (
    <div className="p-6">
      {/* Key Performance Indicators */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-indigo-100">User Growth</p>
                <p className="text-3xl font-bold mt-2">+24%</p>
              </div>
              <div className="bg-indigo-400 bg-opacity-30 p-2 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span className="text-xs">12% increase from last month</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-emerald-100">Session Completion</p>
                <p className="text-3xl font-bold mt-2">91%</p>
              </div>
              <div className="bg-emerald-400 bg-opacity-30 p-2 rounded-lg">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span className="text-xs">4% increase from last month</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-xl text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-amber-100">Expert Applications</p>
                <p className="text-3xl font-bold mt-2">{stats.pendingApplications}</p>
              </div>
              <div className="bg-amber-400 bg-opacity-30 p-2 rounded-lg">
                <UserCheck className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span className="text-xs">3 new applications today</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 rounded-xl text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-rose-100">Open Reports</p>
                <p className="text-3xl font-bold mt-2">{stats.activeReports}</p>
              </div>
              <div className="bg-rose-400 bg-opacity-30 p-2 rounded-lg">
                <Flag className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              <span className="text-xs">2 reports resolved today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-gray-900">User Growth</h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => setTimeRange('day')}
                className={`px-3 py-1 text-xs rounded-md ${
                  timeRange === 'day' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Day
              </button>
              <button 
                onClick={() => setTimeRange('week')}
                className={`px-3 py-1 text-xs rounded-md ${
                  timeRange === 'week' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
              <button 
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1 text-xs rounded-md ${
                  timeRange === 'month' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Month
              </button>
            </div>
          </div>
          <div className="h-64">
            <Line 
              data={userGrowthData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false,
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* User Activity Doughnut */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-6">User Activity</h3>
          <div className="h-64 flex justify-center items-center">
            <Doughnut 
              data={userActivityData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  }
                },
                cutout: '70%'
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Expert Applications Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Expert Applications</h3>
          <div className="h-64">
            <Bar 
              data={expertApplicationsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false,
                  }
                }
              }}
            />
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-gray-900">System Status</h3>
            <button className="text-indigo-600 hover:text-indigo-800">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                <span className="text-sm text-gray-700">Authentication</span>
              </div>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                <span className="text-sm text-gray-700">Database</span>
              </div>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                <span className="text-sm text-gray-700">API Service</span>
              </div>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-yellow-500 mr-3"></div>
                <span className="text-sm text-gray-700">File Storage</span>
              </div>
              <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">Degraded</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                <span className="text-sm text-gray-700">Notification System</span>
              </div>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-gray-900">Recent Users</h3>
            <a href="#" className="text-sm text-indigo-600 hover:text-indigo-900">View all</a>
          </div>
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    src={`http://localhost:3000${user.profileImagePath}`} 
                    alt={user.firstName} 
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.firstName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(user.dateInscription).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-gray-900">Pending Reports</h3>
            <a href="#" className="text-sm text-indigo-600 hover:text-indigo-900">View all</a>
          </div>
          <div className="space-y-4">
            {pendingReports.map((report) => (
              <div key={report.id || report._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Report against {report.reportedUser?.firstName}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">{report.reason}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(report.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {pendingReports.length === 0 && (
              <div className="flex justify-center items-center py-6 text-gray-500">
                <p>No pending reports</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
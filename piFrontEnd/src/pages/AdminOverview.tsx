import React, { useState } from 'react';
import {  
  Home, 
  Users, 
  AlertTriangle,
  Shield,
  Search,
  Bell,
  CheckCircle2,
  XCircle,
  Eye,
  UserCheck,
  Flag,
  Ban,
  Clock,
  MessageSquare
} from 'lucide-react';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string, details: { duration?: number; message?: string }) => void;
  reportedUser: string;
}

const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, onAction, reportedUser }) => {
  const [selectedAction, setSelectedAction] = useState<'ban' | 'suspend' | 'warn' | null>(null);
  const [suspensionDuration, setSuspensionDuration] = useState(1);
  const [warningMessage, setWarningMessage] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Take Action Against {reportedUser}
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => setSelectedAction('ban')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg border ${
                selectedAction === 'ban'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Ban className="h-5 w-5" />
              <span>Permanent Ban</span>
            </button>
            
            <button
              onClick={() => setSelectedAction('suspend')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg border ${
                selectedAction === 'suspend'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Clock className="h-5 w-5" />
              <span>Temporary Suspension</span>
            </button>

            <button
              onClick={() => setSelectedAction('warn')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg border ${
                selectedAction === 'warn'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              <span>Send Warning</span>
            </button>
          </div>

          {selectedAction === 'suspend' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suspension Duration (days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={suspensionDuration}
                onChange={(e) => setSuspensionDuration(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          {selectedAction === 'warn' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warning Message
              </label>
              <textarea
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter warning message..."
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedAction) {
                  onAction(selectedAction, {
                    duration: suspensionDuration,
                    message: warningMessage
                  });
                }
              }}
              disabled={!selectedAction || (selectedAction === 'warn' && !warningMessage)}
              className={`px-4 py-2 rounded-md text-white ${
                !selectedAction || (selectedAction === 'warn' && !warningMessage)
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              Confirm Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminOverview = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'experts' | 'reports'>('users');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const users = [
    {
      id: 1,
      name: "Sarah Miller",
      email: "sarah.miller@example.com",
      location: "Paris, France",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      status: "active",
      joinDate: "2024-02-15",
      expertApplication: {
        status: "pending",
        skills: ["JavaScript", "React", "Node.js"],
        experience: "5 years of development experience",
        submitted: "2024-03-01"
      }
    },
    {
      id: 2,
      name: "John Cooper",
      email: "john.cooper@example.com",
      location: "London, UK",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      status: "active",
      joinDate: "2024-01-20",
      expertApplication: null
    },
    {
      id: 3,
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      location: "Barcelona, Spain",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      status: "suspended",
      joinDate: "2024-02-01",
      expertApplication: {
        status: "approved",
        skills: ["Spanish", "Teaching", "Translation"],
        experience: "10 years of language teaching",
        submitted: "2024-02-15"
      }
    }
  ];

  const reports = [
    {
      id: 1,
      reporter: {
        name: "John Cooper",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
      },
      reported: {
        name: "Alex Thompson",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
      },
      reason: "Inappropriate behavior during session",
      details: "User was consistently late and unprofessional",
      date: "2024-03-01",
      status: "pending"
    },
    {
      id: 2,
      reporter: {
        name: "Maria Garcia",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
      },
      reported: {
        name: "Sarah Miller",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
      },
      reason: "Misrepresented skill level",
      details: "Claimed to be expert but showed beginner level knowledge",
      date: "2024-02-28",
      status: "resolved"
    }
  ];

  const stats = {
    totalUsers: 1250,
    activeExperts: 45,
    pendingApplications: 12,
    activeReports: 8
  };

  const handleExpertApproval = (userId: number, approved: boolean) => {
    console.log(`Expert application ${approved ? 'approved' : 'rejected'} for user ${userId}`);
    // Here you would typically make an API call to update the status
  };

  const handleReportAction = (reportId: number, action: string, details: { duration?: number; message?: string }) => {
    console.log(`Taking action on report ${reportId}:`, { action, details });
    // Here you would typically make an API call to apply the action
    setShowActionModal(false);
    setSelectedReport(null);
  };

  const handleReportResolution = (reportId: number, action: 'resolve' | 'dismiss') => {
    console.log(`Report ${reportId} ${action}d`);
    // Here you would typically make an API call to update the report status
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600 mr-2" />
              <span className="text-xl font-semibold text-indigo-600">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button className="relative p-2 text-gray-400 hover:text-indigo-500">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop"
                alt="Admin"
                className="h-8 w-8 rounded-full cursor-pointer"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-[calc(100vh-4rem)] bg-white border-r border-gray-200">
          <nav className="mt-8 space-y-1 px-4">
            <a href="#" className="flex items-center px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
              <Home className="h-5 w-5 mr-3" />
              Overview
            </a>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center px-4 py-2 w-full rounded-lg ${
                activeTab === 'users' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              <Users className="h-5 w-5 mr-3" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('experts')}
              className={`flex items-center px-4 py-2 w-full rounded-lg ${
                activeTab === 'experts' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              <UserCheck className="h-5 w-5 mr-3" />
              Expert Applications
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center px-4 py-2 w-full rounded-lg ${
                activeTab === 'reports' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              <Flag className="h-5 w-5 mr-3" />
              Reports
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-gray-500 text-sm font-medium">Active Experts</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.activeExperts}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-gray-500 text-sm font-medium">Pending Applications</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.pendingApplications}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-gray-500 text-sm font-medium">Active Reports</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-2">{stats.activeReports}</p>
            </div>
          </div>

          {/* Content based on active tab */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeTab === 'users' && 'User Management'}
                {activeTab === 'experts' && 'Expert Applications'}
                {activeTab === 'reports' && 'Report Management'}
              </h2>
            </div>

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="divide-y divide-gray-200">
                {users.map((user) => (
                  <div key={user.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                      <p className="text-sm text-gray-500">Joined: {user.joinDate}</p>
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Expert Applications Tab */}
            {activeTab === 'experts' && (
              <div className="divide-y divide-gray-200">
                {users.filter(user => user.expertApplication).map((user) => (
                  <div key={user.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-10 w-10 rounded-full"
                        />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.location}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.expertApplication?.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : user.expertApplication?.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.expertApplication?.status}
                      </span>
                    </div>
                    <div className="ml-14">
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700">Skills</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {user.expertApplication?.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700">Experience</h4>
                        <p className="mt-1 text-sm text-gray-600">{user.expertApplication?.experience}</p>
                      </div>
                      {user.expertApplication?.status === 'pending' && (
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleExpertApproval(user.id, true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleExpertApproval(user.id, false)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <div key={report.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-2">
                          <img
                            src={report.reporter.avatar}
                            alt={report.reporter.name}
                            className="h-8 w-8 rounded-full"
                          />
                          <div>
                            <p className="text-xs text-gray-500">Reporter</p>
                            <p className="text-sm font-medium text-gray-900">{report.reporter.name}</p>
                          </div>
                        </div>
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div className="flex items-center space-x-2">
                          <img
                            src={report.reported.avatar}
                            alt={report.reported.name}
                            className="h-8 w-8 rounded-full"
                          />
                          <div>
                            <p className="text-xs text-gray-500">Reported User</p>
                            <p className="text-sm font-medium text-gray-900">{report.reported.name}</p>
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="ml-10">
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700">Reason</h4>
                        <p className="mt-1 text-sm text-gray-600">{report.reason}</p>
                      </div>
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700">Details</h4>
                        <p className="mt-1 text-sm text-gray-600">{report.details}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">Reported on: {report.date}</p>
                        {report.status === 'pending' && (
                          <div className="flex space-x-4">
                            <button
                              onClick={() => {
                                setSelectedReport(report);
                                setShowActionModal(true);
                              }}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                              Take Action
                            </button>
                            <button
                              onClick={() => handleReportResolution(report.id, 'dismiss')}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && selectedReport && (
        <ActionModal
          isOpen={showActionModal}
          onClose={() => {
            setShowActionModal(false);
            setSelectedReport(null);
          }}
          onAction={(action, details) => handleReportAction(selectedReport.id, action, details)}
          reportedUser={selectedReport.reported.name}
        />
      )}
    </div>
  );
};

export default AdminOverview;
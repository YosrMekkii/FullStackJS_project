import React, { useState,useEffect } from 'react';
import axios from 'axios';
import UserModal from './UserModel'; // Assure-toi que le chemin est correct

import {
  Users, 
  AlertTriangle,
  Shield,
  Search,
  Bell,
  CheckCircle,
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

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'experts' | 'reports'>('users');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [user, setUser] = useState<any[]>([]);


  useEffect(() => {
  const storedUserString = localStorage.getItem("user") || sessionStorage.getItem("user");

  if (storedUserString) {
    try {
      const parsedUser = JSON.parse(storedUserString);
      setUser(parsedUser);
      setAdminId(parsedUser.id); // <-- récupération de l'ID
    } catch (error) {
      console.error("Erreur lors du parsing des données utilisateur :", error);
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    }
  }
}, []);


  
  const handleVerifyCertificate = async (application: any) => {
    try {
      // Envoie l'ID de l'application pour vérifier le certificat
      const verifyRes = await fetch(`http://localhost:3000/api/expert-applications/verify-certificate/${application._id}`, {
        method: 'GET', // Utilise GET, puisque tu récupères des informations avec l'ID
      });
  
      if (!verifyRes.ok) {
        throw new Error('Erreur de vérification du certificat');
      }
  
      const result = await verifyRes.json();
  
      // Met à jour l'état avec le résultat de vérification
      const updatedApplications = applications.map((a: any) =>
        a._id === application._id ? { ...a, verificationResult: result } : a
      );
  
      setApplications(updatedApplications);
    } catch (error) {
      console.error('Erreur de vérification:', error);
      // Optionnel: Afficher un message d'erreur à l'utilisateur
      alert('Une erreur est survenue lors de la vérification du certificat.');
    }
  };
  
  



  // Ouvre la modale avec l'utilisateur sélectionné
const handleOpenModal = (user: any) => {
  setSelectedUser(user);
  setIsModalOpen(true);
};

// Ferme la modale
const handleCloseModal = () => {
  setIsModalOpen(false);
  setSelectedUser(null);
};
  
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/users");
      console.log("All Users Data:", response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  useEffect(() => {
    
  
    const fetchTotalUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/users/total/count");
        setTotalUsers(response.data.totalUsers);
      } catch (error) {
        console.error("Error fetching total users:", error);
      }
    };
  
    const fetchReports = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/reports");
        console.log("All Reports Data:", response.data);
        setReports(response.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };
  
    const fetchTotalReports = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/reports/total/count");
        setTotalReports(response.data.totalReports);
      } catch (error) {
        console.error("Error fetching total reports:", error);
      }
    };
    /*const fetchExpertApplications = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/expert-applications/applications");
        console.log("Fetched Expert Applications:", response.data);
        setApplications(response.data); // ce n'est plus "users", mais "applications"
      } catch (error) {
        console.error("Error fetching expert applications:", error);
      }
    };*/
    
  
    // Appelle toutes les fonctions en parallèle
    fetchUsers();
    fetchTotalUsers();
    fetchReports();
    fetchTotalReports();
    fetchExpertApplications();
  }, []);
  


  const stats = {
    totalUsers: totalUsers,
    activeExperts: 45,
    pendingApplications: 12,
    activeReports: totalReports
  };
  const fetchExpertApplications = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/expert-applications/applications");
      console.log("Fetched Expert Applications:", response.data);
      setApplications(response.data); // ce n'est plus "users", mais "applications"
    } catch (error) {
      console.error("Error fetching expert applications:", error);
    }
  };
  

const handleExpertApproval = async (applicationId: string, approved: boolean) => {
  if (!adminId) {
    console.error("Admin ID non défini");
    return;
  }

  try {
    const status = approved ? 'approved' : 'rejected';

    await axios.put(`http://localhost:3000/api/expert-applications/review/${applicationId}`, {
      status,
      adminComment: approved
        ? "Demande approuvée par l'administrateur."
        : "Demande rejetée par l'administrateur.",
      adminId
    });

    console.log(`Expert application ${status} for application ${applicationId}`);
    fetchExpertApplications();
  } catch (error) {
    console.error("Error updating expert application:", error);
  }
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
            src={`http://localhost:3000${user.profileImagePath}`}  // Chemin de l'image de l'utilisateur
            alt={user.firstName}  // Utilisation du prénom de l'utilisateur pour le texte alternatif
            className="h-10 w-10 rounded-full"
          />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{user.firstName}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                      <p className="text-sm text-gray-500">Joined: {user.dateInscription}</p>
                      <button
  className="text-indigo-600 hover:text-indigo-900"
  onClick={() => {
    handleOpenModal(user)
    setShowUserModal(true);
  }}
>
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
    {applications.map((application) => (
      <div key={application._id} className="p-6 hover:bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <img
              src={`http://localhost:3000${application.user.profileImagePath}`}
              alt={application.user.firstName}
              className="h-10 w-10 rounded-full"
            />
            <div>
              <h3 className="text-sm font-medium text-gray-900">{application.user.firstName}</h3>
              <p className="text-sm text-gray-500">{application.user.country}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            application.status === 'approved'
              ? 'bg-green-100 text-green-800'
              : application.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {application.status}
          </span>
        </div>

        <div className="ml-14">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700">Motivation</h4>
            <p className="mt-1 text-sm text-gray-600">{application.motivation}</p>
          </div>

          {application.documentPath && (
  <div className="mb-4">
    <h4 className="text-sm font-medium text-gray-700">Document de certification</h4>
    <a
      href={`http://localhost:3000/${application.documentPath.replace(/\\/g, '/')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 text-sm text-blue-600 hover:underline block"
    >
      {application.documentFilename || 'Voir le document'}
    </a>

    <button
      onClick={() => handleVerifyCertificate(application)}  // Ici, tu passes l'application entière
      className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
    >
      Vérifier le certificat
    </button>

    {/* Affiche le résultat de la vérification */}
    {application.verificationResult && (
  <div className="mt-2 text-sm">
    {application.verificationResult.valid ? (
      <p className="text-green-600">✅ Certificat valide</p>
    ) : (
      <>
        <p className="text-red-600">❌ Certificat invalide</p>
        {application.verificationResult.extrait && (
          <p className="text-gray-600 italic">Extrait détecté : {application.verificationResult.extrait}</p>
        )}
        {application.verificationResult.erreurVision && (
          <p className="text-gray-500">Erreur : {JSON.stringify(application.verificationResult.erreurVision)}</p>
        )}
      </>
    )}
  </div>
)}
  </div>
)}

          {application.status === 'pending' && (
            <div className="flex space-x-4">
              <button
                onClick={() => handleExpertApproval(application._id, true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </button>
              <button
                onClick={() => handleExpertApproval(application._id, false)}
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
                            src={`http://localhost:3000${report.reporter.profileImagePath}`}  // Chemin de l'image de l'utilisateur
                            alt={report.reporter.firstName}
                            className="h-8 w-8 rounded-full"
                          />
                          <div>
                            <p className="text-xs text-gray-500">Reporter</p>
                            <p className="text-sm font-medium text-gray-900">{report.reporter.firstName}</p>
                          </div>
                        </div>
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div className="flex items-center space-x-2">
                          <img
                            src={`http://localhost:3000${report.reportedUser.profileImagePath}`}  // Chemin de l'image de l'utilisateur
                            alt={report.reportedUser.firstName}
                            className="h-8 w-8 rounded-full"
                          />
                          <div>
                            <p className="text-xs text-gray-500">Reported User</p>
                            <p className="text-sm font-medium text-gray-900">{report.reportedUser.firstName}</p>
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {report.status.toLowerCase()}
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
                        {report.status.toLowerCase() === 'pending' && (
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

      {showUserModal && selectedUser && (
  <UserModal
  isOpen={isModalOpen}
  onClose={handleCloseModal}
  user={selectedUser}
  onUserUpdated={fetchUsers}
  />
)}



      {/* Action Modal */}
      {showActionModal && selectedReport && (
        <ActionModal
          isOpen={showActionModal}
          onClose={() => {
            setShowActionModal(false);
            setSelectedReport(null);
          }}
          onAction={(action, details) => handleReportAction(selectedReport._id, action, details)}
          reportedUser={selectedReport.reported.name}
        />
      )}
    </div>
    
  );
};

export default AdminDashboard;
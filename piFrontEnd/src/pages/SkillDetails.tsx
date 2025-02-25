import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Star, 
  Clock, 
  Globe, 
  Award, 
  Users, 
  Flag,
  X,
  MessageSquare,
  UserPlus,
  ChevronRight
} from 'lucide-react';

// Import the skills data (you should move this to a separate file in a real app)
import WebDev from "../assets/webdev.jpeg";
import GraphicDesign from "../assets/6718fbb85d1152665bfafec4_Untitled design (14).jpg";
import DigitalMarketing from "../assets/Capa-do-Blog-Marketing-Digital.png";
import AI from "../assets/real-ai.jpg";
import French from "../assets/image.png";
import Marketing from "../assets/What-is-marketing.webp";

const allSkills = [
  { 
    id: 1, 
    name: "Web Development", 
    provider: "Alice Johnson", 
    category: "Tech", 
    description: "Learn how to build full-stack web applications.",
    image: WebDev,
    rating: 4.8,
    reviews: 124,
    students: 1250,
    expertise: "Expert",
    languages: ["English", "Spanish"],
    topics: ["HTML/CSS", "JavaScript", "React", "Node.js", "Database Design"],
    schedule: "Flexible",
    price: "50/hour",
    longDescription: `Master the art of web development with a comprehensive curriculum covering both front-end and back-end technologies. This course is designed for beginners and intermediate developers looking to enhance their skills.

What you'll learn:
• Modern HTML5 and CSS3 techniques
• JavaScript ES6+ and advanced concepts
• React.js and state management
• Node.js and Express.js
• Database design and implementation
• REST API development
• Authentication and security
• Deployment and hosting

The course includes hands-on projects, code reviews, and personalized feedback to ensure you're building real-world skills.`,
    providerBio: "Alice Johnson is a senior full-stack developer with 10 years of experience in web development. She has worked with major tech companies and has helped hundreds of students launch their development careers.",
    requirements: [
      "Basic understanding of HTML and CSS",
      "Familiarity with programming concepts",
      "A computer with internet access",
      "Dedication to practice and learn"
    ]
  },
  // ... other skills
];

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reason, details);
    setReason('');
    setDetails('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Report Skill</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for reporting
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select a reason</option>
              <option value="inappropriate">Inappropriate content</option>
              <option value="spam">Spam or misleading</option>
              <option value="fake">Fake profile/credentials</option>
              <option value="quality">Poor quality service</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional details
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Please provide more details about your report..."
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SkillDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [showReportModal, setShowReportModal] = useState(false);
  
  const skill = allSkills.find(s => s.id === Number(id));

  if (!skill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Skill not found</h2>
          <p className="mt-2 text-gray-600">The skill you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const handleReport = (reason: string, details: string) => {
    // Here you would typically send the report to your backend
    console.log('Report submitted:', { skillId: id, reason, details });
    setShowReportModal(false);
    // Show success message to user
    alert('Thank you for your report. We will review it shortly.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-4">{skill.name}</h1>
              <p className="text-xl text-indigo-200 mb-6">{skill.description}</p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="ml-1 font-medium">{skill.rating}</span>
                  <span className="ml-1 text-indigo-200">({skill.reviews} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-indigo-200" />
                  <span className="ml-1">{skill.students} students</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Flag className="h-5 w-5" />
              <span>Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">About This Skill</h2>
              <p className="text-gray-600 whitespace-pre-line">{skill.longDescription}</p>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Requirements</h2>
              <ul className="space-y-2">
                {skill.requirements.map((req, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <ChevronRight className="h-5 w-5 text-indigo-600 mr-2" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructor */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">About the Instructor</h2>
              <div className="flex items-start space-x-4">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
                  alt={skill.provider}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-medium">{skill.provider}</h3>
                  <p className="text-gray-600 mt-2">{skill.providerBio}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <div className="text-3xl font-bold text-gray-900 mb-6">
                ${skill.price}
                <span className="text-gray-500 text-lg font-normal">/hour</span>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-3" />
                  <span>{skill.schedule}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Globe className="h-5 w-5 mr-3" />
                  <span>{skill.languages.join(", ")}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Award className="h-5 w-5 mr-3" />
                  <span>{skill.expertise} Level</span>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 flex items-center justify-center space-x-2">
                  <UserPlus className="h-5 w-5" />
                  <span>Connect & Learn</span>
                </button>
                <button className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 flex items-center justify-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Message Instructor</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReport}
      />
    </div>
  );
};

export default SkillDetails;
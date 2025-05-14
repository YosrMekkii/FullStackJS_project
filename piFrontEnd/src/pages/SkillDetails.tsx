
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Calendar, Tag, Clock, Edit, Trash2, Heart, Flag } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ReportModal from "../components/ReportModal";

interface User {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
  profileImagePath?: string;
}

interface Skill {
  _id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  user: User;
  createdAt: string;
  updatedAt: string;
  likes: number;
  isLiked?: boolean;
}

const SkillDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // Fixed: Correctly use useNavigate hook
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [similarSkills, setSimilarSkills] = useState<Skill[]>([]);
  const [similarSkillsError, setSimilarSkillsError] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [skillToReport, setSkillToReport] = useState<Skill | null>(null);
  const isAuthenticated = !!localStorage.getItem("user") || !!sessionStorage.getItem("user");

  useEffect(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUserId(parsedUser.id);
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }

    fetchSkillDetails();
  }, [id]);

  const fetchSkillDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3000/skill/skills/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch skill details");
      }
      const data = await response.json();
      // Fetch liked skills if authenticated
      if (isAuthenticated && currentUserId) {
        const likedSkillsRes = await fetch(`http://localhost:3000/api/users/${currentUserId}/liked-skills`);
        if (likedSkillsRes.ok) {
          const likedSkills = await likedSkillsRes.json();
          data.isLiked = likedSkills.includes(data._id);
        }
      }
      setSkill(data);
      fetchSimilarSkillsByCategory(data.category);
    } catch (err) {
      setError("Failed to load skill details. Please try again later.");
      console.error("Error fetching skill:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarSkillsByCategory = async (category: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/recommendations/category/${encodeURIComponent(category)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch similar skills: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Similar skills data:", data);

      let skills = [];
      if (Array.isArray(data)) {
        skills = data;
      } else if (Array.isArray(data.similar_skills)) {
        skills = data.similar_skills;
      } else {
        throw new Error("Invalid response format from backend");
      }

      // Fetch liked status for similar skills
      if (isAuthenticated && currentUserId && skills.length > 0) {
        const likedSkillsRes = await fetch(`http://localhost:3000/api/users/${currentUserId}/liked-skills`);
        if (likedSkillsRes.ok) {
          const likedSkills = await likedSkillsRes.json();
          skills = skills.map((skill: Skill) => ({
            ...skill,
            isLiked: likedSkills.includes(skill._id),
          }));
        }
      }

      if (skills.length === 0) {
        setSimilarSkillsError("No similar skills found in this category.");
      } else {
        setSimilarSkillsError("");
      }

      setSimilarSkills(skills);
    } catch (err) {
      console.error("Error fetching similar skills:", err);
      setSimilarSkillsError("Failed to load similar skills. Please try again.");
    }
  };

  const handleDeleteSkill = async () => {
    if (window.confirm("Are you sure you want to delete this skill?")) {
      try {
        const response = await fetch(`http://localhost:3000/skill/skills/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          navigate("/marketplace");
        } else {
          throw new Error("Failed to delete skill");
        }
      } catch (err) {
        console.error("Error deleting skill:", err);
        alert("Failed to delete skill. Please try again.");
      }
    }
  };

  const handleToggleLike = async (skillId: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      const skill = similarSkills.find((s) => s._id === skillId);
      if (!skill) return;

      const isCurrentlyLiked = skill.isLiked;
      const action = isCurrentlyLiked ? "unlike" : "like";

      const response = await fetch(`http://localhost:3000/api/skills/${skillId}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ userId: currentUserId }),
      });

      if (response.ok) {
        setSimilarSkills(
          similarSkills.map((s) =>
            s._id === skillId
              ? {
                  ...s,
                  likes: isCurrentlyLiked ? s.likes - 1 : s.likes + 1,
                  isLiked: !isCurrentlyLiked,
                }
              : s
          )
        );
      } else {
        throw new Error("Failed to update like");
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      alert("Failed to update like. Please try again.");
    }
  };

  const handleOpenReportModal = (skill: Skill) => {
    setSkillToReport(skill);
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = async (reason: string, details: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!skillToReport) return;

    try {
      const response = await fetch("http://localhost:3000/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          skillId: skillToReport._id,
          reporterId: currentUserId,
          reportedUserId: skillToReport.user._id,
          reason,
          details,
        }),
      });

      if (response.ok) {
        alert("Report submitted successfully.");
      } else {
        throw new Error("Failed to submit report");
      }
    } catch (err) {
      console.error("Error submitting report:", err);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsReportModalOpen(false);
      setSkillToReport(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getUserFullName = (user: User | undefined) => {
    if (!user) return "Unknown User";
    if (user.name) return user.name;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    return "Unknown User";
  };

  const getUserInitial = (user: User | undefined) => {
    if (!user) return "?";
    if (user.name && user.name.length > 0) return user.name.charAt(0);
    if (user.firstName && user.firstName.length > 0) return user.firstName.charAt(0);
    return "?";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading skill details...</p>
        </div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error || "Skill not found"}</p>
          <button
            onClick={() => navigate("/marketplace")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const isOwner = currentUserId === skill.user?._id;
  const instructorName = getUserFullName(skill.user);
  const instructorInitial = getUserInitial(skill.user);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link
          to="/marketplace"
          className="flex items-center text-indigo-600 mb-6 font-medium hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Link>
        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-8">
          <img
            src={skill.image || "https://via.placeholder.com/1200x400?text=No+Image"}
            alt={skill.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-6 md:p-8 w-full">
              <span className="inline-block bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium mb-3">
                {skill.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{skill.title}</h1>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <div className="prose max-w-none">
                {skill.description.split("\n").map((paragraph, idx) => (
                  <p key={idx} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            {isOwner ? (
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => navigate(`/edit-skill/${skill._id}`)}
                  className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="h-5 w-5" />
                  <span>Edit Skill</span>
                </button>
                <button
                  onClick={handleDeleteSkill}
                  className="flex-1 border-2 border-red-600 text-red-600 py-3 rounded-lg hover:bg-red-50 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Delete Skill</span>
                </button>
              </div>
            ) : (
              <Link
                to={`/user/${skill.user?._id}`}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 font-medium transition-colors w-full mb-6"
              >
                <UserPlus className="h-5 w-5" />
                <span>Connect with Instructor</span>
              </Link>
            )}
            {similarSkillsError && (
              <p className="text-red-600 mb-6">{similarSkillsError}</p>
            )}
            {similarSkills.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Similar Skills</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarSkills.map((skill) => (
                    <div
                      key={`sim-${skill._id}`}
                      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px] border-l-4 border-l-indigo-500"
                    >
                      <div className="relative">
                        <img
                          src={skill.image || "https://via.placeholder.com/400x300?text=No+Image"}
                          alt={skill.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReportModal(skill);
                            }}
                            className="p-2 bg-white/80 rounded-full hover:bg-white text-gray-600 hover:text-red-500 transition-colors"
                            title="Report this skill"
                          >
                            <Flag className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <span className="text-white text-sm font-medium px-3 py-1 bg-indigo-600 rounded-full">
                            {skill.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">{skill.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{skill.description}</p>
                        <div className="flex justify-between items-center mb-4">
                          <p className="font-medium text-gray-700 flex items-center">
                            <span className="inline-block bg-gray-100 rounded-full p-1 mr-2">
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  skill.user?.name || "Unknown"
                                )}&background=random`}
                                alt="Avatar"
                                className="h-6 w-6 rounded-full"
                              />
                            </span>
                            By {skill.user?.name || "Anonymous"}
                          </p>
                          <button
                            onClick={() => handleToggleLike(skill._id)}
                            className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors"
                          >
                            <Heart
                              className={`h-5 w-5 ${skill.isLiked ? "fill-red-500 text-red-500" : ""}`}
                            />
                            <span>{skill.likes || 0}</span>
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            to={`/skills/${skill._id}`}
                            className="flex-1 text-center py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium transition-colors"
                          >
                            View Details
                          </Link>
                          <Link
                            to={
                              isAuthenticated && skill.user?._id
                                ? `/profile/${skill.user._id}`
                                : "/login"
                            }
                            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <UserPlus className="h-4 w-4" />
                            <span>Connect</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="md:w-72">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Instructor</h3>
              <Link
                to={`/user/${skill.user?._id}`}
                className="flex items-center hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xl mr-3">
                  {instructorInitial}
                </div>
                <div>
                  <p className="font-medium">{instructorName}</p>
                  <p className="text-sm text-gray-500">View Profile</p>
                </div>
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Information</h3>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500">Posted on</p>
                    <p>{formatDate(skill.createdAt)}</p>
                  </div>
                </li>
                <li className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-3 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500">Last updated</p>
                    <p>{formatDate(skill.updatedAt)}</p>
                  </div>
                </li>
                <li className="flex items-center text-gray-600">
                  <Tag className="h-5 w-5 mr-3 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p>{skill.category}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {skillToReport && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onSubmit={handleSubmitReport}
          skillTitle={skillToReport.title}
        />
      )}
    </div>
  );
};

export default SkillDetails;

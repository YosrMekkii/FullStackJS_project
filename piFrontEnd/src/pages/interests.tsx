import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Code2, Languages, Palette, Brain, Briefcase, Gamepad2, Trophy, User
} from 'lucide-react';

interface Category {
  name: string;
  icon: React.ReactNode;
  items: string[];
}

const SKILLS_CATEGORIES: Category[] = [
  {
    name: "Programming",
    icon: <Code2 className="h-6 w-6" />,
    items: [
      "JavaScript", "Python", "Java", "C++", "Ruby", "PHP", "Swift", "Go"
    ]
  },
  {
    name: "Professional",
    icon: <Briefcase className="h-6 w-6" />,
    items: [
      "Project Management", "Leadership", "Communication", "Problem Solving", "Team Building", "Agile", "Scrum", "Analytics"
    ]
  },
  {
    name: "Creative",
    icon: <Palette className="h-6 w-6" />,
    items: [
      "Graphic Design", "UI/UX Design", "Video Editing", "Photography", "Animation", "Illustration", "3D Modeling", "Motion Graphics"
    ]
  }
];

const INTERESTS_CATEGORIES: Category[] = [
  {
    name: "Technology",
    icon: <Brain className="h-6 w-6" />,
    items: [
      "AI & Machine Learning", "Blockchain", "IoT", "Cloud Computing", "Cybersecurity", "Mobile Development", "Data Science", "AR/VR"
    ]
  },
  {
    name: "Languages",
    icon: <Languages className="h-6 w-6" />,
    items: [
      "Spanish", "French", "German", "Mandarin", "Japanese", "Italian", "Korean", "Arabic"
    ]
  },
  {
    name: "Hobbies",
    icon: <Gamepad2 className="h-6 w-6" />,
    items: [
      "Gaming", "Music", "Reading", "Travel", "Cooking", "Sports", "Art", "Photography"
    ]
  }
];

function SelectionGrid({ 
  categories, 
  selectedItems, 
  onToggleItem, 
  title, 
  subtitle 
}: {
  categories: Category[];
  selectedItems: string[];
  onToggleItem: (item: string) => void;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h1>
          <p className="text-xl text-gray-600">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div key={category.name} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {category.name}
                  </h3>
                </div>
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <button
                      key={item}
                      onClick={() => onToggleItem(item)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                        selectedItems.includes(item)
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AboutMeForm({
  bio,
  setBio,
  achievements,
  setAchievements,
  onSubmit,
  loading,
  successMsg
}: {
  bio: string;
  setBio: (bio: string) => void;
  achievements: string[];
  setAchievements: (achievements: string[]) => void;
  onSubmit: () => void;
  loading: boolean;
  successMsg: string;
}) {
  const [newAchievement, setNewAchievement] = useState('');

  const handleAddAchievement = () => {
    if (newAchievement.trim()) {
      setAchievements([...achievements, newAchievement.trim()]);
      setNewAchievement('');
    }
  };

  const handleRemoveAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tell us about yourself
          </h1>
          <p className="text-xl text-gray-600">
            Share your story and highlight your achievements
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <User className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">About Me</h3>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself, your background, and what drives you..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Achievements</h3>
            </div>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  placeholder="Add an achievement..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAchievement()}
                />
                <button
                  onClick={handleAddAchievement}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span>{achievement}</span>
                    <button
                      onClick={() => handleRemoveAchievement(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onSubmit}
            disabled={loading || !bio.trim() || achievements.length === 0}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-400"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
          {successMsg && <p className="mt-4 text-green-600">{successMsg}</p>}
        </div>
      </div>
    </div>
  );
}

export function SkillsAndInterests() {
  const { id } = useParams();
  const [step, setStep] = useState<'skills' | 'about' | 'interests'>('skills');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [achievements, setAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSkillsSubmit = async () => {
    setLoading(true);
    setSuccessMsg("");
  
    try {
      const res = await fetch(`http://localhost:3000/api/users/skills/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ skills: selectedSkills })
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue");
  
      setSuccessMsg("Vos compétences ont été mises à jour !");
      setStep('about');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAboutSubmit = async () => {
    setLoading(true);
    setSuccessMsg("");
  
    try {
      const res = await fetch(`http://localhost:3000/api/users/achievements/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bio, achievements })
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue");
  
      setSuccessMsg("Votre profil a été mis à jour !");
      setStep('interests');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestsSubmit = async () => {
    setLoading(true);
    setSuccessMsg("");
  
    try {
      const res = await fetch(`http://localhost:3000/api/users/interests/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ interests: selectedInterests })
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue");
  
      setSuccessMsg("Vos intérêts ont été mis à jour !");
      
      setTimeout(() => {
        window.location.href = "http://localhost:5173/login";
      }, 1000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {step === 'skills' ? (
        <>
          <SelectionGrid
            categories={SKILLS_CATEGORIES}
            selectedItems={selectedSkills}
            onToggleItem={toggleSkill}
            title="What are your skills?"
            subtitle="Select the skills you currently possess. This helps us understand your expertise."
          />
          {selectedSkills.length > 0 && (
            <div className="fixed bottom-8 left-0 right-0 text-center">
              <button
                onClick={handleSkillsSubmit}
                disabled={loading}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors duration-200"
              >
                {loading ? "Saving..." : `Continue with ${selectedSkills.length} selected skill(s)`}
              </button>
              {successMsg && <p className="mt-4 text-green-600">{successMsg}</p>}
            </div>
          )}
        </>
      ) : step === 'about' ? (
        <AboutMeForm
          bio={bio}
          setBio={setBio}
          achievements={achievements}
          setAchievements={setAchievements}
          onSubmit={handleAboutSubmit}
          loading={loading}
          successMsg={successMsg}
        />
      ) : (
        <>
          <SelectionGrid
            categories={INTERESTS_CATEGORIES}
            selectedItems={selectedInterests}
            onToggleItem={toggleInterest}
            title="What would you like to learn?"
            subtitle="Select the topics you're interested in learning about. We'll customize your experience accordingly."
          />
          {selectedInterests.length > 0 && (
            <div className="fixed bottom-8 left-0 right-0 text-center">
              <button
                onClick={handleInterestsSubmit}
                disabled={loading}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors duration-200"
              >
                {loading ? "Saving..." : `Finish with ${selectedInterests.length} selected interest(s)`}
              </button>
              {successMsg && <p className="mt-4 text-green-600">{successMsg}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SkillsAndInterests;
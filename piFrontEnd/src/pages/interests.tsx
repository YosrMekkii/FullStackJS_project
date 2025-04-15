import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Code2, Languages, Palette
} from 'lucide-react';

interface Category {
  name: string;
  icon: React.ReactNode;
  skills: string[];
}

const CATEGORIES: Category[] = [
  {
    name: "Web Development",
    icon: <Code2 className="h-6 w-6" />,
    skills: [
      "HTML & CSS", "JavaScript", "React", "Node.js", "TypeScript", "Vue.js", "Angular", "Python Django"
    ]
  },
  {
    name: "Languages",
    icon: <Languages className="h-6 w-6" />,
    skills: [
      "Spanish", "French", "German", "Mandarin", "Japanese", "Italian", "Korean", "Arabic"
    ]
  },
  {
    name: "Design",
    icon: <Palette className="h-6 w-6" />,
    skills: [
      "UI/UX Design", "Graphic Design", "Adobe Photoshop", "Illustrator", "Figma", "Motion Graphics", "3D Modeling", "Typography"
    ]
  }
];

export function Interests() {
  const { id } = useParams(); // 👈 Récupérer l'ID de l'utilisateur depuis l'URL
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccessMsg("");
  
    try {
      const res = await fetch(`http://localhost:3000/api/users/interests/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ interests: selectedSkills })
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue");
  
      setSuccessMsg("Vos intérêts ont été mis à jour !");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            What would you like to learn?
          </h1>
          <p className="text-xl text-gray-600">
            Select the skills you're interested in. We'll update your profile accordingly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATEGORIES.map((category) => (
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
                  {category.skills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                        selectedSkills.includes(skill)
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedSkills.length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors duration-200"
            >
              {loading ? "Saving..." : `Continue with ${selectedSkills.length} selected skill(s)`}
            </button>
            {successMsg && <p className="mt-4 text-green-600">{successMsg}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default Interests;

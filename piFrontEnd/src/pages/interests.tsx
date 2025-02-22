import React, { useState } from 'react';
import { Code2, Languages, Palette, Music, Camera, BarChart as ChartBar, Brain, Dumbbell, Book } from 'lucide-react';

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
      "HTML & CSS",
      "JavaScript",
      "React",
      "Node.js",
      "TypeScript",
      "Vue.js",
      "Angular",
      "Python Django"
    ]
  },
  {
    name: "Languages",
    icon: <Languages className="h-6 w-6" />,
    skills: [
      "Spanish",
      "French",
      "German",
      "Mandarin",
      "Japanese",
      "Italian",
      "Korean",
      "Arabic"
    ]
  },
  {
    name: "Design",
    icon: <Palette className="h-6 w-6" />,
    skills: [
      "UI/UX Design",
      "Graphic Design",
      "Adobe Photoshop",
      "Illustrator",
      "Figma",
      "Motion Graphics",
      "3D Modeling",
      "Typography"
    ]
    },
];

export function Interests() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            What would you like to learn?
          </h1>
          <p className="text-xl text-gray-600">
            Select the skills you're interested in learning. We'll help you connect with the right mentors.
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
            <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors duration-200">
              Continue with {selectedSkills.length} selected skills
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export default Interests;
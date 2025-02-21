import React, { useState } from "react";
import { Camera, PlusCircle } from "lucide-react";

const PostSkill = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const skillData = {
      title,
      description,
      category,
      image,
    };
    console.log("Skill Posted:", skillData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-700 to-purple-900 text-white py-12 px-6 flex flex-col items-center">
      <div className="max-w-3xl w-full bg-white text-gray-900 p-10 rounded-3xl shadow-xl transform hover:scale-105 transition-all">
        <h2 className="text-4xl font-extrabold mb-6 text-center text-indigo-700">Share Your Skill</h2>
        <p className="text-center text-gray-600 mb-6">Inspire others by sharing what you know!</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold">Skill Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 border rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-600 shadow-sm"
              placeholder="E.g., Full-Stack Development"
              required
            />
          </div>
          <div>
            <label className="block text-lg font-semibold">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 border rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-600 shadow-sm"
              rows="5"
              placeholder="Describe your skill in detail"
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-lg font-semibold">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-4 border rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-600 shadow-sm"
              required
            >
              <option value="">Select a category</option>
              <option value="Web Development">Web Development</option>
              <option value="Graphic Design">Graphic Design</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
            </select>
          </div>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-500 p-6 rounded-lg hover:bg-indigo-50 transition">
            <label className="cursor-pointer text-indigo-700 flex items-center space-x-2">
              <Camera className="w-6 h-6" />
              <span>Upload an Image</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="hidden"
            />
            {image && <p className="text-sm text-gray-600 mt-2">{image.name}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-4 rounded-lg font-bold text-lg flex items-center justify-center space-x-2 hover:bg-indigo-800 transition shadow-md"
          >
            <PlusCircle className="w-6 h-6" />
            <span>Post Skill</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostSkill;

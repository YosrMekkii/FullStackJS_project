import React, { useState,useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, PlusCircle } from "lucide-react";

interface UserType {
  _id: string;
  name?: string;
  email?: string;
}

const PostSkill = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: ""
  });
  const [user, setUser] = useState<UserType | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
const [selectedImage, setSelectedImage] = useState<File | null>(null);
const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("👤 Utilisateur récupéré depuis localStorage/sessionStorage :", parsedUser); // 👈 ici
        setUser(parsedUser);
      } catch (error) {
        console.error("Erreur parsing user :", error);
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
      }
    }
  }, []);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData({ ...formData, image: reader.result as string }); // on envoie l'image base64
      };
      reader.readAsDataURL(file);
    }
  };
  
  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      if (!user || !(user as any).id) throw new Error("Utilisateur non connecté");
  
      const dataToSend = {
        ...formData,
        user: (user as any).id
      };
  
      const response = await fetch('http://localhost:3000/skill/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSend)
      });
  
      if (!response.ok) {
        const errRes = await response.json();
        throw new Error(errRes.error || 'Failed to create skill');
      }
  
      navigate('/marketplace');
    } catch (error: any) {
      console.error('Error creating skill:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-700 to-purple-900 text-white py-12 px-6 flex flex-col items-center">
      <div className="max-w-3xl w-full bg-white text-gray-900 p-10 rounded-3xl shadow-xl transform hover:scale-105 transition-all">
        <h2 className="text-4xl font-extrabold mb-6 text-center text-indigo-700">Share Your Skill</h2>
        <p className="text-center text-gray-600 mb-6">Inspire others by sharing what you know!</p>
  
        <form onSubmit={handleSubmit} className="space-y-6">
  
          {/* Titre */}
          <div>
            <label className="block text-lg font-semibold">Skill Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-4 border rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-600 shadow-sm"
              placeholder="E.g., Full-Stack Development"
              required
            />
          </div>
  
          {/* Description */}
          <div>
            <label className="block text-lg font-semibold">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-4 border rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-600 shadow-sm"
              rows={5}
              placeholder="Describe your skill in detail"
              required
            ></textarea>
          </div>
  
          {/* Catégorie */}
          <div>
            <label className="block text-lg font-semibold">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-4 border rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-600 shadow-sm"
              required
            >
              <option value="">Select a category</option>
              <option value="Tech">Tech</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Language">Language</option>
            </select>
          </div>
  
          {/* Image Upload stylé */}
          <div>
            <label className="block text-lg font-semibold">Skill Image</label>
            <div className="flex flex-col items-center space-y-4 mt-2">
              <div
                onClick={handleImageClick}
                className="relative cursor-pointer group"
              >
                {imagePreview ? (
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-dashed border-gray-300 flex items-center justify-center group-hover:border-indigo-500 transition-colors">
                    <Camera className="h-12 w-12 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black bg-opacity-50 text-white text-sm py-1 px-3 rounded-full">
                    Upload Image
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="text-sm text-gray-500 text-center">
                Click the circle to upload a skill image
              </p>
            </div>
          </div>
  
          {/* Boutons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/skills')}
              className="px-6 py-4 border-2 border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-bold text-lg flex items-center justify-center space-x-2 hover:bg-indigo-800 transition shadow-md disabled:bg-indigo-400"
            >
              <PlusCircle className="w-6 h-6" />
              <span>{loading ? 'Posting...' : 'Post Skill'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default PostSkill;
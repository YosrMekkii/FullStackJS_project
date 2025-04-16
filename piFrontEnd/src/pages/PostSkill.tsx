import { useNavigate } from "react-router-dom";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Camera, PlusCircle } from "lucide-react";
import axios from "axios";


const PostSkill: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  
  // Pour récupérer l'ID de l'utilisateur connecté
  const storedUser =
  sessionStorage.getItem("user") || localStorage.getItem("user");

const userId = storedUser ? JSON.parse(storedUser).id : null;

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setImage(file);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        // Assurez-vous que le résultat est une chaîne (URL de données)
        const result = reader.result;
        if (typeof result === 'string') {
          setImagePreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!userId) {
      setError("Vous devez être connecté pour poster une compétence");
      return;
    }
    
    try {
      setIsLoading(true);
      setError("");
      
      // Créer un FormData pour envoyer les données et l'image
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("user", userId);
      
      if (image) {
        formData.append("image", image);
      }
      
      // Envoyer la requête au backend
      const response = await axios.post("http://localhost:3000/skill/skills", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          // Ajoutez ici votre token d'authentification si nécessaire
          // "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      console.log("Skill ajouté avec succès:", response.data);
      
      // Réinitialiser le formulaire
      setTitle("");
      setDescription("");
      setCategory("");
      setImage(null);
      setImagePreview(null);
      
      // Rediriger vers la page des compétences
      navigate("/marketplace");
    } catch (error) {
      console.error("Erreur lors de l'ajout de la compétence:", error);
      
      // Gérer les erreurs d'Axios de manière plus sûre au niveau du type
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || "Une erreur est survenue lors de l'ajout de votre compétence");
      } else {
        setError("Une erreur inattendue est survenue");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-700 to-purple-900 text-white py-12 px-6 flex flex-col items-center">
      <div className="max-w-3xl w-full bg-white text-gray-900 p-10 rounded-3xl shadow-xl transform hover:scale-105 transition-all">
        <h2 className="text-4xl font-extrabold mb-6 text-center text-indigo-700">Share Your Skill</h2>
        <p className="text-center text-gray-600 mb-6">Inspire others by sharing what you know!</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
  
          {/* Titre */}
          <div>
            <label className="block text-lg font-semibold">Skill Title</label>
            <input
              type="text"
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              className="w-full p-4 border rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-600 shadow-sm"
              placeholder="E.g., Full-Stack Development"
              required
            />
          </div>
  
          {/* Description */}
          <div>
            <label className="block text-lg font-semibold">Description</label>
            <textarea
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
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
              value={category}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
              className="w-full p-4 border rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-600 shadow-sm"
              required
            >
              <option value="">Select a category</option>
              <option value="Web Development">Web Development</option>
              <option value="Graphic Design">Graphic Design</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-500 p-6 rounded-lg hover:bg-indigo-50 transition">
            <label className="cursor-pointer text-indigo-700 flex items-center space-x-2">
              <Camera className="w-6 h-6" />
              <span>Upload an Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            
            {imagePreview && (
              <div className="mt-4">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="h-40 object-contain rounded"
                />
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white p-4 rounded-lg font-bold text-lg flex items-center justify-center space-x-2 shadow-md ${
              isLoading 
                ? "bg-indigo-400 cursor-not-allowed" 
                : "bg-indigo-600 hover:bg-indigo-800 transition"
            }`}
          >
            {isLoading ? (
              <span>Chargement...</span>
            ) : (
              <>
                <PlusCircle className="w-6 h-6" />
                <span>Post Skill</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostSkill;
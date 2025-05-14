import React, { useState } from 'react';
import axios from 'axios';

interface ExpertApplicationFormProps {
  userId: string | number;
  onClose: () => void;
}

const ExpertApplicationForm: React.FC<ExpertApplicationFormProps> = ({ userId, onClose }) => {
  const [motivation, setMotivation] = useState('');
  const [document, setDocument] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!motivation || !document) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userId", String(userId)); // Ensure it's a string
      formData.append("motivation", motivation);
      formData.append("document", document);

      await axios.post("http://localhost:3000/api/expert-applications", formData);

      alert("Your request has been sent!");
      onClose(); // Close the form
    } catch (error) {
      console.error("Error submitting the request:", error);
      alert("Submission failed.");
    }
  };

  return (
    <div className="p-4 border rounded bg-gray-100 mt-4">
      <h3 className="text-lg font-semibold mb-2">Request to Become an Expert</h3>
      
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-2 border mb-2 rounded"
          rows={4}
          placeholder="Motivation..."
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
        />

        <input
          type="file"
          accept=".pdf,.jpg,.png"
          onChange={(e) => setDocument(e.target.files?.[0] || null)}
          className="mb-2"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpertApplicationForm;

import React, { useState } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  status: boolean;
  dateInscription: string;
  profileImagePath: string;
  [key: string]: any;
}

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onUserUpdated: () => void;
  }

  const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, onUserUpdated }) => {
    if (!isOpen) return null;
  const [editedUser, setEditedUser] = useState<User>({ ...user });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3000/api/users/${editedUser._id}`, editedUser);
      alert("User updated!");
      onUserUpdated();
      onClose();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this user?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/users/${editedUser._id}`);
      alert("User deleted!");
      onUserUpdated();
      onClose();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[400px] space-y-4">
        <img
          src={`http://localhost:3000${user.profileImagePath}`}
          alt={user.firstName}
          className="h-20 w-20 rounded-full mx-auto"
        />
        <input name="firstName" value={editedUser.firstName} onChange={handleChange} className="w-full border p-2" />
        <input name="lastName" value={editedUser.lastName} onChange={handleChange} className="w-full border p-2" />
        <input name="email" value={editedUser.email} onChange={handleChange} className="w-full border p-2" />
        <input name="country" value={editedUser.country} onChange={handleChange} className="w-full border p-2" />
        <select name="status" value={editedUser.status ? "true" : "false"} onChange={(e) => {
          setEditedUser(prev => ({ ...prev, status: e.target.value === "true" }));
        }} className="w-full border p-2">
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <div className="flex justify-between mt-4">
          <button onClick={handleUpdate} className="bg-blue-500 text-white px-4 py-2 rounded">Update</button>
          <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Close</button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;

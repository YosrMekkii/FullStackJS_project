import '../css/ProfilePage.css';
import profile from '../assets/profile.jpg';
import React from 'react';

// Define the type for the user prop
type User = {
  name: string;
  bio: string;
  email: string;
  location: string;
  achievements: string[];
  skills: string[];
  // profilepicture?: string; // Uncomment if you use it instead of the static image
};

type ProfilePageProps = {
  user: User;
};

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  return (
    <div className="profile-container">
      <div className="hero-section">
        <div className="hero-content">
          <img
            className="profile-picture"
            src={profile /* user.profilepicture */}
            alt="Profile"
          />
          <div className="profile-info">
            <h1 className="name">{user.name}</h1>
            <p className="bio">{user.bio}</p>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="achievements-section">
        <h2 className="section-title">Achievements</h2>
        <div className="achievements-list">
          {user.achievements.map((achievement: string, index: number) => (
            <div className="achievement-card" key={index}>
              <p>{achievement}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Section */}
      <div className="skills-section">
        <h2 className="section-title">Skills</h2>
        <div className="skills-list">
          {user.skills.map((skill: string, index: number) => (
            <div className="skill-card" key={index}>
              <p>{skill}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="contact-section">
        <h2 className="section-title">Contact</h2>
        <div className="contact-info">
          <p>Email: {user.email}</p>
          <p>Location: {user.location}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

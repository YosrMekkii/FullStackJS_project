import React from "react";
import { Link } from 'react-router-dom'; // Import Link for navigation
import { ArrowRight, Search, ChevronRight, Star, Users, BookOpen, Award, Globe, Briefcase, Code, Sparkles, Target, Heart, Github, Linkedin } from 'lucide-react'; // Added Github and Linkedin icons
import dhiaImg from "../assets/DSC0003.jpg"; // Import images for team members
import khalilImg from "../assets/414d0c0a-b654-46db-9b2b-d80a1cff5a0d.jpeg";
import yosrImg from "../assets/380348815_227017787014770_2900555263838606331_n.jpg";
import khalilMtallahImg from "../assets/foxi.jpg";

const About = () => {
  const teamMembers = [
    {
      name: "Dhia Ghouma",
      role: "Full Stack Developer & Team Lead",
      image: dhiaImg,
      bio: "Passionate about creating innovative solutions and leading teams to success. Expertise in full-stack development and system architecture.",
      social: {
        github: "https://github.com/dhiaghouma",
        linkedin: "https://linkedin.com/in/dhiaghouma",
      }
    },
    {
      name: "Khalil Ayari",
      role: "Backend Developer & DevOps",
      image: khalilImg,
      bio: "Specializing in backend architecture and DevOps practices. Passionate about building scalable and maintainable systems.",
      social: {
        github: "https://github.com/khalilayari",
        linkedin: "https://linkedin.com/in/khalilayari",
      }
    },
    {
      name: "Yosr Mekki",
      role: "Frontend Developer & UI/UX Designer",
      image: yosrImg,
      bio: "Creative developer with a keen eye for design. Focused on creating beautiful and intuitive user experiences.",
      social: {
        github: "https://github.com/YosrMekkii",
        linkedin: "https://linkedin.com/in/yosrmekki",
      }
    },
    {
      name: "Khalil Mtallah",
      role: "Full Stack Developer & Security Expert",
      image: khalilMtallahImg,
      bio: "Dedicated to building secure and efficient applications. Expert in implementing robust security measures.",
      social: {
        github: "https://github.com/khalil27",
        linkedin: "https://www.linkedin.com/in/khalil-mtaallah-571b72221/",
      }
    }
  ];

  const objectives = [
    {
      title: "Connecting Learners",
      description: "Building bridges between those eager to learn and those passionate about teaching, creating a vibrant community of knowledge sharing.",
      icon: <Users className="h-8 w-8 text-blue-400" />
    },
    {
      title: "Skill Development",
      description: "Facilitating personal and professional growth through peer-to-peer learning and expert-led sessions.",
      icon: <Target className="h-8 w-8 text-purple-400" />
    },
    {
      title: "Community Building",
      description: "Creating a supportive environment where members can collaborate, learn, and grow together.",
      icon: <Heart className="h-8 w-8 text-pink-400" />
    },
    {
      title: "Innovation",
      description: "Continuously evolving our platform to provide the best learning experience through cutting-edge technology.",
      icon: <Sparkles className="h-8 w-8 text-yellow-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Empowering Learning Through
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Community Connection
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-blue-100">
              We're on a mission to revolutionize skill sharing and learning by connecting people from all walks of life.
            </p>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
      </div>

      {/* Objectives Section */}
      <div className="py-20 bg-white/5 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Our Objectives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {objectives.map((objective, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300"
              >
                <div className="p-3 bg-white/10 rounded-xl inline-block mb-4">
                  {objective.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {objective.title}
                </h3>
                <p className="text-blue-200">
                  {objective.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden group hover:transform hover:scale-105 transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-semibold text-white">
                      {member.name}
                    </h3>
                    <p className="text-blue-200 text-sm">
                      {member.role}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-blue-100 mb-4 line-clamp-3">
                    {member.bio}
                  </p>
                  <div className="flex space-x-4">
                    <a 
                      href={member.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-200 hover:text-white transition-colors"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                    <a 
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-200 hover:text-white transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vision Section */}
      <div className="py-20 bg-white/5 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Our Vision for the Future
              </h2>
              <p className="text-blue-100 mb-6">
                We envision a world where knowledge sharing knows no boundaries. Our platform is designed to break down traditional barriers to learning, making education more accessible, engaging, and effective.
              </p>
              <p className="text-blue-100 mb-8">
                Through innovative technology and a commitment to community-driven learning, we're building a future where everyone has the opportunity to grow, learn, and succeed.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center px-6 py-3 rounded-full text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg text-lg font-medium group"
              >
                Join Our Community
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">50K+</h3>
                  <p className="text-blue-200">Expected Users by 2025</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">100+</h3>
                  <p className="text-blue-200">Skills Categories</p>
                </div>
              </div>
              <div className="space-y-6 mt-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">24/7</h3>
                  <p className="text-blue-200">Global Access</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">95%</h3>
                  <p className="text-blue-200">Satisfaction Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Get in Touch
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Have questions about our platform or interested in partnering with us? We'd love to hear from you.
          </p>
          <a
            href="mailto:contact@skillsharehub.com"
            className="inline-flex items-center px-6 py-3 rounded-full text-white bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm shadow-lg text-lg font-medium"
          >
            <Globe className="h-5 w-5 mr-2" />
            contact@skillsharehub.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
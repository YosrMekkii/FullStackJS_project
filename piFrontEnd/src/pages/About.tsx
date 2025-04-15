import React from "react";
import { Link } from 'react-router-dom'; // Import Link for navigation
import { ArrowRight, Search, ChevronRight, Star, Users, BookOpen, Award, Globe, Briefcase, Code, Sparkles } from 'lucide-react'; // Import the necessary icons

const About = () => {
  const teamMembers = [
    {
      name: "Dhia Ghouma",
      role: "Full Stack Developer & Team Lead",
      image:dhiaImg,
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
        github: "https://github.com/ayarikhalil",
        linkedin: "https://linkedin.com/in/khalilayari",
      }
    },
    {
      name: "Yosr Mekki",
      role: "Frontend Developer & UI/UX Designer",
      image: yosrImg,
      bio: "Creative developer with a keen eye for design. Focused on creating beautiful and intuitive user experiences.",
      social: {
        github: "https://github.com/yosrmekki",
        linkedin: "https://linkedin.com/in/yosrmekki",
      }
    },
    {
      name: "Khalil Mtallah",
      role: "Full Stack Developer & Security Expert",
      image: khalilMtallahImg,
      bio: "Dedicated to building secure and efficient applications. Expert in implementing robust security measures.",
      social: {
        github: "https://github.com/khalilmtallah",
        linkedin: "https://linkedin.com/in/khalilmtallah",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-800 text-white py-10 px-6 flex flex-col items-center">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold mb-6">About Us</h1>
        <p className="text-lg mb-10">
        We are on a mission to revolutionize the way people learn and share
          knowledge. Our platform connects passionate individuals with experts
          from around the world to facilitate learning in a collaborative
          environment.
        </p>
        
        {/* Our Mission */}
        <div className="bg-white text-gray-900 rounded-3xl shadow-lg p-6 mb-12">
          <h2 className="text-2xl font-semibold">Our Mission</h2>
          <p className="text-gray-700 mt-4">
            Our goal is to create an accessible platform where users can both
            teach and learn skills from diverse fields. Whether it's technology,
            languages, or personal development, we strive to foster a vibrant
            community of lifelong learners.
          </p>
        </div>

        {/* Our Vision */}
        <div className="bg-white text-gray-900 rounded-3xl shadow-lg p-6 mb-12">
          <h2 className="text-2xl font-semibold">Our Vision</h2>
          <p className="text-gray-700 mt-4">
            We envision a world where knowledge knows no boundaries, enabling
            individuals to reach their fullest potential through collaboration and
            mentorship. By empowering both learners and mentors, we aim to create
            an ecosystem that drives innovation and personal growth.
          </p>
        </div>

        {/* Who We Are */}
        <div className="bg-white text-gray-900 rounded-3xl shadow-lg p-6 mb-12">
          <h2 className="text-2xl font-semibold">Who We Are</h2>
          <p className="text-gray-700 mt-4">
            We are a team of educators, technologists, and enthusiasts dedicated
            to making learning accessible to all. Our diverse backgrounds and
            passion for innovation drive us to build a platform that benefits
            individuals, businesses, and communities.
          </p>
          <a
            href="mailto:contact@skillsharehub.com"
            className="inline-flex items-center px-6 py-3 rounded-full text-white bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm shadow-lg text-lg font-medium"
          >
            <Globe className="h-5 w-5 mr-2" />
            contact@skillsharehub.com
          </a>
        </div>

        {/* Meet the Team */}
        <div className="bg-white text-gray-900 rounded-3xl shadow-lg p-6 mb-12">
          <h2 className="text-2xl font-semibold">Meet the Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="text-center">
              <img
                src="https://via.placeholder.com/150"
                alt="Team Member 1"
                className="rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-900">John Doe</h3>
              <p className="text-blue-200">CEO & Co-Founder</p>
              <p className="text-gray-700 mt-2">
                John is passionate about innovation and education, leading the
                team to create impactful solutions.
              </p>
            </div>

            <div className="text-center">
              <img
                src="https://via.placeholder.com/150"
                alt="Team Member 2"
                className="rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-900">Jane Smith</h3>
              <p className="text-blue-200">Lead Developer</p>
              <p className="text-gray-700 mt-2">
                Jane brings a wealth of experience in software development,
                ensuring the platform's seamless user experience.
              </p>
            </div>

            <div className="text-center">
              <img
                src="https://via.placeholder.com/150"
                alt="Team Member 3"
                className="rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-900">Alex Lee</h3>
              <p className="text-blue-200">Community Manager</p>
              <p className="text-gray-700 mt-2">
                Alex is dedicated to building a strong and supportive community
                for both learners and mentors.
              </p>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="bg-white text-gray-900 rounded-3xl shadow-lg p-6 mb-12">
          <h2 className="text-2xl font-semibold">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div className="flex items-start space-x-4">
              <Award className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Excellence</h3>
                <p className="text-gray-700 mt-2">
                  We strive for excellence in everything we do, ensuring that
                  both our platform and the learning experience are of the highest
                  quality.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Users className="h-8 w-8 text-emerald-500" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Community</h3>
                <p className="text-gray-700 mt-2">
                  We believe in the power of community, where people come together
                  to support and learn from one another.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Globe className="h-8 w-8 text-indigo-500" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Global Impact</h3>
                <p className="text-gray-700 mt-2">
                  Our platform is built to connect people globally, breaking down
                  geographical barriers and expanding learning opportunities.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Star className="h-8 w-8 text-yellow-400" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Integrity</h3>
                <p className="text-gray-700 mt-2">
                  We uphold the highest standards of honesty and transparency, ensuring
                  that we always do the right thing for our users and community.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Join Us CTA */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Join Us and Make a Difference
            </h2>
            <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
              Together, we can build a world where knowledge is shared, and everyone
              has access to the learning resources they need to succeed.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 rounded-full text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg text-lg font-medium group"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
      );
};

export default About;
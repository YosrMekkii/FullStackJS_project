import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Star, Users, BookOpen, Award, ChevronRight, Globe, Briefcase, Code, Sparkles } from 'lucide-react';

export function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Share Knowledge,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Grow Together
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-blue-100 sm:text-2xl">
              Connect with people who want to share their skills and learn from others in a collaborative environment.
            </p>
            
            {/* Search Bar */}
            <div className="mt-12 max-w-xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="What would you like to learn?"
                  className="w-full px-6 py-4 rounded-full text-gray-900 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg text-lg"
                />
                <div className="absolute right-3 top-3">
                  <button className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md">
                    <Search className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center px-8 py-4 rounded-full text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg text-lg font-medium group"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center px-8 py-4 rounded-full text-white bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm shadow-lg text-lg font-medium"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white/5 backdrop-blur-lg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-blue-200">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">5K+</div>
              <div className="text-blue-200">Skills Shared</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">15K+</div>
              <div className="text-blue-200">Connections Made</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">4.9</div>
              <div className="text-blue-200">User Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Popular Learning Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-200 group cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <div className="p-3 bg-blue-500/20 rounded-xl inline-block">
                    <Code className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mt-4">Programming</h3>
                  <p className="text-blue-200 mt-2">Learn web development, mobile apps, and more</p>
                </div>
                <ChevronRight className="h-6 w-6 text-blue-400 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-200 group cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <div className="p-3 bg-purple-500/20 rounded-xl inline-block">
                    <Globe className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mt-4">Languages</h3>
                  <p className="text-blue-200 mt-2">Master new languages with native speakers</p>
                </div>
                <ChevronRight className="h-6 w-6 text-blue-400 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-200 group cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <div className="p-3 bg-emerald-500/20 rounded-xl inline-block">
                    <Briefcase className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mt-4">Business</h3>
                  <p className="text-blue-200 mt-2">Enhance your career with expert guidance</p>
                </div>
                <ChevronRight className="h-6 w-6 text-blue-400 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Skills */}
      <div className="py-20 bg-white/5 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-white">Featured Skills</h2>
            <Link 
              to="/marketplace"
              className="flex items-center text-blue-300 hover:text-blue-200 transition-colors"
            >
              View All
              <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Web Development",
                instructor: "Sarah Johnson",
                rating: 4.9,
                students: 1250,
                image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop"
              },
              {
                title: "Spanish Language",
                instructor: "Maria Garcia",
                rating: 4.8,
                students: 890,
                image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&h=600&fit=crop"
              },
              {
                title: "Digital Marketing",
                instructor: "John Smith",
                rating: 4.7,
                students: 2100,
                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"
              }
            ].map((skill, index) => (
              <div 
                key={index} 
                className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden group hover:transform hover:scale-105 transition-all duration-200"
              >
                <div 
                  className="h-48 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${skill.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{skill.title}</h3>
                  <p className="text-blue-200 mb-4">by {skill.instructor}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400" />
                      <span className="ml-1 text-white">{skill.rating}</span>
                    </div>
                    <div className="text-blue-200">
                      {skill.students.toLocaleString()} students
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block p-3 bg-blue-500/20 rounded-xl mb-6">
            <Sparkles className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
            Join our community of learners and experts. Share your knowledge or learn something new today.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-4 rounded-full text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg text-lg font-medium group"
          >
            Join SkillShare Hub
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home
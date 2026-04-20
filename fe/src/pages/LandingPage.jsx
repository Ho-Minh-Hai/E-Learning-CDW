import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, BarChart3, MessageSquare, ShieldCheck, Zap, Award, TrendingUp, Globe, Check, Star, ArrowRight, Mail } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="relative">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <BookOpen className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                EduFlow
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
              <a href="#about" className="hover:text-indigo-600 transition-colors">About</a>
              <a href="#testimonials" className="hover:text-indigo-600 transition-colors">Testimonials</a>
              <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-indigo-600">Login</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium">
              <Zap className="w-4 h-4 fill-indigo-600" />
              <span>Next Generation Learning</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1]">
              Elevate Your <br />
              <span className="text-indigo-600">Potential</span> with <br />
              Smart Learning.
            </h1>
            <p className="text-xl text-slate-600 max-w-xl">
              An all-in-one platform for modern education. Real-time interaction, 
              advanced analytics, and seamless course management.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/register" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition shadow-xl">
                Start Teaching
              </Link>
              <a href="#features" className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition">
                Explore Courses
              </a>
            </div>
            <div className="flex items-center gap-6 pt-8 border-t border-slate-100">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" />
                ))}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Joined by <span className="text-slate-900 font-bold">10k+</span> students worldwide
              </p>
            </div>
          </div>
          <div className="relative">
             <div className="absolute inset-0 bg-indigo-600 blur-[120px] opacity-20 rounded-full" />
             <div className="relative rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl">
               <img 
                 src="/elearning_hero_1776349120377.png" 
                 alt="Hero" 
                 className="w-full h-auto"
               />
             </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem number="10,000+" label="Active Students" />
            <StatItem number="500+" label="Expert Instructors" />
            <StatItem number="1,200+" label="Online Courses" />
            <StatItem number="95%" label="Success Rate" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Key Features</h2>
            <h3 className="text-4xl font-bold text-slate-900">Everything you need to succeed</h3>
            <p className="text-slate-600">Empowering educators and students with cutting-edge tools for a superior learning experience.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BookOpen className="w-8 h-8 text-indigo-600" />}
              title="Course Management"
              desc="Easy-to-use tools for creating classes, uploading lectures, and setting assignments with deadlines."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-8 h-8 text-purple-600" />}
              title="Tracking & Evaluation"
              desc="Automated submission tracking, online contests, and deep performance analysis for every student."
            />
            <FeatureCard 
              icon={<MessageSquare className="w-8 h-8 text-blue-600" />}
              title="Real-time Interaction"
              desc="Direct messaging, instant support, and automated deadline reminders to keep everyone on track."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-emerald-600" />}
              title="System Administration"
              desc="Complete control over users, class monitoring, and detailed system-wide activity statistics."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8 text-orange-600" />}
              title="Community Groups"
              desc="Interact with peers in subject-specific groups to foster collaborative learning and discussions."
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-yellow-600" />}
              title="Smart Reminders"
              desc="AI-powered notifications for upcoming deadlines and personalized study recommendations."
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">About EduFlow</h2>
              <h3 className="text-4xl font-bold text-slate-900">Transforming Education Through Technology</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                EduFlow is a comprehensive learning management system designed to bridge the gap between 
                traditional education and modern technology. We empower educators and students with 
                innovative tools for a seamless learning experience.
              </p>
              <div className="space-y-4">
                <AboutFeature 
                  icon={<Award className="w-5 h-5 text-indigo-600" />}
                  title="Award-Winning Platform"
                  desc="Recognized for excellence in educational technology"
                />
                <AboutFeature 
                  icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
                  title="Proven Results"
                  desc="95% student satisfaction and improved learning outcomes"
                />
                <AboutFeature 
                  icon={<Globe className="w-5 h-5 text-indigo-600" />}
                  title="Global Reach"
                  desc="Serving students and educators in over 50 countries"
                />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-purple-600 blur-[120px] opacity-20 rounded-full" />
              <div className="relative grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-indigo-600 p-8 rounded-3xl text-white">
                    <h4 className="text-4xl font-extrabold mb-2">10k+</h4>
                    <p className="text-indigo-100 font-medium">Active Students</p>
                  </div>
                  <div className="bg-purple-600 p-8 rounded-3xl text-white">
                    <h4 className="text-4xl font-extrabold mb-2">500+</h4>
                    <p className="text-purple-100 font-medium">Instructors</p>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="bg-emerald-600 p-8 rounded-3xl text-white">
                    <h4 className="text-4xl font-extrabold mb-2">1.2k+</h4>
                    <p className="text-emerald-100 font-medium">Courses</p>
                  </div>
                  <div className="bg-orange-600 p-8 rounded-3xl text-white">
                    <h4 className="text-4xl font-extrabold mb-2">95%</h4>
                    <p className="text-orange-100 font-medium">Success Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Testimonials</h2>
            <h3 className="text-4xl font-bold text-slate-900">What Our Users Say</h3>
            <p className="text-slate-600">Hear from students and educators who have transformed their learning experience with EduFlow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              name="Sarah Johnson"
              role="Computer Science Student"
              avatar="SJ"
              rating={5}
              text="EduFlow has completely changed how I learn. The interactive features and real-time feedback help me stay on track with my studies."
            />
            <TestimonialCard 
              name="Prof. Michael Chen"
              role="University Instructor"
              avatar="MC"
              rating={5}
              text="As an educator, EduFlow provides all the tools I need to manage my courses effectively. The analytics help me understand student progress better."
            />
            <TestimonialCard 
              name="Emily Rodriguez"
              role="Online Learner"
              avatar="ER"
              rating={5}
              text="The platform is intuitive and easy to use. I love how I can track my progress and connect with other students in real-time."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Pricing Plans</h2>
            <h3 className="text-4xl font-bold text-slate-900">Choose Your Perfect Plan</h3>
            <p className="text-slate-600">Flexible pricing options for students, educators, and institutions.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard 
              name="Student"
              price="Free"
              period=""
              features={[
                "Access to all courses",
                "Progress tracking",
                "Community forums",
                "Mobile app access",
                "Email support"
              ]}
              buttonText="Get Started"
              popular={false}
            />
            <PricingCard 
              name="Instructor"
              price="$29"
              period="/month"
              features={[
                "Everything in Student",
                "Create unlimited courses",
                "Advanced analytics",
                "Priority support",
                "Custom branding",
                "Live session hosting"
              ]}
              buttonText="Start Teaching"
              popular={true}
            />
            <PricingCard 
              name="Institution"
              price="Custom"
              period=""
              features={[
                "Everything in Instructor",
                "Unlimited users",
                "Dedicated support",
                "Custom integrations",
                "Advanced security",
                "Training & onboarding"
              ]}
              buttonText="Contact Sales"
              popular={false}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students and educators who are already using EduFlow to achieve their goals.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-slate-50 transition shadow-xl flex items-center gap-2">
              Get Started Free
              <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="px-8 py-4 bg-indigo-500 text-white rounded-2xl font-bold hover:bg-indigo-400 transition border-2 border-white/20">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <BookOpen className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-white">EduFlow</span>
              </div>
              <p className="text-sm leading-relaxed">
                Empowering education through innovative technology and seamless learning experiences.
              </p>
              <div className="flex gap-3">
                <SocialIcon href="https://facebook.com" label="Facebook" />
                <SocialIcon href="https://twitter.com" label="Twitter" />
                <SocialIcon href="https://instagram.com" label="Instagram" />
                <SocialIcon href="https://linkedin.com" label="LinkedIn" />
                <SocialIcon href="https://youtube.com" label="YouTube" />
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#about" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Newsletter</h4>
              <p className="text-sm mb-4">Stay updated with our latest news and updates.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                  <Mail size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; 2024 EduFlow. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StatItem = ({ number, label }) => (
  <div className="text-center">
    <h4 className="text-4xl font-extrabold text-slate-900 mb-2">{number}</h4>
    <p className="text-slate-600 font-medium">{label}</p>
  </div>
);

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 bg-white rounded-[2rem] border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition duration-300 group">
    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
      {icon}
    </div>
    <h4 className="text-xl font-bold text-slate-900 mb-3">{title}</h4>
    <p className="text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

const AboutFeature = ({ icon, title, desc }) => (
  <div className="flex items-start gap-4">
    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <h5 className="font-bold text-slate-900 mb-1">{title}</h5>
      <p className="text-slate-600 text-sm">{desc}</p>
    </div>
  </div>
);

const TestimonialCard = ({ name, role, avatar, rating, text }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition duration-300">
    <div className="flex items-center gap-1 mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
      ))}
    </div>
    <p className="text-slate-600 leading-relaxed mb-6">{text}</p>
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
        {avatar}
      </div>
      <div>
        <h5 className="font-bold text-slate-900">{name}</h5>
        <p className="text-sm text-slate-500">{role}</p>
      </div>
    </div>
  </div>
);

const PricingCard = ({ name, price, period, features, buttonText, popular }) => (
  <div className={`relative p-8 rounded-[2rem] border ${popular ? 'border-indigo-200 bg-indigo-50/50 shadow-xl' : 'border-slate-100 bg-white'} transition duration-300 hover:shadow-xl`}>
    {popular && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">
        MOST POPULAR
      </div>
    )}
    <h4 className="text-2xl font-bold text-slate-900 mb-2">{name}</h4>
    <div className="mb-6">
      <span className="text-5xl font-extrabold text-slate-900">{price}</span>
      <span className="text-slate-600 font-medium">{period}</span>
    </div>
    <ul className="space-y-4 mb-8">
      {features.map((feature, i) => (
        <li key={i} className="flex items-start gap-3">
          <Check size={20} className="text-indigo-600 shrink-0 mt-0.5" />
          <span className="text-slate-600">{feature}</span>
        </li>
      ))}
    </ul>
    <Link 
      to="/register" 
      className={`block w-full py-3 rounded-xl font-bold text-center transition ${
        popular 
          ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
          : 'bg-slate-900 text-white hover:bg-slate-800'
      }`}
    >
      {buttonText}
    </Link>
  </div>
);

const SocialIcon = ({ href, label }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition text-white text-xs font-bold"
    aria-label={label}
  >
    {label.charAt(0)}
  </a>
);

export default LandingPage;

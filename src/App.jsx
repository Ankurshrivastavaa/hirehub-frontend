import React, { useState, useEffect, createContext, useContext } from 'react';
import { Briefcase, Search, MapPin, Clock, Users, Building, LogOut, Plus, ChevronRight, X, CheckCircle, Menu } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// ============ AUTH CONTEXT ============
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

// ============ MAIN APP ============
export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hirehub_token'));
  const [page, setPage] = useState('home');
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => { if (data._id) setUser(data); else logout(); })
        .catch(() => logout());
    }
  }, [token]);

  const login = (userData, userToken) => {
    localStorage.setItem('hirehub_token', userToken);
    setToken(userToken);
    setUser(userData);
    setPage(userData.role === 'recruiter' ? 'recruiter-dashboard' : 'jobs');
  };

  const logout = () => {
    localStorage.removeItem('hirehub_token');
    setToken(null);
    setUser(null);
    setPage('home');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <div className="min-h-screen bg-gray-50">
        <Navbar page={page} setPage={setPage} />
        <main>
          {page === 'home' && <Home setPage={setPage} />}
          {page === 'jobs' && <JobsPage setPage={setPage} setSelectedJob={setSelectedJob} />}
          {page === 'job-detail' && <JobDetail job={selectedJob} setPage={setPage} />}
          {page === 'login' && <AuthPage mode="login" setPage={setPage} />}
          {page === 'signup' && <AuthPage mode="signup" setPage={setPage} />}
          {page === 'recruiter-dashboard' && <RecruiterDashboard setPage={setPage} setSelectedJob={setSelectedJob} />}
          {page === 'post-job' && <PostJob setPage={setPage} />}
          {page === 'my-applications' && <MyApplications />}
          {page === 'profile' && <Profile />}
        </main>
      </div>
    </AuthContext.Provider>
  );
}

// ============ NAVBAR ============
function Navbar({ page, setPage }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <button onClick={() => setPage('home')} className="flex items-center gap-2">
          <Briefcase className="text-indigo-600" size={24} />
          <span className="text-xl font-bold text-gray-800">HireHub</span>
        </button>

        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => setPage('jobs')} className="text-gray-600 hover:text-indigo-600 font-medium">Browse Jobs</button>

          {user ? (
            <>
              {user.role === 'recruiter' && (
                <>
                  <button onClick={() => setPage('recruiter-dashboard')} className="text-gray-600 hover:text-indigo-600 font-medium">Dashboard</button>
                  <button onClick={() => setPage('post-job')} className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium">
                    <Plus size={16} /> Post Job
                  </button>
                </>
              )}
              {user.role === 'seeker' && (
                <button onClick={() => setPage('my-applications')} className="text-gray-600 hover:text-indigo-600 font-medium">My Applications</button>
              )}
              <div className="flex items-center gap-3">
                <button onClick={() => setPage('profile')} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </button>
                <button onClick={logout} className="text-gray-500 hover:text-red-500 transition">
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => setPage('login')} className="text-gray-600 hover:text-indigo-600 font-medium px-4 py-2">Login</button>
              <button onClick={() => setPage('signup')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium">Sign Up</button>
            </div>
          )}
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-600">
          <Menu size={24} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 p-4 space-y-3 bg-white">
          <button onClick={() => { setPage('jobs'); setMenuOpen(false); }} className="block w-full text-left text-gray-600 py-2">Browse Jobs</button>
          {user ? (
            <>
              {user.role === 'seeker' && (
                <button onClick={() => { setPage('my-applications'); setMenuOpen(false); }} className="block w-full text-left text-gray-600 py-2">My Applications</button>
              )}
              {user.role === 'recruiter' && (
                <>
                  <button onClick={() => { setPage('recruiter-dashboard'); setMenuOpen(false); }} className="block w-full text-left text-gray-600 py-2">Dashboard</button>
                  <button onClick={() => { setPage('post-job'); setMenuOpen(false); }} className="block w-full text-left text-indigo-600 py-2 font-medium">+ Post Job</button>
                </>
              )}
              <button onClick={logout} className="block w-full text-left text-red-500 py-2">Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => { setPage('login'); setMenuOpen(false); }} className="block w-full text-left text-gray-600 py-2">Login</button>
              <button onClick={() => { setPage('signup'); setMenuOpen(false); }} className="block w-full text-left text-indigo-600 py-2 font-medium">Sign Up</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

// ============ HOME PAGE ============
function Home({ setPage }) {
  const [stats, setStats] = useState({ totalJobs: 0, totalUsers: 0, totalCompanies: 0 });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/stats`).then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Dream Job</h1>
          <p className="text-xl text-indigo-100 mb-10">Connect with top companies hiring developers, designers, and more</p>

          <div className="bg-white rounded-2xl p-2 flex gap-2 max-w-2xl mx-auto shadow-xl">
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Job title, company, or skills..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 outline-none text-gray-800 text-base"
              />
            </div>
            <button
              onClick={() => setPage('jobs')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white py-10 border-b">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-indigo-600">{stats.totalJobs}+</div>
            <div className="text-gray-500 mt-1">Active Jobs</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-600">{stats.totalCompanies}+</div>
            <div className="text-gray-500 mt-1">Companies</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-600">{stats.totalUsers}+</div>
            <div className="text-gray-500 mt-1">Job Seekers</div>
          </div>
        </div>
      </div>

      {/* Job Types */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Browse by Job Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Full-time', 'Internship', 'Remote', 'Part-time'].map(type => (
            <button
              key={type}
              onClick={() => setPage('jobs')}
              className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-indigo-400 hover:shadow-md transition group"
            >
              <div className="text-3xl mb-3">
                {type === 'Full-time' ? '💼' : type === 'Internship' ? '🎓' : type === 'Remote' ? '🏠' : '⏰'}
              </div>
              <div className="font-semibold text-gray-700 group-hover:text-indigo-600">{type}</div>
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-indigo-50 py-16 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-indigo-100">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Looking for a Job?</h3>
            <p className="text-gray-500 mb-6">Browse hundreds of opportunities from top companies. Apply in one click.</p>
            <button onClick={() => setPage('signup')} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition w-full">
              Get Started Free
            </button>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-purple-100">
            <div className="text-4xl mb-4">🏢</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Hiring Talent?</h3>
            <p className="text-gray-500 mb-6">Post jobs and reach thousands of qualified candidates instantly.</p>
            <button onClick={() => setPage('signup')} className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition w-full">
              Post a Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ JOBS PAGE ============
function JobsPage({ setPage, setSelectedJob }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (type) params.append('type', type);
      if (location) params.append('location', location);
      const res = await fetch(`${API_URL}/api/jobs?${params}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  const openJob = (job) => {
    setSelectedJob(job);
    setPage('job-detail');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Browse Jobs</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm"
          />
        </div>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="">All Types</option>
          {['Full-time', 'Part-time', 'Internship', 'Remote', 'Contract'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
          <MapPin size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Location..."
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="outline-none text-sm w-28"
          />
        </div>
        <button onClick={fetchJobs} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
          Search
        </button>
      </div>

      {/* Job Cards */}
      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500 text-lg">No jobs found. Try different filters.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map(job => (
            <div
              key={job._id}
              onClick={() => openJob(job)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{job.title}</h3>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Building size={14} /> {job.company}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {job.type}</span>
                    {job.salary && <span className="text-green-600 font-medium">💰 {job.salary}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.skills?.slice(0, 4).map(skill => (
                      <span key={skill} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">Active</span>
                  <span className="text-gray-400 text-xs flex items-center gap-1">
                    <Users size={12} /> {job.applicants?.length || 0} applicants
                  </span>
                  <ChevronRight size={20} className="text-gray-400 mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ JOB DETAIL ============
function JobDetail({ job, setPage }) {
  const { user, token } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showForm, setShowForm] = useState(false);

  if (!job) return <div className="text-center py-20 text-gray-500">Job not found.</div>;

  const applyToJob = async () => {
    if (!user) { setPage('login'); return; }
    setApplying(true);
    try {
      const res = await fetch(`${API_URL}/api/jobs/${job._id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ coverLetter, resumeUrl })
      });
      const data = await res.json();
      if (res.ok) { setApplied(true); setShowForm(false); }
      else alert(data.error);
    } catch (error) { alert('Failed to apply. Please try again.'); }
    setApplying(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => setPage('jobs')} className="text-indigo-600 hover:underline mb-6 flex items-center gap-1 text-sm">
        ← Back to Jobs
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{job.title}</h1>
            <div className="flex flex-wrap gap-4 text-gray-500">
              <span className="flex items-center gap-1"><Building size={16} /> {job.company}</span>
              <span className="flex items-center gap-1"><MapPin size={16} /> {job.location}</span>
              <span className="flex items-center gap-1"><Clock size={16} /> {job.type}</span>
              {job.salary && <span className="text-green-600 font-semibold">💰 {job.salary}</span>}
            </div>
          </div>
          {applied ? (
            <div className="flex items-center gap-2 text-green-600 font-semibold bg-green-50 px-4 py-2 rounded-lg">
              <CheckCircle size={20} /> Applied!
            </div>
          ) : user?.role === 'seeker' ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              Apply Now
            </button>
          ) : !user ? (
            <button onClick={() => setPage('login')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
              Login to Apply
            </button>
          ) : null}
        </div>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map(skill => (
                <span key={skill} className="bg-indigo-50 text-indigo-700 text-sm px-3 py-1 rounded-full font-medium">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Job Description</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        {/* Requirements */}
        {job.requirements?.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Requirements</h3>
            <ul className="space-y-2">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600">
                  <span className="text-indigo-600 mt-1">•</span> {req}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Apply Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Submit Application</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Letter</label>
              <textarea
                rows={5}
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                placeholder="Tell the recruiter why you're a great fit..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Resume Link (Google Drive / LinkedIn)</label>
              <input
                type="url"
                value={resumeUrl}
                onChange={e => setResumeUrl(e.target.value)}
                placeholder="https://drive.google.com/your-resume"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={applyToJob}
                disabled={applying}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ AUTH PAGE ============
function AuthPage({ mode, setPage }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'seeker', company: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(mode === 'login');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) { login(data.user, data.token); }
      else setError(data.error);
    } catch (err) { setError('Connection failed. Make sure backend is running.'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
          <Briefcase size={40} className="mx-auto mb-3" />
          <h1 className="text-2xl font-bold">{isLogin ? 'Welcome back!' : 'Join HireHub'}</h1>
          <p className="text-indigo-100 mt-1">{isLogin ? 'Login to continue' : 'Create your free account'}</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            )}

            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />

            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password (min 6 characters)"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />

            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: 'seeker' })}
                    className={`py-3 rounded-lg font-medium border-2 transition ${form.role === 'seeker' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-600'}`}
                  >
                    🔍 Job Seeker
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: 'recruiter' })}
                    className={`py-3 rounded-lg font-medium border-2 transition ${form.role === 'recruiter' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-200 text-gray-600'}`}
                  >
                    🏢 Recruiter
                  </button>
                </div>

                {form.role === 'recruiter' && (
                  <input
                    type="text"
                    id="company"
                    name="company"
                    placeholder="Company Name"
                    value={form.company}
                    onChange={e => setForm({ ...form, company: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 font-semibold hover:underline">
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============ POST JOB ============
function PostJob({ setPage }) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    title: '', location: '', type: 'Full-time', salary: '',
    description: '', requirements: '', skills: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          requirements: form.requirements.split('\n').filter(Boolean),
          skills: form.skills.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      const data = await res.json();
      if (res.ok) { alert('Job posted successfully!'); setPage('recruiter-dashboard'); }
      else alert(data.error);
    } catch (err) { alert('Failed to post job.'); }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Post a New Job</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Frontend Developer"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
              <input
                type="text"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Bhopal, MP or Remote"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type *</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {['Full-time', 'Part-time', 'Internship', 'Remote', 'Contract'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Salary (Optional)</label>
              <input
                type="text"
                value={form.salary}
                onChange={e => setForm({ ...form, salary: e.target.value })}
                placeholder="e.g. ₹5-8 LPA or $50k-70k"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Required Skills</label>
            <input
              type="text"
              value={form.skills}
              onChange={e => setForm({ ...form, skills: e.target.value })}
              placeholder="React, Node.js, MongoDB (comma separated)"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description *</label>
            <textarea
              rows={5}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the role, responsibilities, and what the candidate will work on..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Requirements (one per line)</label>
            <textarea
              rows={4}
              value={form.requirements}
              onChange={e => setForm({ ...form, requirements: e.target.value })}
              placeholder={"2+ years experience with React\nStrong problem-solving skills\nGood communication"}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              {loading ? 'Posting...' : 'Post Job'}
            </button>
            <button
              type="button"
              onClick={() => setPage('recruiter-dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ RECRUITER DASHBOARD ============
function RecruiterDashboard({ setPage, setSelectedJob }) {
  const { token, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/recruiter/jobs`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setJobs).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const viewApplications = async (jobId) => {
    setSelectedJobId(jobId);
    const res = await fetch(`${API_URL}/api/jobs/${jobId}/applications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setApplications(data);
  };

  const updateStatus = async (appId, status) => {
    await fetch(`${API_URL}/api/applications/${appId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    setApplications(applications.map(a => a._id === appId ? { ...a, status } : a));
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm('Delete this job?')) return;
    await fetch(`${API_URL}/api/jobs/${jobId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setJobs(jobs.filter(j => j._id !== jobId));
    if (selectedJobId === jobId) { setSelectedJobId(null); setApplications([]); }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    reviewing: 'bg-blue-100 text-blue-700',
    shortlisted: 'bg-purple-100 text-purple-700',
    rejected: 'bg-red-100 text-red-700',
    hired: 'bg-green-100 text-green-700'
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Recruiter Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name} • {user?.company}</p>
        </div>
        <button onClick={() => setPage('post-job')} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
          <Plus size={18} /> Post New Job
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-indigo-600">{jobs.length}</div>
          <div className="text-gray-500 mt-1">Active Jobs</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{jobs.reduce((sum, j) => sum + (j.applicants?.length || 0), 0)}</div>
          <div className="text-gray-500 mt-1">Total Applicants</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{applications.filter(a => a.status === 'hired').length}</div>
          <div className="text-gray-500 mt-1">Hired</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Jobs List */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-4">Your Job Postings</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500 mb-4">No jobs posted yet</p>
              <button onClick={() => setPage('post-job')} className="text-indigo-600 font-semibold hover:underline">Post your first job →</button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <div
                  key={job._id}
                  className={`bg-white rounded-xl border p-5 cursor-pointer transition ${selectedJobId === job._id ? 'border-indigo-400 shadow-md' : 'border-gray-200 hover:border-indigo-300'}`}
                  onClick={() => viewApplications(job._id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800">{job.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{job.location} • {job.type}</p>
                      <p className="text-sm text-indigo-600 mt-1">{job.applicants?.length || 0} applicants</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteJob(job._id); }}
                      className="text-gray-400 hover:text-red-500 transition p-1"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applications */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-4">
            {selectedJobId ? `Applications (${applications.length})` : 'Select a job to view applications'}
          </h2>
          {!selectedJobId ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              👈 Click a job to see applications
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              No applications yet
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map(app => (
                <div key={app._id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-800">{app.applicant?.name}</h4>
                      <p className="text-sm text-gray-500">{app.applicant?.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                  {app.applicant?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {app.applicant.skills.slice(0, 3).map(s => (
                        <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                  {app.resumeUrl && (
                    <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm hover:underline block mb-3">
                      📄 View Resume
                    </a>
                  )}
                  <select
                    value={app.status}
                    onChange={e => updateStatus(app._id, e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                  >
                    {['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ MY APPLICATIONS ============
function MyApplications() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/applications/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setApplications).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    reviewing: 'bg-blue-100 text-blue-700',
    shortlisted: 'bg-purple-100 text-purple-700',
    rejected: 'bg-red-100 text-red-700',
    hired: 'bg-green-100 text-green-700'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Applications</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">No applications yet</h2>
          <p className="text-gray-500">Start applying to jobs to track them here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div key={app._id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{app.job?.title}</h3>
                  <p className="text-gray-500 mt-1">{app.job?.company} • {app.job?.location} • {app.job?.type}</p>
                  <p className="text-sm text-gray-400 mt-2">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-sm px-3 py-1 rounded-full font-medium capitalize ${statusColors[app.status]}`}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ PROFILE ============
function Profile() {
  const { user, token } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    resumeUrl: user?.resumeUrl || '',
    companyWebsite: user?.companyWebsite || ''
  });
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await fetch(`${API_URL}/api/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean)
      })
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full capitalize font-medium">
              {user?.role}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
          <textarea
            rows={3}
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell recruiters about yourself..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {user?.role === 'seeker' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Skills (comma separated)</label>
              <input
                type="text"
                value={form.skills}
                onChange={e => setForm({ ...form, skills: e.target.value })}
                placeholder="React, Node.js, MongoDB, JavaScript"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Resume Link</label>
              <input
                type="url"
                value={form.resumeUrl}
                onChange={e => setForm({ ...form, resumeUrl: e.target.value })}
                placeholder="https://drive.google.com/your-resume"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </>
        )}

        {user?.role === 'recruiter' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Company Website</label>
            <input
              type="url"
              value={form.companyWebsite}
              onChange={e => setForm({ ...form, companyWebsite: e.target.value })}
              placeholder="https://yourcompany.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          {saved ? '✅ Saved!' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}

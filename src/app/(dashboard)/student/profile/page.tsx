'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Building2, Users, Calendar, 
  Camera, Edit2, ArrowLeft, AlertCircle, Loader2, Save, X
} from 'lucide-react';

type Student = {
  _id: string;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  college?: string;
  group?: string;
  registrationDate?: string;
  createdAt?: string;
  accountStatus?: string;
  photo?: string;
};

type FormData = {
  name: string;
  email: string;
  phone: string;
  college: string;
  group: string;
  photo: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  
  const normalizePhoto = (src?: string) => {
    if (!src) return "";
    if (src.startsWith("http") || src.startsWith("/") || src.startsWith("data:")) return src;
    return `/uploads/${src}`;
  };

  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    college: '',
    group: '',
    photo: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const getDevHeaders = useCallback((): HeadersInit => {
    try {
      if (typeof window === 'undefined') return {};
      const stored = localStorage.getItem('user');
      if (!stored) return {};
      const parsed = JSON.parse(stored);
      if (parsed && parsed._id) {
        return { 'x-user-id': String(parsed._id) };
      }
      return {};
    } catch (e) {
      console.error('Error getting dev headers:', e);
      return {};
    }
  }, []);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    try {
      const headers = getDevHeaders();
      const res = await fetch('/api/student/me', {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (res.status === 401) {
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      if (!res.ok) return;

      const data: Student = await res.json();
      setUser(data);
      
      const initialForm: FormData = {
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        college: data.college || '',
        group: data.group || '',
        photo: data.photo || '',
      };
      setForm(initialForm);
      
      if (data?.photo) {
        setAvatarPreview(normalizePhoto(data.photo));
      }

      try {
        localStorage.setItem('user', JSON.stringify({ 
          _id: data._id, 
          name: data.name, 
          email: data.email,
          role: data.role || 'student',
          photo: normalizePhoto(data.photo),
        }));
        window.dispatchEvent(new Event("user-updated"));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    } catch (err) {
      console.error('fetchMe crash:', err);
    } finally {
      setLoading(false);
    }
  }, [getDevHeaders, router]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        college: user.college || '',
        group: user.group || '',
        photo: user.photo || '',
      });
    }
  }, [user]);

  function handleOpenEdit() {
    if (!user) return;
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      college: user.college || '',
      group: user.group || '',
      photo: user.photo || '',
    });
    setAvatarPreview(user.photo ? normalizePhoto(user.photo) : null);
    setShowEdit(true);
  }

  function handleCloseEdit() {
    setShowEdit(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(String(reader.result));
    reader.readAsDataURL(file);

    try {
      const fd = new FormData();
      fd.append('file', file);

      const uploadRes = await fetch('/api/upload', { 
        method: 'POST', 
        body: fd, 
        credentials: 'include' 
      });
      
      if (!uploadRes.ok) {
        alert('Image upload failed');
        return;
      }

      const uploadJson = await uploadRes.json();
      if (uploadJson.url) {
        setForm(prevForm => ({ ...prevForm, photo: uploadJson.url }));
        setAvatarPreview(uploadJson.url);
      }
    } catch (err) {
      alert('Upload error');
    }
  }

  async function handleSubmit() {
    if (!user) return;
    if (!form.name.trim() || !form.email.trim()) {
      alert('Name and Email are required');
      return;
    }

    setSaving(true);
    
    try {
      const devHeaders = getDevHeaders();
      const headers: HeadersInit = { 'Content-Type': 'application/json', ...devHeaders };

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        college: form.college.trim(),
        group: form.group.trim(),
        photo: form.photo,
      };

      const res = await fetch('/api/student/me', {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const json = await res.json();

      if (res.status === 401) {
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      if (!res.ok) {
        alert(json?.error || 'Save failed');
        return;
      }

      setUser(json);
      setForm({
        name: json.name || '',
        email: json.email || '',
        phone: json.phone || '',
        college: json.college || '',
        group: json.group || '',
        photo: json.photo || '',
      });
      
      if (json.photo) setAvatarPreview(normalizePhoto(json.photo));
      
      try {
        localStorage.setItem('user', JSON.stringify({ 
          _id: json._id, 
          name: json.name, 
          email: json.email,
          role: json.role || 'student',
          photo: normalizePhoto(json.photo),
        }));
        window.dispatchEvent(new Event("user-updated"));
      } catch (e) { console.error(e); }
      
      setShowEdit(false);
      
    } catch (err) {
      alert('Error saving profile.');
    } finally {
      setSaving(false);
    }
  }

  function formatDate(dateString?: string): string {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch { return '-'; }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-slate-500 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-6">Please log in to view your profile.</p>
          <button 
            onClick={() => router.push('/login')}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 relative font-sans text-slate-800 overflow-hidden pb-12">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-500 mt-1">Manage your account details and preferences.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => router.push('/dashboard')} 
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-medium shadow-sm hover:bg-slate-50 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleOpenEdit}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] transition flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" /> Edit Details
            </button>
          </div>
        </div>

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100"
        >
          {/* Card Banner */}
          <div className="h-32 md:h-40 bg-gradient-to-r from-violet-100 to-indigo-100 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-multiply" />
          </div>

          <div className="px-6 md:px-10 pb-10 relative">
            {/* Avatar & Identity Group */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 md:-mt-20 mb-8">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-white shadow-lg bg-white overflow-hidden">
                  {user.photo ? (
                    <img 
                      src={normalizePhoto(user.photo)} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                      <User className="w-16 h-16" />
                    </div>
                  )}
                </div>
                {/* Status Indicator */}
                <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white flex items-center gap-1 ${
                  user.accountStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${user.accountStatus === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {user.accountStatus || 'Active'}
                </div>
              </div>

              <div className="flex-1 mb-2">
                <h2 className="text-3xl font-bold text-slate-900">{user.name}</h2>
                <div className="flex flex-wrap gap-3 mt-2 text-sm font-medium text-slate-500">
                   <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100">
                     <User className="w-3.5 h-3.5" /> {user.role ? user.role.toUpperCase() : 'STUDENT'}
                   </span>
                   {user.group && (
                     <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600">
                       <Users className="w-3.5 h-3.5" /> {user.group}
                     </span>
                   )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-slate-100 mb-8" />

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <InfoItem 
                icon={<Mail className="w-5 h-5 text-purple-500" />} 
                label="Email Address" 
                value={user.email} 
              />
              <InfoItem 
                icon={<Phone className="w-5 h-5 text-blue-500" />} 
                label="Phone Number" 
                value={user.phone} 
              />
              <InfoItem 
                icon={<Building2 className="w-5 h-5 text-pink-500" />} 
                label="College / Institution" 
                value={user.college} 
              />
              <InfoItem 
                icon={<Calendar className="w-5 h-5 text-orange-500" />} 
                label="Joined Date" 
                value={formatDate(user.registrationDate || user.createdAt)} 
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- Edit Modal --- */}
      <AnimatePresence>
        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" 
              onClick={handleCloseEdit} 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
              role="dialog"
              aria-labelledby="edit-profile-title"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 id="edit-profile-title" className="text-lg font-bold text-slate-800">Edit Profile</h3>
                <button 
                  onClick={handleCloseEdit} 
                  className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto">
                {/* Photo Upload */}
                <div className="flex flex-col items-center justify-center gap-3 pb-4 border-b border-slate-100">
                  <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md ring-2 ring-slate-100">
                      <img 
                         src={avatarPreview || `https://ui-avatars.com/api/?name=${form.name}&background=f1f5f9&color=64748b`} 
                         alt="Preview" 
                         className="w-full h-full object-cover" 
                      />
                    </div>
                    <label className="absolute inset-0 bg-slate-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-full cursor-pointer backdrop-blur-[2px]">
                       <span className="sr-only">Upload profile photo</span>
                       <Camera className="w-8 h-8 text-white" aria-hidden="true" />
                       <input 
                          type="file" 
                          accept="image/*" 
                          onChange={onFileChange} 
                          className="sr-only" 
                          aria-label="Upload profile photo"
                       />
                    </label>
                  </div>
                  <p className="text-xs font-medium text-indigo-500">Click photo to update</p>
                </div>

                <div className="space-y-4">
                   <InputGroup label="Full Name" name="name" value={form.name} onChange={handleInputChange} />
                   <InputGroup label="Email Address" name="email" type="email" value={form.email} onChange={handleInputChange} />
                   <div className="grid grid-cols-2 gap-4">
                     <InputGroup label="Phone" name="phone" type="tel" value={form.phone} onChange={handleInputChange} />
                     <InputGroup label="Group Code" name="group" value={form.group} onChange={handleInputChange} />
                   </div>
                   <InputGroup label="College / Institution" name="college" value={form.college} onChange={handleInputChange} />
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                 <button 
                   onClick={handleCloseEdit}
                   className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition font-medium text-sm"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleSubmit}
                   disabled={saving}
                   className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-70 flex items-center justify-center gap-2 text-sm transition-all"
                 >
                   {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                   {saving ? 'Saving...' : 'Save Changes'}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Helper Components ---

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition duration-200 border border-transparent hover:border-slate-100">
      <div className="shrink-0 p-3 bg-slate-50 rounded-xl">
        {icon}
      </div>
      <div className="overflow-hidden">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-slate-800 font-medium truncate text-base">{value || '—'}</p>
      </div>
    </div>
  );
}

// FIXED: Added htmlFor and id association
function InputGroup({ 
  label, name, value, onChange, type = "text" 
}: { 
  label: string, name: string, value: string, type?: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void 
}) {
  return (
    <div className="space-y-1.5">
       <label htmlFor={name} className="text-sm font-semibold text-slate-600 ml-1">
         {label}
       </label>
       <input 
          id={name}
          type={type} 
          name={name} 
          value={value} 
          onChange={onChange}
          className="w-full bg-white border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-sm"
          placeholder={`Enter ${label}`}
       />
    </div>
  );
}

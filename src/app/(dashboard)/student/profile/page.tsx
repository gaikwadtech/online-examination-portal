'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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
        console.warn('Unauthorized: Redirecting to login');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      if (!res.ok) {
        const txt = await res.text();
        console.error('GET /api/student/me failed', res.status, txt);
        return;
      }

      const data: Student = await res.json();
      console.log('Fetched user data:', data);
      
      setUser(data);
      
      // Initialize form with fetched data
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
        setAvatarPreview(data.photo);
      }

      try {
        localStorage.setItem('user', JSON.stringify({ 
          _id: data._id, 
          name: data.name, 
          email: data.email 
        }));
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

  // Sync form when user data changes
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
    
    // Reset form with current user data when opening modal
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      college: user.college || '',
      group: user.group || '',
      photo: user.photo || '',
    });
    setAvatarPreview(user.photo || null);
    setShowEdit(true);
  }

  function handleCloseEdit() {
    setShowEdit(false);
    // Reset form to current user data when closing
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        college: user.college || '',
        group: user.group || '',
        photo: user.photo || '',
      });
      setAvatarPreview(user.photo || null);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    console.log(`Input change - ${name}:`, value); // Debug log
    setForm(prevForm => ({
      ...prevForm,
      [name]: value,
    }));
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      setAvatarPreview(result);
    };
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
        const uploadJson = await uploadRes.json();
        console.error('Upload failed', uploadJson);
        alert('Image upload failed');
        return;
      }

      const uploadJson = await uploadRes.json();

      if (uploadJson.url) {
        setForm(prevForm => ({ ...prevForm, photo: uploadJson.url }));
        setAvatarPreview(uploadJson.url);
        console.log('Photo uploaded successfully:', uploadJson.url);
      } else {
        console.error('Upload did not return url', uploadJson);
        alert('Upload failed: no url returned');
      }
    } catch (err) {
      console.error('onFileChange error', err);
      alert('Upload error');
    }
  }

  async function handleSubmit() {
    if (!user) {
      alert('User data not loaded');
      return;
    }

    // Validate required fields
    if (!form.name.trim()) {
      alert('Name is required');
      return;
    }
    if (!form.email.trim()) {
      alert('Email is required');
      return;
    }

    setSaving(true);
    
    try {
      const devHeaders = getDevHeaders();
      const headers: HeadersInit = { 
        'Content-Type': 'application/json', 
        ...devHeaders 
      };

      // Create payload with all editable fields
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        college: form.college.trim(),
        group: form.group.trim(),
        photo: form.photo,
      };

      console.log('Submitting payload:', payload);

      const res = await fetch('/api/student/me', {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const json = await res.json();
      console.log('PATCH response status:', res.status);
      console.log('PATCH response body:', json);

      if (res.status === 401) {
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      if (!res.ok) {
        console.error('Save error', json);
        alert(json?.error || 'Save failed');
        return;
      }

      // Update user state with response
      setUser(json);
      
      // Update form state
      setForm({
        name: json.name || '',
        email: json.email || '',
        phone: json.phone || '',
        college: json.college || '',
        group: json.group || '',
        photo: json.photo || '',
      });
      
      // Update avatar preview
      if (json.photo) {
        setAvatarPreview(json.photo);
      }
      
      // Update localStorage
      try {
        localStorage.setItem('user', JSON.stringify({ 
          _id: json._id, 
          name: json.name, 
          email: json.email 
        }));
      } catch (e) {
        console.error('Error updating localStorage:', e);
      }
      
      setShowEdit(false);
      alert('Profile updated successfully!');
      
    } catch (err) {
      console.error('Submit error:', err);
      alert('Error saving profile. Please try again.');
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
    } catch {
      return '-';
    }
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(s => s[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">Please log in to view this page.</p>
        <button 
          onClick={() => router.push('/login')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-200 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
          <p className="text-slate-500">Manage your personal information and account settings</p>
        </div>
        <button
          className="px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-600 text-white rounded-lg shadow hover:opacity-90 transition"
          onClick={handleOpenEdit}
        >
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column - Avatar Card */}
        <div className="col-span-12 md:col-span-4">
          <div className="bg-slate-300 rounded-xl p-6 shadow-lg">
            <div className="flex flex-col items-center">
              <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-sky-400 to-blue-500 flex items-center justify-center text-white text-3xl shadow-md relative overflow-hidden">
                {user.photo ? (
                  <img 
                    src={user.photo} 
                    className="w-full h-full object-cover" 
                    alt="avatar" 
                  />
                ) : (
                  <span className="opacity-90 font-semibold">
                    {getInitials(user.name || 'User')}
                  </span>
                )}
                <div className="absolute -bottom-2 right-0 bg-white rounded-full p-1">
                  <div className={`w-5 h-5 rounded-full border-2 border-white ${
                    user.accountStatus === 'Active' ? 'bg-green-400' : 
                    user.accountStatus === 'Inactive' ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                </div>
              </div>

              <h2 className="mt-4 text-xl font-semibold text-slate-800">{user.name}</h2>
              <p className="text-slate-500">{user.email}</p>

              <div className="mt-4 flex gap-3 flex-wrap justify-center">
                <span className="text-sm px-3 py-1 bg-sky-50 text-sky-700 rounded-full capitalize">
                  {user.role || 'Student'}
                </span>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  user.accountStatus === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                  user.accountStatus === 'Inactive' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-red-50 text-green-700'
                }`}>
                  {user.accountStatus || 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Info Card */}
        <div className="col-span-12 md:col-span-8">
          <div className="bg-slate-300 rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-black">Personal Information</h3>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-black mb-2">Full Name</label>
                <div className="p-3 bg-slate-50 text-black rounded min-h-[48px] flex items-center">
                  {user.name || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm text-black mb-2">Email Address</label>
                <div className="p-3 bg-slate-50 text-black rounded min-h-[48px] break-all flex items-center">
                  {user.email || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm text-black mb-2">Phone Number</label>
                <div className="p-3 bg-slate-50 text-black rounded min-h-[48px] flex items-center">
                  {user.phone || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm text-black mb-2">College/Institution</label>
                <div className="p-3 bg-slate-50 text-black rounded min-h-[48px] flex items-center">
                  {user.college || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm text-black mb-2">Group Name/Code</label>
                <div className="p-3 bg-slate-50 text-black rounded min-h-[48px] flex items-center">
                  {user.group || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm text-black mb-2">Registration Date</label>
                <div className="p-3 bg-slate-50 text-black rounded min-h-[48px] flex items-center">
                  {formatDate(user.registrationDate || user.createdAt)}
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm text-slate-600 mb-2">Account Status</label>
                <div className={`p-3 bg-white rounded inline-block ${
                  user.accountStatus === 'Active' ? 'text-emerald-600' :
                  user.accountStatus === 'Inactive' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {user.accountStatus || 'Active'}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button 
                onClick={() => router.push('/dashboard')} 
                className="px-5 py-3 bg-red-400 border rounded-md inline-flex items-center gap-2 hover:bg-red-300 transition text-white"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={handleCloseEdit} 
          />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px] p-6 relative z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h4 className="text-xl font-semibold text-black">Edit Profile</h4>
              <button 
                onClick={handleCloseEdit} 
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Profile Photo */}
              <div>
                <label className="block text-sm text-black mb-1">Profile Photo</label>
                <div className="flex items-center gap-3">
                  <label className="inline-block bg-blue-600 px-4 py-2 rounded cursor-pointer border border-slate-200 hover:bg-slate-100 transition">
                    Choose File
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={onFileChange} 
                      className="hidden" 
                    />
                  </label>
                  {avatarPreview && (
                    <img 
                      src={avatarPreview} 
                      className="w-12 h-12 rounded-full object-cover" 
                      alt="preview" 
                    />
                  )}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm text-black mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input 
                  name="name" 
                  type="text"
                  value={form.name} 
                  onChange={handleInputChange} 
                  placeholder="Enter your full name"
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 text-black outline-none transition" 
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input 
                  name="email" 
                  type="email"
                  value={form.email} 
                  onChange={handleInputChange} 
                  placeholder="Enter your email"
                  className="w-full p-3 border rounded focus:ring-2 text-black focus:ring-blue-500 outline-none transition" 
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-slate-600 mb-1">Phone Number</label>
                <input 
                  name="phone" 
                  type="tel"
                  value={form.phone} 
                  onChange={handleInputChange} 
                  placeholder="Enter your phone number"
                  className="w-full p-3 border rounded focus:ring-2 text-black focus:ring-blue-500 outline-none transition" 
                />
              </div>

              {/* College */}
              <div>
                <label className="block text-sm text-slate-600 mb-1">College/Institution</label>
                <input 
                  name="college"
                  type="text" 
                  value={form.college} 
                  onChange={handleInputChange} 
                  placeholder="Enter your college or institution name"
                  className="w-full p-3 border rounded focus:ring-2 text-black focus:ring-blue-500 outline-none transition" 
                />
              </div>

              {/* Group */}
              <div>
                <label className="block text-sm text-slate-600 mb-1">Group Name/Code</label>
                <input 
                  name="group"
                  type="text" 
                  value={form.group} 
                  onChange={handleInputChange} 
                  placeholder="Enter your group or batch code"
                  className="w-full p-3 border rounded focus:ring-2 text-black focus:ring-blue-500 outline-none transition" 
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={handleCloseEdit} 
                  className="flex-1 py-3 rounded bg-red-500 hover:bg-slate-200 transition font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleSubmit} 
                  disabled={saving} 
                  className="flex-1 py-3 rounded bg-gradient-to-r from-sky-400 to-blue-600 text-white hover:shadow-md transition disabled:opacity-70 font-medium"
                >
                  {saving ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

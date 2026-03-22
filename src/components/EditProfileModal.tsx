'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'patient' | 'assessor';
  userData?: {
    name: string;
    email: string;
    [key: string]: any;
  };
}

export function EditProfileModal({
  isOpen,
  onClose,
  userRole,
  userData = { name: '', email: '' },
}: EditProfileModalProps) {
  const [formData, setFormData] = useState(userData);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePicturePreview(reader.result as string);
          setFormData(prev => ({
            ...prev,
            profilePicture: file,
            profilePictureUrl: reader.result as string,
          }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Connect to backend API for actual persistence
      console.log('Saving profile data:', formData);
      
      // Store in localStorage scoped by user ID for multi-account support
      const savedData = { ...formData };
      const userId = formData.id;
      const storageKey = userId ? `userProfile_${userId}` : 'userProfile';
      localStorage.setItem(storageKey, JSON.stringify(savedData));
      
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Dispatch custom event to notify parent component
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: savedData }));
      
      onClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg dark:bg-slate-900/95 dark:border-slate-700/70">
        <DialogHeader>
          <DialogTitle className="dark:text-slate-100">Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto dark:text-slate-100">
          {userRole === 'patient' ? (
            <>
              {/* Patient Profile Form */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0A81FF]/50 focus:border-[#0A81FF]"
                  placeholder="Sarah Mitchell"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  disabled
                  className="w-full px-3 py-2 rounded-lg border border-slate-200/70 bg-slate-50 text-slate-500 placeholder:text-slate-400 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-500 dark:placeholder:text-slate-600 cursor-not-allowed"
                  placeholder="email@example.com"
                />
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Email cannot be changed</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0A81FF]/50 focus:border-[#0A81FF]"
                    placeholder="34"
                    min="18"
                    max="120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200/70 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0A81FF]/50 focus:border-[#0A81FF]"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Health Information (optional)
                </label>
                <textarea
                  name="healthInfo"
                  value={formData.healthInfo || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0A81FF]/50 focus:border-[#0A81FF] resize-none"
                  placeholder="Add any relevant health information..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-3">
                  {profilePicturePreview ? (
                    <img 
                      src={profilePicturePreview}
                      alt="Profile preview"
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#0A81FF]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0A81FF] to-[#8DE0F6] flex items-center justify-center text-white font-bold text-sm">
                      {formData.name?.split(' ').map((n: string) => n[0]).join('') || 'SM'}
                    </div>
                  )}
                  <input
                    type="file"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200/70 bg-white text-slate-900 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 file:bg-slate-100 file:border-0 file:rounded file:px-2 file:py-1 file:text-xs file:font-semibold file:text-slate-700 dark:file:bg-slate-700 dark:file:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0A81FF]/50"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Assessor Profile Form */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0A81FF]/50 focus:border-[#0A81FF]"
                  placeholder="Dr. Rebecca Chen"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  disabled
                  className="w-full px-3 py-2 rounded-lg border border-slate-200/70 bg-slate-50 text-slate-500 placeholder:text-slate-400 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-500 dark:placeholder:text-slate-600 cursor-not-allowed"
                  placeholder="email@example.com"
                />
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Specialty *
                </label>
                <input
                  type="text"
                  name="specialty"
                  value={formData.specialty || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0A81FF]/50 focus:border-[#0A81FF]"
                  placeholder="Internal Medicine"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Institution
                </label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0A81FF]/50 focus:border-[#0A81FF]"
                  placeholder="Medical Center"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Credentials Summary
                </label>
                <textarea
                  name="credentialsSummary"
                  value={formData.credentialsSummary || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0A81FF]/50 focus:border-[#0A81FF] resize-none"
                  placeholder="MD, Board Certified..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0A81FF]/50 focus:border-[#0A81FF] resize-none"
                  placeholder="Professional background and expertise..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-3">
                  {profilePicturePreview ? (
                    <img 
                      src={profilePicturePreview}
                      alt="Profile preview"
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                      {formData.name?.split(' ').map((n: string) => n[0]).join('') || 'RC'}
                    </div>
                  )}
                  <input
                    type="file"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200/70 bg-white text-slate-900 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 file:bg-slate-100 file:border-0 file:rounded file:px-2 file:py-1 file:text-xs file:font-semibold file:text-slate-700 dark:file:bg-slate-700 dark:file:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0A81FF]/50"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <button className="px-4 py-2.5 rounded-lg bg-slate-100/80 text-slate-700 font-medium text-sm hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all">
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#0A81FF] to-[#3A9BFF] text-white font-medium text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

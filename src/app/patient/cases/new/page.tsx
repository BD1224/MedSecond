'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DNABackground from '@/components/DNABackground';
import { submitCase } from '@/app/patient/actions';
import { getUserProfile } from '@/app/auth/actions';

const Icon = {
  dna: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 15c6.667-6 13.333 0 20-6M9 22c1.798-1.998 2.573-3.995 2.572-5.993M15 2c-1.798 1.998-2.573 3.995-2.572 5.993M2 9c6.667 6 13.333 0 20 6" /></svg>,
  upload: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>,
  trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  close: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

export default function NewCasePage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await getUserProfile();
        if (!result.success || !result.user) {
          router.push('/auth/sign-in');
          return;
        }
        setAuthed(true);
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/auth/sign-in');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);

    // Create previews
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviews(prev => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove file
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError('Please provide a description');
      return;
    }

    setSubmitting(true);

    try {
      // Convert files to buffer format for server action
      const fileData = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          data: Buffer.from(await file.arrayBuffer()),
        }))
      );

      const result = await submitCase(title || 'Medical Case', description, fileData);

      if (!result.success) {
        setError(result.error || 'Failed to submit case');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/patient/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSubmitting(false);
    }
  };

  if (!authed || loading) return null;

  return (
    <div className="relative min-h-screen bg-transparent">
      <DNABackground />

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-slate-200/60">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-[#0A81FF] to-[#59BAEE] flex items-center justify-center shadow-md shadow-blue-500/20">
              {Icon.dna}
            </div>
            <span className="text-[1.05rem] font-extrabold tracking-tight text-slate-900">Med<span className="text-[#0A81FF]">Second</span></span>
          </div>
          <button onClick={() => router.push('/patient/dashboard')} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="relative z-[2] max-w-[700px] mx-auto px-4 sm:px-6 py-8">
        <section className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Submit a Case</h1>
          <p className="text-slate-500">Provide medical information for a second opinion from our verified assessors</p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Case Title <span className="text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Skin lesion on left forearm"
              className="w-full px-4 py-2.5 rounded-xl bg-white/80 backdrop-blur-lg border border-slate-200/70 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0A81FF]/50 focus:ring-1 focus:ring-[#0A81FF]/30 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Medical Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your symptoms, medical history, or specific concerns..."
              rows={5}
              className="w-full px-4 py-2.5 rounded-xl bg-white/80 backdrop-blur-lg border border-slate-200/70 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0A81FF]/50 focus:ring-1 focus:ring-[#0A81FF]/30 transition-all resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">Provide as much detail as possible to help assessors give accurate opinions</p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Upload Medical Images <span className="text-slate-400">(optional)</span>
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
              disabled={submitting}
            />
            <label
              htmlFor="file-input"
              className="flex items-center justify-center gap-3 px-4 py-6 rounded-xl bg-white/80 backdrop-blur-lg border-2 border-dashed border-slate-200/70 hover:border-[#0A81FF]/50 cursor-pointer transition-all"
            >
              <div className="text-[#0A81FF]">{Icon.upload}</div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-900">Click to upload images</p>
                <p className="text-xs text-slate-400">PNG, JPG, GIF up to 10MB each</p>
              </div>
            </label>
          </div>

          {/* File Previews */}
          {files.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-3">Images ({files.length})</p>
              <div className="grid grid-cols-2 gap-3">
                {previews.map((preview, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden bg-white/80 backdrop-blur-lg border border-slate-200/70 group">
                    <img src={preview} alt={`Preview ${idx}`} className="w-full h-32 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {Icon.trash}
                    </button>
                    <p className="text-xs text-slate-500 px-2 py-1 truncate">{files[idx].name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50/80 backdrop-blur-lg border border-red-200/70 rounded-xl p-4 flex gap-3">
              <div className="text-red-500 flex-shrink-0 mt-0.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {success && (
            <div className="bg-emerald-50/80 backdrop-blur-lg border border-emerald-200/70 rounded-xl p-4 flex gap-3">
              <div className="text-emerald-600 flex-shrink-0 mt-0.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-700">Case submitted successfully! Redirecting...</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !description.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0A81FF] to-[#3A9BFF] text-white font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? 'Submitting...' : 'Submit Case'}
          </button>
        </form>
      </main>
    </div>
  );
}

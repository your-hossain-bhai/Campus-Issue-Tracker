import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  UserCheck,
  UserX,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { CampusIssue, IssueCategory } from '../types';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newIssue: Omit<CampusIssue, 'id' | 'upvotes' | 'date' | 'createdAtTimestamp' | 'commentsCount' | 'comments'>) => void;
}

const CATEGORY_OPTIONS: IssueCategory[] = [
  'Transport',
  'Library',
  'Cafeteria',
  'Facilities',
  'Administration',
  'Academics',
  'Student Life',
];

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Transport');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Image file size must be under 8MB.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setImagePreview(uploadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a descriptive title for this issue.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide details in the description.');
      return;
    }
    if (!isAnonymous && !studentId.trim()) {
      setError('Please provide your Student ID or toggle "Post Anonymously".');
      return;
    }

    const author = isAnonymous
      ? 'Anonymous'
      : `Student #${studentId.trim().toUpperCase()}`;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      isAnonymous,
      studentId: isAnonymous ? undefined : studentId.trim().toUpperCase(),
      author,
      status: 'Pending',
      imageUrl: imagePreview || undefined,
      hasUserUpvoted: true,
      aiSummary: null,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setCategory('Transport');
    setIsAnonymous(false);
    setStudentId('');
    setImagePreview(null);
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-issue-title"
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h2 id="create-issue-title" className="text-xl font-extrabold text-stone-900">
              Create New Campus Issue
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Submit your concern to the student body. The AI engine will analyze and extract the core demands.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Kumira Bus 8:15 AM schedule delay causing missed exams"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-stone-900 text-sm outline-hidden"
              maxLength={120}
              required
            />
            <div className="flex justify-end mt-1 text-[11px] text-stone-400">
              {title.length}/120
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Campus Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IssueCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-stone-900 text-sm outline-hidden bg-white"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Detailed Description & Demands <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe what happened, where on campus (e.g., Central Library, Admin Building, Bus Counter), when, and the specific relief or action demanded..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-stone-900 text-sm outline-hidden"
              required
            ></textarea>
          </div>

          {/* Image Upload with Preview */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Evidence Photo (Optional)
            </label>
            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-orange-400 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-stone-50 hover:bg-orange-50/30"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700">
                    Click to upload photo evidence (JPG, PNG, WebP)
                  </span>
                  <span className="text-[11px] text-stone-400 mt-0.5">
                    AI vision will analyze photo details alongside text
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 max-h-56">
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  className="w-full h-44 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs transition-colors flex items-center gap-1 shadow-md"
                >
                  <X className="w-3.5 h-3.5" /> Remove Photo
                </button>
              </div>
            )}
          </div>

          {/* Identity Toggle: Anonymous vs Student ID */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isAnonymous ? (
                  <UserX className="w-4 h-4 text-stone-600" />
                ) : (
                  <UserCheck className="w-4 h-4 text-blue-600" />
                )}
                <span className="text-xs font-bold text-stone-800">
                  Author Identity
                </span>
              </div>

              {/* Toggle Buttons */}
              <div className="flex items-center gap-1 bg-stone-200/70 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setIsAnonymous(false)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    !isAnonymous
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Student ID
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnonymous(true)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    isAnonymous
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Post Anonymously
                </button>
              </div>
            </div>

            {!isAnonymous ? (
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Enter your Student ID (e.g. C211048)
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. C211048 or CSE-48"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-stone-900 text-xs uppercase font-mono"
                  required={!isAnonymous}
                />
              </div>
            ) : (
              <p className="text-[11px] text-stone-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Your post will display as <span className="font-semibold text-stone-700">"Anonymous"</span>. Protects whistleblower identity.
              </p>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Issue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

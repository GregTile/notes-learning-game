import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChildProfile } from '../types';
import { Users, Plus, Star, Flame, Trophy, Check, X, Pencil, Trash2 } from 'lucide-react';

export interface ProfileButtonProps {
  activeProfile: ChildProfile;
  onClick: () => void;
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({ activeProfile, onClick }) => {
  const themeColor = activeProfile.color || '#8b5cf6';
  return (
    <button
      id="player-profile-pill"
      type="button"
      onClick={onClick}
      style={{
        backgroundColor: `${themeColor}18`,
        borderColor: `${themeColor}70`,
      }}
      className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border-2 hover:shadow-md transition active:scale-95 cursor-pointer shadow-xs group"
      title="Switch or Manage Player Profile"
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xl shrink-0 border-2 shadow-xs"
        style={{
          backgroundColor: '#ffffff',
          borderColor: themeColor,
        }}
      >
        {activeProfile.avatar}
      </div>
      <div className="text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black text-slate-900 leading-tight">
            {activeProfile.name}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold">
          <span className="flex items-center gap-0.5 text-amber-700">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
            {activeProfile.totalStars} Stars
          </span>
          <span className="text-slate-400">•</span>
          <span
            className="px-1.5 py-0.5 rounded-md font-black text-[10px]"
            style={{
              backgroundColor: '#ffffff',
              color: themeColor,
            }}
          >
            Lvl {activeProfile.unlockedLevel}
          </span>
        </div>
      </div>
    </button>
  );
};

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: ChildProfile[];
  activeProfile: ChildProfile;
  onSelectProfile: (profileId: string) => void;
  onAddProfile: (name: string, avatar: string, color: string) => void;
  onEditProfile: (profileId: string, name: string, avatar: string, color: string) => void;
  onDeleteProfile: (profileId: string) => void;
}

const AVATAR_OPTIONS = ['🦄', '🌸', '🦁', '🦊', '🐼', '🚀', '🐬', '🦖', '🎨', '⭐', '🎸', '🐱'];
const COLOR_OPTIONS = [
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfile,
  onSelectProfile,
  onAddProfile,
  onEditProfile,
  onDeleteProfile,
}) => {
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formAvatar, setFormAvatar] = useState('🦄');
  const [formColor, setFormColor] = useState('#8b5cf6');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Reset state when modal is opened or closed
  useEffect(() => {
    if (isOpen) {
      setMode('list');
      setEditingProfileId(null);
      setConfirmDeleteId(null);
    }
  }, [isOpen]);

  const openCreateModal = () => {
    setFormName('');
    setFormAvatar('🌸');
    setFormColor('#ec4899');
    setMode('create');
  };

  const openEditModal = (p: ChildProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProfileId(p.id);
    setFormName(p.name);
    setFormAvatar(p.avatar);
    setFormColor(p.color || '#8b5cf6');
    setMode('edit');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (mode === 'create') {
      onAddProfile(formName.trim(), formAvatar, formColor);
    } else if (mode === 'edit' && editingProfileId) {
      onEditProfile(editingProfileId, formName.trim(), formAvatar, formColor);
    }

    setMode('list');
    setEditingProfileId(null);
  };

  const handleDeleteClick = (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (profiles.length <= 1) {
      alert('At least one profile is required.');
      return;
    }
    setConfirmDeleteId(profileId);
  };

  const handleExecuteDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDeleteId) {
      const idToDelete = confirmDeleteId;
      setConfirmDeleteId(null);
      onDeleteProfile(idToDelete);
    }
  };

  const targetDeleteProfile = profiles.find((p) => p.id === confirmDeleteId);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="profile-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => {
            if (mode === 'list') {
              onClose();
              setConfirmDeleteId(null);
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border-4 border-indigo-100 max-w-md w-full p-5 sm:p-6 relative max-h-[85vh] flex flex-col my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {mode === 'create'
                      ? 'Add New Profile'
                      : mode === 'edit'
                      ? 'Edit Profile'
                      : 'Player Profiles'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {mode === 'list'
                      ? 'Switch players, edit or delete profiles'
                      : 'Customize name and avatar'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setMode('list');
                  setConfirmDeleteId(null);
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Delete Confirmation Warning */}
            {confirmDeleteId && targetDeleteProfile && (
              <div className="my-3 p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-200 shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{targetDeleteProfile.avatar}</span>
                  <span className="text-sm font-black text-rose-900">
                    Delete profile for {targetDeleteProfile.name}?
                  </span>
                </div>
                <p className="text-xs text-rose-800 mb-3">
                  This will permanently remove {targetDeleteProfile.name}&apos;s profile, including all stars and saved game progress.
                </p>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteDelete}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer shadow-sm active:scale-95"
                  >
                    Yes, Delete Profile
                  </button>
                </div>
              </div>
            )}

            {/* Profiles List */}
            {mode === 'list' && (
              <div className="mt-3 space-y-2.5 overflow-y-auto flex-1 pr-1 min-h-0">
                {profiles.map((p) => {
                  const isActive = p.id === activeProfile.id;
                  const profileColor = p.color || '#8b5cf6';
                  const accuracy =
                    p.totalNotesAnswered > 0
                      ? Math.round((p.totalCorrect / p.totalNotesAnswered) * 100)
                      : 0;

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectProfile(p.id);
                        onClose();
                      }}
                      style={
                        isActive
                          ? {
                              borderColor: profileColor,
                              backgroundColor: `${profileColor}15`,
                            }
                          : undefined
                      }
                      className={`
                        flex items-center justify-between p-3.5 rounded-2xl border-2 transition cursor-pointer group
                        ${
                          isActive
                            ? 'shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="text-3xl p-2 rounded-xl shadow-xs border flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: isActive ? '#ffffff' : `${profileColor}15`,
                            borderColor: isActive ? profileColor : `${profileColor}40`,
                          }}
                        >
                          {p.avatar}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-sm">
                              {p.name}
                            </span>
                            {isActive && (
                              <span
                                className="px-2 py-0.5 rounded-full text-white font-extrabold text-[10px]"
                                style={{ backgroundColor: profileColor }}
                              >
                                Active
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                            <span className="flex items-center gap-1 font-semibold text-amber-600">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                              {p.totalStars} stars
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-rose-600">
                              <Flame className="w-3 h-3 text-rose-500" />
                              Streak {p.bestStreak}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-emerald-600">
                              <Trophy className="w-3 h-3 text-emerald-500" />
                              {accuracy}% Acc
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Edit / Delete Buttons */}
                      <div className="flex items-center gap-1">
                        {isActive && (
                          <div
                            className="w-7 h-7 rounded-full text-white flex items-center justify-center mr-1"
                            style={{ backgroundColor: profileColor }}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => openEditModal(p, e)}
                          title="Edit Profile"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {profiles.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteClick(p.id, e)}
                            title="Delete Profile"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add Profile Button */}
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="w-full mt-2 py-3 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-indigo-700 font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Profile</span>
                </button>
              </div>
            )}

            {/* Create or Edit Form */}
            {(mode === 'create' || mode === 'edit') && (
              <form onSubmit={handleSave} className="mt-3 space-y-3.5 overflow-y-auto flex-1 pr-1 min-h-0">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Player Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Player One or Player Two"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Choose Avatar
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_OPTIONS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setFormAvatar(em)}
                        className={`text-2xl p-2 rounded-xl border transition cursor-pointer ${
                          formAvatar === em
                            ? 'bg-indigo-100 border-indigo-500 scale-110 shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-0.5">
                    Theme Color
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Controls your avatar badge background, profile pill border, and active card accent.
                  </p>
                  <div className="flex gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-7 h-7 rounded-full border-2 transition cursor-pointer ${
                          formColor === c
                            ? 'border-slate-900 scale-115 shadow-sm'
                            : 'border-white hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('list');
                      setEditingProfileId(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    {mode === 'create' ? 'Create Profile' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Convenience wrapper combining button and modal
export const ProfileSelector: React.FC<Omit<ProfileModalProps, 'isOpen' | 'onClose'>> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <ProfileButton activeProfile={props.activeProfile} onClick={() => setIsOpen(true)} />
      <ProfileModal {...props} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CameraIcon,
  ActivityIcon,
  BarChart3Icon,
  BellIcon,
  CalendarIcon,
  CheckIcon,
  Edit2Icon,
  HomeIcon,
  LayoutDashboardIcon,
  LockIcon,
  MoonIcon,
  SaveIcon,
  ShieldCheckIcon,
  SunIcon,
  TrophyIcon,
  UserIcon,
  UsersIcon,
  XIcon
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { InputField } from '../components/ui/InputField';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../lib/media';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
};

function getSidebarItems(role) {
  if (role === 'captain') {
    return [
      { icon: <LayoutDashboardIcon className="w-5 h-5" />, label: 'Dashboard', path: '/captain' },
      { icon: <UsersIcon className="w-5 h-5" />, label: 'My Team', path: '/captain/team' },
      { icon: <TrophyIcon className="w-5 h-5" />, label: 'Tournaments', path: '/captain/register' },
      { icon: <BarChart3Icon className="w-5 h-5" />, label: 'Stats', path: '/captain/stats' },
      { icon: <UserIcon className="w-5 h-5" />, label: 'Profile', path: '/profile' }
    ];
  }

  if (role === 'admin') {
    return [
      { icon: <UsersIcon className="w-5 h-5" />, label: 'Users', path: '/admin' },
      { icon: <TrophyIcon className="w-5 h-5" />, label: 'Tournaments', path: '/admin/tournaments' },
      { icon: <ShieldCheckIcon className="w-5 h-5" />, label: 'Approvals', path: '/admin/approvals' },
      { icon: <UserIcon className="w-5 h-5" />, label: 'Profile', path: '/profile' }
    ];
  }

  return [
    { icon: <HomeIcon className="w-5 h-5" />, label: 'Home', path: '/student' },
    { icon: <TrophyIcon className="w-5 h-5" />, label: 'Tournaments', path: '/student/tournaments' },
    { icon: <CalendarIcon className="w-5 h-5" />, label: 'Fixtures', path: '/student/fixtures' },
    { icon: <BarChart3Icon className="w-5 h-5" />, label: 'Leaderboard', path: '/student/leaderboard' },
    { icon: <ActivityIcon className="w-5 h-5" />, label: 'Stats', path: '/student/stats' },
    { icon: <UserIcon className="w-5 h-5" />, label: 'Profile', path: '/profile' }
  ];
}

function getProfileFieldConfig(role) {
  if (role === 'student') {
    return [
      { label: 'Full Name', name: 'fullName' },
      { label: 'Email Address', name: 'email', type: 'email' },
      { label: 'Contact Number', name: 'phone', type: 'tel' },
      { label: 'Emergency Contact', name: 'emergencyContact', type: 'tel' }
    ];
  }

  return [
    { label: 'Full Name', name: 'fullName' },
    { label: 'Email Address', name: 'email', type: 'email' },
    { label: 'Phone Number', name: 'phone', type: 'tel' },
    { label: 'Department', name: 'department' }
  ];
}

function getRoleManagementConfig(role) {
  if (role === 'captain') {
    return {
      title: 'Captain Management',
      description: 'Manage team leadership, sport category, and captain-specific identity details.',
      fields: [
        { label: 'Captain ID', name: 'identifier' },
        { label: 'University', name: 'organization' },
        { label: 'Team Name', name: 'teamName' },
        { label: 'Sport', name: 'sport' },
        { label: 'Leadership Since', name: 'leadershipSince' }
      ]
    };
  }

  if (role === 'admin') {
    return {
      title: 'Admin Management',
      description: 'Use the common profile tools below to manage admin account details.',
      fields: []
    };
  }

  return {
    title: 'Student Management',
    description: 'Manage academic identity and campus profile details.',
    fields: [
      { label: 'Student ID', name: 'identifier' },
      { label: 'Faculty', name: 'department' },
      { label: 'Year of Study', name: 'yearOfStudy' },
      { label: 'Sports Preferences', name: 'sport' },
      { label: 'Medical Clearance', name: 'medicalClearance' }
    ]
  };
}

function getStudentTrackingFields(profile, hasAvatar) {
  return [
    { label: 'Full Name', complete: Boolean(profile.fullName?.trim()) },
    { label: 'Student ID', complete: Boolean(profile.identifier?.trim()) },
    { label: 'Faculty', complete: Boolean(profile.department?.trim()) },
    { label: 'Year of Study', complete: Boolean(profile.yearOfStudy?.trim()) },
    { label: 'Contact Number', complete: Boolean(profile.phone?.trim()) },
    { label: 'Email Address', complete: Boolean(profile.email?.trim()) },
    { label: 'Emergency Contact', complete: Boolean(profile.emergencyContact?.trim()) },
    { label: 'Sports Preferences', complete: Boolean(profile.sport?.trim()) },
    { label: 'Profile Photo', complete: hasAvatar },
    { label: 'Medical Clearance', complete: Boolean(profile.medicalClearance?.trim()) }
  ];
}

function formatMemberSince(createdAt) {
  if (!createdAt) {
    return 'Member since recently';
  }

  return `Member since ${new Date(createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })}`;
}

function getProfilePageTitle(role) {
  if (role === 'admin') {
    return 'Admin Profile';
  }

  if (role === 'captain') {
    return 'Captain Profile';
  }

  return 'Student Profile';
}

function getRoleSummary(role) {
  if (role === 'admin') {
    return {
      icon: <ShieldCheckIcon className="w-5 h-5" />,
      title: 'Admin Control Panel',
      description: 'Administrative identity, organization assignment, and access scope are managed here.',
      accent: 'from-blue-500/20 to-cyan-500/10 border-blue-500/20 text-blue-300'
    };
  }

  if (role === 'captain') {
    return {
      icon: <UsersIcon className="w-5 h-5" />,
      title: 'Captain Team Profile',
      description: 'Team leadership, sport category, and captain credentials are managed here.',
      accent: 'from-purple-500/20 to-pink-500/10 border-purple-500/20 text-purple-300'
    };
  }

  return {
    icon: <UserIcon className="w-5 h-5" />,
    title: 'Student Academic Profile',
    description: 'Student identity and campus profile details are managed here.',
    accent: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20 text-emerald-300'
  };
}

function buildProfileState(user) {
  return {
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    identifier: user?.identifier || '',
    organization: user?.organization || '',
    emergencyContact: user?.emergencyContact || '',
    yearOfStudy: user?.yearOfStudy || '',
    teamName: user?.teamName || '',
    sport: user?.sport || '',
    medicalClearance: user?.medicalClearance || '',
    leadershipSince: user?.leadershipSince || '',
    designation: user?.designation || '',
    officeLocation: user?.officeLocation || '',
    avatarUrl: user?.avatarUrl || '',
    notificationsEnabled:
      typeof user?.notificationsEnabled === 'boolean' ? user.notificationsEnabled : true
  };
}

const PROFILE_THEME_KEY = 'profile-theme';

function getInitialProfileTheme() {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  return localStorage.getItem(PROFILE_THEME_KEY) || 'dark';
}

export default function ProfilePage() {
  const { user, updateProfile, updatePassword, uploadAvatar } = useAuth();
  const role = user?.role || 'student';
  const pageTitle = useMemo(() => getProfilePageTitle(role), [role]);
  const roleSummary = useMemo(() => getRoleSummary(role), [role]);
  const sidebarItems = useMemo(() => getSidebarItems(role), [role]);
  const profileFields = useMemo(() => getProfileFieldConfig(role), [role]);
  const roleManagement = useMemo(() => getRoleManagementConfig(role), [role]);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(buildProfileState(user));
  const [draftProfile, setDraftProfile] = useState(buildProfileState(user));
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileTheme, setProfileTheme] = useState(getInitialProfileTheme);

  const isLightTheme = profileTheme === 'light';

  const pageTone = isLightTheme
    ? {
        shell: 'bg-slate-100',
        heading: 'text-slate-900',
        body: 'text-slate-700',
        muted: 'text-slate-500',
        badge: 'bg-blue-100 text-blue-700',
        panel: 'bg-white border border-slate-200 shadow-sm',
        panelAlt: 'bg-slate-50 border border-slate-200',
        field: 'text-slate-900 bg-slate-50 border border-slate-200',
        switchOff: 'bg-slate-300',
        sectionText: 'text-slate-600'
      }
    : {
        shell: '',
        heading: 'text-white',
        body: 'text-slate-300',
        muted: 'text-slate-400',
        badge: 'bg-blue-500/20 text-blue-400',
        panel: '',
        panelAlt: 'bg-white/[0.02] border border-white/5',
        field: 'text-white bg-white/[0.02] border border-white/5',
        switchOff: 'bg-slate-600',
        sectionText: 'text-slate-400'
      };

  useEffect(() => {
    const nextState = buildProfileState(user);
    setProfileData(nextState);
    setDraftProfile(nextState);
  }, [user]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROFILE_THEME_KEY, profileTheme);
    }
  }, [profileTheme]);

  const handleStartEditing = () => {
    setDraftProfile({ ...profileData });
    setProfileError('');
    setProfileMessage('');
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setDraftProfile({ ...profileData });
    setProfileError('');
    setIsEditing(false);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setDraftProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validateProfileForm = () => {
    if (!draftProfile.fullName.trim()) {
      setProfileError('Full name is required');
      return false;
    }

    if (!draftProfile.email.trim()) {
      setProfileError('Email is required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draftProfile.email.trim())) {
      setProfileError('Enter a valid email address');
      return false;
    }

    return true;
  };

  const validatePasswordForm = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All password fields are required');
      return false;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return false;
    }

    return true;
  };

  const handleProfileSubmit = async () => {
    if (!validateProfileForm()) {
      return;
    }

    try {
      setSavingProfile(true);
      setProfileError('');
      setProfileMessage('');

      const payload = {
        fullName: draftProfile.fullName.trim(),
        email: draftProfile.email.trim(),
        phone: draftProfile.phone.trim(),
        department: draftProfile.department.trim(),
        identifier: draftProfile.identifier.trim(),
        organization: draftProfile.organization.trim(),
        emergencyContact: draftProfile.emergencyContact.trim(),
        yearOfStudy: draftProfile.yearOfStudy.trim(),
        teamName: draftProfile.teamName.trim(),
        sport: draftProfile.sport.trim(),
        medicalClearance: draftProfile.medicalClearance.trim(),
        leadershipSince: draftProfile.leadershipSince.trim(),
        designation: draftProfile.designation.trim(),
        officeLocation: draftProfile.officeLocation.trim(),
        avatarUrl: draftProfile.avatarUrl,
        notificationsEnabled: draftProfile.notificationsEnabled
      };

      const data = await updateProfile(payload);
      const nextState = buildProfileState(data.user);

      setProfileData(nextState);
      setDraftProfile(nextState);
      setIsEditing(false);
      setProfileMessage(data.message);
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordError('');
      setPasswordMessage('');

      const data = await updatePassword(passwordData);

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordMessage(data.message);
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploadingAvatar(true);
      setProfileError('');
      setProfileMessage('');
      const data = await uploadAvatar(file);
      const nextState = buildProfileState(data.user);
      setProfileData(nextState);
      setDraftProfile(nextState);
      setProfileMessage(data.message);
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const displayProfile = isEditing ? draftProfile : profileData;
  const avatarSrc = getMediaUrl(displayProfile.avatarUrl || profileData.avatarUrl || user?.avatarUrl);
  const studentTrackingFields = useMemo(
    () => (role === 'student' ? getStudentTrackingFields(displayProfile, Boolean(avatarSrc)) : []),
    [avatarSrc, displayProfile, role]
  );
  const completedStudentFields = studentTrackingFields.filter((field) => field.complete).length;
  const missingStudentFields = studentTrackingFields.length - completedStudentFields;
  const studentProfileCompletion = studentTrackingFields.length
    ? Math.round((completedStudentFields / studentTrackingFields.length) * 100)
    : 0;
  const initials = (displayProfile.fullName || 'User')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={role}
      userName={profileData.fullName || 'User'}
      userAvatar={getMediaUrl(user?.avatarUrl)}
      pageTitle={pageTitle}
    >
      <motion.div
        className={`space-y-6 max-w-4xl mx-auto rounded-[28px] p-2 md:p-3 ${pageTone.shell}`}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}>
          <GlassCard className={`flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden ${pageTone.panel}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 z-10 text-center md:text-left">
              <div className="relative flex-shrink-0">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover shadow-xl shadow-purple-500/20 border-4 border-surface"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-purple-500/20 border-4 border-surface">
                    {initials}
                  </div>
                )}
                <label className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 border-4 border-surface flex items-center justify-center text-white cursor-pointer transition-colors">
                  <CameraIcon className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
              <div className="pt-2">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h2 className={`text-2xl font-bold ${pageTone.heading}`}>{displayProfile.fullName || 'User'}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block w-max mx-auto md:mx-0 ${pageTone.badge}`}>
                    {role}
                  </span>
                </div>
                <p className={`${pageTone.muted} text-sm mb-1`}>{displayProfile.email}</p>
                <p className={`${isLightTheme ? 'text-slate-500' : 'text-slate-500'} text-xs`}>{formatMemberSince(user?.createdAt)}</p>
                {uploadingAvatar && (
                  <p className="text-xs text-blue-400 mt-2">Uploading profile image...</p>
                )}
              </div>
            </div>

            <div className="z-10 w-full md:w-auto mt-4 md:mt-0 flex gap-3">
              {isEditing ? (
                <>
                  <GradientButton
                    variant="outline"
                    className="w-full md:w-auto"
                    onClick={handleCancelEditing}
                  >
                    Cancel
                  </GradientButton>
                  <GradientButton
                    variant="primary"
                    className="w-full md:w-auto"
                    onClick={handleProfileSubmit}
                    loading={savingProfile}
                  >
                    <SaveIcon className="w-4 h-4 mr-2" /> Save Changes
                  </GradientButton>
                </>
              ) : (
                <GradientButton
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={handleStartEditing}
                >
                  <Edit2Icon className="w-4 h-4 mr-2" /> Edit Profile
                </GradientButton>
              )}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <GlassCard className={`relative overflow-hidden border ${roleSummary.accent.split(' ').find((item) => item.startsWith('border-')) || ''} ${pageTone.panel}`}>
            <div className={`absolute inset-0 bg-gradient-to-r ${roleSummary.accent.split(' ').filter((item) => item.startsWith('from-') || item.startsWith('to-')).join(' ')}`} />
            <div className="relative flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 ${roleSummary.accent.split(' ').find((item) => item.startsWith('text-')) || 'text-white'}`}>
                {roleSummary.icon}
              </div>
              <div>
                <p className={`text-xs uppercase tracking-[0.2em] ${pageTone.muted} mb-2`}>
                  {pageTitle}
                </p>
                <h3 className={`text-xl font-bold ${pageTone.heading}`}>{roleSummary.title}</h3>
                <p className={`text-sm ${pageTone.body} mt-2 max-w-2xl`}>{roleSummary.description}</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {role === 'student' && (
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="px-1">
              <h3 className={`text-lg font-bold ${pageTone.heading}`}>Profile Progress Tracking</h3>
              <p className={`text-sm ${pageTone.sectionText} mt-1`}>
                Track what is complete and what still needs attention in your student profile.
              </p>
            </div>

            <GlassCard className={`space-y-6 ${pageTone.panel}`}>
              <div className={`rounded-3xl border p-5 ${isLightTheme ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/[0.03]'}`}>
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className={`text-sm font-semibold ${pageTone.heading}`}>Progress Bar</p>
                    <p className={`text-sm ${pageTone.sectionText} mt-1`}>
                      {studentProfileCompletion}% complete - {missingStudentFields} fields missing
                    </p>
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${pageTone.muted}`}>
                    {completedStudentFields}/{studentTrackingFields.length} fields done
                  </span>
                </div>

                <div className={`mt-4 h-4 overflow-hidden rounded-full ${isLightTheme ? 'bg-slate-200' : 'bg-slate-800/80'}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${studentProfileCompletion}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className={`text-sm font-semibold ${pageTone.heading}`}>Profile Fields Checklist</p>
                  <p className={`text-sm ${pageTone.sectionText} mt-1`}>
                    Completed fields are highlighted in green. Missing fields are highlighted in red.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {studentTrackingFields.map((field) => (
                    <div
                      key={field.label}
                      className={`rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 ${
                        field.complete
                          ? isLightTheme
                            ? 'border-emerald-200 bg-emerald-50 shadow-sm shadow-emerald-100'
                            : 'border-emerald-500/25 bg-emerald-500/10 hover:border-emerald-400/40'
                          : isLightTheme
                            ? 'border-rose-200 bg-rose-50 shadow-sm shadow-rose-100'
                            : 'border-rose-500/25 bg-rose-500/10 hover:border-rose-400/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className={`text-sm font-semibold ${pageTone.heading}`}>{field.label}</p>
                          <p
                            className={`mt-1 text-xs font-medium ${
                              field.complete
                                ? isLightTheme
                                  ? 'text-emerald-700'
                                  : 'text-emerald-300'
                                : isLightTheme
                                  ? 'text-rose-700'
                                  : 'text-rose-300'
                            }`}
                          >
                            {field.complete ? 'Completed' : 'Missing'}
                          </p>
                        </div>
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            field.complete
                              ? isLightTheme
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-emerald-500/15 text-emerald-300'
                              : isLightTheme
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-rose-500/15 text-rose-300'
                          }`}
                        >
                          {field.complete ? <CheckIcon className="h-5 w-5" /> : <XIcon className="h-5 w-5" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <GradientButton
                  variant="primary"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    if (isEditing) {
                      handleProfileSubmit();
                      return;
                    }

                    handleStartEditing();
                    document.getElementById('student-profile-editor')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                  loading={savingProfile}
                >
                  {isEditing ? 'Save Profile' : 'Complete Profile'}
                </GradientButton>
                <GradientButton
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    if (!isEditing) {
                      handleStartEditing();
                    }

                    document.getElementById('student-profile-editor')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                >
                  Update Info
                </GradientButton>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {roleManagement.fields.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-4" id="student-profile-editor">
            <div className="px-1">
              <h3 className={`text-lg font-bold ${pageTone.heading}`}>{roleManagement.title}</h3>
              <p className={`text-sm ${pageTone.sectionText} mt-1`}>{roleManagement.description}</p>
            </div>

            <GlassCard className={`border ${isLightTheme ? 'border-slate-200 bg-white' : 'border-white/10'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roleManagement.fields.map((field) => (
                  <div key={field.name} className="space-y-1">
                    {isEditing ? (
                      <InputField
                        label={field.label}
                        name={field.name}
                        value={draftProfile[field.name] || ''}
                        onChange={handleProfileChange}
                        type={field.type || 'text'}
                      />
                    ) : (
                      <>
                        <p className={`text-xs font-medium ${pageTone.muted} uppercase tracking-wider`}>
                          {field.label}
                        </p>
                        <p className={`text-sm font-medium p-3 rounded-xl min-h-[48px] ${pageTone.field}`}>
                          {profileData[field.name] || 'Not set'}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="space-y-4">
          <h3 className={`text-lg font-bold px-1 ${pageTone.heading}`}>Personal Information</h3>
          <GlassCard className={pageTone.panel}>
            {(profileMessage || profileError) && (
              <div
                className={`mb-5 rounded-xl px-4 py-3 text-sm border ${
                  profileError
                    ? 'text-red-400 bg-red-500/10 border-red-500/20'
                    : 'text-green-400 bg-green-500/10 border-green-500/20'
                }`}
              >
                {profileError || profileMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profileFields.map((field) => (
                <div key={field.name} className="space-y-1">
                  {isEditing ? (
                    <InputField
                      label={field.label}
                      name={field.name}
                      value={draftProfile[field.name] || ''}
                      onChange={handleProfileChange}
                      type={field.type || 'text'}
                    />
                  ) : (
                    <>
                      <p className={`text-xs font-medium ${pageTone.muted} uppercase tracking-wider`}>
                        {field.label}
                      </p>
                      <p className={`text-sm font-medium p-3 rounded-xl min-h-[48px] ${pageTone.field}`}>
                        {profileData[field.name] || 'Not set'}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className={`text-lg font-bold px-1 ${pageTone.heading}`}>Change Password</h3>
            <GlassCard className={`space-y-5 ${pageTone.panel}`}>
              {(passwordMessage || passwordError) && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm border ${
                    passwordError
                      ? 'text-red-400 bg-red-500/10 border-red-500/20'
                      : 'text-green-400 bg-green-500/10 border-green-500/20'
                  }`}
                >
                  {passwordError || passwordMessage}
                </div>
              )}

              <form className="space-y-5" onSubmit={handlePasswordSubmit}>
                <InputField
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  icon={<LockIcon className="w-4 h-4" />}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                />

                <InputField
                  label="New Password"
                  name="newPassword"
                  type="password"
                  icon={<LockIcon className="w-4 h-4" />}
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                />

                <InputField
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  icon={<LockIcon className="w-4 h-4" />}
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                />

                <div className="pt-2">
                  <GradientButton
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={savingPassword}
                  >
                    Update Password
                  </GradientButton>
                </div>
              </form>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className={`text-lg font-bold px-1 ${pageTone.heading}`}>Account Settings</h3>
            <GlassCard className={`space-y-6 flex flex-col h-[calc(100%-2rem)] ${pageTone.panel}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLightTheme ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-slate-300'}`}>
                    <BellIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${pageTone.heading}`}>Email Notifications</p>
                    <p className={`text-xs ${pageTone.sectionText}`}>
                      {isEditing
                        ? 'This setting will be saved with profile changes'
                        : 'Turn on edit mode to change this setting'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() =>
                    setDraftProfile((prev) => ({
                      ...prev,
                      notificationsEnabled: !prev.notificationsEnabled
                    }))
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    (isEditing ? draftProfile.notificationsEnabled : profileData.notificationsEnabled)
                      ? 'bg-blue-500'
                      : pageTone.switchOff
                  } ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      (isEditing ? draftProfile.notificationsEnabled : profileData.notificationsEnabled)
                        ? 'left-6'
                        : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLightTheme ? 'bg-slate-100 text-amber-500' : 'bg-white/5 text-slate-300'}`}>
                    {isLightTheme ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${pageTone.heading}`}>Theme Preference</p>
                    <p className={`text-xs ${pageTone.sectionText}`}>
                      Switch between Dark and White mode for your profile page
                    </p>
                  </div>
                </div>
                <div className={`flex items-center rounded-xl p-1 ${isLightTheme ? 'bg-slate-100 border border-slate-200' : 'bg-white/5 border border-white/10'}`}>
                  <button
                    type="button"
                    onClick={() => setProfileTheme('dark')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      !isLightTheme
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileTheme('light')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isLightTheme
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    White
                  </button>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${pageTone.body}`}>Role Access</p>
                    <p className={`text-xs ${pageTone.muted} capitalize`}>Signed in as {role}</p>
                  </div>
                  <span className="px-3 py-2 text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-xl uppercase">
                    {role}
                  </span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}


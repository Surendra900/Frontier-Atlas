"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Award,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Camera,
  ArrowRight,
  Shield,
  Calendar,
} from "lucide-react";
import { getCurrentUser, updateUserProfile, type UserProfile } from "@/lib/auth-client";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    avatar: "",
    github: "",
    twitter: "",
    linkedin: "",
    website: "",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push("/login?redirect=/profile");
          return;
        }

        setUser(currentUser);
        setFormData({
          displayName: currentUser.displayName || "",
          bio: currentUser.bio || "",
          avatar: currentUser.avatar || "",
          github: currentUser.github || "",
          twitter: currentUser.twitter || "",
          linkedin: currentUser.linkedin || "",
          website: currentUser.website || "",
        });
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await updateUserProfile(formData);
      if (res.user) {
        setUser(res.user);
      }
      setSuccessMsg("Profile updated successfully!");
      window.dispatchEvent(new Event("authchange"));
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#F55036] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-[#777]">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initials = (user.displayName || user.username || user.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  const joinedYear = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#171717] py-10 px-4 sm:px-6 md:px-12 lg:px-16">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E5E5E0]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
              Account & Profile
            </h1>
            <p className="text-sm text-[#777] mt-1">
              Manage your personal details, researcher bio, and connected accounts.
            </p>
          </div>
          <Link
            href="/saved"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#444] bg-white border border-[#E5E5E0] hover:border-[#F55036] hover:text-[#F55036] transition-colors shadow-xs"
          >
            <Bookmark size={15} />
            Saved Papers
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-[#E8F5E9] border border-[#A5D6A7] rounded-xl text-sm font-medium text-[#2E7D32] animate-in fade-in">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-[#FFEBEE] border border-[#FFCDD2] rounded-xl text-sm font-medium text-[#C62828] animate-in fade-in">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Card & Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white border border-[#E5E5E0] rounded-2xl p-6 shadow-xs text-center">
              <div className="relative mx-auto w-24 h-24 mb-4">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt={user.displayName || user.username}
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#E5E5E0] shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#F55036] to-[#FF8A65] text-white text-3xl font-black flex items-center justify-center shadow-sm">
                    {initials}
                  </div>
                )}
                <div
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-[#E5E5E0] flex items-center justify-center text-[#555] shadow-xs cursor-pointer hover:text-[#F55036]"
                  title="Change avatar via image URL below"
                >
                  <Camera size={14} />
                </div>
              </div>

              <h2 className="text-xl font-bold text-[#171717]">
                {formData.displayName || user.username}
              </h2>
              <p className="text-xs text-[#888] mt-0.5">@{user.username}</p>

              {formData.bio && (
                <p className="text-xs text-[#555] mt-3 line-clamp-3 leading-relaxed">
                  {formData.bio}
                </p>
              )}

              <div className="mt-5 pt-4 border-t border-[#F0EFEB] flex items-center justify-around text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 text-sm font-black text-[#F55036]">
                    <Award size={15} />
                    {user.reputationScore ?? 0}
                  </div>
                  <span className="text-[11px] font-medium text-[#888]">Reputation</span>
                </div>
                <div className="w-px h-6 bg-[#E5E5E0]" />
                <div>
                  <div className="flex items-center justify-center gap-1 text-sm font-black text-[#171717]">
                    <Calendar size={14} className="text-[#888]" />
                    {joinedYear}
                  </div>
                  <span className="text-[11px] font-medium text-[#888]">Member Since</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white border border-[#E5E5E0] rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#888] mb-3">
                Quick Navigation
              </h3>
              <div className="space-y-1.5">
                <Link
                  href="/saved"
                  className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-[#444] hover:bg-[#F8F7F2] hover:text-[#F55036] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Bookmark size={15} />
                    Saved Papers
                  </span>
                  <ArrowRight size={13} />
                </Link>
                <Link
                  href="/submit"
                  className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-[#444] hover:bg-[#F8F7F2] hover:text-[#F55036] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Shield size={15} />
                    Submit Research Paper
                  </span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Edit Profile Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-[#E5E5E0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
            >
              <div>
                <h2 className="text-lg font-bold text-[#171717]">
                  Public Researcher Profile
                </h2>
                <p className="text-xs text-[#777] mt-1">
                  This information will be displayed on your contributions, submissions, and research discussions.
                </p>
              </div>

              {/* Display Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="displayName"
                    className="block text-xs font-semibold text-[#444] mb-1.5"
                  >
                    Display Name
                  </label>
                  <div className="relative">
                    <User
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888]"
                    />
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      value={formData.displayName}
                      onChange={handleChange}
                      placeholder="e.g. Dr. Jane Doe"
                      className="w-full pl-9 pr-3.5 py-2 text-xs border border-[#E5E5E0] rounded-xl focus:outline-none focus:border-[#F55036] focus:ring-1 focus:ring-[#F55036] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-[#444] mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888]"
                    />
                    <input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full pl-9 pr-3.5 py-2 text-xs border border-[#EBEBE6] bg-[#F8F7F2] text-[#777] rounded-xl cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Avatar URL */}
              <div>
                <label
                  htmlFor="avatar"
                  className="block text-xs font-semibold text-[#444] mb-1.5"
                >
                  Avatar Image URL
                </label>
                <div className="relative">
                  <Camera
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888]"
                  />
                  <input
                    id="avatar"
                    name="avatar"
                    type="url"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full pl-9 pr-3.5 py-2 text-xs border border-[#E5E5E0] rounded-xl focus:outline-none focus:border-[#F55036] focus:ring-1 focus:ring-[#F55036] transition-colors"
                  />
                </div>
                <p className="text-[11px] text-[#999] mt-1">
                  Paste a direct link to an image hosted on GitHub, Gravatar, or Cloudinary.
                </p>
              </div>

              {/* Bio */}
              <div>
                <label
                  htmlFor="bio"
                  className="block text-xs font-semibold text-[#444] mb-1.5"
                >
                  Researcher Bio / Interests
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Share your research lab, current interests (e.g. LLM alignment, Diffusion Models), or recent publications..."
                  className="w-full px-3.5 py-2.5 text-xs border border-[#E5E5E0] rounded-xl focus:outline-none focus:border-[#F55036] focus:ring-1 focus:ring-[#F55036] transition-colors resize-none"
                />
              </div>

              {/* Social & Academic Links */}
              <div className="pt-2 border-t border-[#F0EFEB]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#888] mb-3">
                  Online & Academic Profiles
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="github"
                      className="block text-xs font-semibold text-[#444] mb-1.5"
                    >
                      GitHub Profile
                    </label>
                    <div className="relative">
                      <Github
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888]"
                      />
                      <input
                        id="github"
                        name="github"
                        type="text"
                        value={formData.github}
                        onChange={handleChange}
                        placeholder="username or URL"
                        className="w-full pl-9 pr-3.5 py-2 text-xs border border-[#E5E5E0] rounded-xl focus:outline-none focus:border-[#F55036] focus:ring-1 focus:ring-[#F55036] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="twitter"
                      className="block text-xs font-semibold text-[#444] mb-1.5"
                    >
                      Twitter / X Handle
                    </label>
                    <div className="relative">
                      <Twitter
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888]"
                      />
                      <input
                        id="twitter"
                        name="twitter"
                        type="text"
                        value={formData.twitter}
                        onChange={handleChange}
                        placeholder="@username"
                        className="w-full pl-9 pr-3.5 py-2 text-xs border border-[#E5E5E0] rounded-xl focus:outline-none focus:border-[#F55036] focus:ring-1 focus:ring-[#F55036] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="linkedin"
                      className="block text-xs font-semibold text-[#444] mb-1.5"
                    >
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <Linkedin
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888]"
                      />
                      <input
                        id="linkedin"
                        name="linkedin"
                        type="text"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="linkedin.com/in/username"
                        className="w-full pl-9 pr-3.5 py-2 text-xs border border-[#E5E5E0] rounded-xl focus:outline-none focus:border-[#F55036] focus:ring-1 focus:ring-[#F55036] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="website"
                      className="block text-xs font-semibold text-[#444] mb-1.5"
                    >
                      Personal / Lab Website
                    </label>
                    <div className="relative">
                      <Globe
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888]"
                      />
                      <input
                        id="website"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://lab.university.edu"
                        className="w-full pl-9 pr-3.5 py-2 text-xs border border-[#E5E5E0] rounded-xl focus:outline-none focus:border-[#F55036] focus:ring-1 focus:ring-[#F55036] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#F0EFEB] flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#F55036] hover:bg-[#E0462D] text-white text-xs font-bold transition-all shadow-sm hover:shadow-[0_0_0_3px_rgba(245,80,54,0.20)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saving ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

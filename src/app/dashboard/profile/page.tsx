"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar,
  Globe,
  Building,
  Target,
  TrendingUp,
  Trophy,
  Loader2,
  RefreshCw,
  Edit3,
  Camera,
  Key,
  Eye,
  EyeOff,
  Check,
  X,
  Upload,
  Save
} from "lucide-react";
import { profileService, type UserProfile, type UpdateProfileRequest, type ChangePasswordRequest } from "@/lib/api/profile/profileService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Form states
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    phoneCountryCode: "+2",
    image: ""
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Loading states
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Form validation states
  const [editErrors, setEditErrors] = useState<{[key: string]: string}>({});
  const [passwordErrors, setPasswordErrors] = useState<{[key: string]: string}>({});
  
  // Password visibility states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // File input ref for profile picture
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Success states
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("📄 ProfilePage: Fetching user profile...");
        setIsLoading(true);
        setError("");
        
        const response = await profileService.getProfile();
        console.log("📄 ProfilePage: Profile response:", response);
        
        if (response && response.status && response.data) {
          setProfile(response.data);
          // Initialize edit form with current profile data
          setEditForm({
            name: response.data.name || "",
            phone: response.data.phone || "",
            phoneCountryCode: response.data.phoneCountryCode || "+2",
            image: ""
          });
          console.log("✅ ProfilePage: Profile loaded successfully:", response.data);
        } else {
          setError("Failed to load profile data");
        }
      } catch (err: any) {
        console.error("🚨 ProfilePage: Error fetching profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleRefresh = () => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await profileService.getProfile();
        if (response && response.status && response.data) {
          setProfile(response.data);
          // Update edit form with fresh data
          setEditForm({
            name: response.data.name || "",
            phone: response.data.phone || "",
            phoneCountryCode: response.data.phoneCountryCode || "+2",
            image: ""
          });
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  };

  // Handle profile picture upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setEditErrors({...editErrors, image: "Image size must be less than 5MB"});
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setEditErrors({...editErrors, image: "Please select a valid image file"});
        return;
      }
      
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        
        console.log("📷 Original FileReader result:", {
          length: base64.length,
          startsWithData: base64.startsWith('data:'),
          preview: base64.substring(0, 100)
        });
        
        // Extract just the base64 data, removing the data URL prefix
        let cleanBase64 = base64;
        if (base64.includes(',')) {
          cleanBase64 = base64.split(',')[1];
        }
        
        // Remove any remaining data URL prefixes
        cleanBase64 = cleanBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        
        // Remove any whitespace, newlines, or other characters
        cleanBase64 = cleanBase64.replace(/\s/g, '').replace(/\n/g, '').replace(/\r/g, '');
        
        // Validate base64 format
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        const isValidBase64 = base64Regex.test(cleanBase64) && cleanBase64.length > 0;
        
        console.log("📷 Image processing complete:", {
          originalLength: base64.length,
          cleanLength: cleanBase64.length,
          isValidBase64: isValidBase64,
          startsWithSlash: cleanBase64.startsWith('/'),
          preview: cleanBase64.substring(0, 50),
          endsWithEquals: cleanBase64.endsWith('=') || cleanBase64.endsWith('==')
        });
        
        if (isValidBase64) {
          setEditForm({...editForm, image: cleanBase64});
          setEditErrors({...editErrors, image: ""});
        } else {
          setEditErrors({...editErrors, image: "Failed to process image. Please try a different image."});
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate edit form
  const validateEditForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!editForm.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (editForm.phone && !/^\d{10,15}$/.test(editForm.phone.replace(/\D/g, ''))) {
      errors.phone = "Please enter a valid phone number";
    }
    
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!passwordForm.oldPassword) {
      errors.oldPassword = "Current password is required";
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!validateEditForm()) return;
    
    setUpdateLoading(true);
    try {
      // Build base update data first
      const updateData: UpdateProfileRequest = {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        phoneCountryCode: editForm.phoneCountryCode
      };
      
      // Handle image if provided
      if (editForm.image && editForm.image.trim()) {
        let cleanImage = editForm.image.trim();
        
        // Remove any potential data URL prefix that might still be present
        cleanImage = cleanImage.replace(/^data:image\/[a-z]+;base64,/, '');
        
        // Remove any whitespace, newlines, or control characters
        cleanImage = cleanImage.replace(/\s/g, '').replace(/\n/g, '').replace(/\r/g, '').replace(/\t/g, '');
        
        // Validate base64 format more strictly
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        const isValidBase64 = base64Regex.test(cleanImage) && cleanImage.length > 0;
        
        // Additional validation: check if it's a proper length (base64 should be divisible by 4 when padding is added)
        const paddedLength = cleanImage.length + (4 - (cleanImage.length % 4)) % 4;
        const isProperLength = paddedLength % 4 === 0;
        
        // Test if the base64 can actually be decoded (final validation)
        let canDecode = false;
        try {
          // Try to decode the base64 string to validate it's actually valid
          const decoded = atob(cleanImage);
          canDecode = decoded.length > 0;
        } catch (decodeError) {
          console.warn("📷 Base64 decode test failed:", decodeError);
          canDecode = false;
        }
        
        console.log("📷 Final image validation:", {
          originalFormLength: editForm.image.length,
          cleanLength: cleanImage.length,
          isValidBase64: isValidBase64,
          isProperLength: isProperLength,
          canDecode: canDecode,
          startsWithSlash: cleanImage.startsWith('/'),
          preview: cleanImage.substring(0, 50),
          willIncludeImage: isValidBase64 && isProperLength && canDecode
        });
        
        // Only add image if it passes all validations
        if (isValidBase64 && isProperLength && canDecode && cleanImage.length > 0) {
          updateData.image = cleanImage;
          console.log("✅ Image validation passed, including in request");
        } else {
          console.warn("❌ Image validation failed, excluding from request");
          setEditErrors({...editErrors, image: "Invalid image format. Please try uploading a different image."});
          setUpdateLoading(false);
          return;
        }
      }
      
      console.log("🔄 Updating profile with data:", {
        ...updateData,
        image: updateData.image ? `Base64 image (${updateData.image.length} chars)` : 'No image field included'
      });
      
      console.log("📤 API Request Structure:", {
        hasImageField: 'image' in updateData,
        imageLength: updateData.image?.length || 0,
        fieldsIncluded: Object.keys(updateData)
      });
      
      const response = await profileService.updateProfile(updateData);
      
      if (response && response.status) {
        setProfile(response.data);
        setShowEditModal(false);
        setUpdateSuccess(true);
        
        // Clear success message after 3 seconds
        setTimeout(() => setUpdateSuccess(false), 3000);
        
        // Reset image field
        setEditForm({...editForm, image: ""});
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setEditErrors({general: response?.message || "Failed to update profile"});
      }
    } catch (err: any) {
      console.error("🚨 Profile update error:", err);
      let errorMessage = "Failed to update profile";
      
      if (err.status === 500) {
        errorMessage = "Server error occurred. Please try again or contact support.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setEditErrors({general: errorMessage});
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;
    
    setPasswordLoading(true);
    try {
      const passwordData: ChangePasswordRequest = {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      };
      
      const response = await profileService.changePassword(passwordData);
      
      if (response && response.status) {
        setShowPasswordModal(false);
        setPasswordSuccess(true);
        
        // Clear form
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => setPasswordSuccess(false), 3000);
      } else {
        setPasswordErrors({general: "Failed to change password"});
      }
    } catch (err: any) {
      setPasswordErrors({general: err.message || "Failed to change password"});
    } finally {
      setPasswordLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = () => {
    if (profile) {
      setEditForm({
        name: profile.name || "",
        phone: profile.phone || "",
        phoneCountryCode: profile.phoneCountryCode || "+2",
        image: ""
      });
    }
    setEditErrors({});
    setShowEditModal(true);
  };

  // Open password modal
  const openPasswordModal = () => {
    setPasswordForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setPasswordErrors({});
    setShowPasswordModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">Error loading profile:</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Messages */}
        <AnimatePresence>
          {updateSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Profile updated successfully!
            </motion.div>
          )}
          
          {passwordSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Password changed successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p className="font-medium">Error loading profile:</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={handleRefresh} className="inline-flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Header with background */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-24"></div>
              
              <div className="p-6 -mt-12">
                <div className="flex items-start gap-6">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-24 h-24 bg-white border-4 border-white rounded-full overflow-hidden shadow-lg">
                      {profile?.profilePic ? (
                        <img 
                          src={profile.profilePic} 
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                          <User className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 pt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">{profile?.name || 'Sales User'}</h2>
                      {profile?.accountType && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {profile.accountType.charAt(0).toUpperCase() + profile.accountType.slice(1)}
                        </span>
                      )}
                      {profile?.isOnline && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Online
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{profile?.email || 'No email'}</span>
                      </div>

                      {profile?.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {profile.phoneCountryCode} {profile.phone}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          ID: {profile?.id || 'Unknown'}
                        </span>
                      </div>

                      {profile?.storeId && (
                        <div className="flex items-center gap-3">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Store: {profile.storeId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 pt-4">
                    <Button 
                      onClick={openEditModal}
                      size="sm"
                      className="inline-flex items-center gap-2"
                    >
                      <Edit3 className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button 
                      onClick={openPasswordModal}
                      variant="outline"
                      size="sm"
                      className="inline-flex items-center gap-2"
                    >
                      <Key className="h-3 w-3" />
                      Password
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Account Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
              
              {profile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">User ID</label>
                      <p className="mt-1 text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded">{profile.id}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Account Type</label>
                      <p className="mt-1 text-gray-900">{profile.accountType}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-gray-900">{profile.email}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-gray-900">
                        {profile.phone ? `${profile.phoneCountryCode} ${profile.phone}` : 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Store ID</label>
                      <p className="mt-1 text-gray-900">{profile.storeId || 'Not assigned'}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profile.isOnline 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {profile.isOnline ? 'Online' : 'Offline'}
                        </span>
                        {profile.isBanned && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Banned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {profile.authProviders && profile.authProviders.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Auth Providers</label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {profile.authProviders.map((provider: string, index: number) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {provider}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No profile data available</p>
              )}
            </motion.div>
          </>
        )}

        {/* Edit Profile Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Edit Profile
              </DialogTitle>
              <DialogDescription>
                Update your profile information below.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {editErrors.general && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                  {editErrors.general}
                </div>
              )}
              
              {/* Profile Picture Upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {editForm.image ? (
                      <img src={`data:image/jpeg;base64,${editForm.image}`} alt="Preview" className="w-full h-full object-cover" />
                    ) : profile?.profilePic ? (
                      <img src={profile.profilePic} alt="Current" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Choose Image
                    </Button>
                  </div>
                </div>
                {editErrors.image && (
                  <p className="text-red-600 text-sm mt-1">{editErrors.image}</p>
                )}
              </div>

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1 block">
                  Name *
                </label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  placeholder="Enter your name"
                  className={editErrors.name ? "border-red-500" : ""}
                />
                {editErrors.name && (
                  <p className="text-red-600 text-sm mt-1">{editErrors.name}</p>
                )}
              </div>

              {/* Phone Fields */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="countryCode" className="text-sm font-medium text-gray-700 mb-1 block">
                    Code
                  </label>
                  <Input
                    id="countryCode"
                    value={editForm.phoneCountryCode}
                    onChange={(e) => setEditForm({...editForm, phoneCountryCode: e.target.value})}
                    placeholder="+2"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1 block">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    placeholder="Enter phone number"
                    className={editErrors.phone ? "border-red-500" : ""}
                  />
                </div>
              </div>
              {editErrors.phone && (
                <p className="text-red-600 text-sm mt-1">{editErrors.phone}</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
                disabled={updateLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUpdateProfile}
                disabled={updateLoading}
                className="inline-flex items-center gap-2"
              >
                {updateLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {updateLoading ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Change Password Modal */}
        <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Password
              </DialogTitle>
              <DialogDescription>
                Enter your current password and choose a new one.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {passwordErrors.general && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                  {passwordErrors.general}
                </div>
              )}

              {/* Current Password */}
              <div>
                <label htmlFor="oldPassword" className="text-sm font-medium text-gray-700 mb-1 block">
                  Current Password *
                </label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                    placeholder="Enter current password"
                    className={passwordErrors.oldPassword ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.oldPassword && (
                  <p className="text-red-600 text-sm mt-1">{passwordErrors.oldPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="text-sm font-medium text-gray-700 mb-1 block">
                  New Password *
                </label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    placeholder="Enter new password"
                    className={passwordErrors.newPassword ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-red-600 text-sm mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-1 block">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    placeholder="Confirm new password"
                    className={passwordErrors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordModal(false)}
                disabled={passwordLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="inline-flex items-center gap-2"
              >
                {passwordLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Key className="h-4 w-4" />
                )}
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
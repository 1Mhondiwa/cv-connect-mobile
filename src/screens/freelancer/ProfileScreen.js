import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Platform, ToastAndroid } from 'react-native';
import { Text, Card, Button, IconButton, Surface, useTheme, Avatar, Divider, Chip } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { updateProfile, getProfile, updateAvailability } from '../../store/slices/freelancerSlice';
import { profileAPI } from '../../services/api';
import { showToast } from '../../utils/toast';

const ProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.freelancer);
  const { user } = useSelector((state) => state.auth);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = React.useRef(null);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    headline: '',
    phone: '',
    linkedin_url: '',
    github_url: '',
    summary: '',
          availability_status: 'available'
  });

  // Skills management
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Proficient');

  // Education management
  const [education, setEducation] = useState([]);
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    year: '',
    description: ''
  });

  // Work experience management
  const [workExperience, setWorkExperience] = useState([]);
  const [newWorkExperience, setNewWorkExperience] = useState({
    title: '',
    company: '',
    start_date: '',
    end_date: '',
    description: ''
  });

  // Contact information management
  const [newContact, setNewContact] = useState({
    type: 'phone',
    value: ''
  });

  // Load profile data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('ProfileScreen: Loading profile data...');
      dispatch(getProfile());
    }, [dispatch])
  );

  // Initialize form data when profile loads
  React.useEffect(() => {
    console.log('ProfileScreen: useEffect triggered - Profile data changed:', profile);
    console.log('ProfileScreen: useEffect - profile.availability_status:', profile?.availability_status);
    if (profile) {
      // Only initialize form data if it hasn't been set yet (first load)
      setFormData(prevFormData => {
        console.log('ProfileScreen: useEffect - prevFormData:', prevFormData);
        // If formData is already initialized (has values), don't reset it
        if (prevFormData.first_name !== '' || prevFormData.last_name !== '') {
          console.log('ProfileScreen: Form already initialized, preserving current values');
          console.log('ProfileScreen: Current availability_status in form:', prevFormData.availability_status);
          return prevFormData;
        }
        
        console.log('ProfileScreen: Initializing form data from profile');
        const newFormData = {
          first_name: profile.first_name || user?.first_name || '',
          last_name: profile.last_name || user?.last_name || '',
          headline: profile.headline || '',
          phone: profile.phone || '',
          linkedin_url: profile.linkedin_url || '',
          github_url: profile.github_url || '',
          summary: profile.summary || '',
          availability_status: profile.availability_status !== undefined ? profile.availability_status : 'available'
        };
        console.log('ProfileScreen: New formData being set:', newFormData);
        return newFormData;
      });

      // Initialize skills from CV-extracted skills or existing skills
      // Convert backend skills format to frontend format
      const backendSkills = profile.skills || [];
      const cvSkills = profile.cv_skills || [];
      
      // Combine both skills and convert to frontend format
      const allSkills = [
        ...backendSkills.map(skill => ({
          name: skill.skill_name || skill.name,
          level: skill.proficiency_level || skill.level || 'Proficient'
        })),
        ...cvSkills.map(skill => ({
          name: skill.name,
          level: skill.level || 'Proficient'
        }))
      ];
      
      setSkills(allSkills);
      
      // Initialize education from CV-extracted education or existing education
      setEducation(profile.education || []);
      
      // Initialize work experience from CV-extracted work experience
      setWorkExperience(profile.work_experience || []);
    }
  }, [profile, user]);

  const handleEditToggle = () => {
    console.log('ProfileScreen: Edit button clicked, current isEditing:', isEditing);
    if (isEditing) {
      // Save changes before exiting edit mode
      console.log('ProfileScreen: Saving changes before exiting edit mode');
      handleSaveProfile();
    }
    setIsEditing(!isEditing);
    console.log('ProfileScreen: isEditing set to:', !isEditing);
  };

  const handleCancelEdit = () => {
    console.log('ProfileScreen: Cancel edit clicked');
    // Reset form data to original profile values
    setFormData({
      first_name: profile.first_name || user?.first_name || '',
      last_name: profile.last_name || user?.last_name || '',
      headline: profile.headline || '',
      phone: profile.phone || '',
      linkedin_url: profile.linkedin_url || '',
      github_url: profile.github_url || '',
      summary: profile.summary || '',
      availability_status: profile.availability_status !== undefined ? profile.availability_status : 'available'
    });
    setSkills(profile.cv_skills || profile.skills || []);
    setEducation(profile.education || []);
    setWorkExperience(profile.work_experience || []);
    setNewSkill('');
    setNewSkillLevel('Proficient');
    setNewEducation({ degree: '', institution: '', year: '', description: '' });
    setNewWorkExperience({ title: '', company: '', start_date: '', end_date: '', description: '' });
    setNewContact({ type: 'phone', value: '' });
    setIsEditing(false);
    console.log('ProfileScreen: Edit mode cancelled');
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // First, update basic profile information
      const profileData = {
        ...formData
      };

      const profileResponse = await dispatch(updateProfile(profileData)).unwrap();
      
      if (profileResponse.success) {
        // Now handle skills updates
        try {
          // Get current skills from profile to compare
          const currentSkills = profile?.skills || profile?.cv_skills || [];
          
          // Find skills to add (skills that are in local state but not in current profile)
          const skillsToAdd = skills.filter(localSkill => 
            !currentSkills.some(currentSkill => 
              currentSkill.name?.toLowerCase() === localSkill.name.toLowerCase() ||
              currentSkill.skill_name?.toLowerCase() === localSkill.name.toLowerCase()
            )
          );
          
          // Add new skills
          for (const skill of skillsToAdd) {
            await profileAPI.addSkill({
              skill_name: skill.name,
              proficiency_level: skill.level || 'Proficient'
            });
          }
          
          // Note: For now, we'll only add skills. Deleting skills would require more complex logic
          // to identify which skills were removed and call the delete API
          
          Alert.alert('Success', 'Profile and skills updated successfully!');
          setIsEditing(false);
          // Refresh profile data
          dispatch(getProfile());
        } catch (skillsError) {
          console.error('Error updating skills:', skillsError);
          Alert.alert('Warning', 'Profile updated but there was an issue updating skills. Please try again.');
        }
      } else {
        Alert.alert('Error', profileResponse.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = async (field, value) => {
    console.log('ProfileScreen: handleInputChange called with field:', field, 'value:', value, 'type:', typeof value);
    
    // For availability_status, use the value directly since we're now passing strings
    let newValue = value;
    if (field === 'availability_status') {
      newValue = value; // Use the string value directly
      console.log('ProfileScreen: Setting availability_status to:', newValue);
    }
    
    setFormData(prev => {
      console.log('ProfileScreen: Previous formData:', prev);
      const newFormData = {
        ...prev,
        [field]: newValue
      };
      console.log('ProfileScreen: New formData:', newFormData);
      
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timeout for auto-save
      saveTimeoutRef.current = setTimeout(async () => {
        // Don't auto-save if profile isn't loaded yet
        if (!profile) {
          console.log('ProfileScreen: Skipping auto-save - profile not loaded yet');
          return;
        }
        
        console.log('ProfileScreen: Current profile data:', profile);
        console.log('ProfileScreen: Current formData:', newFormData);
        
        try {
          // If only availability is being changed, use the dedicated endpoint
          if (field === 'availability_status') {
            console.log('ProfileScreen: Using availability-only endpoint');
            const result = await dispatch(updateAvailability(newValue)).unwrap();
            console.log(`ProfileScreen: Availability updated to:`, newValue, 'Result:', result);
            return;
          }
          
          // Create a clean data object with only non-empty values and preserve existing values
          const cleanData = {};
          Object.keys(newFormData).forEach(key => {
            if (newFormData[key] !== '' && newFormData[key] !== null && newFormData[key] !== undefined) {
              cleanData[key] = newFormData[key];
            } else if (profile && profile[key] !== undefined && profile[key] !== '') {
              // Preserve existing value if new value is empty
              cleanData[key] = profile[key];
            }
          });
          
          // Ensure required fields are always present
          if (!cleanData.first_name && profile?.first_name) cleanData.first_name = profile.first_name;
          if (!cleanData.last_name && profile?.last_name) cleanData.last_name = profile.last_name;
          if (!cleanData.phone && profile?.phone) cleanData.phone = profile.phone;
          
          // Debug: Check if phone is missing
          if (!cleanData.phone) {
            console.log('ProfileScreen: WARNING - Phone field is missing!');
            console.log('ProfileScreen: Profile phone:', profile?.phone);
            console.log('ProfileScreen: FormData phone:', newFormData.phone);
          }
          
          // Skip auto-save if required fields are missing
          if (!cleanData.phone || !cleanData.first_name || !cleanData.last_name) {
            console.log('ProfileScreen: Skipping auto-save - required fields missing');
            console.log('ProfileScreen: Missing fields - phone:', !cleanData.phone, 'first_name:', !cleanData.first_name, 'last_name:', !cleanData.last_name);
            return;
          }
          
          console.log('ProfileScreen: Auto-saving clean profile data:', cleanData);
          const result = await dispatch(updateProfile(cleanData)).unwrap();
          console.log(`ProfileScreen: Auto-saved ${field}:`, value, 'Result:', result);
        } catch (error) {
          // Log the entire error object
          console.error('ProfileScreen: Full error object:', error);
          
          // Handle the new error format from the thunk
          let msg = 'Failed to update profile';
          if (error && typeof error === 'object') {
            if (error.message) {
              msg = error.message;
            }
            if (error.responseData) {
              console.error('ProfileScreen: error.responseData:', error.responseData);
              if (error.responseData.errors && error.responseData.errors.length > 0) {
                // Handle validation errors array
                msg = error.responseData.errors[0].msg;
              } else if (error.responseData.error) {
                msg = error.responseData.error;
              } else if (error.responseData.message) {
                msg = error.responseData.message;
              }
            }
          }
          showToast(msg);
        }
      }, 1000); // 1 second delay
      
      return newFormData;
    });
  };

  // Skills management functions
  const addSkill = async () => {
    if (newSkill.trim()) {
      const skillExists = skills.some(skill => 
        skill.name.toLowerCase() === newSkill.trim().toLowerCase()
      );
      
      if (skillExists) {
        Alert.alert('Duplicate Skill', 'This skill already exists in your profile.');
        return;
      }

      try {
        // Add to local state immediately for UI feedback
        const newSkillObj = { name: newSkill.trim(), level: newSkillLevel };
        setSkills(prev => [...prev, newSkillObj]);
        
        // Save to backend
        await profileAPI.addSkill({
          skill_name: newSkill.trim(),
          proficiency_level: newSkillLevel
        });
        
        setNewSkill('');
        setNewSkillLevel('Proficient');
        
        // Show success message
        Alert.alert('Success', `Skill "${newSkill.trim()}" added successfully!`);
        
        // Refresh profile data to get updated skills count
        dispatch(getProfile());
      } catch (error) {
        console.error('Error adding skill:', error);
        // Remove from local state if backend save failed
        setSkills(prev => prev.filter(skill => skill.name !== newSkill.trim()));
        Alert.alert('Error', 'Failed to add skill. Please try again.');
      }
    }
  };

  const removeSkill = async (index) => {
    const skillToRemove = skills[index];
    
    try {
      // Remove from local state immediately for UI feedback
      setSkills(prev => prev.filter((_, i) => i !== index));
      
      // If it's a backend skill (not CV skill), delete from backend
      const backendSkills = profile?.skills || [];
      const isBackendSkill = backendSkills.some(backendSkill => 
        backendSkill.skill_name === skillToRemove.name
      );
      
      if (isBackendSkill) {
        // Find the skill ID to delete
        const skillToDelete = backendSkills.find(backendSkill => 
          backendSkill.skill_name === skillToRemove.name
        );
        
        if (skillToDelete?.freelancer_skill_id) {
          await profileAPI.deleteSkill(skillToDelete.freelancer_skill_id);
        }
      }
      
      // Show success message
      Alert.alert('Success', `Skill "${skillToRemove.name}" removed successfully!`);
      
      // Refresh profile data to get updated skills count
      dispatch(getProfile());
    } catch (error) {
      console.error('Error removing skill:', error);
      // Add back to local state if backend delete failed
      setSkills(prev => [...prev, skillToRemove]);
      Alert.alert('Error', 'Failed to remove skill. Please try again.');
    }
  };

  const editSkill = async (index, newName, newLevel) => {
    const oldSkill = skills[index];
    
    try {
      // Update local state immediately for UI feedback
      setSkills(prev => prev.map((skill, i) => 
        i === index ? { name: newName, level: newLevel } : skill
      ));
      
      // If it's a backend skill (not CV skill), update in backend
      const backendSkills = profile?.skills || [];
      const isBackendSkill = backendSkills.some(backendSkill => 
        backendSkill.skill_name === oldSkill.name
      );
      
      if (isBackendSkill) {
        // Find the skill ID to update
        const skillToUpdate = backendSkills.find(backendSkill => 
          backendSkill.skill_name === oldSkill.name
        );
        
        if (skillToUpdate?.freelancer_skill_id) {
          await profileAPI.updateSkill(skillToUpdate.freelancer_skill_id, {
            proficiency_level: newLevel
          });
        }
      }
      
      // Show success message
      Alert.alert('Success', `Skill "${oldSkill.name}" updated to "${newName}" successfully!`);
      
      // Refresh profile data to get updated skills count
      dispatch(getProfile());
    } catch (error) {
      console.error('Error updating skill:', error);
      // Revert local state if backend update failed
      setSkills(prev => prev.map((skill, i) => 
        i === index ? oldSkill : skill
      ));
      Alert.alert('Error', 'Failed to update skill. Please try again.');
    }
  };

  // Education management functions
  const addEducation = async () => {
    if (newEducation.degree.trim() && newEducation.institution.trim()) {
      try {
        // Add to local state immediately for UI feedback
        const newEducationObj = { ...newEducation };
        setEducation(prev => [...prev, newEducationObj]);
        setNewEducation({ degree: '', institution: '', year: '', description: '' });
        
        // Save to backend via profile update
        const updatedProfile = {
          ...formData,
          education: [...education, newEducationObj]
        };
        
        await dispatch(updateProfile(updatedProfile)).unwrap();
        
        // Show success message
        Alert.alert('Success', `Education "${newEducationObj.degree}" added successfully!`);
        
        // Refresh profile data
        dispatch(getProfile());
      } catch (error) {
        console.error('Error adding education:', error);
        // Remove from local state if backend save failed
        setEducation(prev => prev.filter(edu => edu.degree !== newEducation.degree));
        Alert.alert('Error', 'Failed to add education. Please try again.');
      }
    } else {
      Alert.alert('Required Fields', 'Please fill in both degree and institution.');
    }
  };

  const removeEducation = async (index) => {
    const educationToRemove = education[index];
    
    try {
      // Remove from local state immediately for UI feedback
      setEducation(prev => prev.filter((_, i) => i !== index));
      
      // Save to backend via profile update
      const updatedProfile = {
        ...formData,
        education: education.filter((_, i) => i !== index)
      };
      
      await dispatch(updateProfile(updatedProfile)).unwrap();
      
      // Show success message
      Alert.alert('Success', `Education "${educationToRemove.degree}" removed successfully!`);
      
      // Refresh profile data
      dispatch(getProfile());
    } catch (error) {
      console.error('Error removing education:', error);
      // Add back to local state if backend save failed
      setEducation(prev => [...prev, educationToRemove]);
      Alert.alert('Error', 'Failed to remove education. Please try again.');
    }
  };

  const editEducation = async (index, field, value) => {
    const oldEducation = education[index];
    
    try {
      // Update local state immediately for UI feedback
      setEducation(prev => prev.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      ));
      
      // Save to backend via profile update
      const updatedEducation = education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      );
      
      const updatedProfile = {
        ...formData,
        education: updatedEducation
      };
      
      await dispatch(updateProfile(updatedProfile)).unwrap();
      
      // Show success message
      Alert.alert('Success', `Education "${oldEducation.degree}" updated successfully!`);
      
      // Refresh profile data
      dispatch(getProfile());
    } catch (error) {
      console.error('Error updating education:', error);
      // Revert local state if backend save failed
      setEducation(prev => prev.map((edu, i) => 
        i === index ? oldEducation : edu
      ));
      Alert.alert('Error', 'Failed to update education. Please try again.');
    }
  };

  // Work experience management functions
  const addWorkExperience = async () => {
    if (newWorkExperience.title.trim() && newWorkExperience.company.trim()) {
      try {
        // Add to local state immediately for UI feedback
        const newWorkExpObj = { ...newWorkExperience };
        setWorkExperience(prev => [...prev, newWorkExpObj]);
        setNewWorkExperience({ title: '', company: '', start_date: '', end_date: '', description: '' });
        
        // Save to backend via profile update
        const updatedProfile = {
          ...formData,
          work_experience: [...workExperience, newWorkExpObj]
        };
        
        await dispatch(updateProfile(updatedProfile)).unwrap();
        
        // Show success message
        Alert.alert('Success', `Work experience "${newWorkExpObj.title}" added successfully!`);
        
        // Refresh profile data
        dispatch(getProfile());
      } catch (error) {
        console.error('Error adding work experience:', error);
        // Remove from local state if backend save failed
        setWorkExperience(prev => prev.filter(exp => exp.title !== newWorkExperience.title));
        Alert.alert('Error', 'Failed to add work experience. Please try again.');
      }
    } else {
      Alert.alert('Required Fields', 'Please fill in both job title and company.');
    }
  };

  const removeWorkExperience = async (index) => {
    const workExpToRemove = workExperience[index];
    
    try {
      // Remove from local state immediately for UI feedback
      setWorkExperience(prev => prev.filter((_, i) => i !== index));
      
      // Save to backend via profile update
      const updatedProfile = {
        ...formData,
        work_experience: workExperience.filter((_, i) => i !== index)
      };
      
      await dispatch(updateProfile(updatedProfile)).unwrap();
      
      // Show success message
      Alert.alert('Success', `Work experience "${workExpToRemove.title}" removed successfully!`);
      
      // Refresh profile data
      dispatch(getProfile());
    } catch (error) {
      console.error('Error removing work experience:', error);
      // Add back to local state if backend save failed
      setWorkExperience(prev => [...prev, workExpToRemove]);
      Alert.alert('Error', 'Failed to remove work experience. Please try again.');
    }
  };

  const editWorkExperience = async (index, field, value) => {
    const oldWorkExp = workExperience[index];
    
    try {
      // Update local state immediately for UI feedback
      setWorkExperience(prev => prev.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      ));
      
      // Save to backend via profile update
      const updatedWorkExp = workExperience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      );
      
      const updatedProfile = {
        ...formData,
        work_experience: updatedWorkExp
      };
      
      await dispatch(updateProfile(updatedProfile)).unwrap();
      
      // Show success message
      Alert.alert('Success', `Work experience "${oldWorkExp.title}" updated successfully!`);
      
      // Refresh profile data
      dispatch(getProfile());
    } catch (error) {
      console.error('Error updating work experience:', error);
      // Revert local state if backend save failed
      setWorkExperience(prev => prev.map((exp, i) => 
        i === index ? oldWorkExp : exp
      ));
      Alert.alert('Error', 'Failed to update work experience. Please try again.');
    }
  };

  // Contact information management functions
  const addContact = async () => {
    if (newContact.value.trim()) {
      try {
        // Add to formData based on type
        if (newContact.type === 'phone') {
          setFormData(prev => ({ ...prev, phone: newContact.value.trim() }));
        } else if (newContact.type === 'linkedin') {
          setFormData(prev => ({ ...prev, linkedin_url: newContact.value.trim() }));
        } else if (newContact.type === 'github') {
          setFormData(prev => ({ ...prev, github_url: newContact.value.trim() }));
        }
        setNewContact({ type: 'phone', value: '' });
        
        // Save to backend immediately
        const profileData = {
          ...formData,
          [newContact.type === 'phone' ? 'phone' : `${newContact.type}_url`]: newContact.value.trim()
        };
        
        await dispatch(updateProfile(profileData)).unwrap();
        
        // Show success message
        const contactType = newContact.type.charAt(0).toUpperCase() + newContact.type.slice(1);
        Alert.alert('Success', `${contactType} contact information added successfully!`);
        
        // Refresh profile data
        dispatch(getProfile());
      } catch (error) {
        console.error('Error adding contact:', error);
        Alert.alert('Error', 'Failed to add contact information. Please try again.');
      }
    }
  };

  const handleProfilePictureUpload = async () => {
    try {
      console.log('Starting profile picture upload process...');
      
      // Request both camera and media library permissions
      const [mediaLibraryPermission, cameraPermission] = await Promise.all([
        ImagePicker.requestMediaLibraryPermissionsAsync(),
        ImagePicker.requestCameraPermissionsAsync()
      ]);
      
      console.log('Media library permission result:', mediaLibraryPermission);
      console.log('Camera permission result:', cameraPermission);
      
      if (mediaLibraryPermission.granted === false && cameraPermission.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll or camera is required!');
        return;
      }

      console.log('Launching image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: false,
        quality: 1,
      });
      
      console.log('Image picker result:', result);

      if (!result.canceled && result.assets[0]) {
        setUploadingImage(true);
        
        try {
          // Create FormData for the image
          const formData = new FormData();
          formData.append('image', {
            uri: result.assets[0].uri,
            type: 'image/jpeg',
            name: 'profile-picture.jpg',
          });
          
          // Upload the image to the backend
          console.log('Uploading profile picture...');
          console.log('FormData:', formData);
          const response = await profileAPI.uploadProfileImage(formData);
          console.log('Profile picture upload response:', response.data);
          
          if (response.data.success) {
            Alert.alert('Success', 'Profile picture updated successfully!');
            // Refresh profile data to get the new image URL
            dispatch(getProfile());
          } else {
            Alert.alert('Error', response.data.message || 'Failed to update profile picture');
      }
    } catch (error) {
          console.error('Profile picture upload error:', error);
          console.error('Error response:', error.response?.data);
          console.error('Error status:', error.response?.status);
          
          let errorMessage = 'Failed to update profile picture';
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          Alert.alert('Error', errorMessage);
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      console.error('Profile picture upload outer error:', error);
      setUploadingImage(false);
      
      let errorMessage = 'Failed to update profile picture';
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const handleViewCV = async () => {
    if (!profile?.cv?.stored_filename) {
      Alert.alert('Error', 'CV file not found');
      return;
    }

    try {
      // Debug: Log the CV data to see what we're working with
      console.log('CV Data:', profile.cv);
      console.log('Stored filename:', profile.cv.stored_filename);
      console.log('Original filename:', profile.cv.original_filename);
      
      // Construct the full URL to the CV file
      const cvUrl = `http://192.168.101.122:5000/uploads/cvs/${profile.cv.stored_filename}`;
      console.log('Opening CV URL:', cvUrl);
      
      // For now, show the URL in an alert so we can see what it's trying to access
      Alert.alert(
        'CV URL Debug', 
        `Trying to access: ${cvUrl}\n\nStored filename: ${profile.cv.stored_filename}\nOriginal filename: ${profile.cv.original_filename}`,
        [
          {
            text: 'Copy URL',
            onPress: () => {
              // You can implement clipboard functionality here
              console.log('URL copied to clipboard:', cvUrl);
            }
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
      
      // TODO: Implement in-app PDF viewer
      // For now, we'll just show the debug info
      
    } catch (error) {
      console.error('Error opening CV:', error);
      Alert.alert('Error', 'Failed to open CV file');
    }
  };

  const handleDownloadCV = async () => {
    if (!profile?.cv?.stored_filename) {
      Alert.alert('Error', 'CV file not found');
      return;
    }

    try {
      // Debug: Log the CV data
      console.log('CV Data for download:', profile.cv);
      
      // Construct the full URL to the CV file
      const cvUrl = `http://192.168.101.122:5000/uploads/cvs/${profile.cv.stored_filename}`;
      console.log('Downloading CV from URL:', cvUrl);
      
      // Show success message (in-app download simulation)
      Alert.alert(
        'Download Started', 
        `CV "${profile.cv.original_filename}" is being downloaded.\n\nURL: ${cvUrl}`,
        [
          {
            text: 'View in Browser',
            onPress: async () => {
              try {
                await Linking.openURL(cvUrl);
              } catch (error) {
                console.error('Error opening URL:', error);
                Alert.alert('Error', 'Failed to open URL in browser');
              }
            }
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
      
    } catch (error) {
      console.error('Error downloading CV:', error);
      Alert.alert('Error', 'Failed to download CV file');
    }
  };

  const renderSkills = () => {
    // Use skills from local state when editing, otherwise use profile data
    let currentSkills;
    
    if (isEditing) {
      currentSkills = skills;
    } else {
      // Combine backend skills and CV skills for display
      const backendSkills = profile?.skills || [];
      const cvSkills = profile?.cv_skills || [];
      
      currentSkills = [
        ...backendSkills.map(skill => ({
          name: skill.skill_name || skill.name,
          level: skill.proficiency_level || skill.level || 'Proficient'
        })),
        ...cvSkills.map(skill => ({
          name: skill.name,
          level: skill.level || 'Proficient'
        }))
      ];
    }
    
    console.log('ProfileScreen - currentSkills:', currentSkills);
    console.log('ProfileScreen - skills length:', currentSkills?.length);
    
    if (!currentSkills || currentSkills.length === 0) {
    return (
        <View style={styles.emptySection}>
          <Text style={styles.emptyText}>No skills available yet</Text>
      </View>
    );
  }

  return (
      <View style={styles.skillsList}>
        {currentSkills.map((skill, index) => (
          <View key={index} style={styles.skillItem}>
            <Text style={styles.skillName}>{skill.name}</Text>
            <Text style={styles.skillLevel}>{skill.level || 'Proficient'}</Text>
      </View>
        ))}
      </View>
    );
  };

  const renderEducation = () => {
    // Use education from local state when editing, otherwise use profile data
    const currentEducation = isEditing ? education : (profile?.education || []);
    console.log('ProfileScreen - currentEducation:', currentEducation);
    console.log('ProfileScreen - education length:', currentEducation?.length);
    
    if (!currentEducation || currentEducation.length === 0) {
      return (
        <View style={styles.emptySection}>
          <Text style={styles.emptyText}>No education information available yet</Text>
        </View>
      );
    }

    return (
      <View style={styles.educationList}>
        {currentEducation.map((edu, index) => (
          <View key={index} style={styles.educationItem}>
            <Text style={styles.educationDegree}>{edu.degree || edu.title}</Text>
            <Text style={styles.educationInstitution}>{edu.institution || edu.school}</Text>
            <Text style={styles.educationYear}>{edu.year || edu.graduation_year}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderWorkExperience = () => {
    // Use work experience from local state when editing, otherwise use profile data
    const currentWorkExperience = isEditing ? workExperience : (profile?.work_experience || []);
    console.log('ProfileScreen - currentWorkExperience:', currentWorkExperience);
    console.log('ProfileScreen - work_experience length:', currentWorkExperience?.length);
    
    if (!currentWorkExperience || currentWorkExperience.length === 0) {
      return (
        <View style={styles.emptySection}>
          <Text style={styles.emptyText}>No work experience available yet</Text>
        </View>
      );
    }

    return (
      <View style={styles.experienceList}>
        {currentWorkExperience.map((exp, index) => (
          <View key={index} style={styles.experienceItem}>
            <Text style={styles.experienceTitle}>{exp.title || exp.position}</Text>
            <Text style={styles.experienceCompany}>{exp.company || exp.employer}</Text>
            <Text style={styles.experienceDuration}>{exp.duration || `${exp.start_date} - ${exp.end_date || 'Present'}`}</Text>
            <Text style={styles.experienceDescription}>{exp.description || exp.responsibilities}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderEditSkills = () => (
    <Card style={styles.sectionCard} elevation={2}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Skills Management
        </Text>
        
        {/* Current Skills */}
        <View style={styles.currentSkillsContainer}>
          <Text variant="bodyMedium" style={styles.subsectionTitle}>Current Skills:</Text>
          {skills.length === 0 ? (
            <Text style={styles.emptyText}>No skills added yet</Text>
          ) : (
            <View style={styles.skillsChipsContainer}>
              {skills.map((skill, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  onPress={() => {
                    Alert.prompt(
                      'Edit Skill',
                      'Enter new skill name:',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Save',
                          onPress: (newName) => {
                            if (newName && newName.trim()) {
                              editSkill(index, newName.trim(), skill.level);
                            }
                          }
                        }
                      ],
                      'plain-text',
                      skill.name
                    );
                  }}
                  onClose={() => removeSkill(index)}
                  style={styles.skillChip}
                  textStyle={styles.skillChipText}
                >
                  {skill.name} ({skill.level})
                </Chip>
              ))}
            </View>
          )}
        </View>

        {/* Add New Skill */}
        <View style={styles.addSkillContainer}>
          <Text variant="bodyMedium" style={styles.subsectionTitle}>Add New Skill:</Text>
          <View style={styles.addSkillRow}>
            <TextInput
              mode="outlined"
              label="Skill Name"
              value={newSkill}
              onChangeText={setNewSkill}
              style={[styles.formInput, styles.skillInput]}
              outlineColor="#E0E0E0"
              activeOutlineColor="#FF6B35"
              placeholder="e.g., JavaScript"
            />
            <View style={styles.skillLevelContainer}>
              <Text style={styles.skillLevelLabel}>Level:</Text>
              <View style={styles.skillLevelButtons}>
                {['Beginner', 'Intermediate', 'Proficient', 'Expert'].map((level) => (
                  <Chip
                    key={level}
                    mode={newSkillLevel === level ? 'flat' : 'outlined'}
                    onPress={() => setNewSkillLevel(level)}
                    style={[
                      styles.levelChip,
                      newSkillLevel === level && styles.selectedLevelChip
                    ]}
                    textStyle={[
                      styles.levelChipText,
                      newSkillLevel === level && styles.selectedLevelChipText
                    ]}
                  >
                    {level}
                  </Chip>
                ))}
              </View>
            </View>
            <Button
              mode="contained"
              onPress={addSkill}
              style={styles.addButton}
              disabled={!newSkill.trim()}
              icon="plus"
            >
              Add
            </Button>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEditEducation = () => (
    <Card style={styles.sectionCard} elevation={2}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Education Management
                </Text>
        
        {/* Current Education */}
        <View style={styles.currentEducationContainer}>
          <Text variant="bodyMedium" style={styles.subsectionTitle}>Current Education:</Text>
          {education.length === 0 ? (
            <Text style={styles.emptyText}>No education added yet</Text>
          ) : (
            <View style={styles.educationList}>
              {education.map((edu, index) => (
                <View key={index} style={styles.educationEditItem}>
                  <View style={styles.educationEditHeader}>
                    <Text style={styles.educationEditTitle}>{edu.degree}</Text>
                    <IconButton
                      icon="delete"
                      size={20}
                      iconColor="#EF4444"
                      onPress={() => removeEducation(index)}
                    />
              </View>
                  <Text style={styles.educationEditInstitution}>{edu.institution}</Text>
                  <Text style={styles.educationEditYear}>{edu.year}</Text>
                  {edu.description && (
                    <Text style={styles.educationEditDescription}>{edu.description}</Text>
                  )}
                </View>
              ))}
            </View>
            )}
          </View>

        {/* Add New Education */}
        <View style={styles.addEducationContainer}>
          <Text variant="bodyMedium" style={styles.subsectionTitle}>Add New Education:</Text>
          
          <TextInput
            mode="outlined"
            label="Degree/Qualification"
            value={newEducation.degree}
            onChangeText={(value) => setNewEducation(prev => ({ ...prev, degree: value }))}
            style={styles.formInput}
            outlineColor="#E0E0E0"
            activeOutlineColor="#FF6B35"
            placeholder="e.g., Bachelor of Science in Computer Science"
          />

          <TextInput
            mode="outlined"
            label="Institution"
            value={newEducation.institution}
            onChangeText={(value) => setNewEducation(prev => ({ ...prev, institution: value }))}
            style={styles.formInput}
            outlineColor="#E0E0E0"
            activeOutlineColor="#FF6B35"
            placeholder="e.g., University of Technology"
          />

          <TextInput
            mode="outlined"
            label="Year"
            value={newEducation.year}
            onChangeText={(value) => setNewEducation(prev => ({ ...prev, year: value }))}
            style={styles.formInput}
            outlineColor="#E0E0E0"
            activeOutlineColor="#FF6B35"
            placeholder="e.g., 2020"
          />

          <TextInput
            mode="outlined"
            label="Description (Optional)"
            value={newEducation.description}
            onChangeText={(value) => setNewEducation(prev => ({ ...prev, description: value }))}
            style={[styles.formInput, styles.textArea]}
            outlineColor="#E0E0E0"
            activeOutlineColor="#FF6B35"
            multiline
            numberOfLines={3}
            placeholder="Brief description of your studies..."
          />

          <Button
            mode="contained"
            onPress={addEducation}
            style={styles.addButton}
            disabled={!newEducation.degree.trim() || !newEducation.institution.trim()}
            icon="plus"
          >
            Add Education
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

     const renderEditWorkExperience = () => (
     <Card style={styles.sectionCard} elevation={2}>
       <Card.Content>
         <Text variant="titleMedium" style={styles.sectionTitle}>
           Work Experience Management
          </Text>
         
         {/* Current Work Experience */}
         <View style={styles.currentWorkExperienceContainer}>
           <Text variant="bodyMedium" style={styles.subsectionTitle}>Current Work Experience:</Text>
           {workExperience.length === 0 ? (
             <Text style={styles.emptyText}>No work experience added yet</Text>
           ) : (
             <View style={styles.workExperienceList}>
               {workExperience.map((exp, index) => (
                 <View key={index} style={styles.workExperienceEditItem}>
                   <View style={styles.workExperienceEditHeader}>
                     <Text style={styles.workExperienceEditTitle}>{exp.title}</Text>
                     <IconButton
                       icon="delete"
                       size={20}
                       iconColor="#EF4444"
                       onPress={() => removeWorkExperience(index)}
                     />
                   </View>
                   <Text style={styles.workExperienceEditCompany}>{exp.company}</Text>
                   <Text style={styles.workExperienceEditDuration}>{exp.start_date} - {exp.end_date || 'Present'}</Text>
                   {exp.description && (
                     <Text style={styles.workExperienceEditDescription}>{exp.description}</Text>
                   )}
                 </View>
               ))}
             </View>
           )}
        </View>

         {/* Add New Work Experience */}
         <View style={styles.addWorkExperienceContainer}>
           <Text variant="bodyMedium" style={styles.subsectionTitle}>Add New Work Experience:</Text>
           
            <TextInput
             mode="outlined"
             label="Job Title"
             value={newWorkExperience.title}
             onChangeText={(value) => setNewWorkExperience(prev => ({ ...prev, title: value }))}
             style={styles.formInput}
             outlineColor="#E0E0E0"
             activeOutlineColor="#FF6B35"
             placeholder="e.g., Software Developer"
           />

            <TextInput
             mode="outlined"
             label="Company"
             value={newWorkExperience.company}
             onChangeText={(value) => setNewWorkExperience(prev => ({ ...prev, company: value }))}
             style={styles.formInput}
             outlineColor="#E0E0E0"
             activeOutlineColor="#FF6B35"
             placeholder="e.g., Tech Company Inc."
           />

           <View style={styles.dateRow}>
            <TextInput
               mode="outlined"
               label="Start Date"
               value={newWorkExperience.start_date}
               onChangeText={(value) => setNewWorkExperience(prev => ({ ...prev, start_date: value }))}
               style={[styles.formInput, styles.dateInput]}
               outlineColor="#E0E0E0"
               activeOutlineColor="#FF6B35"
               placeholder="e.g., Jan 2020"
             />
             <TextInput
               mode="outlined"
               label="End Date"
               value={newWorkExperience.end_date}
               onChangeText={(value) => setNewWorkExperience(prev => ({ ...prev, end_date: value }))}
               style={[styles.formInput, styles.dateInput]}
               outlineColor="#E0E0E0"
               activeOutlineColor="#FF6B35"
               placeholder="e.g., Dec 2023 (or leave empty for current)"
            />
          </View>

            <TextInput
             mode="outlined"
             label="Description (Optional)"
             value={newWorkExperience.description}
             onChangeText={(value) => setNewWorkExperience(prev => ({ ...prev, description: value }))}
             style={[styles.formInput, styles.textArea]}
             outlineColor="#E0E0E0"
             activeOutlineColor="#FF6B35"
             multiline
             numberOfLines={3}
             placeholder="Brief description of your role and responsibilities..."
           />

           <Button
             mode="contained"
             onPress={addWorkExperience}
             style={styles.addButton}
             disabled={!newWorkExperience.title.trim() || !newWorkExperience.company.trim()}
             icon="plus"
           >
             Add Work Experience
           </Button>
          </View>
       </Card.Content>
     </Card>
   );

   const renderEditContact = () => (
    <Card style={styles.sectionCard} elevation={2}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Add Contact Information
        </Text>
        
        <Text variant="bodySmall" style={styles.contactNote}>
          Note: You can add new contact information. Existing contact details cannot be edited.
        </Text>

        <View style={styles.addContactContainer}>
          <View style={styles.contactTypeSelector}>
            <Text style={styles.contactTypeLabel}>Contact Type:</Text>
            <View style={styles.contactTypeButtons}>
              {[
                { type: 'phone', label: 'Phone', icon: 'phone' },
                { type: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
                { type: 'github', label: 'GitHub', icon: 'github' }
              ].map((contactType) => (
                <Chip
                  key={contactType.type}
                  mode={newContact.type === contactType.type ? 'flat' : 'outlined'}
                  onPress={() => setNewContact(prev => ({ ...prev, type: contactType.type }))}
                  style={[
                    styles.contactTypeChip,
                    newContact.type === contactType.type && styles.selectedContactTypeChip
                  ]}
                  textStyle={[
                    styles.contactTypeChipText,
                    newContact.type === contactType.type && styles.selectedContactTypeChipText
                  ]}
                  icon={contactType.icon}
                >
                  {contactType.label}
                </Chip>
              ))}
            </View>
          </View>

            <TextInput
            mode="outlined"
            label={`${newContact.type.charAt(0).toUpperCase() + newContact.type.slice(1)} ${newContact.type === 'phone' ? 'Number' : 'URL'}`}
            value={newContact.value}
            onChangeText={(value) => setNewContact(prev => ({ ...prev, value }))}
            style={styles.formInput}
            outlineColor="#E0E0E0"
            activeOutlineColor="#FF6B35"
            placeholder={
              newContact.type === 'phone' 
                ? '+1 (555) 123-4567' 
                : newContact.type === 'linkedin'
                ? 'https://linkedin.com/in/yourprofile'
                : 'https://github.com/yourusername'
            }
            keyboardType={newContact.type === 'phone' ? 'phone-pad' : 'url'}
          />

          <Button
            mode="contained"
            onPress={addContact}
            style={styles.addButton}
            disabled={!newContact.value.trim()}
            icon="plus"
          >
            Add Contact
          </Button>
          </View>
      </Card.Content>
    </Card>
  );

  const renderEditForm = () => (
    <Card style={styles.sectionCard} elevation={2}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Edit Profile Information
        </Text>
        
        <View style={styles.formRow}>
            <TextInput
            mode="outlined"
            label="First Name"
            value={formData.first_name}
            onChangeText={(value) => handleInputChange('first_name', value)}
            style={styles.formInput}
            outlineColor="#E0E0E0"
            activeOutlineColor="#FF6B35"
          />
          <TextInput
            mode="outlined"
            label="Last Name"
            value={formData.last_name}
            onChangeText={(value) => handleInputChange('last_name', value)}
            style={styles.formInput}
            outlineColor="#E0E0E0"
            activeOutlineColor="#FF6B35"
            />
          </View>

            <TextInput
          mode="outlined"
          label="Professional Headline"
          value={formData.headline}
          onChangeText={(value) => handleInputChange('headline', value)}
          style={styles.formInput}
          outlineColor="#E0E0E0"
          activeOutlineColor="#FF6B35"
          placeholder="e.g., Full Stack Developer"
        />

        

            <TextInput
          mode="outlined"
          label="Professional Summary"
          value={formData.summary}
          onChangeText={(value) => handleInputChange('summary', value)}
          style={[styles.formInput, styles.textArea]}
          outlineColor="#E0E0E0"
          activeOutlineColor="#FF6B35"
              multiline
              numberOfLines={4}
          placeholder="Write a brief professional summary..."
        />

        <View style={styles.availabilityContainer}>
          <Text variant="bodyMedium" style={styles.availabilityLabel}>
            Availability Status
          </Text>
          <Text style={styles.availabilityDebug}>
            Current status: {formData.availability_status === 'available' ? 'Available' : 'Not Available'}
          </Text>
          <View style={styles.availabilityToggle}>
            <TouchableOpacity
              style={[
                styles.availabilityButton,
                formData.availability_status === 'available' && styles.availableButton
              ]}
              onPress={() => {
                console.log('ProfileScreen: Setting availability to available');
                handleInputChange('availability_status', 'available');
              }}
            >
              <MaterialCommunityIcons 
                name="check-circle" 
                size={20} 
                color={formData.availability_status === 'available' ? '#FFFFFF' : '#666666'} 
              />
              <Text style={[
                styles.availabilityText,
                formData.availability_status === 'available' && styles.availableText
              ]}>
                Available for Work
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.availabilityButton,
                formData.availability_status !== 'available' && styles.unavailableButton
              ]}
              onPress={() => {
                console.log('ProfileScreen: Setting availability to unavailable');
                handleInputChange('availability_status', 'unavailable');
              }}
            >
              <MaterialCommunityIcons 
                name="close-circle" 
                size={20} 
                color={formData.availability_status !== 'available' ? '#FFFFFF' : '#666666'} 
              />
              <Text style={[
                styles.availabilityText,
                formData.availability_status !== 'available' && styles.unavailableText
              ]}>
                Not Available
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleProfilePictureUpload} disabled={uploadingImage}>
            {profile?.profile_picture_url ? (
              <Avatar.Image
                size={80}
                source={{ uri: `http://192.168.101.122:5000${profile.profile_picture_url}` }}
                style={styles.profileImage}
              />
            ) : (
              <Avatar.Icon
                size={80}
                icon="account"
                style={[styles.profileImage, { backgroundColor: '#FF6B35' }]}
              />
            )}
            {uploadingImage && (
              <View style={styles.uploadingOverlay}>
                <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
            )}
            <Text style={styles.uploadHint}>Tap to upload</Text>
          </TouchableOpacity>
          
          <View style={styles.headerText}>
            <Text variant="headlineSmall" style={styles.welcomeText}>
              {profile?.first_name || user?.first_name} {profile?.last_name || user?.last_name}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitleText}>
              {profile?.headline || 'Freelancer'}
            </Text>
            <Text variant="bodySmall" style={styles.emailText}>
              {profile?.email || user?.email}
            </Text>
        </View>

          {/* Edit Button */}
          <View style={styles.editButtonContainer}>
            <TouchableOpacity
              onPress={handleEditToggle}
              disabled={isSaving}
              style={styles.editButtonTouchable}
            >
              <MaterialCommunityIcons
                name={isEditing ? "close" : "pencil"}
                size={20}
                color={isEditing ? "#EF4444" : "#FF6B35"}
              />
              <Text style={styles.editButtonText}>
                {isEditing ? "Cancel" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Surface>
      


      {/* Edit Forms - Show when editing */}
      {isEditing && (
        <>
          {renderEditForm()}
                     {renderEditSkills()}
           {renderEditEducation()}
           {renderEditWorkExperience()}
           {renderEditContact()}
          
                     {/* Save/Cancel Buttons */}
           <Card style={styles.sectionCard} elevation={2}>
             <Card.Content>
               <View style={styles.editButtonsContainer}>
                 <Button
                   mode="contained"
                   onPress={handleEditToggle}
                   style={styles.doneButton}
                   contentStyle={styles.editButtonContent}
                   icon="check"
                   disabled={isSaving}
                 >
                   {isSaving ? 'Saving...' : 'Save Changes'}
                 </Button>
                 <Button
                   mode="outlined"
                   onPress={handleCancelEdit}
                   style={styles.cancelButton}
                   contentStyle={styles.editButtonContent}
                   icon="close"
                   disabled={isSaving}
                 >
                   Cancel
                 </Button>
               </View>
             </Card.Content>
           </Card>
        </>
      )}

      {/* Summary Section */}
      {profile?.summary && !isEditing && (
        <Card style={styles.sectionCard} elevation={2}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Professional Summary
            </Text>
            <Text variant="bodyMedium" style={styles.summaryText}>
              {profile.summary}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Contact Information */}
      <Card style={styles.sectionCard} elevation={2}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Contact Information
          </Text>
          <View style={styles.contactList}>
            {profile?.phone && (
              <View style={styles.contactItem}>
                <IconButton icon="phone" size={20} iconColor="#8B4513" />
                <Text style={styles.contactText}>{profile.phone}</Text>
      </View>
            )}
            {profile?.email && (
              <View style={styles.contactItem}>
                <IconButton icon="email" size={20} iconColor="#8B4513" />
                <Text style={styles.contactText}>{profile.email}</Text>
              </View>
            )}
            {profile?.linkedin_url && (
              <View style={styles.contactItem}>
                <IconButton icon="linkedin" size={20} iconColor="#8B4513" />
                <Text style={styles.contactText}>{profile.linkedin_url}</Text>
              </View>
            )}
            {profile?.github_url && (
              <View style={styles.contactItem}>
                <IconButton icon="github" size={20} iconColor="#8B4513" />
                <Text style={styles.contactText}>{profile.github_url}</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Skills Section */}
      <Card style={styles.sectionCard} elevation={2}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Skills ({isEditing ? skills.length : ((profile?.skills || []).length + (profile?.cv_skills || []).length)})
          </Text>
          {renderSkills()}
        </Card.Content>
      </Card>

      {/* Education Section */}
      <Card style={styles.sectionCard} elevation={2}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Education ({isEditing ? education.length : (profile?.education || []).length})
          </Text>
          {renderEducation()}
        </Card.Content>
      </Card>

      {/* Work Experience Section */}
      <Card style={styles.sectionCard} elevation={2}>
        <Card.Content>
                     <Text variant="titleMedium" style={styles.sectionTitle}>
             Work Experience ({isEditing ? workExperience.length : (profile?.work_experience?.length || 0)})
           </Text>
          {renderWorkExperience()}
        </Card.Content>
      </Card>

      {/* CV Information */}
      {profile?.cv && (
        <Card style={styles.sectionCard} elevation={2}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              CV Information
            </Text>
            <View style={styles.cvInfo}>
              <Text style={styles.cvText}>File: {profile.cv.original_filename}</Text>
              <Text style={styles.cvText}>Size: {(profile.cv.file_size / 1024 / 1024).toFixed(2)} MB</Text>
              <Text style={styles.cvText}>Status: {profile.cv.parsing_status}</Text>
            </View>
            <View style={styles.cvButtonsContainer}>
              <Button
                mode="contained"
                onPress={handleViewCV}
                style={[styles.cvButton, styles.viewCVButton]}
                contentStyle={styles.cvButtonContent}
                icon="file-document"
              >
                View CV
              </Button>
              <Button
                mode="outlined"
                onPress={handleDownloadCV}
                style={[styles.cvButton, styles.downloadCVButton]}
                contentStyle={styles.cvButtonContent}
                icon="download"
              >
                Download
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  headerContent: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    marginRight: 16,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#fff',
    fontSize: 12,
  },
  headerText: {
    flex: 1,
  },
  editButton: {
    marginLeft: 'auto',
  },
  editButtonContainer: {
    marginLeft: 'auto',
  },
  editButtonTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    borderWidth: 1,
    borderColor: '#FF6B35',
    gap: 4,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  welcomeText: {
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  subtitleText: {
    color: '#666',
    marginBottom: 4,
  },
  emailText: {
    color: '#8B4513',
    fontSize: 12,
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  summaryText: {
    color: '#666',
    lineHeight: 20,
  },
  contactList: {
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    color: '#666',
    fontSize: 14,
  },
  skillsList: {
    gap: 8,
  },
  skillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  skillLevel: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '500',
  },
  educationList: {
    gap: 12,
  },
  educationItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  educationDegree: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  educationInstitution: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  educationYear: {
    fontSize: 12,
    color: '#8B4513',
    marginTop: 2,
  },
  experienceList: {
    gap: 12,
  },
  experienceItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  experienceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  experienceCompany: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  experienceDuration: {
    fontSize: 12,
    color: '#8B4513',
    marginTop: 2,
  },
  experienceDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    lineHeight: 16,
  },
  cvInfo: {
    gap: 4,
  },
  cvText: {
    fontSize: 12,
    color: '#666',
  },
  emptySection: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  uploadHint: {
    fontSize: 10,
    color: '#8B4513',
    textAlign: 'center',
    marginTop: 4,
  },
  cvButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cvButton: {
    flex: 1,
    borderRadius: 8,
  },
  viewCVButton: {
    backgroundColor: '#FF6B35',
  },
  downloadCVButton: {
    borderColor: '#8B4513',
  },
  cvButtonContent: {
    height: 40,
  },
  // Edit form styles
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  formInput: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  doneButton: {
    backgroundColor: '#FF6B35',
    flex: 1,
  },
  cancelButton: {
    borderColor: '#EF4444',
    flex: 1,
  },
  editButtonContent: {
    height: 48,
  },
  // Skills management styles
  currentSkillsContainer: {
    marginBottom: 20,
  },
  skillsChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  skillChip: {
    marginBottom: 8,
    borderColor: '#FF6B35',
  },
  skillChipText: {
    color: '#FF6B35',
  },
  addSkillContainer: {
    marginTop: 16,
  },
  addSkillRow: {
    gap: 12,
  },
  skillInput: {
    flex: 1,
  },
  skillLevelContainer: {
    marginTop: 8,
  },
  skillLevelLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  skillLevelButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelChip: {
    borderColor: '#E0E0E0',
  },
  selectedLevelChip: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  levelChipText: {
    color: '#666',
  },
  selectedLevelChipText: {
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    marginTop: 8,
  },
  // Education management styles
  currentEducationContainer: {
    marginBottom: 20,
  },
  educationEditItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  educationEditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  educationEditTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  educationEditInstitution: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  educationEditYear: {
    fontSize: 12,
    color: '#8B4513',
    marginTop: 2,
  },
  educationEditDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    lineHeight: 16,
  },
     addEducationContainer: {
     marginTop: 16,
   },
   // Work experience management styles
   currentWorkExperienceContainer: {
     marginBottom: 20,
   },
   workExperienceList: {
     gap: 12,
   },
   workExperienceEditItem: {
    paddingVertical: 12,
     paddingHorizontal: 16,
     backgroundColor: '#F8F9FA',
     borderRadius: 8,
     marginBottom: 8,
   },
   workExperienceEditHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
   },
   workExperienceEditTitle: {
     fontSize: 14,
     fontWeight: '600',
     color: '#333',
     flex: 1,
   },
   workExperienceEditCompany: {
     fontSize: 12,
     color: '#666',
     marginTop: 2,
   },
   workExperienceEditDuration: {
     fontSize: 12,
     color: '#8B4513',
     marginTop: 2,
   },
   workExperienceEditDescription: {
     fontSize: 12,
     color: '#666',
     marginTop: 4,
     lineHeight: 16,
   },
   addWorkExperienceContainer: {
     marginTop: 16,
   },
   dateRow: {
    flexDirection: 'row',
     gap: 12,
     marginBottom: 16,
  },
   dateInput: {
    flex: 1,
   },
  // Contact management styles
  contactNote: {
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  addContactContainer: {
    gap: 12,
  },
  contactTypeSelector: {
    marginBottom: 8,
  },
  contactTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  contactTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  // Availability toggle styles
  availabilityContainer: {
    marginTop: 16,
  },
  availabilityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  availabilityDebug: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  availabilityToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  availabilityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
    gap: 8,
  },
  availableButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  unavailableButton: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  availableText: {
    color: '#FFFFFF',
  },
  unavailableText: {
    color: '#FFFFFF',
  },
  contactTypeChip: {
    borderColor: '#E0E0E0',
  },
  selectedContactTypeChip: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  contactTypeChipText: {
    color: '#666',
  },
  selectedContactTypeChipText: {
    color: '#fff',
  },
});

export default ProfileScreen; 
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Platform, ToastAndroid, ActivityIndicator } from 'react-native';
import { Text, Card, Button, IconButton, Surface, useTheme, Avatar, Divider, Chip } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { updateProfile, getProfile, updateAvailability } from '../../store/slices/freelancerSlice';
import CountryCodePicker from '../../components/CountryCodePicker';
import CVViewer from '../../components/CVViewer';
import { profileAPI } from '../../services/api';
import { showToast } from '../../utils/toast';
import config from '../../config/config';

const ProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.freelancer);
  const { user } = useSelector((state) => state.auth);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cvViewerVisible, setCvViewerVisible] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const saveTimeoutRef = React.useRef(null);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    headline: '',
    phone: '',
    linkedin_url: '',
    github_url: '',
    summary: ''
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
  
  // Education editing state
  const [editingEducation, setEditingEducation] = useState(null);
  const [editingEducationData, setEditingEducationData] = useState({});

  // Work experience management
  const [workExperience, setWorkExperience] = useState([]);
  const [newWorkExperience, setNewWorkExperience] = useState({
    title: '',
    company: '',
    start_date: '',
    end_date: '',
    description: ''
  });
  
  // Work experience editing state
  const [editingWork, setEditingWork] = useState(null);
  const [editingWorkData, setEditingWorkData] = useState({});

  // Contact information management
  const [newContact, setNewContact] = useState({
    type: 'phone',
    value: '',
    countryCode: '+1'
  });

  // Load profile data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      dispatch(getProfile());
    }, [dispatch])
  );

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      // Only initialize form data if it hasn't been set yet (first load)
      setFormData(prevFormData => {
        // If formData is already initialized (has values), don't reset it
        if (prevFormData.first_name !== '' || prevFormData.last_name !== '') {
          return prevFormData;
        }
        
        const newFormData = {
          first_name: profile.first_name || user?.first_name || '',
          last_name: profile.last_name || user?.last_name || '',
          headline: profile.headline || '',
          phone: profile.phone || '',
          linkedin_url: profile.linkedin_url || '',
          github_url: profile.github_url || '',
          summary: profile.summary || ''
        };
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
      // Only update if we don't have local state or if this is the first load
      if (education.length === 0) {
        const cvEducation = profile.cv?.parsed_data?.education || [];
        const backendEducation = profile.education || [];
        console.log('Loading education data:', { cvEducation, backendEducation, combined: [...cvEducation, ...backendEducation] });
        setEducation([...cvEducation, ...backendEducation]);
      }
      
      // Initialize work experience from CV-extracted work experience
      // Only update if we don't have local state or if this is the first load
      if (workExperience.length === 0) {
        const cvWorkExperience = profile.cv?.parsed_data?.work_experience || [];
        const backendWorkExperience = profile.work_experience || [];
        console.log('Loading work experience data:', { cvWorkExperience, backendWorkExperience, combined: [...cvWorkExperience, ...backendWorkExperience] });
        setWorkExperience([...cvWorkExperience, ...backendWorkExperience]);
      }
    }
  }, [profile, user]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes before exiting edit mode
      handleSaveProfile();
    }
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    // Reset form data to original profile values
    setFormData({
      first_name: profile.first_name || user?.first_name || '',
      last_name: profile.last_name || user?.last_name || '',
      headline: profile.headline || '',
      phone: profile.phone || '',
      linkedin_url: profile.linkedin_url || '',
      github_url: profile.github_url || '',
      summary: profile.summary || ''
    });
    setSkills(profile.cv_skills || profile.skills || []);
    const cvEducation = profile.cv?.parsed_data?.education || [];
    const backendEducation = profile.education || [];
    setEducation([...cvEducation, ...backendEducation]);
    const cvWorkExperience = profile.cv?.parsed_data?.work_experience || [];
    const backendWorkExperience = profile.work_experience || [];
    setWorkExperience([...cvWorkExperience, ...backendWorkExperience]);
    setNewSkill('');
    setNewSkillLevel('Proficient');
    setNewEducation({ degree: '', institution: '', year: '', description: '' });
    setNewWorkExperience({ title: '', company: '', start_date: '', end_date: '', description: '' });
    setNewContact({ type: 'phone', value: '' });
    setEditingEducation(null);
    setEditingEducationData({});
    setEditingWork(null);
    setEditingWorkData({});
    setIsEditing(false);
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
          
          // Update CV parsed data to sync all changes
          try {
            await profileAPI.updateCVParsedData({
              work_experience: workExperience,
              education: education
            });
          } catch (cvError) {
            console.warn('Failed to update CV parsed data:', cvError);
          }
          
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
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value
      };
      
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timeout for auto-save
      saveTimeoutRef.current = setTimeout(async () => {
        // Don't auto-save if profile isn't loaded yet
        if (!profile) {
          return;
        }
        
        try {
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
          
          // Skip auto-save if required fields are missing
          if (!cleanData.phone || !cleanData.first_name || !cleanData.last_name) {
            return;
          }
          
          const result = await dispatch(updateProfile(cleanData)).unwrap();
        } catch (error) {
          // Handle the new error format from the thunk
          let msg = 'Failed to update profile';
          if (error && typeof error === 'object') {
            if (error.message) {
              msg = error.message;
            }
            if (error.responseData) {
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
    } else {
      Alert.alert('Error', 'Please enter a skill name');
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
        const newEducationObj = { 
          ...newEducation,
          id: `edu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        setEducation(prev => [...prev, newEducationObj]);
        setNewEducation({ degree: '', institution: '', year: '', description: '' });
        
        // Save to backend using dedicated education endpoint
        const educationData = {
          degree: newEducationObj.degree.trim(),
          institution: newEducationObj.institution.trim(),
          year: newEducationObj.year || '',
          description: newEducationObj.description || ''
        };
        
        await profileAPI.addEducation(educationData);
        
        // Update CV parsed data to sync with backend
        try {
          const updatedEducation = [...education, newEducationObj];
          await profileAPI.updateCVParsedData({
            education: updatedEducation
          });
        } catch (cvError) {
          console.warn('Failed to update CV parsed data:', cvError);
        }
        
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
      
      // If it's a backend education (has ID), delete from backend
      if (educationToRemove.id) {
        await profileAPI.deleteEducation(educationToRemove.id);
      }
      
      // Update CV parsed data to sync with backend
      try {
        const updatedEducation = education.filter((_, i) => i !== index);
        await profileAPI.updateCVParsedData({
          education: updatedEducation
        });
      } catch (cvError) {
        console.warn('Failed to update CV parsed data:', cvError);
      }
      
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

  // Start editing education
  const startEditingEducation = (edu) => {
    setEditingEducation(edu.id);
    setEditingEducationData({
      degree: edu.degree || edu.title || '',
      institution: edu.institution || edu.school || '',
      year: edu.year || edu.graduation_year || '',
      description: edu.description || ''
    });
  };

  // Cancel editing education
  const cancelEditingEducation = () => {
    setEditingEducation(null);
    setEditingEducationData({});
  };

  // Update education
  const handleUpdateEducation = async () => {
    if (!editingEducationData.degree.trim() || !editingEducationData.institution.trim()) {
      Alert.alert('Required Fields', 'Degree and institution are required.');
      return;
    }

    try {
      // Update local state immediately for UI feedback
      setEducation(prev => prev.map(edu => 
        edu.id === editingEducation ? { ...edu, ...editingEducationData } : edu
      ));
      
      // Update in backend if it has an ID
      if (editingEducation) {
        await profileAPI.updateEducation(editingEducation, editingEducationData);
      }
      
      // Update CV parsed data to sync with backend
      try {
        const updatedEducation = education.map(edu => 
          edu.id === editingEducation ? { ...edu, ...editingEducationData } : edu
        );
        await profileAPI.updateCVParsedData({
          education: updatedEducation
        });
      } catch (cvError) {
        console.warn('Failed to update CV parsed data:', cvError);
      }
      
      // Show success message
      Alert.alert('Success', 'Education updated successfully!');
      
      // Exit editing mode
      setEditingEducation(null);
      setEditingEducationData({});
      
      // Refresh profile data
      dispatch(getProfile());
    } catch (error) {
      console.error('Error updating education:', error);
      Alert.alert('Error', 'Failed to update education. Please try again.');
    }
  };

  const editEducation = async (index, field, value) => {
    const oldEducation = education[index];
    
    try {
      // Update local state immediately for UI feedback
      setEducation(prev => prev.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      ));
      
      // If it's a backend education (has ID), update in backend
      if (oldEducation.id) {
        const updatedEducationData = {
          ...oldEducation,
          [field]: value
        };
        await profileAPI.updateEducation(oldEducation.id, updatedEducationData);
      }
      
      // Update CV parsed data to sync with backend
      try {
        const updatedEducation = education.map((edu, i) => 
          i === index ? { ...edu, [field]: value } : edu
        );
        await profileAPI.updateCVParsedData({
          education: updatedEducation
        });
      } catch (cvError) {
        console.warn('Failed to update CV parsed data:', cvError);
      }
      
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
        const newWorkExpObj = { 
          ...newWorkExperience,
          id: `work_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        setWorkExperience(prev => [...prev, newWorkExpObj]);
        setNewWorkExperience({ title: '', company: '', start_date: '', end_date: '', description: '' });
        
        // Save to backend using dedicated work experience endpoint
        const workData = {
          title: newWorkExpObj.title.trim(),
          company: newWorkExpObj.company.trim(),
          start_date: newWorkExpObj.start_date || '',
          end_date: newWorkExpObj.end_date || '',
          description: newWorkExpObj.description || ''
        };
        
        await profileAPI.addWorkExperience(workData);
        
        // Update CV parsed data to sync with backend
        try {
          const updatedWorkExp = [...workExperience, newWorkExpObj];
          await profileAPI.updateCVParsedData({
            work_experience: updatedWorkExp
          });
        } catch (cvError) {
          console.warn('Failed to update CV parsed data:', cvError);
        }
        
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
      
      // If it's a backend work experience (has ID), delete from backend
      if (workExpToRemove.id) {
        await profileAPI.deleteWorkExperience(workExpToRemove.id);
      }
      
      // Update CV parsed data to sync with backend
      try {
        const updatedWorkExp = workExperience.filter((_, i) => i !== index);
        await profileAPI.updateCVParsedData({
          work_experience: updatedWorkExp
        });
      } catch (cvError) {
        console.warn('Failed to update CV parsed data:', cvError);
      }
      
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

  // Start editing work experience
  const startEditingWork = (work) => {
    setEditingWork(work.id);
    setEditingWorkData({
      title: work.title || work.position || '',
      company: work.company || work.employer || '',
      start_date: work.start_date || '',
      end_date: work.end_date || '',
      description: work.description || work.responsibilities || ''
    });
  };

  // Cancel editing work experience
  const cancelEditingWork = () => {
    setEditingWork(null);
    setEditingWorkData({});
  };

  // Update work experience
  const handleUpdateWork = async () => {
    if (!editingWorkData.title.trim() || !editingWorkData.company.trim()) {
      Alert.alert('Required Fields', 'Job title and company are required.');
      return;
    }

    try {
      // Update local state immediately for UI feedback
      setWorkExperience(prev => prev.map(exp => 
        exp.id === editingWork ? { ...exp, ...editingWorkData } : exp
      ));
      
      // Update in backend if it has an ID
      if (editingWork) {
        await profileAPI.updateWorkExperience(editingWork, editingWorkData);
      }
      
      // Update CV parsed data to sync with backend
      try {
        const updatedWorkExp = workExperience.map(exp => 
          exp.id === editingWork ? { ...exp, ...editingWorkData } : exp
        );
        await profileAPI.updateCVParsedData({
          work_experience: updatedWorkExp
        });
      } catch (cvError) {
        console.warn('Failed to update CV parsed data:', cvError);
      }
      
      // Show success message
      Alert.alert('Success', 'Work experience updated successfully!');
      
      // Exit editing mode
      setEditingWork(null);
      setEditingWorkData({});
      
      // Refresh profile data
      dispatch(getProfile());
    } catch (error) {
      console.error('Error updating work experience:', error);
      Alert.alert('Error', 'Failed to update work experience. Please try again.');
    }
  };

  const editWorkExperience = async (index, field, value) => {
    const oldWorkExp = workExperience[index];
    
    try {
      // Update local state immediately for UI feedback
      setWorkExperience(prev => prev.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      ));
      
      // If it's a backend work experience (has ID), update in backend
      if (oldWorkExp.id) {
        const updatedWorkData = {
          ...oldWorkExp,
          [field]: value
        };
        await profileAPI.updateWorkExperience(oldWorkExp.id, updatedWorkData);
      }
      
      // Update CV parsed data to sync with backend
      try {
        const updatedWorkExp = workExperience.map((exp, i) => 
          i === index ? { ...exp, [field]: value } : exp
        );
        await profileAPI.updateCVParsedData({
          work_experience: updatedWorkExp
        });
      } catch (cvError) {
        console.warn('Failed to update CV parsed data:', cvError);
      }
      
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
          setFormData(prev => ({ ...prev, phone: `${newContact.countryCode}${newContact.value.trim()}` }));
        } else if (newContact.type === 'linkedin') {
          setFormData(prev => ({ ...prev, linkedin_url: newContact.value.trim() }));
        } else if (newContact.type === 'github') {
          setFormData(prev => ({ ...prev, github_url: newContact.value.trim() }));
        }
        setNewContact({ type: 'phone', value: '', countryCode: '+1' });
        
        // Save to backend immediately
        const profileData = {
          ...formData,
          [newContact.type === 'phone' ? 'phone' : `${newContact.type}_url`]: newContact.type === 'phone' ? `${newContact.countryCode}${newContact.value.trim()}` : newContact.value.trim()
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
      // Request both camera and media library permissions
      const [mediaLibraryPermission, cameraPermission] = await Promise.all([
        ImagePicker.requestMediaLibraryPermissionsAsync(),
        ImagePicker.requestCameraPermissionsAsync()
      ]);
      
      if (mediaLibraryPermission.granted === false && cameraPermission.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll or camera is required!');
        return;
      }

      // Show options to user
      Alert.alert(
        'Profile Picture',
        'Choose how you want to add your profile picture',
        [
          {
            text: 'Camera',
            onPress: () => handleImagePicker('camera'),
            style: 'default'
          },
          {
            text: 'Photo Library',
            onPress: () => handleImagePicker('library'),
            style: 'default'
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
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

  const handleImagePicker = async (type) => {
    try {
      let result;
      
      if (type === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }
      
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
          const response = await profileAPI.uploadProfileImage(formData);
          
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
      console.error('Image picker error:', error);
      setUploadingImage(false);
      Alert.alert('Error', 'Failed to access camera or photo library');
    }
  };

  const handleUploadCV = async () => {
    try {
      // Show file picker with supported formats
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedFile = result.assets[0];
        
        // Validate file size (5MB limit)
        const fileSizeMB = selectedFile.size / (1024 * 1024);
        if (fileSizeMB > 5) {
          Alert.alert(
            'File Too Large',
            'Please select a file smaller than 5MB. Your file is ' + fileSizeMB.toFixed(2) + 'MB.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Show confirmation dialog
        Alert.alert(
          'Upload CV',
          `Are you sure you want to upload "${selectedFile.name}"?\n\nThis will replace your current CV if one exists.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Upload',
              onPress: async () => {
                setCvUploading(true);
                
                const formData = new FormData();
                formData.append('cv', {
                  uri: selectedFile.uri,
                  type: selectedFile.mimeType || 'application/pdf',
                  name: selectedFile.name,
                });

                try {
                  const response = await profileAPI.uploadCV(formData);
                  
                  // Check if the response has the expected structure
                  if (response.data && response.data.success) {
                    // Show success message
                    Alert.alert(
                      'Success!',
                      'CV uploaded and processed successfully. Your profile has been updated with the new information.',
                      [
                        {
                          text: 'OK',
                          onPress: () => {
                            // Refresh profile data to show the new CV information
                            dispatch(getProfile());
                          }
                        }
                      ]
                    );
                  } else {
                    // Handle case where response structure is different
                    const message = response.data?.message || response.message || 'CV uploaded successfully';
                    Alert.alert('Success', message);
                    dispatch(getProfile());
                  }
                } catch (error) {
                  console.error('Error uploading CV:', error);
                  
                  // Provide more detailed error information
                  let errorMessage = 'Failed to upload CV. Please try again.';
                  
                  if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                  } else if (error.response?.data?.error) {
                    errorMessage = error.response.data.error;
                  } else if (error.message) {
                    errorMessage = error.message;
                  }
                  
                  Alert.alert('Upload Failed', errorMessage);
                } finally {
                  setCvUploading(false);
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error accessing document picker:', error);
      Alert.alert('Error', 'Failed to access document picker. Please try again.');
    }
  };

  const handleViewCV = async () => {
    if (!profile?.cv?.stored_filename) {
      Alert.alert('Error', 'CV file not found. Please upload a CV first.');
      return;
    }

    try {
      console.log('Opening CV viewer for file:', profile.cv.stored_filename);
      console.log('CV URL will be:', `${config.API_BASE_URL.replace('/api', '')}/cv/${profile.cv.stored_filename}`);
      
      // Show the CV viewer modal
      setCvViewerVisible(true);
      
    } catch (error) {
      console.error('Error opening CV:', error);
      Alert.alert('Error', 'Failed to open CV file');
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
    
    return (
      <Card style={styles.sectionCard} elevation={2}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Skills
            </Text>
          </View>
          
          {currentSkills && currentSkills.length > 0 ? (
            <View style={styles.skillsList}>
              {currentSkills.map((skill, index) => (
                <View key={index} style={styles.skillItem}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillLevel}>{skill.level || 'Proficient'}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>No skills available yet</Text>
            </View>
          )}
          
          {/* Always show the Add Skills button when not editing */}
          {!isEditing && (
            <TouchableOpacity
              onPress={handleEditToggle}
              style={styles.addSectionButton}
            >
              <View style={styles.addSectionContent}>
                <MaterialCommunityIcons name="plus-circle" size={32} color="#FF6B35" />
                <View style={styles.addSectionText}>
                  <Text style={styles.addSectionTitle}>Add Skills</Text>
                  <Text style={styles.addSectionSubtitle}>Tap to add your skills and expertise</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#FF6B35" />
              </View>
            </TouchableOpacity>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderEducation = () => {
    // Use education from local state when editing, otherwise use profile data
    const currentEducation = isEditing ? education : (profile?.cv?.parsed_data?.education || profile?.education || []);
    console.log('Rendering education with data:', { 
      isEditing, 
      localEducation: education, 
      cvEducation: profile?.cv?.parsed_data?.education, 
      backendEducation: profile?.education,
      currentEducation 
    });
    
    return (
      <Card style={styles.sectionCard} elevation={2}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Education
            </Text>
          </View>
          
          {currentEducation && currentEducation.length > 0 ? (
            <View style={styles.educationList}>
              {currentEducation.map((edu, index) => (
                <View key={index} style={styles.educationItem}>
                  {editingEducation === edu.id ? (
                    // Editing mode
                    <View style={styles.editingEducationForm}>
                      <TextInput
                        style={styles.editingInput}
                        value={editingEducationData.degree}
                        onChangeText={(text) => setEditingEducationData({ ...editingEducationData, degree: text })}
                        placeholder="Degree"
                      />
                      <TextInput
                        style={styles.editingInput}
                        value={editingEducationData.institution}
                        onChangeText={(text) => setEditingEducationData({ ...editingEducationData, institution: text })}
                        placeholder="Institution"
                      />
                      <TextInput
                        style={styles.editingInput}
                        value={editingEducationData.year}
                        onChangeText={(text) => setEditingEducationData({ ...editingEducationData, year: text })}
                        placeholder="Year"
                      />
                      <TextInput
                        style={styles.editingInput}
                        value={editingEducationData.description}
                        onChangeText={(text) => setEditingEducationData({ ...editingEducationData, description: text })}
                        placeholder="Description"
                        multiline
                      />
                      <View style={styles.editingButtons}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleUpdateEducation}>
                          <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={cancelEditingEducation}>
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    // Display mode
                    <View style={styles.educationDisplay}>
                      <Text style={styles.educationDegree}>{edu.degree || edu.title}</Text>
                      <Text style={styles.educationInstitution}>{edu.institution || edu.school}</Text>
                      <Text style={styles.educationYear}>{edu.year || edu.graduation_year}</Text>
                      {edu.description && (
                        <Text style={styles.educationDescription}>{edu.description}</Text>
                      )}
                      {isEditing && (
                        <View style={styles.educationActions}>
                          <TouchableOpacity 
                            style={styles.editButton} 
                            onPress={() => startEditingEducation(edu)}
                          >
                            <MaterialCommunityIcons name="pencil" size={16} color="#FF6B35" />
                            <Text style={styles.editButtonText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.deleteButton} 
                            onPress={() => removeEducation(index)}
                          >
                            <MaterialCommunityIcons name="delete" size={16} color="#EF4444" />
                            <Text style={styles.deleteButtonText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>No education information available yet</Text>
            </View>
          )}
          
          {/* Always show the Add Education button when not editing */}
          {!isEditing && (
            <TouchableOpacity
              onPress={handleEditToggle}
              style={styles.addSectionButton}
            >
              <View style={styles.addSectionContent}>
                <MaterialCommunityIcons name="plus-circle" size={32} color="#FF6B35" />
                <View style={styles.addSectionText}>
                  <Text style={styles.addSectionTitle}>Add Education</Text>
                  <Text style={styles.addSectionSubtitle}>Tap to add your educational background</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#FF6B35" />
              </View>
            </TouchableOpacity>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderWorkExperience = () => {
    // Use work experience from local state when editing, otherwise use profile data
    const currentWorkExperience = isEditing ? workExperience : (profile?.cv?.parsed_data?.work_experience || profile?.work_experience || []);
    console.log('Rendering work experience with data:', { 
      isEditing, 
      localWorkExperience: workExperience, 
      cvWorkExperience: profile?.cv?.parsed_data?.work_experience, 
      backendWorkExperience: profile?.work_experience,
      currentWorkExperience 
    });
    
    return (
      <Card style={styles.sectionCard} elevation={2}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Work Experience
            </Text>
          </View>
          
          {currentWorkExperience && currentWorkExperience.length > 0 ? (
            <View style={styles.experienceList}>
              {currentWorkExperience.map((exp, index) => (
                <View key={index} style={styles.experienceItem}>
                  {editingWork === exp.id ? (
                    // Editing mode
                    <View style={styles.editingWorkForm}>
                      <TextInput
                        style={styles.editingInput}
                        value={editingWorkData.title}
                        onChangeText={(text) => setEditingWorkData({ ...editingWorkData, title: text })}
                        placeholder="Job Title"
                      />
                      <TextInput
                        style={styles.editingInput}
                        value={editingWorkData.company}
                        onChangeText={(text) => setEditingWorkData({ ...editingWorkData, company: text })}
                        placeholder="Company"
                      />
                      <TextInput
                        style={styles.editingInput}
                        value={editingWorkData.start_date}
                        onChangeText={(text) => setEditingWorkData({ ...editingWorkData, start_date: text })}
                        placeholder="Start Date"
                      />
                      <TextInput
                        style={styles.editingInput}
                        value={editingWorkData.end_date}
                        onChangeText={(text) => setEditingWorkData({ ...editingWorkData, end_date: text })}
                        placeholder="End Date"
                      />
                      <TextInput
                        style={styles.editingInput}
                        value={editingWorkData.description}
                        onChangeText={(text) => setEditingWorkData({ ...editingWorkData, description: text })}
                        placeholder="Description"
                        multiline
                      />
                      <View style={styles.editingButtons}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleUpdateWork}>
                          <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={cancelEditingWork}>
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    // Display mode
                    <View style={styles.experienceDisplay}>
                      <Text style={styles.experienceTitle}>{exp.title || exp.position}</Text>
                      <Text style={styles.experienceCompany}>{exp.company || exp.employer}</Text>
                      <Text style={styles.experienceDuration}>{exp.duration || `${exp.start_date} - ${exp.end_date || 'Present'}`}</Text>
                      <Text style={styles.experienceDescription}>{exp.description || exp.responsibilities}</Text>
                      {isEditing && (
                        <View style={styles.experienceActions}>
                          <TouchableOpacity 
                            style={styles.editButton} 
                            onPress={() => startEditingWork(exp)}
                          >
                            <MaterialCommunityIcons name="pencil" size={16} color="#FF6B35" />
                            <Text style={styles.editButtonText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.deleteButton} 
                            onPress={() => removeWorkExperience(index)}
                          >
                            <MaterialCommunityIcons name="delete" size={16} color="#EF4444" />
                            <Text style={styles.deleteButtonText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>No work experience available yet</Text>
            </View>
          )}
          
          {/* Always show the Add Work Experience button when not editing */}
          {!isEditing && (
            <TouchableOpacity
              onPress={handleEditToggle}
              style={styles.addSectionButton}
            >
              <View style={styles.addSectionContent}>
                <MaterialCommunityIcons name="plus-circle" size={32} color="#FF6B35" />
                <View style={styles.addSectionText}>
                  <Text style={styles.addSectionTitle}>Add Work Experience</Text>
                  <Text style={styles.addSectionSubtitle}>Tap to add your professional experience</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#FF6B35" />
                </View>
            </TouchableOpacity>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderEditSkills = () => (
    <Card style={styles.sectionCard} elevation={2}>
      <Card.Content>
        <View style={styles.editSectionHeader}>
          <MaterialCommunityIcons name="star" size={24} color="#FF6B35" />
          <Text variant="titleMedium" style={styles.editSectionTitle}>
            Skills Management
          </Text>
        </View>
        
        {/* Current Skills */}
        {skills.length > 0 && (
          <View style={styles.currentSkillsContainer}>
            <Text variant="bodyMedium" style={styles.subsectionTitle}>Current Skills:</Text>
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
          </View>
        )}

        {/* Add New Skill Form */}
        <View style={styles.addSkillContainer}>
          <View style={styles.addFormHeader}>
            <MaterialCommunityIcons name="plus-circle" size={24} color="#FF6B35" />
            <Text variant="bodyMedium" style={styles.addFormTitle}>Add New Skill</Text>
          </View>
          
          <View style={styles.skillFormContainer}>
            <View style={styles.inputFieldContainer}>
              <Text style={styles.inputLabel}>Skill Name *</Text>
              <TextInput
                mode="outlined"
                value={newSkill}
                onChangeText={setNewSkill}
                style={styles.enhancedFormInput}
                outlineColor="#E0E0E0"
                activeOutlineColor="#FF6B35"
                placeholder="Type your skill here (e.g., JavaScript, React, Python)"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputFieldContainer}>
              <Text style={styles.inputLabel}>Proficiency Level *</Text>
              <View style={styles.skillLevelButtons}>
                {['Beginner', 'Intermediate', 'Proficient', 'Expert'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setNewSkillLevel(level)}
                    style={[
                      styles.enhancedLevelButton,
                      newSkillLevel === level && styles.selectedEnhancedLevelButton
                    ]}
                  >
                    <Text style={[
                      styles.enhancedLevelButtonText,
                      newSkillLevel === level && styles.selectedEnhancedLevelButtonText
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TouchableOpacity
              onPress={addSkill}
              style={[
                styles.enhancedAddButton,
                !newSkill.trim() && styles.enhancedAddButtonDisabled
              ]}
              disabled={!newSkill.trim()}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
              <Text style={styles.enhancedAddButtonText}>Add Skill</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEditEducation = () => (
    <Card style={styles.sectionCard} elevation={2}>
      <Card.Content>
        <View style={styles.editSectionHeader}>
          <MaterialCommunityIcons name="school" size={24} color="#FF6B35" />
          <Text variant="titleMedium" style={styles.editSectionTitle}>
            Education Management
          </Text>
        </View>
        
        {/* Current Education */}
        {education.length > 0 && (
          <View style={styles.currentEducationContainer}>
            <Text variant="bodyMedium" style={styles.subsectionTitle}>Current Education:</Text>
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
          </View>
        )}

        {/* Add New Education Form */}
        <View style={styles.addEducationContainer}>
          <View style={styles.addFormHeader}>
            <MaterialCommunityIcons name="plus-circle" size={24} color="#FF6B35" />
            <Text variant="bodyMedium" style={styles.addFormTitle}>Add New Education</Text>
          </View>
          
          <View style={styles.educationFormContainer}>
            <View style={styles.inputFieldContainer}>
              <Text style={styles.inputLabel}>Degree/Qualification *</Text>
              <TextInput
                mode="outlined"
                value={newEducation.degree}
                onChangeText={(value) => setNewEducation(prev => ({ ...prev, degree: value }))}
                style={styles.enhancedFormInput}
                outlineColor="#E0E0E0"
                activeOutlineColor="#FF6B35"
                placeholder="Type your degree here (e.g., Bachelor of Science in Computer Science)"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputFieldContainer}>
              <Text style={styles.inputLabel}>Institution *</Text>
              <TextInput
                mode="outlined"
                value={newEducation.institution}
                onChangeText={(value) => setNewEducation(prev => ({ ...prev, institution: value }))}
                style={styles.enhancedFormInput}
                outlineColor="#E0E0E0"
                activeOutlineColor="#FF6B35"
                placeholder="Type your institution name here (e.g., University of Technology)"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputFieldContainer}>
              <Text style={styles.inputLabel}>Year *</Text>
              <TextInput
                mode="outlined"
                value={newEducation.year}
                onChangeText={(value) => setNewEducation(prev => ({ ...prev, year: value }))}
                style={styles.enhancedFormInput}
                outlineColor="#E0E0E0"
                activeOutlineColor="#FF6B35"
                placeholder="Type graduation year here (e.g., 2020)"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputFieldContainer}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                mode="outlined"
                value={newEducation.description}
                onChangeText={(value) => setNewEducation(prev => ({ ...prev, description: value }))}
                style={[styles.enhancedFormInput, styles.enhancedTextArea]}
                outlineColor="#E0E0E0"
                activeOutlineColor="#FF6B35"
                multiline
                numberOfLines={3}
                placeholder="Brief description of your studies, achievements, or focus areas..."
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity
              onPress={addEducation}
              style={[
                styles.enhancedAddButton,
                (!newEducation.degree.trim() || !newEducation.institution.trim()) && styles.enhancedAddButtonDisabled
              ]}
              disabled={!newEducation.degree.trim() || !newEducation.institution.trim()}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
              <Text style={styles.enhancedAddButtonText}>Add Education</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

          const renderEditWorkExperience = () => (
     <Card style={styles.sectionCard} elevation={2}>
       <Card.Content>
         <View style={styles.editSectionHeader}>
           <MaterialCommunityIcons name="briefcase" size={24} color="#FF6B35" />
           <Text variant="titleMedium" style={styles.editSectionTitle}>
             Work Experience Management
           </Text>
         </View>
         
         {/* Current Work Experience */}
         {workExperience.length > 0 && (
           <View style={styles.currentWorkExperienceContainer}>
             <Text variant="bodyMedium" style={styles.subsectionTitle}>Current Work Experience:</Text>
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
           </View>
         )}

         {/* Add New Work Experience Form */}
         <View style={styles.addWorkExperienceContainer}>
           <View style={styles.addFormHeader}>
             <MaterialCommunityIcons name="plus-circle" size={24} color="#FF6B35" />
             <Text variant="bodyMedium" style={styles.addFormTitle}>Add New Work Experience</Text>
           </View>
           
           <View style={styles.workExperienceFormContainer}>
             <View style={styles.inputFieldContainer}>
               <Text style={styles.inputLabel}>Job Title *</Text>
               <TextInput
                 mode="outlined"
                 value={newWorkExperience.title}
                 onChangeText={(value) => setNewWorkExperience(prev => ({ ...prev, title: value }))}
                 style={styles.enhancedFormInput}
                 outlineColor="#E0E0E0"
                 activeOutlineColor="#FF6B35"
                 placeholder="Type your job title here (e.g., Software Developer)"
                 placeholderTextColor="#999"
               />
             </View>

             <View style={styles.inputFieldContainer}>
               <Text style={styles.inputLabel}>Company *</Text>
               <TextInput
                 mode="outlined"
                 value={newWorkExperience.company}
                 onChangeText={(value) => setNewWorkExperience(prev => ({ ...prev, company: value }))}
                 style={styles.enhancedFormInput}
                 outlineColor="#E0E0E0"
                 activeOutlineColor="#FF6B35"
                 placeholder="Type your company name here (e.g., Tech Company Inc.)"
                 placeholderTextColor="#999"
               />
             </View>

             <View style={styles.dateRowContainer}>
               <View style={styles.dateFieldContainer}>
                 <Text style={styles.inputLabel}>Start Date *</Text>
                 <TextInput
                   mode="outlined"
                   value={newWorkExperience.start_date}
                   onChangeText={(value) => setNewWorkExperience(prev => ({ ...prev, start_date: value }))}
                   style={styles.enhancedFormInput}
                   outlineColor="#E0E0E0"
                   activeOutlineColor="#FF6B35"
                   placeholder="Type start date here (e.g., Jan 2020)"
                   placeholderTextColor="#999"
                 />
               </View>
               <View style={styles.dateFieldContainer}>
                 <Text style={styles.inputLabel}>End Date</Text>
                 <TextInput
                   mode="outlined"
                   value={newWorkExperience.end_date}
                   onChangeText={(value) => setNewWorkExperience(prev => ({ ...prev, end_date: value }))}
                   style={styles.enhancedFormInput}
                   outlineColor="#E0E0E0"
                   activeOutlineColor="#FF6B35"
                   placeholder="Type end date here (e.g., Dec 2023) or leave empty for current"
                   placeholderTextColor="#999"
                 />
               </View>
             </View>

             <View style={styles.inputFieldContainer}>
               <Text style={styles.inputLabel}>Description (Optional)</Text>
               <TextInput
                 mode="outlined"
                 value={newWorkExperience.description}
                 onChangeText={(value) => setNewWorkExperience(prev => ({ ...prev, description: value }))}
                 style={[styles.enhancedFormInput, styles.enhancedTextArea]}
                 outlineColor="#E0E0E0"
                 activeOutlineColor="#FF6B35"
                 multiline
                 numberOfLines={3}
                 placeholder="Brief description of your role, responsibilities, and achievements..."
                 placeholderTextColor="#999"
               />
             </View>

             <TouchableOpacity
               onPress={addWorkExperience}
               style={[
                 styles.enhancedAddButton,
                 (!newWorkExperience.title.trim() || !newWorkExperience.company.trim()) && styles.enhancedAddButtonDisabled
               ]}
               disabled={!newWorkExperience.title.trim() || !newWorkExperience.company.trim()}
             >
               <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
               <Text style={styles.enhancedAddButtonText}>Add Work Experience</Text>
             </TouchableOpacity>
           </View>
         </View>
       </Card.Content>
     </Card>
   );

   const renderEditContact = () => (
    <Card style={styles.sectionCard} elevation={2}>
      <Card.Content>
        <View style={styles.editSectionHeader}>
          <MaterialCommunityIcons name="contact-mail" size={24} color="#FF6B35" />
          <Text variant="titleMedium" style={styles.editSectionTitle}>
            Contact Information
          </Text>
        </View>
        
        <Text variant="bodySmall" style={styles.contactNote}>
          Note: You can add new contact information. Existing contact details cannot be edited.
        </Text>

        <View style={styles.addContactContainer}>
          <View style={styles.addFormHeader}>
            <MaterialCommunityIcons name="plus-circle" size={24} color="#FF6B35" />
            <Text variant="bodyMedium" style={styles.addFormTitle}>Add New Contact</Text>
          </View>
          
          <View style={styles.contactFormContainer}>
            <View style={styles.inputFieldContainer}>
              <Text style={styles.inputLabel}>Contact Type *</Text>
              <View style={styles.contactTypeButtons}>
                {[
                  { type: 'phone', label: 'Phone', icon: 'phone' },
                  { type: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
                  { type: 'github', label: 'GitHub', icon: 'github' }
                ].map((contactType) => (
                  <TouchableOpacity
                    key={contactType.type}
                    onPress={() => setNewContact(prev => ({ ...prev, type: contactType.type }))}
                    style={[
                      styles.enhancedContactTypeButton,
                      newContact.type === contactType.type && styles.selectedEnhancedContactTypeButton
                    ]}
                  >
                    <MaterialCommunityIcons 
                      name={contactType.icon} 
                      size={20} 
                      color={newContact.type === contactType.type ? '#FFFFFF' : '#FF6B35'} 
                    />
                    <Text style={[
                      styles.enhancedContactTypeButtonText,
                      newContact.type === contactType.type && styles.selectedEnhancedContactTypeButtonText
                    ]}>
                      {contactType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputFieldContainer}>
              <Text style={styles.inputLabel}>
                {newContact.type === 'phone' ? 'Phone Number *' : 
                 newContact.type === 'linkedin' ? 'LinkedIn URL *' : 'GitHub URL *'}
              </Text>
              {newContact.type === 'phone' ? (
                <View style={styles.phoneInputContainer}>
                  <CountryCodePicker
                    selectedCode={newContact.countryCode}
                    onSelectCode={(code) => setNewContact(prev => ({ ...prev, countryCode: code }))}
                  />
                  <TextInput
                    mode="outlined"
                    value={newContact.value}
                    onChangeText={(value) => setNewContact(prev => ({ ...prev, value }))}
                    style={[styles.enhancedFormInput, styles.phoneInput]}
                    outlineColor="#E0E0E0"
                    activeOutlineColor="#FF6B35"
                    placeholder="Type your phone number here (e.g., (555) 123-4567)"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                  />
                </View>
              ) : (
                <TextInput
                  mode="outlined"
                  value={newContact.value}
                  onChangeText={(value) => setNewContact(prev => ({ ...prev, value }))}
                  style={styles.enhancedFormInput}
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#FF6B35"
                  placeholder={
                    newContact.type === 'linkedin'
                      ? 'Type your LinkedIn profile URL here (e.g., https://linkedin.com/in/yourprofile)'
                      : 'Type your GitHub profile URL here (e.g., https://github.com/yourusername)'
                  }
                  placeholderTextColor="#999"
                  keyboardType="url"
                />
              )}
            </View>

            <TouchableOpacity
              onPress={addContact}
              style={[
                styles.enhancedAddButton,
                !newContact.value.trim() && styles.enhancedAddButtonDisabled
              ]}
              disabled={!newContact.value.trim()}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
              <Text style={styles.enhancedAddButtonText}>Add Contact</Text>
            </TouchableOpacity>
          </View>
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

        <TextInput
          mode="outlined"
          label="Phone Number"
          value={formData.phone}
          onChangeText={(value) => handleInputChange('phone', value)}
          style={styles.formInput}
          outlineColor="#E0E0E0"
          activeOutlineColor="#FF6B35"
          placeholder="+1 (555) 123-4567"
          keyboardType="phone-pad"
        />

        <TextInput
          mode="outlined"
          label="LinkedIn URL"
          value={formData.linkedin_url}
          onChangeText={(value) => handleInputChange('linkedin_url', value)}
          style={styles.formInput}
          outlineColor="#E0E0E0"
          activeOutlineColor="#FF6B35"
          placeholder="https://linkedin.com/in/yourprofile"
          keyboardType="url"
        />

        <TextInput
          mode="outlined"
          label="GitHub URL"
          value={formData.github_url}
          onChangeText={(value) => handleInputChange('github_url', value)}
          style={styles.formInput}
          outlineColor="#E0E0E0"
          activeOutlineColor="#FF6B35"
          placeholder="https://github.com/yourusername"
          keyboardType="url"
        />
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <Surface style={styles.header} elevation={3}>
        <View style={styles.headerContent}>
          <View style={styles.profilePictureSection}>
            <TouchableOpacity 
              onPress={handleProfilePictureUpload} 
              disabled={uploadingImage}
              style={styles.profilePictureContainer}
            >
              {profile?.profile_picture_url ? (
                <View style={styles.profileImageWrapper}>
                  <Avatar.Image
                    size={100}
                    source={{ 
                      uri: `${config.API_BASE_URL.replace('/api', '')}${profile.profile_picture_url}`,
                      cache: 'force-cache'
                    }}
                    style={styles.profileImage}
                    onError={(error) => {
                      console.error('Profile image load error:', error);
                      console.error('Profile image URL:', `${config.API_BASE_URL.replace('/api', '')}${profile.profile_picture_url}`);
                    }}
                    onLoad={() => {
                      console.log('Profile image loaded successfully');
                      console.log('Profile image URL:', `${config.API_BASE_URL.replace('/api', '')}${profile.profile_picture_url}`);
                    }}
                  />
                </View>
              ) : (
                <View style={styles.profileImageWrapper}>
                  <Avatar.Icon
                    size={100}
                    icon="account"
                    style={[styles.profileImage, { backgroundColor: '#FF6B35' }]}
                  />
                </View>
              )}
              
              {uploadingImage && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color="#FF6B35" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <Text style={styles.uploadHint}>
              {profile?.profile_picture_url ? 'Tap to change photo' : 'Tap to add profile photo'}
            </Text>
          </View>
          
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
                size={24}
                color={isEditing ? "#FFFFFF" : "#FFFFFF"}
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

      {/* Contact Information - Only show when NOT editing */}
      {!isEditing && (
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
      )}

      {/* Skills Section - Only show when NOT editing */}
      {!isEditing && (
        <Card style={styles.sectionCard} elevation={2}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Skills ({((profile?.skills || []).length + (profile?.cv_skills || []).length)})
            </Text>
            {renderSkills()}
          </Card.Content>
        </Card>
      )}

      {/* Education Section */}
      <Card style={styles.sectionCard} elevation={2}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Education ({isEditing ? education.length : (profile?.cv?.parsed_data?.education || profile?.education || []).length})
          </Text>
          {renderEducation()}
        </Card.Content>
      </Card>

      {/* Work Experience Section */}
      <Card style={styles.sectionCard} elevation={2}>
        <Card.Content>
                     <Text variant="titleMedium" style={styles.sectionTitle}>
             Work Experience ({isEditing ? workExperience.length : (profile?.cv?.parsed_data?.work_experience || profile?.work_experience || []).length})
           </Text>
          {renderWorkExperience()}
        </Card.Content>
      </Card>

      {/* CV Information */}
      {profile?.cv ? (
        <Card style={styles.sectionCard} elevation={2}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              CV Information
            </Text>
            <View style={styles.cvInfo}>
              <Text style={styles.cvText}>File: {profile.cv.original_filename}</Text>
              <Text style={styles.cvText}>Size: {(profile.cv.file_size / 1024 / 1024).toFixed(2)} MB</Text>
              <Text style={styles.cvText}>Status: {profile.cv.parsing_status}</Text>
              <Text style={styles.cvFormatNote}>
                Supported formats: PDF, DOCX, DOC, TXT (max 5MB)
              </Text>
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
                onPress={handleUploadCV}
                style={[styles.cvButton, styles.uploadCVButton]}
                contentStyle={styles.cvButtonContent}
                icon={cvUploading ? "loading" : "upload"}
                disabled={cvUploading}
                loading={cvUploading}
              >
                {cvUploading ? 'Uploading...' : 'Replace CV'}
              </Button>

            </View>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.sectionCard} elevation={2}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              CV Information
            </Text>
            <View style={styles.cvUploadContainer}>
              <Text style={styles.cvUploadText}>No CV uploaded yet</Text>
              <Text style={styles.cvFormatNote}>
                Supported formats: PDF, DOCX, DOC, TXT (max 5MB)
              </Text>
              <Button
                mode="contained"
                onPress={handleUploadCV}
                style={[styles.cvButton, styles.uploadCVButton]}
                contentStyle={styles.cvButtonContent}
                icon={cvUploading ? "loading" : "upload"}
                disabled={cvUploading}
                loading={cvUploading}
              >
                {cvUploading ? 'Uploading...' : 'Upload CV'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}


            {/* CV Viewer Modal */}
      {cvViewerVisible && profile?.cv?.stored_filename && (
        <CVViewer
          visible={cvViewerVisible}
          onClose={() => setCvViewerVisible(false)}
                      cvUrl={`${config.API_BASE_URL.replace('/api', '')}/cv/${profile.cv.stored_filename}`}
          cvFilename={profile?.cv?.original_filename || 'CV'}
          cvData={profile?.cv}
        />
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#FF6B35',
    borderWidth: 1,
    borderColor: '#FF6B35',
    gap: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
  
  // Editing form styles
  editingEducationForm: {
    gap: 8,
  },
  editingWorkForm: {
    gap: 8,
  },
  editingInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  editingButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6B7280',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Display mode styles
  educationDisplay: {
    gap: 4,
  },
  experienceDisplay: {
    gap: 4,
  },
  educationDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    lineHeight: 16,
  },
  
  // Action buttons styles
  educationActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  experienceActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  editButtonText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '500',
  },
  cvInfo: {
    gap: 4,
  },
  cvText: {
    fontSize: 12,
    color: '#666',
  },
  cvFormatNote: {
    fontSize: 11,
    color: '#8B4513',
    fontStyle: 'italic',
    marginTop: 4,
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

  uploadCVButton: {
    borderColor: '#FF6B35',
  },
  cvButtonContent: {
    height: 40,
  },
  cvUploadContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cvUploadText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
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
  // New styles for improved UI
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#FF6B35',
    gap: 4,
  },
  addButtonText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
  },
  addButtonEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F0F8FF',
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 12,
  },
  addButtonEmptyText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '600',
  },
  // Edit section styles
  editSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#FF9800',
    borderTopWidth: 1,
    borderTopColor: '#FFF3E0',
    borderRightWidth: 1,
    borderRightColor: '#FFF3E0',
    borderBottomWidth: 1,
    borderBottomColor: '#FFF3E0',
  },
  editSectionTitle: {
    fontWeight: 'bold',
    color: '#E65100',
    marginLeft: 12,
    fontSize: 20,
  },
  // Add form styles
  addFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  addFormTitle: {
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  // Skills form styles
  skillFormContainer: {
    gap: 16,
  },
  skillNameInput: {
    marginBottom: 8,
  },
  skillLevelSection: {
    marginBottom: 16,
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
  levelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  selectedLevelButton: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  levelButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedLevelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addSkillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#FF6B35',
    gap: 8,
  },
  addSkillButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  addSkillButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Education and Work Experience form styles
  educationFormContainer: {
    gap: 16,
  },
  workExperienceFormContainer: {
    gap: 16,
  },
  // Contact form styles
  contactFormContainer: {
    gap: 16,
  },
  contactTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  selectedContactTypeButton: {
    backgroundColor: '#FF6B35',
  },
  contactTypeButtonText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  selectedContactTypeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Common add button styles
  addFormButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#FF6B35',
    gap: 8,
  },
  addFormButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  addFormButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // New clear add section button styles
  addSectionButton: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addSectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addSectionText: {
    flex: 1,
    marginLeft: 12,
  },
  addSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 4,
  },
  addSectionSubtitle: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  // Enhanced form styles
  inputFieldContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: 10,
    marginLeft: 4,
    textShadowColor: 'rgba(255, 107, 53, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  enhancedFormInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  phoneInput: {
    flex: 1,
  },
  enhancedTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  enhancedLevelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    marginBottom: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  selectedEnhancedLevelButton: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  enhancedLevelButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  selectedEnhancedLevelButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  enhancedContactTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FF6B35',
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    marginBottom: 8,
    minWidth: 120,
    justifyContent: 'center',
    gap: 8,
  },
  selectedEnhancedContactTypeButton: {
    backgroundColor: '#FF6B35',
  },
  enhancedContactTypeButtonText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  selectedEnhancedContactTypeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  enhancedAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    gap: 12,
    marginTop: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  enhancedAddButtonDisabled: {
    backgroundColor: '#E0E0E0',
    elevation: 0,
    shadowOpacity: 0,
  },
  enhancedAddButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  // Date row layout fixes
  dateRowContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  dateFieldContainer: {
    flex: 1,
  },
  // Enhanced form styling with colors
  addFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#FF6B35',
    borderTopWidth: 1,
    borderTopColor: '#FFE0B2',
    borderRightWidth: 1,
    borderRightColor: '#FFE0B2',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
  },
  addFormTitle: {
    fontWeight: '700',
    color: '#E65100',
    marginLeft: 12,
    fontSize: 18,
  },
  enhancedFormInput: {
    backgroundColor: '#FAFAFA',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  enhancedTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#F8F9FA',
  },
  enhancedLevelButton: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFE0B2',
    backgroundColor: '#FFFFFF',
    marginRight: 10,
    marginBottom: 10,
    minWidth: 110,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedEnhancedLevelButton: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOpacity: 0.3,
  },
  enhancedContactTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FF6B35',
    backgroundColor: '#FFF3E0',
    marginRight: 14,
    marginBottom: 10,
    minWidth: 125,
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedEnhancedContactTypeButton: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOpacity: 0.3,
  },
  enhancedAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 14,
    backgroundColor: '#FF6B35',
    gap: 14,
    marginTop: 12,
    elevation: 4,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  enhancedAddButtonDisabled: {
    backgroundColor: '#E0E0E0',
    borderColor: '#E0E0E0',
    elevation: 0,
    shadowOpacity: 0,
  },
  // Enhanced profile picture styles
  profilePictureSection: {
    alignItems: 'center',
    marginRight: 20,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImageWrapper: {
    position: 'relative',
    borderRadius: 50,
    overflow: 'hidden',
  },
  profileImage: {
    borderWidth: 3,
    borderColor: '#FF6B35',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 8,
  },
  uploadingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  uploadHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Profile Options Styles
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});

export default ProfileScreen; 
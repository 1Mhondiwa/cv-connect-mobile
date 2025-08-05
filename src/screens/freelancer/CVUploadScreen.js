import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  ProgressBar,
  IconButton,
  Surface,
  useTheme,
} from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { useDispatch, useSelector } from 'react-redux';
import { uploadCV } from '../../store/slices/freelancerSlice';

const CVUploadScreen = ({ navigation }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  const pickDocument = async () => {
    try {
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
        const file = result.assets[0];
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a file smaller than 5MB');
          return;
        }
        setSelectedFile(file);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('No File Selected', 'Please select a CV file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      // Clean the filename - remove spaces and special characters
      const cleanFileName = selectedFile.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
      
      // Create the file object with proper format
      const fileObject = {
        uri: selectedFile.uri,
        type: selectedFile.mimeType || 'application/pdf',
        name: cleanFileName,
      };
      
      formData.append('cv', fileObject);

      console.log('Uploading CV:', selectedFile.name);

      const result = await dispatch(uploadCV(formData)).unwrap();
      
      Alert.alert(
        'Success!',
        'Your CV has been uploaded successfully. You can now access your dashboard.',
        [
          {
            text: 'Continue',
            onPress: () => {
              // Navigate to main app after successful upload
              navigation.replace('Main');
            },
          },
        ]
      );
    } catch (error) {
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
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    Alert.alert(
      'Remove File',
      'Are you sure you want to remove this file?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => setSelectedFile(null) }
      ]
    );
  };







  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <IconButton
            icon="account-check"
            size={40}
            iconColor={theme.colors.primary}
            style={styles.headerIcon}
          />
          <View style={styles.headerText}>
            <Text variant="headlineSmall" style={styles.welcomeText}>
              Welcome to CV Connect!
            </Text>
            <Text variant="bodyMedium" style={styles.subtitleText}>
              Let's get you started by uploading your CV
            </Text>
          </View>

        </View>
      </Surface>

      <Card style={styles.uploadCard} elevation={4}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.uploadIconContainer}>
            <IconButton
              icon="file-document"
              size={60}
              iconColor="#8B4513"
              style={styles.uploadIcon}
            />
          </View>

          <Text variant="headlineSmall" style={styles.cardTitle}>
            Upload Your CV
          </Text>
          
          <Text variant="bodyMedium" style={styles.cardDescription}>
            Please upload your CV to complete your profile. We accept PDF, DOC, DOCX, and TXT files (max 5MB).
          </Text>

                     {selectedFile ? (
             <View style={styles.fileInfo}>
               <View style={styles.fileDetails}>
                 <IconButton
                   icon="file-document"
                   size={24}
                   iconColor="#8B4513"
                 />
                 <View style={styles.fileText}>
                   <Text variant="bodyMedium" style={styles.fileName}>
                     {selectedFile.name}
                   </Text>
                   <Text variant="bodySmall" style={styles.fileSize}>
                     {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                   </Text>
                 </View>
                 <IconButton
                   icon="close-circle"
                   size={24}
                   onPress={removeFile}
                   iconColor={theme.colors.error}
                 />
               </View>
               <View style={styles.fileActions}>
                 <Button
                   mode="outlined"
                   onPress={pickDocument}
                   style={styles.changeButton}
                   contentStyle={styles.changeButtonContent}
                   icon="file-replace"
                 >
                   Change File
                 </Button>
               </View>
             </View>
           ) : (
            <Button
              mode="outlined"
              onPress={pickDocument}
              style={styles.pickButton}
              contentStyle={styles.pickButtonContent}
              icon="file-plus"
            >
              Select CV File
            </Button>
          )}

          {uploading && (
            <View style={styles.progressContainer}>
              <Text variant="bodySmall" style={styles.progressText}>
                Uploading... {Math.round(uploadProgress)}%
              </Text>
              <ProgressBar
                progress={uploadProgress / 100}
                color={theme.colors.primary}
                style={styles.progressBar}
              />
            </View>
          )}

                     <View style={styles.buttonContainer}>
             <Button
               mode="contained"
               onPress={handleUpload}
               disabled={!selectedFile || uploading}
               style={styles.uploadButton}
               contentStyle={styles.uploadButtonContent}
               icon={uploading ? "loading" : "upload"}
             >
               {uploading ? 'Uploading...' : 'Upload CV'}
             </Button>
             

             

           </View>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard} elevation={2}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.infoTitle}>
            Why upload your CV?
          </Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <IconButton
                icon="check"
                size={20}
                iconColor="#8B4513"
              />
              <Text variant="bodyMedium">Complete your profile</Text>
            </View>
            <View style={styles.benefitItem}>
              <IconButton
                icon="check"
                size={20}
                iconColor="#8B4513"
              />
              <Text variant="bodyMedium">Get discovered by employers</Text>
            </View>
            <View style={styles.benefitItem}>
              <IconButton
                icon="check"
                size={20}
                iconColor="#8B4513"
              />
              <Text variant="bodyMedium">Access all platform features</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
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
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  headerContent: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  welcomeText: {
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  subtitleText: {
    color: '#666',
  },
  uploadCard: {
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  cardContent: {
    padding: 24,
  },
  uploadIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadIcon: {
    backgroundColor: 'transparent',
  },
  cardTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  cardDescription: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  pickButton: {
    borderColor: '#FF6B35',
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 16,
  },
  pickButtonContent: {
    height: 48,
  },
  fileInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  fileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileText: {
    flex: 1,
    marginLeft: 8,
  },
  fileName: {
    fontWeight: '600',
    color: '#333',
  },
  fileSize: {
    color: '#666',
    marginTop: 2,
  },
  fileActions: {
    marginTop: 12,
    alignItems: 'center',
  },
  changeButton: {
    borderColor: '#FF6B35',
    borderWidth: 1,
    borderRadius: 8,
  },
  changeButtonContent: {
    height: 36,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  buttonContainer: {
    marginTop: 8,
  },
  uploadButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
  },
  uploadButtonContent: {
    height: 48,
  },


  infoCard: {
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default CVUploadScreen; 
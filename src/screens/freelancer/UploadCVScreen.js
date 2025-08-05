import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { uploadCV } from '../../store/slices/profileSlice';
import * as DocumentPicker from 'expo-document-picker';

const UploadCVScreen = ({ navigation }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const dispatch = useDispatch();
  const { isLoading, uploadProgress } = useSelector((state) => state.profile);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setSelectedFile(result);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a CV file first');
      return;
    }

    try {
      await dispatch(uploadCV(selectedFile)).unwrap();
      Alert.alert('Success', 'CV uploaded successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Upload Failed', error || 'Please try again');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload CV</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Select Your CV</Text>
          <Text style={styles.sectionSubtitle}>
            Upload your CV in PDF, DOC, or DOCX format
          </Text>

          <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
            <Text style={styles.uploadIcon}>📄</Text>
            <Text style={styles.uploadText}>Choose File</Text>
            <Text style={styles.uploadSubtext}>PDF, DOC, DOCX (Max 10MB)</Text>
          </TouchableOpacity>

          {selectedFile && (
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{selectedFile.name}</Text>
              <Text style={styles.fileSize}>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </Text>
            </View>
          )}

          {isLoading && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${uploadProgress || 0}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{uploadProgress || 0}%</Text>
            </View>
          )}
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Tips for a Great CV</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>1</Text>
            <Text style={styles.tipText}>Keep it concise and well-formatted</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>2</Text>
            <Text style={styles.tipText}>Include relevant skills and experience</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>3</Text>
            <Text style={styles.tipText}>Update your CV regularly</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>4</Text>
            <Text style={styles.tipText}>Use clear, professional language</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.uploadCVButton,
            (!selectedFile || isLoading) && styles.disabledButton
          ]}
          onPress={handleUpload}
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.uploadCVButtonText}>Upload CV</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#8B4513',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 60,
  },
  content: {
    padding: 20,
  },
  uploadSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 20,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#8B8B8B',
  },
  fileInfo: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#8B4513',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  fileSize: {
    fontSize: 14,
    color: '#4A4A4A',
  },
  progressContainer: {
    marginTop: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF8C00',
  },
  progressText: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 14,
    color: '#4A4A4A',
  },
  tipsSection: {
    marginBottom: 30,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF8C00',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  uploadCVButton: {
    backgroundColor: '#FF8C00',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  uploadCVButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UploadCVScreen; 
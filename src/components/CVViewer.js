import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  Alert,
  Linking,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Conditional import to prevent runtime errors
let Pdf = null;
try {
  Pdf = require('react-native-pdf').default;
} catch (error) {
  console.log('PDF viewer not available:', error.message);
}

const CVViewer = ({ visible, onClose, cvUrl, cvFilename, cvData }) => {
  const [urlStatus, setUrlStatus] = useState('checking');
  const [validUrl, setValidUrl] = useState('');
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  // Validate props
  if (!cvUrl || !cvFilename) {
    console.error('CVViewer: Missing required props - cvUrl:', cvUrl, 'cvFilename:', cvFilename);
    return null;
  }

  // Don't render if URL is empty
  if (cvUrl === '') {
    return null;
  }

  // Clean the filename if it contains a path
  const cleanFilename = (filename) => {
    if (!filename) return 'CV';
    // Remove any path segments and get just the filename
    return filename.split('/').pop() || filename.split('\\').pop() || filename;
  };

  const cleanCvFilename = cleanFilename(cvFilename);

  // Debug logging
  console.log('CVViewer - cvUrl:', cvUrl);
  console.log('CVViewer - cvFilename:', cvFilename);
  console.log('CVViewer - Cleaned filename:', cleanCvFilename);
  console.log('CVViewer - CV Data:', cvData);

  // Check URL validity when component mounts or URL changes
  useEffect(() => {
    if (visible && cvUrl) {
      checkUrlValidity();
    }
  }, [visible, cvUrl]);

  const checkUrlValidity = async () => {
    try {
      setUrlStatus('checking');
      console.log('Checking URL validity:', cvUrl);
      
      // Test the URL with a HEAD request
      const response = await fetch(cvUrl, { 
        method: 'HEAD',
        timeout: 10000 
      });
      
      if (response.ok) {
        console.log('URL is valid, status:', response.status);
        setValidUrl(cvUrl);
        setUrlStatus('valid');
      } else {
        console.log('Initial URL returned status:', response.status, 'trying alternatives...');
        
        // Try to construct alternative URLs
        await tryAlternativeUrls();
      }
    } catch (error) {
      console.log('Error checking initial URL, trying alternatives...');
      
      // Try to construct alternative URLs
      await tryAlternativeUrls();
    }
  };

  const tryAlternativeUrls = async () => {
    console.log('Trying alternative URL constructions...');
    
    // Extract the filename from the stored_filename
    const storedFilename = cvUrl.split('/').pop();
    console.log('Stored filename from URL:', storedFilename);
    
    // Try different URL patterns
    const alternativeUrls = [
      `http://10.254.121.136:5000/uploads/cvs/${storedFilename}`,
      `http://10.254.121.136:5000/cv/${storedFilename}`,
      `http://10.254.121.136:8081/uploads/cvs/${storedFilename}`,
      `http://10.254.121.136:8081/cv/${storedFilename}`,
    ];
    
    for (const altUrl of alternativeUrls) {
      try {
        console.log('Testing alternative URL:', altUrl);
        const response = await fetch(altUrl, { method: 'HEAD', timeout: 5000 });
        
        if (response.ok) {
          console.log('Alternative URL works:', altUrl);
          setValidUrl(altUrl);
          setUrlStatus('valid');
          return;
        }
      } catch (error) {
        console.log('Alternative URL failed:', altUrl, error.message);
      }
    }
    
    console.error('All alternative URLs failed');
    setUrlStatus('invalid');
  };

  const handleViewCV = async () => {
    if (!validUrl) {
      Alert.alert('View Error', 'CV URL is not accessible. Please try again.');
      return;
    }

    try {
      console.log('Attempting to view CV at URL:', validUrl);
      
      // Validate URL format
      if (!validUrl || !validUrl.startsWith('http')) {
        Alert.alert('Invalid URL', 'CV URL is not properly formatted. Please try again.');
        return;
      }
      
      // For PDFs, show in-app viewer if available, otherwise open in browser
      if (cleanCvFilename.toLowerCase().endsWith('.pdf')) {
        if (Pdf) {
          setShowPdfViewer(true);
        } else {
          // Fallback to browser if PDF viewer not available
          try {
            await Linking.openURL(validUrl);
          } catch (linkError) {
            Alert.alert(
              'Cannot Open PDF', 
              'PDF viewer not available. Please try opening in browser.'
            );
          }
        }
      } else {
        // For other file types, try to open in browser
        try {
          await Linking.openURL(validUrl);
        } catch (linkError) {
          Alert.alert(
            'Cannot Open File', 
            'Unable to open this file type. Please try again later.'
          );
        }
      }
    } catch (error) {
      console.error('Error opening CV:', error);
      Alert.alert(
        'Error Opening CV', 
        'Cannot open CV file. This might be due to:\n\n• Invalid file path\n• Server configuration\n• Network issues\n\nPlease try again later.'
      );
    }
  };

  const renderUrlStatus = () => {
    if (urlStatus === 'checking') {
      return (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color="#FF6B35" />
          <Text style={styles.statusText}>Checking CV accessibility...</Text>
        </View>
      );
    } else if (urlStatus === 'valid') {
      return (
        <View style={styles.statusContainer}>
          <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.statusText}>CV is accessible</Text>
        </View>
      );
    }
    // Don't show any status if URL is not valid yet
    return null;
  };

  const renderCVInfo = () => {
    if (!cvData) return null;

    return (
      <View style={styles.cvInfoContainer}>
        <Text style={styles.cvInfoTitle}>CV Information</Text>
        <View style={styles.cvInfoRow}>
          <Text style={styles.cvInfoLabel}>Original Name:</Text>
          <Text style={styles.cvInfoValue}>{cvData.original_filename || 'N/A'}</Text>
        </View>
        <View style={styles.cvInfoRow}>
          <Text style={styles.cvInfoLabel}>File Type:</Text>
          <Text style={styles.cvInfoValue}>{cvData.file_type || 'N/A'}</Text>
        </View>
        <View style={styles.cvInfoRow}>
          <Text style={styles.cvInfoLabel}>File Size:</Text>
          <Text style={styles.cvInfoValue}>
            {cvData.file_size ? `${(cvData.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
          </Text>
        </View>
        <View style={styles.cvInfoRow}>
          <Text style={styles.cvInfoLabel}>Status:</Text>
          <Text style={styles.cvInfoValue}>{cvData.parsing_status || 'N/A'}</Text>
        </View>
        {cvData.file_info && (
          <View style={styles.cvInfoRow}>
            <Text style={styles.cvInfoLabel}>File Exists:</Text>
            <Text style={styles.cvInfoValue}>
              {cvData.file_info.exists ? 'Yes' : 'No'}
            </Text>
          </View>
        )}
        
        {/* Show warning if file is missing */}
        {cvData.file_info && !cvData.file_info.exists && (
          <View style={styles.warningContainer}>
            <MaterialCommunityIcons name="alert-triangle" size={20} color="#FF9800" />
            <Text style={styles.warningText}>
              CV file is missing from server. Please re-upload your CV in the profile section.
            </Text>
          </View>
        )}
      </View>
    );
  };

  // If showing PDF viewer, render that instead
  if (showPdfViewer && validUrl && Pdf) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={onClose}
      >
        <View style={styles.pdfContainer}>
          {/* PDF Viewer Header */}
          <View style={styles.pdfHeader}>
            <TouchableOpacity onPress={() => setShowPdfViewer(false)} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.pdfTitle}>{cleanCvFilename}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {/* PDF Content */}
          <View style={styles.pdfContent}>
            <Pdf
              source={{ uri: validUrl }}
              style={styles.pdf}
              onLoadComplete={(numberOfPages, filePath) => {
                console.log(`PDF loaded: ${numberOfPages} pages`);
              }}
              onPageChanged={(page, numberOfPages) => {
                console.log(`Page changed to: ${page}/${numberOfPages}`);
              }}
              onError={(error) => {
                console.error('PDF error:', error);
                Alert.alert('PDF Error', 'Failed to load PDF. Please try again.');
                setShowPdfViewer(false);
              }}
              onPressLink={(uri) => {
                console.log(`Link pressed: ${uri}`);
              }}
            />
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>{cleanCvFilename}</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              onPress={handleViewCV} 
              style={[styles.headerButton, urlStatus === 'checking' && styles.headerButtonDisabled]}
              disabled={urlStatus === 'checking'}
            >
              <MaterialCommunityIcons name="eye" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* URL Status */}
        {renderUrlStatus()}
        
        {/* CV Information from Database */}
        {renderCVInfo()}
        
        {/* File Content */}
        <View style={styles.fileContainer}>
          <View style={styles.fileInfo}>
            <MaterialCommunityIcons name="file-document" size={80} color="#FF6B35" />
            <Text style={styles.fileName}>{cleanCvFilename}</Text>
            <Text style={styles.fileType}>
              File Type: {cleanCvFilename?.split('.').pop()?.toUpperCase() || 'Unknown'}
            </Text>
            

          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, urlStatus === 'checking' && styles.actionButtonDisabled]} 
              onPress={handleViewCV}
              disabled={urlStatus === 'checking'}
            >
              <MaterialCommunityIcons name="eye" size={32} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>
                View CV
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  pdfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pdfTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
  },
  pdfContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  statusSubtext: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 8,
  },
  cvInfoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  cvInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  cvInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cvInfoLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  cvInfoValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '400',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FFCC80',
  },
  warningText: {
    fontSize: 13,
    color: '#FF9800',
    marginLeft: 8,
    fontWeight: '500',
  },

  fileContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  fileInfo: {
    alignItems: 'center',
    marginBottom: 48,
  },
  fileName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  fileType: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 24,
  },
  actionButton: {
    backgroundColor: '#FF6B35',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  actionButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },

  errorMessageContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    backgroundColor: '#FEEEEE',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  errorMessageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  errorMessageText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessageSubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default CVViewer;

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Button, Surface } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    // Animate content on load
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      {/* Header with Logo */}
      <LinearGradient
        colors={['#FF6B35', '#FF8C42']}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              {logoError ? (
                <MaterialCommunityIcons
                  name="account-tie"
                  size={50}
                  color="#FFFFFF"
                />
              ) : (
                <Image
                  source={require('../../assets/images/cv-connect_logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                  onError={() => setLogoError(true)}
                />
              )}
            </View>
          </View>
          
          <Text style={styles.appTitle}>CV-Connect</Text>
          <Text style={styles.mainHeadline}>
            Find Your Next
            <Text style={styles.highlightText}> Freelance Opportunity</Text>
          </Text>
          <Text style={styles.subHeadline}>
            Connect with top employers, showcase your skills, and build your career
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* App Preview Section */}
        <Animated.View
          style={[
            styles.appPreviewSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.phoneMockup}>
            <View style={styles.phoneFrame}>
              <View style={styles.phoneScreen}>
                <View style={styles.mockupContent}>
                  <View style={styles.mockupHeader}>
                    <View style={styles.mockupLogo} />
                    <Text style={styles.mockupTitle}>CV-Connect</Text>
                  </View>
                  <View style={styles.mockupFeatures}>
                    <View style={styles.mockupFeature}>
                      <View style={styles.mockupIcon} />
                      <Text style={styles.mockupText}>Find Jobs</Text>
                    </View>
                    <View style={styles.mockupFeature}>
                      <View style={styles.mockupIcon} />
                      <Text style={styles.mockupText}>Video Interviews</Text>
                    </View>
                    <View style={styles.mockupFeature}>
                      <View style={styles.mockupIcon} />
                      <Text style={styles.mockupText}>Get Feedback</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Trust Indicators */}
        <Animated.View
          style={[
            styles.trustSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.trustText}>
            ✓ Free to join  ✓ No hidden fees  ✓ Secure platform
          </Text>
        </Animated.View>

        {/* Call to Action Buttons */}
        <Animated.View
          style={[
            styles.ctaSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Register')}
            style={styles.primaryCTA}
            contentStyle={styles.primaryCTAContent}
            labelStyle={styles.primaryCTALabel}
            icon="rocket-launch"
          >
            Get Started Free
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Login')}
            style={styles.secondaryCTA}
            contentStyle={styles.secondaryCTAContent}
            labelStyle={styles.secondaryCTALabel}
            icon="login"
          >
            I Already Have an Account
          </Button>
        </Animated.View>

        {/* Footer */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.footerText}>
            Ready to start your freelance journey?
          </Text>
          <Text style={styles.footerSubtext}>
            Join thousands of successful freelancers today
          </Text>
          
          {/* Social Proof */}
          <View style={styles.socialProof}>
            <Text style={styles.socialProofText}>
              Trusted by 1000+ freelancers worldwide
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  mainHeadline: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },
  highlightText: {
    color: '#FFE0B2',
    fontWeight: 'bold',
  },
  subHeadline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  appPreviewSection: {
    padding: 20,
    alignItems: 'center',
  },
  phoneMockup: {
    alignItems: 'center',
    marginVertical: 20,
  },
  phoneFrame: {
    width: 200,
    height: 400,
    backgroundColor: '#2C3E50',
    borderRadius: 30,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
  },
  mockupContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  mockupHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  mockupLogo: {
    width: 40,
    height: 40,
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    marginBottom: 10,
  },
  mockupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  mockupFeatures: {
    flex: 1,
    justifyContent: 'space-around',
  },
  mockupFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  mockupIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    marginRight: 12,
  },
  mockupText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  trustSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  trustText: {
    fontSize: 14,
    color: '#2C3E50',
    textAlign: 'center',
    fontWeight: '500',
  },
  ctaSection: {
    padding: 20,
  },
  primaryCTA: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryCTAContent: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  primaryCTALabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryCTA: {
    borderColor: '#FF6B35',
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  secondaryCTAContent: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  secondaryCTALabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
  },
  socialProof: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  socialProofText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default LandingScreen;

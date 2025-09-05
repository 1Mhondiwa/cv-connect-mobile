import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Switch,
  List,
  Divider,
  Button,
  Surface,
  Paragraph,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNotifications } from '../../contexts/NotificationContext';

// Responsive utilities
import {
  scale,
  verticalScale,
  fontSize,
  spacing,
  borderRadius,
} from '../../utils/responsive';

const NotificationSettingsScreen = ({ navigation }) => {
  const {
    isInitialized,
    expoPushToken,
    requestPermissions,
    showPermissionAlert,
    cancelAllNotifications,
  } = useNotifications();

  const [settings, setSettings] = useState({
    interviewScheduled: true,
    interviewReminders: true,
    interviewFeedback: true,
    interviewCancelled: true,
    generalUpdates: false,
  });

  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const granted = await requestPermissions();
    setPermissionGranted(granted);
  };

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleRequestPermissions = async () => {
    const granted = await requestPermissions();
    if (granted) {
      setPermissionGranted(true);
      Alert.alert(
        'Success',
        'Notification permissions granted! You will now receive interview updates.',
        [{ text: 'OK' }]
      );
    } else {
      showPermissionAlert();
    }
  };

  const handleClearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all scheduled notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await cancelAllNotifications();
            Alert.alert('Success', 'All notifications have been cleared.');
          },
        },
      ]
    );
  };

  const renderPermissionStatus = () => {
    if (!isInitialized) {
      return (
        <Card style={styles.statusCard}>
          <Card.Content>
            <View style={styles.statusContent}>
              <MaterialCommunityIcons name="loading" size={24} color="#FF6B35" />
              <Text style={styles.statusText}>Initializing notifications...</Text>
            </View>
          </Card.Content>
        </Card>
      );
    }

    if (!permissionGranted) {
      return (
        <Card style={[styles.statusCard, styles.errorCard]}>
          <Card.Content>
            <View style={styles.statusContent}>
              <MaterialCommunityIcons name="alert-circle" size={24} color="#dc3545" />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusText}>Notifications are disabled</Text>
                <Paragraph style={styles.statusDescription}>
                  Enable notifications to receive interview updates and reminders.
                </Paragraph>
                <Button
                  mode="contained"
                  onPress={handleRequestPermissions}
                  style={styles.permissionButton}
                  labelStyle={styles.buttonLabel}
                >
                  Enable Notifications
                </Button>
              </View>
            </View>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card style={[styles.statusCard, styles.successCard]}>
        <Card.Content>
          <View style={styles.statusContent}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#28a745" />
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusText}>Notifications enabled</Text>
              <Paragraph style={styles.statusDescription}>
                You will receive interview updates and reminders.
              </Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderNotificationSettings = () => (
    <Card style={styles.settingsCard}>
      <Card.Content>
        <Title style={styles.sectionTitle}>Notification Types</Title>
        <Paragraph style={styles.sectionDescription}>
          Choose which types of notifications you want to receive.
        </Paragraph>

        <List.Item
          title="Interview Scheduled"
          description="When a new interview is scheduled for you"
          left={(props) => <List.Icon {...props} icon="calendar-plus" />}
          right={() => (
            <Switch
              value={settings.interviewScheduled}
              onValueChange={(value) => handleSettingChange('interviewScheduled', value)}
              disabled={!permissionGranted}
            />
          )}
        />

        <Divider style={styles.divider} />

        <List.Item
          title="Interview Reminders"
          description="30 minutes before your scheduled interviews"
          left={(props) => <List.Icon {...props} icon="alarm" />}
          right={() => (
            <Switch
              value={settings.interviewReminders}
              onValueChange={(value) => handleSettingChange('interviewReminders', value)}
              disabled={!permissionGranted}
            />
          )}
        />

        <Divider style={styles.divider} />

        <List.Item
          title="Interview Feedback"
          description="When feedback is available for your interviews"
          left={(props) => <List.Icon {...props} icon="star" />}
          right={() => (
            <Switch
              value={settings.interviewFeedback}
              onValueChange={(value) => handleSettingChange('interviewFeedback', value)}
              disabled={!permissionGranted}
            />
          )}
        />

        <Divider style={styles.divider} />

        <List.Item
          title="Interview Cancelled"
          description="When an interview is cancelled"
          left={(props) => <List.Icon {...props} icon="cancel" />}
          right={() => (
            <Switch
              value={settings.interviewCancelled}
              onValueChange={(value) => handleSettingChange('interviewCancelled', value)}
              disabled={!permissionGranted}
            />
          )}
        />

        <Divider style={styles.divider} />

        <List.Item
          title="General Updates"
          description="Platform updates and announcements"
          left={(props) => <List.Icon {...props} icon="information" />}
          right={() => (
            <Switch
              value={settings.generalUpdates}
              onValueChange={(value) => handleSettingChange('generalUpdates', value)}
              disabled={!permissionGranted}
            />
          )}
        />
      </Card.Content>
    </Card>
  );

  const renderDebugInfo = () => {
    if (!__DEV__) return null;

    return (
      <Card style={styles.debugCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Debug Information</Title>
          <Text style={styles.debugText}>
            Initialized: {isInitialized ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.debugText}>
            Permission: {permissionGranted ? 'Granted' : 'Denied'}
          </Text>
          <Text style={styles.debugText}>
            Push Token: {expoPushToken ? 'Available' : 'Not Available'}
          </Text>
          {expoPushToken && (
            <Text style={[styles.debugText, styles.tokenText]}>
              {expoPushToken}
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderPermissionStatus()}
        
        {permissionGranted && renderNotificationSettings()}

        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Actions</Title>
            
            <Button
              mode="outlined"
              onPress={handleClearAllNotifications}
              style={styles.actionButton}
              labelStyle={styles.buttonLabel}
              icon="delete-sweep"
            >
              Clear All Notifications
            </Button>

            <Button
              mode="outlined"
              onPress={checkPermissions}
              style={styles.actionButton}
              labelStyle={styles.buttonLabel}
              icon="refresh"
            >
              Refresh Permissions
            </Button>
          </Card.Content>
        </Card>

        {renderDebugInfo()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    padding: spacing.medium,
  },
  statusCard: {
    marginBottom: spacing.medium,
    elevation: 2,
  },
  successCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  errorCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTextContainer: {
    flex: 1,
    marginLeft: spacing.medium,
  },
  statusText: {
    fontSize: fontSize.medium,
    fontWeight: 'bold',
    color: '#333',
  },
  statusDescription: {
    fontSize: fontSize.small,
    color: '#666',
    marginTop: spacing.xs,
  },
  permissionButton: {
    marginTop: spacing.small,
    backgroundColor: '#FF6B35',
  },
  buttonLabel: {
    fontSize: fontSize.small,
    fontWeight: 'bold',
  },
  settingsCard: {
    marginBottom: spacing.medium,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: fontSize.large,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: spacing.small,
  },
  sectionDescription: {
    fontSize: fontSize.small,
    color: '#666',
    marginBottom: spacing.medium,
  },
  divider: {
    marginVertical: spacing.xs,
  },
  actionsCard: {
    marginBottom: spacing.medium,
    elevation: 2,
  },
  actionButton: {
    marginBottom: spacing.small,
    borderColor: '#FF6B35',
  },
  debugCard: {
    marginBottom: spacing.medium,
    elevation: 1,
    backgroundColor: '#f8f9fa',
  },
  debugText: {
    fontSize: fontSize.small,
    color: '#666',
    marginBottom: spacing.xs,
  },
  tokenText: {
    fontFamily: 'monospace',
    backgroundColor: '#e9ecef',
    padding: spacing.xs,
    borderRadius: borderRadius.small,
  },
});

export default NotificationSettingsScreen;

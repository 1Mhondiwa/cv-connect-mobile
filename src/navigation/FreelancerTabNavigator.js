import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { 
  getResponsiveTabBarStyle, 
  getResponsiveTabBarLabelStyle,
  getResponsiveTabBarIconStyle,
  getResponsiveTabBarConfig
} from '../components/ResponsiveBottomTabBar';

// Import screens
import DashboardScreen from '../screens/freelancer/DashboardScreen';
import ProfileScreen from '../screens/freelancer/ProfileScreen';
import HiringHistoryScreen from '../screens/freelancer/HiringHistoryScreen';

import MessagesScreen from '../screens/freelancer/MessagesScreen';
import ChatScreen from '../screens/common/ChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Messages Stack Navigator
const MessagesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FF6B35',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen 
        name="MessagesList" 
        component={MessagesScreen}
        options={{
          title: 'Messages',
        }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          title: 'Chat',
        }}
      />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FF6B35',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
      <Stack.Screen 
        name="HiringHistory" 
        component={HiringHistoryScreen}
        options={{
          title: 'Hiring History',
        }}
      />
    </Stack.Navigator>
  );
};

const FreelancerTabNavigator = () => {
  const theme = useTheme();
  const { unreadCount } = useSelector((state) => state.messages);

  // Custom tab bar icon with badge
  const renderTabBarIcon = ({ route, focused, color, size }) => {
    let iconName;

    if (route.name === 'Dashboard') {
      iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
    } else if (route.name === 'Profile') {
      iconName = focused ? 'account' : 'account-outline';
    } else if (route.name === 'Messages') {
      iconName = focused ? 'message' : 'message-outline';
    }

    // Use responsive icon size
    const config = getResponsiveTabBarConfig();
    const iconSize = config.iconSize;

    if (route.name === 'Messages' && unreadCount > 0) {
      return (
        <View style={styles.tabIconContainer}>
          <Icon name={iconName} size={iconSize} color={color} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        </View>
      );
    }

    return <Icon name={iconName} size={iconSize} color={color} />;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => renderTabBarIcon({ route, focused, color, size }),
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#8B4513',
        tabBarStyle: getResponsiveTabBarStyle(),
        tabBarLabelStyle: getResponsiveTabBarLabelStyle(),
        headerStyle: {
          backgroundColor: '#FF6B35',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
        }}
      />

      <Tab.Screen 
        name="Messages" 
        component={MessagesStack}
        options={{
          title: 'Messages',
          headerShown: false, // Hide header since MessagesStack has its own
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{
          title: 'Profile',
          headerShown: false, // Hide header since ProfileStack has its own
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default FreelancerTabNavigator; 
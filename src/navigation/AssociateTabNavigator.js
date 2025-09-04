import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { 
  getResponsiveTabBarStyle, 
  getResponsiveTabBarLabelStyle,
  getResponsiveTabBarIconStyle,
  getResponsiveTabBarConfig
} from '../components/ResponsiveBottomTabBar';

// Associate Screens
import AssociateDashboardScreen from '../screens/associate/DashboardScreen';
import AssociateSearchScreen from '../screens/associate/SearchScreen';
import AssociateMessagesScreen from '../screens/associate/MessagesScreen';
import AssociateProfileScreen from '../screens/associate/ProfileScreen';
import FreelancerDetailScreen from '../screens/associate/FreelancerDetailScreen';
import ChatScreen from '../screens/common/ChatScreen';
import SavedProfilesScreen from '../screens/associate/SavedProfilesScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Search Stack Navigator
const SearchStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SearchMain" component={AssociateSearchScreen} />
    <Stack.Screen name="FreelancerDetail" component={FreelancerDetailScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
  </Stack.Navigator>
);

// Messages Stack Navigator
const MessagesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MessagesMain" component={AssociateMessagesScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
  </Stack.Navigator>
);

const AssociateTabNavigator = () => {
  const { unreadCount } = useSelector((state) => state.messages);

  // Custom tab bar icon with badge
  const renderTabBarIcon = ({ route, focused, color, size }) => {
    let iconName;

    if (route.name === 'Dashboard') {
      iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
    } else if (route.name === 'Search') {
      iconName = focused ? 'magnify' : 'magnify';
    } else if (route.name === 'Saved') {
      iconName = focused ? 'bookmark' : 'bookmark-outline';
    } else if (route.name === 'Messages') {
      iconName = focused ? 'message-text' : 'message-text-outline';
    } else if (route.name === 'Profile') {
      iconName = focused ? 'account' : 'account-outline';
    }

    // Use responsive icon size
    const config = getResponsiveTabBarConfig();
    const iconSize = config.iconSize;

    if (route.name === 'Messages' && unreadCount > 0) {
      return (
        <View style={styles.tabIconContainer}>
          <MaterialCommunityIcons name={iconName} size={iconSize} color={color} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        </View>
      );
    }

    return <MaterialCommunityIcons name={iconName} size={iconSize} color={color} />;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => renderTabBarIcon({ route, focused, color, size }),
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#8B4513',
        tabBarStyle: getResponsiveTabBarStyle(),
        tabBarLabelStyle: getResponsiveTabBarLabelStyle(),
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={AssociateDashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchStack}
        options={{ title: 'Search' }}
      />
      <Tab.Screen 
        name="Saved" 
        component={SavedProfilesScreen}
        options={{ title: 'Saved' }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesStack}
        options={{ title: 'Messages' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={AssociateProfileScreen}
        options={{ title: 'Profile' }}
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

export default AssociateTabNavigator; 
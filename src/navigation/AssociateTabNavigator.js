import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';

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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
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

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#8B4513',
                 tabBarStyle: {
           backgroundColor: '#FFFFFF',
           borderTopWidth: 1,
           borderTopColor: '#E0E0E0',
           paddingBottom: Platform.OS === 'ios' ? 20 : 12,
           paddingTop: 8,
           height: Platform.OS === 'ios' ? 90 : 80,
           paddingHorizontal: 10,
           // Add safe area padding for Android
           ...(Platform.OS === 'android' && {
             paddingBottom: 20,
           }),
         },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2,
        },
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

export default AssociateTabNavigator; 
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Associate Screens
import AssociateDashboardScreen from '../screens/associate/DashboardScreen';
import AssociateSearchScreen from '../screens/associate/SearchScreen';
import AssociateMessagesScreen from '../screens/associate/MessagesScreen';
import AssociateProfileScreen from '../screens/associate/ProfileScreen';
import FreelancerDetailScreen from '../screens/associate/FreelancerDetailScreen';
import ChatScreen from '../screens/common/ChatScreen';

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
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
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
        options={{ title: 'Find Freelancers' }}
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
// import React from 'react';
// import {Text} from 'react-native';
// import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

// import HomeScreen from '../screens/Home/HomeScreen';
// import WishListScreen from '../screens/WishList/WishListScreen';
// import LoginScreen from '../screens/Login/LoginScreen';

// const Tab = createBottomTabNavigator();

// const BottomTabNavigator = () => {
//   return (
//     <Tab.Navigator
//       screenOptions={{
//         headerShown: false,
//       }}>

//       <Tab.Screen
//         name="HomeTab"
//         component={HomeScreen}
//         options={{
//           tabBarIcon: () => (
//             <Text>🏠</Text>
//           ),
//         }}
//       />

//       <Tab.Screen
//         name="WishlistTab"
//         component={WishListScreen}
//         options={{
//           tabBarIcon: () => (
//             <Text>♡</Text>
//           ),
//         }}
//       />

//       <Tab.Screen
//         name="ProfileTab"
//         component={LoginScreen}
//         options={{
//           tabBarIcon: () => (
//             <Text>👤</Text>
//           ),
//         }}
//       />
//     </Tab.Navigator>
//   );
// };

// export default BottomTabNavigator;

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/Home/HomeScreen';
import CategoriesScreen from '../screens/categories/CategoriesScreen';
import WishListScreen from '../screens/WishList/WishListScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

import CustomTabBar from '../components/common/CustomTabBar';
import CartScreen from '../screens/Cart/CartScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
      />

      <Tab.Screen
        name="CategoriesTab"
        component={CategoriesScreen}
      />

      <Tab.Screen
        name="WishlistTab"
        component={WishListScreen}
      />

      <Tab.Screen
        name="CartTab"
        component={CartScreen}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
      />

    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
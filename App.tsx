import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import OwnerScreen from './screens/OwnerScreen'; 
import DetailsScreen from './screens/UserDetails';
import SplashScreen from './screens/SplashScreen';
import StartWorknew from './screens/startworknew';
import UsersList from './screens/UsersList'
import UsersWorkHistory from './screens/UsersWorkHistory'


const Stack = createStackNavigator();

const App = () => {
 
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen}  options={{ headerShown: false }} />
        <Stack.Screen name="Owner" component={OwnerScreen}  options={{ headerShown: false }}/>
        <Stack.Screen name="UserDetails" component={DetailsScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="startnew" component={StartWorknew}options={{ headerShown: false }} />
        <Stack.Screen name="UsersList" component={UsersList}options={{ headerShown: false }} />
        <Stack.Screen name="UsersWorkHistory" component={UsersWorkHistory} options={{ headerShown: false }}/>
      </Stack.Navigator>
      
    </NavigationContainer>
  );
};

export default App; 
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './context/AuthContext';
import { Web3Provider } from './context/Web3Context';
import HomeScreen from './screens/HomeScreen';
import MarketScreen from './screens/MarketScreen';
import SellScreen from './screens/SellScreen';
import PortfolioScreen from './screens/PortfolioScreen';
import SignInScreen from './screens/SignInScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <Web3Provider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Market" component={MarketScreen} />
            <Stack.Screen name="Sell" component={SellScreen} />
            <Stack.Screen name="Portfolio" component={PortfolioScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </Web3Provider>
    </AuthProvider>
  );
}

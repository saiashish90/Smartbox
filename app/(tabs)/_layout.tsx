import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {

  return (
    <Tabs screenOptions={{
      headerStyle: {
        height: 40,
      },
      headerTitleStyle: {
        fontSize: 16,
        fontWeight: '600',
      },
    }}>
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Phone',
          headerShown: true,
        }}
      />
      <Tabs.Screen 
        name="standalone" 
        options={{
          title: 'Standalone',
          headerShown: true,
        }}
      />
    </Tabs>

  );
}

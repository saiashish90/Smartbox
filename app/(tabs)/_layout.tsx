import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {

  return (
    <Tabs>
      <Tabs.Screen name="phone" />
      <Tabs.Screen name="standalone" />
    </Tabs>

  );
}

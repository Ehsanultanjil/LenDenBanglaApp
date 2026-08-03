import { Tabs } from 'expo-router';
import { BottomNav } from '@/components/BottomNav';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <BottomNav {...props} />}>
      <Tabs.Screen name="debt" />
      <Tabs.Screen name="goals" />
      <Tabs.Screen name="bills" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

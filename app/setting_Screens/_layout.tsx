// app/profile-screens/_layout.tsx
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

function BackButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={{
        backgroundColor: 'rgba(255,255,255,0.08)',
        height: 40, width: 40,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ChevronLeft size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: 'transparent' },
        headerTransparent: true,
        headerTitleStyle: { fontWeight: '800', fontSize: 18, color: '#FFFFFF' },
        headerBackVisible: false,
        headerBackTitle: '',
        headerLeft: () => <BackButton />,
      }}
    >
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="health" options={{ title: 'Health Details' }} />
      <Stack.Screen name="change" options={{ title: 'Change Goals' }} />
      <Stack.Screen name="unit" options={{ title: 'Unit of Measure' }} />
      <Stack.Screen name="account" options={{ title: 'Manage Account', headerShown: false }} />
    </Stack>
  );
}
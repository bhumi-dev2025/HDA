// app/profile-screens/_layout.tsx
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native'; // અથવા @expo/vector-icons માંથી પણ લઈ શકો

export default function ProfileLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center', // Android અને iOS બંનેમાં Title સેન્ટરમાં રાખવા
        headerShadowVisible: false, // હેડરની નીચેની લાઈન/શેડો કાઢવા માટે (ક્લીન લુક માટે)
        headerStyle: {
          backgroundColor: '#FAFAFA', // હેડરનું બેકગ્રાઉન્ડ વ્હાઇટ
        },
        headerTitleStyle: {
          fontWeight: '800', // ફોન્ટ જાડા કરવા
          fontSize: 18,
        },
        // કસ્ટમ બેક બટન (ગોળ ગ્રે સર્કલ)
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{
              backgroundColor: '#F1F1F1', // આછો ગ્રે કલર
              padding: 8,
              borderRadius: 50, // ગોળ કરવા માટે
              marginLeft: 0, // ડાબી બાજુથી જગ્યા (જરૂર હોય તો વધારી શકાય)
            }}
          >
            <ChevronLeft size={24} color="black" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="notifications"
        options={{ title: 'Notifications'}}
      />
      <Stack.Screen
        name="health"
        options={{ title: 'Health Details' }}
      />
      <Stack.Screen
        name="change"
        options={{ title: 'Change Goals' }}
      />
      <Stack.Screen
        name="unit"
        options={{ title: 'Unit of Measure' }}
      />
    </Stack>
  );
}
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { COLORS } from '../../../constants/colors';

export default function StudentLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: '#7F8A72',

                tabBarStyle: {
                    height: 88,
                    paddingTop: 10,
                    paddingBottom: 12,
                    backgroundColor: '#EEF1E7',

                    borderTopWidth: 0,

                    borderTopLeftRadius: 28,
                    borderTopRightRadius: 28,

                    position: 'absolute',
                    overflow: 'hidden',
                },

                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '700',
                    marginTop: 4,
                },
            }}
        >
            <Tabs.Screen
                name="relatorios"
                options={{
                    title: 'Relatórios',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="chart-box-outline"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="bem-estar"
                options={{
                    title: 'Bem-estar',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="heart-outline"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="indicadores"
                options={{
                    title: 'Indicadores',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="puzzle-outline"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="comunidade"
                options={{
                    title: 'Comunidade',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="account-group-outline"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="perfil"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="account-outline"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
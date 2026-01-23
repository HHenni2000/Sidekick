import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

const tabConfig: Record<string, { label: string; icon: keyof typeof Feather.glyphMap }> = {
  index: { label: 'Heute', icon: 'home' },
  checkin: { label: 'Check-in', icon: 'activity' },
  insights: { label: 'Auswertungen', icon: 'bar-chart-2' },
};

export const BottomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(12, insets.bottom) }]}>
      <View style={styles.inner}>
        {state.routes.map((route, index) => {
          const options = descriptors[route.key]?.options;
          if (options?.tabBarButton === null) {
            return null;
          }
          const isFocused = state.index === index;
          const config = tabConfig[route.name] ?? { label: route.name, icon: 'circle' };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[styles.tab, isFocused ? styles.activeTab : null]}
            >
              <Feather
                name={config.icon}
                size={22}
                color={isFocused ? Colors.primary : Colors.mutedForeground}
              />
              <Text style={[styles.label, isFocused ? styles.labelActive : null]}>
                {config.label}
              </Text>
              {isFocused ? <View style={styles.dot} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: 'rgba(104, 170, 160, 0.12)',
  },
  label: {
    fontSize: 11,
    color: Colors.mutedForeground,
    marginTop: 4,
    fontWeight: '600',
  },
  labelActive: {
    color: Colors.primary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
});

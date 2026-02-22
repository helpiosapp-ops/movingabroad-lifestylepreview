
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { useRouter, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import { Href } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows } from '@/styles/commonStyles';

export interface TabBarItem {
  name: string;
  route: Href;
  icon: string;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

export default function FloatingTabBar({
  tabs,
  containerWidth = Dimensions.get('window').width - 48,
  borderRadius: customBorderRadius = 24,
  bottomMargin = 16,
}: FloatingTabBarProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const activeIndex = tabs.findIndex((tab) => {
    if (tab.name === '(home)') {
      return pathname === '/' || pathname.startsWith('/(tabs)/(home)');
    }
    return pathname.includes(tab.name);
  });

  const indicatorPosition = useSharedValue(activeIndex >= 0 ? activeIndex : 0);

  React.useEffect(() => {
    if (activeIndex >= 0) {
      indicatorPosition.value = withSpring(activeIndex, {
        damping: 20,
        stiffness: 200,
      });
    }
  }, [activeIndex]);

  const handleTabPress = (route: Href) => {
    console.log('Tab pressed:', route);
    router.push(route);
  };

  const tabWidth = containerWidth / tabs.length;

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            indicatorPosition.value,
            [0, tabs.length - 1],
            [0, tabWidth * (tabs.length - 1)]
          ),
        },
      ],
    };
  });

  const isDark = theme.dark;
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={[styles.container, { marginBottom: bottomMargin }]}>
        <BlurView
          intensity={isDark ? 80 : 60}
          tint={isDark ? 'dark' : 'light'}
          style={[
            styles.tabBar,
            {
              width: containerWidth,
              borderRadius: customBorderRadius,
              backgroundColor: isDark ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              borderWidth: 1,
              borderColor: themeColors.border,
            },
            shadows.large,
          ]}
        >
          {/* Animated Indicator */}
          <Animated.View
            style={[
              styles.indicator,
              indicatorStyle,
              {
                width: tabWidth - 16,
                left: 8,
              },
            ]}
          >
            <LinearGradient
              colors={[themeColors.gradientStart, themeColors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.indicatorGradient}
            />
          </Animated.View>

          {/* Tab Buttons */}
          {tabs.map((tab, index) => {
            const isActive = index === activeIndex;
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tab}
                onPress={() => handleTabPress(tab.route)}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name={tab.icon}
                  android_material_icon_name={tab.icon}
                  size={24}
                  color={isActive ? '#FFFFFF' : themeColors.textSecondary}
                />
                <Text
                  style={[
                    styles.label,
                    {
                      color: isActive ? '#FFFFFF' : themeColors.textSecondary,
                      fontWeight: isActive ? '600' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    height: 48,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  indicatorGradient: {
    flex: 1,
    borderRadius: borderRadius.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    zIndex: 1,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
  },
});

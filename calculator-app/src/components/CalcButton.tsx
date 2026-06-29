import React from 'react';
import { StyleSheet, Text, Pressable, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../theme';

interface CalcButtonProps {
  label: string;
  onPress: () => void;
  type: 'digit' | 'operator' | 'function' | 'action' | 'constant';
  flex?: number;
  isActiveOperator?: boolean;
}

export const CalcButton: React.FC<CalcButtonProps> = ({
  label,
  onPress,
  type,
  flex = 1,
  isActiveOperator = false,
}) => {
  // Determine styling based on type
  const getButtonStyles = (pressed: boolean): ViewStyle[] => {
    const stylesList: ViewStyle[] = [
      styles.baseButton,
      { flex },
    ];

    // Background color based on type
    if (type === 'operator') {
      stylesList.push({
        backgroundColor: isActiveOperator 
          ? theme.colors.white 
          : theme.colors.accent,
      });
    } else if (type === 'action') {
      if (label === 'AC') {
        stylesList.push({
          backgroundColor: theme.colors.dangerBg,
          borderWidth: 1,
          borderColor: theme.colors.border,
        });
      } else {
        stylesList.push({
          backgroundColor: '#273849', // slightly darker surface
          borderWidth: 1,
          borderColor: theme.colors.border,
        });
      }
    } else if (type === 'function') {
      stylesList.push({
        backgroundColor: '#2E3F50', // darker slate key
        borderWidth: 1,
        borderColor: theme.colors.border,
      });
    } else {
      // digit / constant
      stylesList.push({
        backgroundColor: theme.colors.surface,
      });
    }

    // Press feedback (scale & subtle color shift)
    if (pressed) {
      stylesList.push({
        transform: [{ scale: 0.94 }],
        opacity: 0.85,
      });
    }

    return stylesList;
  };

  const getLabelStyles = (): TextStyle[] => {
    const stylesList: TextStyle[] = [styles.baseLabel];

    if (type === 'operator') {
      stylesList.push({
        color: isActiveOperator ? theme.colors.accent : theme.colors.white,
        fontFamily: theme.fonts.bold,
      });
    } else if (type === 'action' && label === 'AC') {
      stylesList.push({
        color: theme.colors.dangerText,
        fontFamily: theme.fonts.bold,
      });
    } else if (type === 'function') {
      stylesList.push({
        color: theme.colors.textMuted,
        fontFamily: theme.fonts.regular,
        fontSize: label.length > 4 ? 13 : 15,
      });
    } else {
      stylesList.push({
        color: theme.colors.text,
        fontFamily: theme.fonts.medium,
      });
    }

    return stylesList;
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => getButtonStyles(pressed)}
    >
      <Text style={getLabelStyles()}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    height: 58,
    margin: theme.keyShape.gap / 2,
    borderRadius: theme.keyShape.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    // Android Shadow
    elevation: theme.keyShape.elevation,
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  baseLabel: {
    fontSize: 19,
    textAlign: 'center',
  },
});

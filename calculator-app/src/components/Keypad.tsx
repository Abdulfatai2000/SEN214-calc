import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CalcButton } from './CalcButton';
import { basicLayout, scientificLayout } from '../keyLayouts';

interface KeypadProps {
  mode: 'basic' | 'scientific';
  onKeyPress: (
    value: string,
    label: string,
    type: 'digit' | 'operator' | 'function' | 'action' | 'constant'
  ) => void;
  activeOperator: string | null;
}

export const Keypad: React.FC<KeypadProps> = ({
  mode,
  onKeyPress,
  activeOperator,
}) => {
  const layout = mode === 'basic' ? basicLayout : scientificLayout;

  return (
    <View style={styles.container}>
      {layout.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((key, keyIndex) => {
            // Check if this operator is currently active
            const isActive = activeOperator !== null && activeOperator === key.value;
            return (
              <CalcButton
                key={`key-${rowIndex}-${keyIndex}`}
                label={key.label}
                type={key.type}
                flex={key.flex || 1}
                isActiveOperator={isActive}
                onPress={() => onKeyPress(key.value, key.label, key.type)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 6,
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

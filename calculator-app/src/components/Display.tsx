import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { theme } from '../theme';

interface DisplayProps {
  expression: string;
  result: string;
  isLivePreview: boolean;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  result,
  isLivePreview,
}) => {
  const exprScrollViewRef = useRef<ScrollView>(null);

  // Prettify expression for user-friendly display
  const prettifyExpression = (expr: string): string => {
    if (!expr) return '0';
    return expr
      .replace(/\*/g, '×')
      .replace(/\//g, '÷')
      .replace(/asin\(/g, 'sin⁻¹(')
      .replace(/acos\(/g, 'cos⁻¹(')
      .replace(/atan\(/g, 'atan⁻¹(')
      .replace(/sqrt\(/g, '√(')
      .replace(/pi/g, 'π')
      .replace(/e\^\(/g, 'e^(')
      .replace(/\^/g, ' ^ ');
  };

  // Auto-scroll expression to the right when it changes
  useEffect(() => {
    if (exprScrollViewRef.current) {
      setTimeout(() => {
        exprScrollViewRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [expression]);

  return (
    <View style={styles.container}>
      {/* Top Line: Expression */}
      <View style={styles.expressionWrapper}>
        <ScrollView
          ref={exprScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.expressionText}>
            {prettifyExpression(expression)}
          </Text>
        </ScrollView>
      </View>

      {/* Bottom Line: Result / Live Preview */}
      <View style={styles.resultWrapper}>
        <Text
          selectable
          adjustsFontSizeToFit
          numberOfLines={1}
          style={[
            styles.resultText,
            isLivePreview ? styles.livePreviewText : styles.finalResultText,
          ]}
        >
          {result || '0'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...theme.displayStyle,
    height: 140,
    justifyContent: 'space-between',
  },
  expressionWrapper: {
    height: 40,
    width: '100%',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  expressionText: {
    color: theme.colors.textMuted,
    fontSize: 22,
    fontFamily: theme.fonts.regular,
    textAlign: 'right',
  },
  resultWrapper: {
    height: 60,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  resultText: {
    fontSize: 42,
    fontFamily: theme.fonts.bold,
    textAlign: 'right',
  },
  livePreviewText: {
    color: theme.colors.textMuted,
    opacity: 0.7,
  },
  finalResultText: {
    color: theme.colors.text,
  },
});

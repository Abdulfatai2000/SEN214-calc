import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';

import { theme } from './src/theme';
import { Display } from './src/components/Display';
import { Keypad } from './src/components/Keypad';
import { InputModal } from './src/components/InputModal';
import { memoryKeys } from './src/keyLayouts';
import {
  evaluateExpression,
  liveEvaluate,
  tokenize,
} from './src/mathEngine';

// Local factorial helper for combinatorics
function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return 1;
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

// Matrix helper: determinant calculation
function getDeterminant(m: number[][]): number {
  const n = m.length;
  if (n === 1) return m[0][0];
  if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  let det = 0;
  for (let j = 0; j < n; j++) {
    const sub = m.slice(1).map(row => row.filter((_, colIdx) => colIdx !== j));
    const sign = j % 2 === 0 ? 1 : -1;
    det += sign * m[0][j] * getDeterminant(sub);
  }
  return det;
}

// Matrix helper: inversion calculation
function getInverse(matrix: number[][]): number[][] | string {
  const n = matrix.length;
  const det = getDeterminant(matrix);
  if (Math.abs(det) < 1e-12) {
    return 'Error: Non-invertible (Det = 0)';
  }

  const adj = Array(n).fill(0).map(() => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const sub = matrix
        .filter((_, rIdx) => rIdx !== i)
        .map(row => row.filter((_, cIdx) => cIdx !== j));
      const sign = (i + j) % 2 === 0 ? 1 : -1;
      const cofactor = sign * getDeterminant(sub);
      adj[j][i] = cofactor;
    }
  }

  return adj.map(row => row.map(val => Number((val / det).toFixed(4))));
}

export default function App() {
  // Load google fonts
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_700Bold,
  });

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'basic' | 'scientific' | 'matrix' | 'statistics'>('basic');

  // Calculator states
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [isLivePreview, setIsLivePreview] = useState(false);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [memory, setMemory] = useState(0);
  const [ans, setAns] = useState(0);

  // Combinatorics Modals
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'nPr' | 'nCr' | null>(null);

  // Matrix Workspace States
  const [matrixSize, setMatrixSize] = useState<number>(2); // 2x2, 3x3, 4x4
  const [activeMatrix, setActiveMatrix] = useState<'A' | 'B'>('A');
  const [matrixAStr, setMatrixAStr] = useState<string[][]>([
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
  ]);
  const [matrixBStr, setMatrixBStr] = useState<string[][]>([
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
  ]);
  const [matrixResult, setMatrixResult] = useState<number[][] | number | string | null>(null);
  const [matrixResultType, setMatrixResultType] = useState<'matrix' | 'scalar' | 'error' | null>(null);
  const [matrixOpLabel, setMatrixOpLabel] = useState('');

  // Statistics Workspace States
  const [statsInput, setStatsInput] = useState('');
  const [statsResults, setStatsResults] = useState({
    count: 0,
    mean: 0,
    sampleVar: 0,
    sampleStd: 0,
    popVar: 0,
    popStd: 0,
  });

  // Calculate live preview for math expressions
  useEffect(() => {
    if (isEvaluated) return;
    if (expression === '') {
      setResult('0');
      setIsLivePreview(false);
    } else {
      const live = liveEvaluate(expression);
      setResult(live || '0');
      setIsLivePreview(true);
    }
  }, [expression, isEvaluated]);

  // Calculate stats live
  useEffect(() => {
    const vals = statsInput
      .split(',')
      .map(v => v.trim())
      .filter(v => v !== '')
      .map(v => Number(v))
      .filter(v => !isNaN(v));

    if (vals.length === 0) {
      setStatsResults({ count: 0, mean: 0, sampleVar: 0, sampleStd: 0, popVar: 0, popStd: 0 });
      return;
    }

    const n = vals.length;
    const sum = vals.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const sumSqDiff = vals.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
    
    const popVar = sumSqDiff / n;
    const popStd = Math.sqrt(popVar);
    const sampleVar = n > 1 ? sumSqDiff / (n - 1) : 0;
    const sampleStd = Math.sqrt(sampleVar);

    setStatsResults({
      count: n,
      mean: Number(mean.toPrecision(10)),
      sampleVar: Number(sampleVar.toPrecision(10)),
      sampleStd: Number(sampleStd.toPrecision(10)),
      popVar: Number(popVar.toPrecision(10)),
      popStd: Number(popStd.toPrecision(10)),
    });
  }, [statsInput]);

  if (!fontsLoaded) {
    return null;
  }

  // Handle + / - unary toggles on current typing
  const handlePlusMinus = () => {
    if (isEvaluated) {
      const num = Number(result);
      if (!isNaN(num)) {
        const negated = (-num).toString();
        setExpression(negated);
        setResult(negated);
        setIsEvaluated(true);
      }
      return;
    }

    if (expression === '' || expression === '0') {
      setExpression('-');
      return;
    }

    const tokens = tokenize(expression);
    if (tokens.length === 0) return;

    const lastToken = tokens[tokens.length - 1];

    if (/^\d*\.?\d+$/.test(lastToken)) {
      if (
        tokens.length >= 4 &&
        tokens[tokens.length - 4] === '(' &&
        tokens[tokens.length - 3] === '-' &&
        tokens[tokens.length - 2] === lastToken &&
        tokens[tokens.length - 1] === ')'
      ) {
        tokens.splice(tokens.length - 4, 4, lastToken);
      } else {
        tokens[tokens.length - 1] = `(-${lastToken})`;
      }
      setExpression(tokens.join(''));
    } else {
      setExpression(prev => prev + '-');
    }
  };

  // Memory keys handler
  const handleMemory = (op: string) => {
    const currentVal = Number(result) || 0;
    switch (op) {
      case 'MC':
        setMemory(0);
        break;
      case 'MR':
        setExpression(prev => {
          if (prev === '0' || prev === '') return memory.toString();
          return prev + memory.toString();
        });
        break;
      case 'M+':
        setMemory(prev => prev + currentVal);
        break;
      case 'MS':
        setMemory(currentVal);
        break;
    }
  };

  // Main Key press routing
  const handleKeyPress = (value: string, label: string, type: string) => {
    if (value === 'AC') {
      setExpression('');
      setResult('0');
      setIsLivePreview(false);
      setIsEvaluated(false);
    } else if (value === 'DEL') {
      if (isEvaluated) {
        setExpression('');
        setResult('0');
        setIsLivePreview(false);
        setIsEvaluated(false);
        return;
      }
      const tokens = tokenize(expression);
      if (tokens.length > 0) {
        tokens.pop();
        setExpression(tokens.join(''));
      }
    } else if (value === '=') {
      if (expression === '') return;
      const finalRes = evaluateExpression(expression);
      setResult(finalRes);
      setIsLivePreview(false);
      setIsEvaluated(true);
      if (finalRes !== 'Error') {
        setAns(Number(finalRes) || 0);
      }
    } else if (value === '+/-') {
      handlePlusMinus();
    } else if (type === 'action' && (value === 'nPr' || value === 'nCr')) {
      setModalType(value as 'nPr' | 'nCr');
      setModalVisible(true);
    } else if (type === 'action' && ['MC', 'MR', 'M+', 'MS'].includes(value)) {
      handleMemory(value);
    } else if (type === 'operator') {
      if (isEvaluated) {
        setExpression(result + value);
        setIsEvaluated(false);
      } else {
        setExpression(prev => prev + value);
      }
    } else if (type === 'function') {
      if (isEvaluated) {
        setExpression(value);
        setIsEvaluated(false);
      } else {
        setExpression(prev => (prev === '0' ? value : prev + value));
      }
    } else if (type === 'constant') {
      const constVal = value === 'ANS' ? ans.toString() : value;
      if (isEvaluated) {
        setExpression(constVal);
        setIsEvaluated(false);
      } else {
        setExpression(prev => (prev === '0' ? constVal : prev + constVal));
      }
    } else {
      // numbers, dots, DEG (does nothing/reminder)
      if (value === 'DEG') return;
      if (isEvaluated) {
        setExpression(value);
        setIsEvaluated(false);
      } else {
        setExpression(prev => (prev === '0' && value !== '.' ? value : prev + value));
      }
    }
  };

  const handleModalSubmit = (n: number, r: number) => {
    setModalVisible(false);
    let val = 0;
    try {
      if (modalType === 'nPr') {
        val = factorial(n) / factorial(n - r);
      } else {
        val = factorial(n) / (factorial(r) * factorial(n - r));
      }
    } catch (e) {
      setResult('Error');
      setIsLivePreview(false);
      return;
    }

    const valStr = val.toString();
    if (isEvaluated) {
      setExpression(valStr);
      setIsEvaluated(false);
    } else {
      setExpression(prev => (prev === '0' || prev === '' ? valStr : prev + valStr));
    }
  };

  // Matrix calculator methods
  const updateMatrixCell = (matrix: 'A' | 'B', row: number, col: number, text: string) => {
    // Only allow negative floats or empty strings (inputs)
    const cleanText = text.replace(/[^0-9.-]/g, '');
    if (matrix === 'A') {
      const next = matrixAStr.map((r, ri) =>
        r.map((c, ci) => (ri === row && ci === col ? cleanText : c))
      );
      setMatrixAStr(next);
    } else {
      const next = matrixBStr.map((r, ri) =>
        r.map((c, ci) => (ri === row && ci === col ? cleanText : c))
      );
      setMatrixBStr(next);
    }
  };

  const getMatrixValues = (matrixStr: string[][]) => {
    return matrixStr.slice(0, matrixSize).map(row =>
      row.slice(0, matrixSize).map(cell => parseFloat(cell) || 0)
    );
  };

  const runMatrixBinaryOp = (op: '+' | '-' | '×') => {
    const a = getMatrixValues(matrixAStr);
    const b = getMatrixValues(matrixBStr);
    setMatrixOpLabel(`Result: A ${op} B`);

    if (op === '+') {
      const res = a.map((row, r) => row.map((val, c) => val + b[r][c]));
      setMatrixResult(res);
      setMatrixResultType('matrix');
    } else if (op === '-') {
      const res = a.map((row, r) => row.map((val, c) => val - b[r][c]));
      setMatrixResult(res);
      setMatrixResultType('matrix');
    } else {
      // Multiplication
      const res = Array(matrixSize).fill(0).map(() => Array(matrixSize).fill(0));
      for (let r = 0; r < matrixSize; r++) {
        for (let c = 0; c < matrixSize; c++) {
          let sum = 0;
          for (let k = 0; k < matrixSize; k++) {
            sum += a[r][k] * b[k][c];
          }
          res[r][c] = Number(sum.toFixed(4));
        }
      }
      setMatrixResult(res);
      setMatrixResultType('matrix');
    }
  };

  const runMatrixUnaryOp = (op: 'Det' | 'Inv' | 'Transpose', target: 'A' | 'B') => {
    const m = getMatrixValues(target === 'A' ? matrixAStr : matrixBStr);
    setMatrixOpLabel(`Result: ${op}(${target})`);

    if (op === 'Transpose') {
      const res = Array(matrixSize).fill(0).map(() => Array(matrixSize).fill(0));
      for (let r = 0; r < matrixSize; r++) {
        for (let c = 0; c < matrixSize; c++) {
          res[r][c] = m[c][r];
        }
      }
      setMatrixResult(res);
      setMatrixResultType('matrix');
    } else if (op === 'Det') {
      const det = getDeterminant(m);
      setMatrixResult(Number(det.toFixed(4)));
      setMatrixResultType('scalar');
    } else {
      // Inverse
      const inv = getInverse(m);
      if (typeof inv === 'string') {
        setMatrixResult(inv);
        setMatrixResultType('error');
      } else {
        setMatrixResult(inv);
        setMatrixResultType('matrix');
      }
    }
  };

  const clearMatrices = () => {
    const emptyStr = [
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
    ];
    setMatrixAStr(emptyStr);
    setMatrixBStr(emptyStr);
    setMatrixResult(null);
    setMatrixResultType(null);
    setMatrixOpLabel('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      {Platform.OS === 'android' && <RNStatusBar backgroundColor={theme.colors.background} barStyle="light-content" />}
      
      {/* Navigation Header / Tab Selector */}
      <View style={styles.tabContainer}>
        {['Basic', 'Scientific', 'Matrix', 'Statistics'].map(tab => {
          const tabKey = tab.toLowerCase() as typeof activeTab;
          const isSelected = activeTab === tabKey;
          return (
            <Pressable
              key={tab}
              style={[styles.tabButton, isSelected && styles.tabButtonActive]}
              onPress={() => setActiveTab(tabKey)}
            >
              <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Main Workspace Render */}
      <View style={styles.workspace}>
        {(activeTab === 'basic' || activeTab === 'scientific') && (
          <View style={styles.calculatorWorkspace}>
            {/* Display Component */}
            <Display
              expression={expression}
              result={result}
              isLivePreview={isLivePreview}
            />

            {/* Memory Buttons Panel (Scientific Only) */}
            {activeTab === 'scientific' && (
              <View style={styles.memoryRow}>
                {memoryKeys.map(k => (
                  <Pressable
                    key={k.label}
                    style={styles.memButton}
                    onPress={() => handleMemory(k.value)}
                  >
                    <Text style={styles.memButtonText}>{k.label}</Text>
                  </Pressable>
                ))}
                {memory !== 0 ? (
                  <View style={styles.memoryBadge}>
                    <Text style={styles.memoryBadgeText}>M: {Number(memory.toPrecision(6))}</Text>
                  </View>
                ) : null}
              </View>
            )}

            {/* Keypad Component */}
            <Keypad
              mode={activeTab}
              onKeyPress={handleKeyPress}
              activeOperator={null}
            />
          </View>
        )}

        {activeTab === 'matrix' && (
          <ScrollView
            style={styles.matrixScroll}
            contentContainerStyle={styles.matrixContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.workspaceTitle}>Matrix Calculator</Text>

            {/* Matrix Size Control */}
            <View style={styles.controlRow}>
              <Text style={styles.sectionLabel}>Size:</Text>
              <View style={styles.segmentedSelector}>
                {[2, 3, 4].map(sz => (
                  <Pressable
                    key={`size-${sz}`}
                    style={[styles.segmentBtn, matrixSize === sz && styles.segmentBtnActive]}
                    onPress={() => {
                      setMatrixSize(sz);
                      setMatrixResult(null);
                      setMatrixResultType(null);
                    }}
                  >
                    <Text style={[styles.segmentText, matrixSize === sz && styles.segmentTextActive]}>
                      {sz}x{sz}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Target Matrix Edit Select */}
            <View style={styles.editTargetRow}>
              <Pressable
                style={[styles.editTargetBtn, activeMatrix === 'A' && styles.editTargetBtnActive]}
                onPress={() => setActiveMatrix('A')}
              >
                <Text style={[styles.editTargetText, activeMatrix === 'A' && styles.editTargetTextActive]}>
                  Edit Matrix A
                </Text>
              </Pressable>
              <Pressable
                style={[styles.editTargetBtn, activeMatrix === 'B' && styles.editTargetBtnActive]}
                onPress={() => setActiveMatrix('B')}
              >
                <Text style={[styles.editTargetText, activeMatrix === 'B' && styles.editTargetTextActive]}>
                  Edit Matrix B
                </Text>
              </Pressable>
            </View>

            {/* Matrix Input Grid card */}
            <View style={styles.matrixEditorCard}>
              <Text style={styles.matrixCardTitle}>
                Matrix {activeMatrix} ({matrixSize}x{matrixSize})
              </Text>
              <View style={styles.gridContainer}>
                {Array(matrixSize)
                  .fill(0)
                  .map((_, rIndex) => (
                    <View key={`row-${rIndex}`} style={styles.gridRow}>
                      {Array(matrixSize)
                        .fill(0)
                        .map((_, cIndex) => {
                          const val = activeMatrix === 'A' 
                            ? matrixAStr[rIndex][cIndex] 
                            : matrixBStr[rIndex][cIndex];
                          return (
                            <TextInput
                              key={`cell-${rIndex}-${cIndex}`}
                              style={styles.cellInput}
                              value={val}
                              placeholder="0"
                              placeholderTextColor={theme.colors.textMuted}
                              keyboardType="numeric"
                              onChangeText={txt => updateMatrixCell(activeMatrix, rIndex, cIndex, txt)}
                            />
                          );
                        })}
                    </View>
                  ))}
              </View>
            </View>

            {/* Matrix Actions */}
            <Text style={styles.actionHeader}>Binary Operations</Text>
            <View style={styles.opBtnRow}>
              <Pressable style={styles.matrixOpBtn} onPress={() => runMatrixBinaryOp('+')}>
                <Text style={styles.matrixOpBtnText}>A + B</Text>
              </Pressable>
              <Pressable style={styles.matrixOpBtn} onPress={() => runMatrixBinaryOp('-')}>
                <Text style={styles.matrixOpBtnText}>A - B</Text>
              </Pressable>
              <Pressable style={styles.matrixOpBtn} onPress={() => runMatrixBinaryOp('×')}>
                <Text style={styles.matrixOpBtnText}>A × B</Text>
              </Pressable>
            </View>

            <Text style={styles.actionHeader}>Unary Operations</Text>
            <View style={styles.opBtnRow}>
              <Pressable style={styles.matrixOpBtn} onPress={() => runMatrixUnaryOp('Det', 'A')}>
                <Text style={styles.matrixOpBtnText}>Det(A)</Text>
              </Pressable>
              <Pressable style={styles.matrixOpBtn} onPress={() => runMatrixUnaryOp('Inv', 'A')}>
                <Text style={styles.matrixOpBtnText}>Inv(A)</Text>
              </Pressable>
              <Pressable style={styles.matrixOpBtn} onPress={() => runMatrixUnaryOp('Transpose', 'A')}>
                <Text style={styles.matrixOpBtnText}>Transpose(A)</Text>
              </Pressable>
            </View>

            <View style={styles.opBtnRow}>
              <Pressable style={styles.matrixOpBtn} onPress={() => runMatrixUnaryOp('Det', 'B')}>
                <Text style={styles.matrixOpBtnText}>Det(B)</Text>
              </Pressable>
              <Pressable style={styles.matrixOpBtn} onPress={() => runMatrixUnaryOp('Inv', 'B')}>
                <Text style={styles.matrixOpBtnText}>Inv(B)</Text>
              </Pressable>
              <Pressable style={styles.matrixOpBtn} onPress={() => runMatrixUnaryOp('Transpose', 'B')}>
                <Text style={styles.matrixOpBtnText}>Transpose(B)</Text>
              </Pressable>
            </View>

            <Pressable style={styles.clearBtn} onPress={clearMatrices}>
              <Text style={styles.clearBtnText}>Clear Matrices</Text>
            </Pressable>

            {/* Matrix result area */}
            {matrixResultType !== null && (
              <View style={styles.matrixResultCard}>
                <Text style={styles.resultCardHeader}>{matrixOpLabel}</Text>
                
                {matrixResultType === 'scalar' && (
                  <Text style={styles.scalarResult}>
                    {matrixResult as number}
                  </Text>
                )}

                {matrixResultType === 'error' && (
                  <Text style={styles.errorResult}>
                    {matrixResult as string}
                  </Text>
                )}

                {matrixResultType === 'matrix' && (
                  <View style={styles.gridContainer}>
                    {(matrixResult as number[][]).map((row, rIndex) => (
                      <View key={`res-row-${rIndex}`} style={styles.gridRow}>
                        {row.map((val, cIndex) => (
                          <View key={`res-cell-${rIndex}-${cIndex}`} style={styles.resultCell}>
                            <Text style={styles.resultCellText}>{val}</Text>
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {activeTab === 'statistics' && (
          <ScrollView
            style={styles.statsScroll}
            contentContainerStyle={styles.statsContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.workspaceTitle}>Statistics Workspace</Text>
            <Text style={styles.statsSubtitle}>
              Enter values separated by commas (e.g., 10, 24.5, 33, 41, 15.8)
            </Text>

            {/* Multi-line numeric comma input card */}
            <View style={styles.inputCard}>
              <TextInput
                style={styles.statsInput}
                multiline
                placeholder="e.g. 5, 12, 18.5, 23, 40, 12"
                placeholderTextColor={theme.colors.textMuted}
                value={statsInput}
                onChangeText={setStatsInput}
                keyboardType="numeric"
              />
            </View>

            {/* Stat Output Cards Grid */}
            <View style={styles.statsOutputsGrid}>
              <View style={styles.statsOutputRow}>
                <View style={styles.statsOutputCard}>
                  <Text style={styles.statsCardLabel}>Count (n)</Text>
                  <Text style={styles.statsCardVal}>{statsResults.count}</Text>
                </View>
                <View style={styles.statsOutputCard}>
                  <Text style={styles.statsCardLabel}>Mean (μ)</Text>
                  <Text style={styles.statsCardVal}>{statsResults.mean}</Text>
                </View>
              </View>

              <View style={styles.statsOutputRow}>
                <View style={styles.statsOutputCard}>
                  <Text style={styles.statsCardLabel}>Sample Std Dev (s)</Text>
                  <Text style={styles.statsCardVal}>{statsResults.sampleStd}</Text>
                </View>
                <View style={styles.statsOutputCard}>
                  <Text style={styles.statsCardLabel}>Sample Variance (s²)</Text>
                  <Text style={styles.statsCardVal}>{statsResults.sampleVar}</Text>
                </View>
              </View>

              <View style={styles.statsOutputRow}>
                <View style={styles.statsOutputCard}>
                  <Text style={styles.statsCardLabel}>Pop Std Dev (σ)</Text>
                  <Text style={styles.statsCardVal}>{statsResults.popStd}</Text>
                </View>
                <View style={styles.statsOutputCard}>
                  <Text style={styles.statsCardLabel}>Pop Variance (σ²)</Text>
                  <Text style={styles.statsCardVal}>{statsResults.popVar}</Text>
                </View>
              </View>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>

      {/* Combinatorics Dialog modal */}
      <InputModal
        visible={modalVisible}
        type={modalType}
        onClose={() => setModalVisible(false)}
        onSubmit={handleModalSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E2D3E', // subtle tab container background
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 25,
    padding: 4,
    height: 48,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    borderRadius: 21,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textMuted,
  },
  tabTextActive: {
    color: theme.colors.textDark,
    fontFamily: theme.fonts.bold,
  },
  workspace: {
    flex: 1,
  },
  calculatorWorkspace: {
    flex: 1,
    justifyContent: 'space-between',
  },
  memoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  memButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#273849',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  memButtonText: {
    fontSize: 12,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textMuted,
  },
  memoryBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.accent,
    marginLeft: 'auto',
  },
  memoryBadgeText: {
    fontSize: 10,
    fontFamily: theme.fonts.bold,
    color: theme.colors.white,
  },
  // Matrix Styles
  matrixScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  matrixContainer: {
    paddingBottom: 24,
  },
  workspaceTitle: {
    fontSize: 24,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    marginTop: 10,
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
    marginRight: 10,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  segmentedSelector: {
    flexDirection: 'row',
    backgroundColor: '#1E2D3E',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  segmentBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9,
  },
  segmentBtnActive: {
    backgroundColor: theme.colors.white,
  },
  segmentText: {
    fontSize: 13,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textMuted,
  },
  segmentTextActive: {
    color: theme.colors.textDark,
    fontFamily: theme.fonts.bold,
  },
  editTargetRow: {
    flexDirection: 'row',
    backgroundColor: '#1E2D3E',
    borderRadius: 14,
    padding: 4,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  editTargetBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11,
  },
  editTargetBtnActive: {
    backgroundColor: theme.colors.surface,
  },
  editTargetText: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textMuted,
  },
  editTargetTextActive: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  matrixEditorCard: {
    backgroundColor: '#1E2D3E',
    borderRadius: theme.displayStyle.borderRadius,
    padding: 16,
    marginVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matrixCardTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  gridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridRow: {
    flexDirection: 'row',
  },
  cellInput: {
    width: 60,
    height: 44,
    backgroundColor: '#111A24',
    borderRadius: 10,
    margin: 5,
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionHeader: {
    fontSize: 11,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textMuted,
    marginTop: 16,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  opBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  matrixOpBtn: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  matrixOpBtnText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    fontSize: 13,
  },
  clearBtn: {
    backgroundColor: theme.colors.dangerBg,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clearBtnText: {
    color: theme.colors.dangerText,
    fontFamily: theme.fonts.bold,
    fontSize: 14,
  },
  matrixResultCard: {
    backgroundColor: '#111A24',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  resultCardHeader: {
    fontSize: 13,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textMuted,
    marginBottom: 12,
  },
  scalarResult: {
    fontSize: 28,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
  },
  errorResult: {
    fontSize: 15,
    fontFamily: theme.fonts.bold,
    color: theme.colors.error,
  },
  resultCell: {
    width: 65,
    height: 44,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  resultCellText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    fontSize: 14,
  },
  // Statistics Styles
  statsScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsContainer: {
    paddingBottom: 24,
  },
  statsSubtitle: {
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted,
    marginBottom: 16,
  },
  inputCard: {
    backgroundColor: '#1E2D3E',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsInput: {
    height: 90,
    color: theme.colors.text,
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    textAlignVertical: 'top',
  },
  statsOutputsGrid: {
    marginTop: 16,
  },
  statsOutputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  statsOutputCard: {
    width: '48%',
    backgroundColor: '#1E2D3E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statsCardLabel: {
    fontSize: 11,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  statsCardVal: {
    fontSize: 18,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
  },
});

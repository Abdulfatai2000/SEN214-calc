// Custom Math Engine for Scientific Calculator
// Pure TypeScript - No external imports except JS built-ins

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('Factorial of negative or non-integer');
  }
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

export function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  
  const funcs = [
    'asin(', 'acos(', 'atan(', 
    'sinh(', 'cosh(', 'tanh(', 
    'sin(', 'cos(', 'tan(', 
    'sqrt(', 'ln(', 'log(', 'e^('
  ];

  const matchFunc = (): string | null => {
    for (const f of funcs) {
      if (expr.startsWith(f, i)) {
        return f;
      }
    }
    return null;
  };

  while (i < expr.length) {
    const char = expr[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    const funcMatch = matchFunc();
    if (funcMatch) {
      tokens.push(funcMatch);
      i += funcMatch.length;
      continue;
    }

    if (char === 'π' || expr.substring(i, i + 2) === 'pi') {
      tokens.push('π');
      i += char === 'π' ? 1 : 2;
      continue;
    }

    if (char === 'e' && (i + 1 >= expr.length || expr[i + 1] !== 'x')) {
      tokens.push('e');
      i++;
      continue;
    }

    // Match numbers
    if (/\d/.test(char) || char === '.') {
      let numStr = '';
      while (i < expr.length && (/\d/.test(expr[i]) || expr[i] === '.')) {
        numStr += expr[i];
        i++;
      }
      tokens.push(numStr);
      continue;
    }

    // Match operators/brackets
    if (['+', '-', '*', '/', '^', '!', '(', ')'].includes(char)) {
      tokens.push(char);
      i++;
      continue;
    }

    // Unrecognized character
    tokens.push(char);
    i++;
  }

  return tokens;
}

export function insertImplicitMultiplication(tokens: string[]): string[] {
  const result: string[] = [];
  
  const isOperand = (t: string) => {
    return /^\d*\.?\d+$/.test(t) || t === 'π' || t === 'e' || t === ')' || t === '!';
  };
  
  const isOpenToken = (t: string) => {
    return /^\d*\.?\d+$/.test(t) || t === 'π' || t === 'e' || t === '(' || t.endsWith('(');
  };

  for (let i = 0; i < tokens.length; i++) {
    if (i > 0) {
      const prev = tokens[i - 1];
      const curr = tokens[i];
      if (isOperand(prev) && isOpenToken(curr)) {
        result.push('*');
      }
    }
    result.push(tokens[i]);
  }
  return result;
}

export function processUnaryMinus(tokens: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === '-') {
      const isUnary = i === 0 || 
                      ['+', '-', '*', '/', '^', '('].includes(tokens[i - 1]) || 
                      tokens[i - 1].endsWith('(');
      if (isUnary) {
        result.push('u-');
      } else {
        result.push('-');
      }
    } else {
      result.push(t);
    }
  }
  return result;
}

interface OpInfo {
  precedence: number;
  associativity: 'left' | 'right';
}

const operators: Record<string, OpInfo> = {
  '+': { precedence: 2, associativity: 'left' },
  '-': { precedence: 2, associativity: 'left' },
  '*': { precedence: 3, associativity: 'left' },
  '/': { precedence: 3, associativity: 'left' },
  'u-': { precedence: 4, associativity: 'right' },
  '^': { precedence: 5, associativity: 'right' },
};

export function shuntingYard(tokens: string[]): string[] | 'Error' {
  const output: string[] = [];
  const stack: string[] = [];

  for (const token of tokens) {
    if (!isNaN(Number(token)) || token === 'π' || token === 'e') {
      output.push(token);
    } else if (token === '!') {
      output.push('!');
    } else if (token.endsWith('(')) {
      stack.push(token);
    } else if (token === '(') {
      stack.push(token);
    } else if (token === ')') {
      let found = false;
      while (stack.length > 0) {
        const top = stack[stack.length - 1];
        if (top === '(' || top.endsWith('(')) {
          found = true;
          break;
        }
        output.push(stack.pop()!);
      }
      if (!found) {
        return 'Error';
      }
      const top = stack.pop()!;
      if (top.endsWith('(')) {
        output.push(top);
      }
    } else if (operators[token]) {
      const op1 = token;
      while (stack.length > 0) {
        const op2 = stack[stack.length - 1];
        if (op2 === '(') {
          break;
        }
        const isOp2Func = op2.endsWith('(');
        const op1Info = operators[op1];
        const op2Info = operators[op2];
        
        if (isOp2Func || 
            (op2Info && (
              op2Info.precedence > op1Info.precedence ||
              (op2Info.precedence === op1Info.precedence && op1Info.associativity === 'left')
            ))
        ) {
          output.push(stack.pop()!);
        } else {
          break;
        }
      }
      stack.push(op1);
    } else {
      return 'Error';
    }
  }

  while (stack.length > 0) {
    const top = stack.pop()!;
    if (top === '(' || top.endsWith('(')) {
      return 'Error';
    }
    output.push(top);
  }

  return output;
}

export function evaluateRPN(rpn: string[]): number | 'Error' {
  const stack: number[] = [];

  try {
    for (const token of rpn) {
      if (!isNaN(Number(token))) {
        stack.push(Number(token));
      } else if (token === 'π') {
        stack.push(Math.PI);
      } else if (token === 'e') {
        stack.push(Math.E);
      } else if (operators[token]) {
        if (token === 'u-') {
          if (stack.length < 1) return 'Error';
          const val = stack.pop()!;
          stack.push(-val);
        } else {
          if (stack.length < 2) return 'Error';
          const val2 = stack.pop()!;
          const val1 = stack.pop()!;
          
          let res = 0;
          switch (token) {
            case '+': res = val1 + val2; break;
            case '-': res = val1 - val2; break;
            case '*': res = val1 * val2; break;
            case '/': 
              if (val2 === 0) return 'Error';
              res = val1 / val2; 
              break;
            case '^': 
              res = Math.pow(val1, val2); 
              break;
            default: return 'Error';
          }
          stack.push(res);
        }
      } else if (token === '!') {
        if (stack.length < 1) return 'Error';
        const val = stack.pop()!;
        try {
          const res = factorial(val);
          stack.push(res);
        } catch (e) {
          return 'Error';
        }
      } else if (token.endsWith('(')) {
        if (stack.length < 1) return 'Error';
        const val = stack.pop()!;
        let res = 0;
        switch (token) {
          case 'sin(': 
            res = Math.sin(val * Math.PI / 180); 
            if (Math.abs(res) < 1e-14) res = 0;
            break;
          case 'cos(': 
            res = Math.cos(val * Math.PI / 180); 
            if (Math.abs(res) < 1e-14) res = 0;
            break;
          case 'tan(': 
            const cosVal = Math.cos(val * Math.PI / 180);
            if (Math.abs(cosVal) < 1e-15) return 'Error';
            res = Math.sin(val * Math.PI / 180) / cosVal;
            if (Math.abs(res) < 1e-14) res = 0;
            break;
          case 'asin(': 
            if (val < -1 || val > 1) return 'Error';
            res = Math.asin(val) * 180 / Math.PI; 
            break;
          case 'acos(': 
            if (val < -1 || val > 1) return 'Error';
            res = Math.acos(val) * 180 / Math.PI; 
            break;
          case 'atan(': 
            res = Math.atan(val) * 180 / Math.PI; 
            break;
          case 'sinh(': 
            res = Math.sinh(val); 
            break;
          case 'cosh(': 
            res = Math.cosh(val); 
            break;
          case 'tanh(': 
            res = Math.tanh(val); 
            break;
          case 'sqrt(': 
            if (val < 0) return 'Error';
            res = Math.sqrt(val); 
            break;
          case 'ln(': 
            if (val <= 0) return 'Error';
            res = Math.log(val); 
            break;
          case 'log(': 
            if (val <= 0) return 'Error';
            res = Math.log10(val); 
            break;
          case 'e^(': 
            res = Math.exp(val); 
            break;
          default: return 'Error';
        }
        stack.push(res);
      } else {
        return 'Error';
      }
    }

    if (stack.length !== 1) {
      return 'Error';
    }

    const finalVal = stack[0];
    if (isNaN(finalVal) || !isFinite(finalVal)) {
      return 'Error';
    }

    const precisionRes = Number(finalVal.toPrecision(10));
    return precisionRes;
  } catch (e) {
    return 'Error';
  }
}

export function evaluateExpression(expr: string): string {
  if (!expr || expr.trim() === '') return '0';
  
  let cleanExpr = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'π')
    .replace(/e/g, 'e');

  const tokens = tokenize(cleanExpr);
  const implicitTokens = insertImplicitMultiplication(tokens);
  const finalTokens = processUnaryMinus(implicitTokens);
  const rpn = shuntingYard(finalTokens);
  
  if (rpn === 'Error') return 'Error';
  
  const result = evaluateRPN(rpn);
  if (result === 'Error') return 'Error';
  
  return result.toString();
}

export function liveEvaluate(expr: string): string {
  if (!expr || expr.trim() === '') return '';
  
  let closedExpr = expr;
  let openCount = 0;
  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === '(') {
      openCount++;
    } else if (expr.startsWith('sin(', i) || expr.startsWith('cos(', i) || expr.startsWith('tan(', i)) {
      openCount++;
      i += 3;
    } else if (expr.startsWith('asin(', i) || expr.startsWith('acos(', i) || expr.startsWith('atan(', i)) {
      openCount++;
      i += 4;
    } else if (expr.startsWith('sinh(', i) || expr.startsWith('cosh(', i) || expr.startsWith('tanh(', i)) {
      openCount++;
      i += 4;
    } else if (expr.startsWith('sqrt(', i)) {
      openCount++;
      i += 4;
    } else if (expr.startsWith('log(', i) || expr.startsWith('ln(', i)) {
      openCount++;
      i += 3;
    } else if (expr.startsWith('e^(', i)) {
      openCount++;
      i += 2;
    } else if (expr[i] === ')') {
      openCount = Math.max(0, openCount - 1);
    }
  }
  
  for (let k = 0; k < openCount; k++) {
    closedExpr += ')';
  }
  
  let previewExpr = closedExpr.trim();
  while (previewExpr.length > 0 && ['+', '-', '*', '/', '^', '×', '÷'].includes(previewExpr[previewExpr.length - 1])) {
    previewExpr = previewExpr.slice(0, -1).trim();
  }

  if (previewExpr === '') return '';

  const res = evaluateExpression(previewExpr);
  if (res === 'Error' || res === 'NaN' || res === 'Infinity' || res === '-Infinity') {
    return '';
  }
  return res;
}

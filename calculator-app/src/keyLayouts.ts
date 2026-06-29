export interface KeyItem {
  label: string;
  value: string;
  type: 'digit' | 'operator' | 'function' | 'action' | 'constant';
  flex?: number;
}

export const basicLayout: KeyItem[][] = [
  [
    { label: 'AC', value: 'AC', type: 'action' },
    { label: '+/-', value: '+/-', type: 'action' },
    { label: '%', value: '%', type: 'operator' },
    { label: '÷', value: '÷', type: 'operator' }
  ],
  [
    { label: '7', value: '7', type: 'digit' },
    { label: '8', value: '8', type: 'digit' },
    { label: '9', value: '9', type: 'digit' },
    { label: '×', value: '×', type: 'operator' }
  ],
  [
    { label: '4', value: '4', type: 'digit' },
    { label: '5', value: '5', type: 'digit' },
    { label: '6', value: '6', type: 'digit' },
    { label: '-', value: '-', type: 'operator' }
  ],
  [
    { label: '1', value: '1', type: 'digit' },
    { label: '2', value: '2', type: 'digit' },
    { label: '3', value: '3', type: 'digit' },
    { label: '+', value: '+', type: 'operator' }
  ],
  [
    { label: '0', value: '0', type: 'digit', flex: 2 },
    { label: '.', value: '.', type: 'digit' },
    { label: '=', value: '=', type: 'operator' }
  ]
];

export const scientificLayout: KeyItem[][] = [
  [
    { label: 'DEG', value: 'DEG', type: 'action' },
    { label: 'ANS', value: 'ANS', type: 'constant' },
    { label: '(', value: '(', type: 'operator' },
    { label: ')', value: ')', type: 'operator' },
    { label: '⌫', value: 'DEL', type: 'action' },
    { label: '÷', value: '÷', type: 'operator' }
  ],
  [
    { label: 'sin', value: 'sin(', type: 'function' },
    { label: 'sin⁻¹', value: 'asin(', type: 'function' },
    { label: '7', value: '7', type: 'digit' },
    { label: '8', value: '8', type: 'digit' },
    { label: '9', value: '9', type: 'digit' },
    { label: '×', value: '×', type: 'operator' }
  ],
  [
    { label: 'cos', value: 'cos(', type: 'function' },
    { label: 'cos⁻¹', value: 'acos(', type: 'function' },
    { label: '4', value: '4', type: 'digit' },
    { label: '5', value: '5', type: 'digit' },
    { label: '6', value: '6', type: 'digit' },
    { label: '-', value: '-', type: 'operator' }
  ],
  [
    { label: 'tan', value: 'tan(', type: 'function' },
    { label: 'tan⁻¹', value: 'atan(', type: 'function' },
    { label: '1', value: '1', type: 'digit' },
    { label: '2', value: '2', type: 'digit' },
    { label: '3', value: '3', type: 'digit' },
    { label: '+', value: '+', type: 'operator' }
  ],
  [
    { label: 'sinh', value: 'sinh(', type: 'function' },
    { label: 'cosh', value: 'cosh(', type: 'function' },
    { label: '0', value: '0', type: 'digit' },
    { label: '.', value: '.', type: 'digit' },
    { label: '+/-', value: '+/-', type: 'action' },
    { label: '=', value: '=', type: 'operator' }
  ],
  [
    { label: 'tanh', value: 'tanh(', type: 'function' },
    { label: 'x!', value: '!', type: 'operator' },
    { label: 'nPr', value: 'nPr', type: 'action' },
    { label: 'nCr', value: 'nCr', type: 'action' },
    { label: 'xʸ', value: '^', type: 'operator' },
    { label: '√x', value: 'sqrt(', type: 'function' }
  ],
  [
    { label: 'log', value: 'log(', type: 'function' },
    { label: 'ln', value: 'ln(', type: 'function' },
    { label: 'eˣ', value: 'e^(', type: 'function' },
    { label: 'π', value: 'π', type: 'constant' },
    { label: 'e', value: 'e', type: 'constant' },
    { label: 'AC', value: 'AC', type: 'action' }
  ]
];

export const memoryKeys: KeyItem[] = [
  { label: 'MC', value: 'MC', type: 'action' },
  { label: 'MR', value: 'MR', type: 'action' },
  { label: 'M+', value: 'M+', type: 'action' },
  { label: 'MS', value: 'MS', type: 'action' }
];

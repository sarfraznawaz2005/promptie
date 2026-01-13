// Mock implementation of chalk for Jest tests
// Returns ANSI color codes to match test expectations

const ANSI_CODES = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const createColorFunction = (colorName, ansiCode = '') => {
  const fn = text => {
    if (typeof text === 'string') {
      return `${ansiCode}${text}${ANSI_CODES.reset}`;
    }
    // Handle chained calls like chalk.white.bold
    return createColorFunction(colorName, ansiCode);
  };

  // Support chaining like chalk.white.bold
  Object.defineProperty(fn, 'bold', {
    get: () => createColorFunction(`${colorName}.bold`, ansiCode + ANSI_CODES.bold),
    enumerable: true,
    configurable: true,
  });

  return fn;
};

const chalk = {
  // Basic colors - return ANSI codes that match test expectations
  cyan: createColorFunction('cyan', ANSI_CODES.cyan),
  yellow: createColorFunction('yellow', ANSI_CODES.yellow),
  white: createColorFunction('white', ANSI_CODES.white),
  green: createColorFunction('green', ANSI_CODES.green),
  red: createColorFunction('red', ANSI_CODES.red),

  // Chainable bold
  bold: createColorFunction('bold', ANSI_CODES.bold),

  // hex colors - fallback to plain text for custom colors
  hex: color => createColorFunction(`hex(${color})`, ''),

  // Support for other chalk methods if needed
  reset: createColorFunction('reset', ANSI_CODES.reset),
  dim: createColorFunction('dim', ''),
  bright: createColorFunction('bright', ''),
};

module.exports = chalk;
module.exports.default = chalk;

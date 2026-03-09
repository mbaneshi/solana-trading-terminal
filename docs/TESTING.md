# Testing Guide

This document provides comprehensive testing instructions for the Solana Trading Platform.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Frontend Tests](#frontend-tests)
- [Backend Tests](#backend-tests)
- [Integration Tests](#integration-tests)
- [Coverage Requirements](#coverage-requirements)
- [Writing Tests](#writing-tests)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before running tests, ensure you have:

- Node.js v18+ installed
- All dependencies installed (`npm install` in both `/app` and `/backend`)
- Anchor CLI installed (for integration tests)
- Solana CLI installed (for integration tests)

## Test Structure

```
solana-trading-terminal/
├── app/
│   ├── src/
│   │   └── __tests__/
│   │       ├── components/      # Component tests
│   │       ├── hooks/           # Hook tests
│   │       └── utils/           # Utility tests
│   ├── jest.config.js           # Jest configuration
│   └── jest.setup.js            # Test setup
├── backend/
│   └── src/
│       └── __tests__/
│           ├── services/        # Service tests
│           ├── controllers/     # Controller tests
│           └── utils/           # Utility tests
└── tests/
    └── integration.test.ts      # E2E integration tests
```

## Running Tests

### All Tests

Run all tests across the project:

```bash
# From project root
npm test
```

### Frontend Tests Only

```bash
cd app
npm test
```

### Backend Tests Only

```bash
cd backend
npm test
```

### Integration Tests

```bash
# Requires localnet running
anchor test
```

### Watch Mode

Run tests in watch mode for development:

```bash
# Frontend
cd app
npm run test:watch

# Backend
cd backend
npm run test:watch
```

### Coverage Reports

Generate coverage reports:

```bash
# Frontend
cd app
npm run test:coverage

# Backend
cd backend
npm run test:coverage
```

Coverage reports will be generated in `coverage/` directories.

## Frontend Tests

### Component Tests

Component tests use React Testing Library to test UI components:

**Example: SwapInterface.test.tsx**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { SwapInterface } from '@/components/trading/SwapInterface';

describe('SwapInterface', () => {
  it('should render swap interface', () => {
    render(<SwapInterface />);
    expect(screen.getByText('Swap')).toBeInTheDocument();
  });
});
```

**Coverage:**
- SwapInterface: 15+ tests
- WalletButton: 7+ tests
- TokenSelector: 13+ tests

### Hook Tests

Hook tests use `renderHook` from React Testing Library:

**Example: useSwap.test.ts**

```typescript
import { renderHook, act } from '@testing-library/react';
import { useSwap } from '@/hooks/useSwap';

describe('useSwap', () => {
  it('should execute swap successfully', async () => {
    const { result } = renderHook(() => useSwap());
    await act(async () => {
      await result.current.executeSwap(...);
    });
  });
});
```

**Coverage:**
- useSwap: 10+ tests
- useProgram: 8+ tests

### Utility Tests

Utility functions have comprehensive test coverage:

**Coverage:**
- format.ts: 30+ tests
- calculations.ts: 30+ tests

## Backend Tests

### Service Tests

Service tests mock external dependencies:

**Example: solana.service.test.ts**

```typescript
import { SolanaService } from '../../services/solana.service';

jest.mock('@solana/web3.js');

describe('SolanaService', () => {
  it('should return balance in SOL', async () => {
    const balance = await service.getBalance(address);
    expect(balance).toBe(1);
  });
});
```

**Coverage:**
- SolanaService: 20+ tests
- PriceService: 15+ tests

### Controller Tests

Controller tests use Supertest for HTTP testing:

**Example: swap.controller.test.ts**

```typescript
import request from 'supertest';
import { app } from '../../main';

describe('API Controllers', () => {
  it('should return wallet balance', async () => {
    const response = await request(app)
      .get('/api/v1/wallet/balance/:address');

    expect(response.status).toBe(200);
  });
});
```

**Coverage:**
- Balance endpoint: 3+ tests
- Tokens endpoint: 3+ tests
- Transactions endpoint: 4+ tests
- Prices endpoint: 5+ tests

## Integration Tests

Integration tests verify the entire system works together:

```bash
# Start local validator
solana-test-validator

# In another terminal
anchor test
```

Integration tests cover:
- Pool initialization
- Token swaps
- Liquidity provision
- Transaction confirmations

## Coverage Requirements

### Minimum Coverage Thresholds

All components must meet these coverage thresholds:

- **Branches:** 80%
- **Functions:** 80%
- **Lines:** 80%
- **Statements:** 80%

### Current Coverage

Run coverage reports to see current metrics:

```bash
# Frontend
cd app && npm run test:coverage

# Backend
cd backend && npm run test:coverage
```

### Viewing Coverage Reports

Coverage reports are generated in HTML format:

```bash
# Frontend
open app/coverage/lcov-report/index.html

# Backend
open backend/coverage/lcov-report/index.html
```

## Writing Tests

### Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the component does, not how it does it
   - Test user interactions and outcomes

2. **Use Descriptive Test Names**
   ```typescript
   it('should display error when wallet is not connected', () => {
     // test
   });
   ```

3. **Follow AAA Pattern**
   - **Arrange:** Set up test data and mocks
   - **Act:** Execute the code being tested
   - **Assert:** Verify expected outcomes

4. **Mock External Dependencies**
   ```typescript
   jest.mock('@solana/wallet-adapter-react');
   ```

5. **Test Edge Cases**
   - Empty states
   - Error states
   - Loading states
   - Invalid inputs

### Test Templates

#### Component Test Template

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render component', () => {
    render(<MyComponent />);
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    render(<MyComponent />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    // Assert outcome
  });
});
```

#### Service Test Template

```typescript
import { MyService } from '../../services/my.service';

jest.mock('external-dependency');

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    service = new MyService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should perform operation', async () => {
    const result = await service.operation();
    expect(result).toBeDefined();
  });

  it('should handle errors', async () => {
    await expect(service.operation()).rejects.toThrow();
  });
});
```

## Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. Tests timing out

**Solution:**
```typescript
// Increase timeout for async tests
it('should complete async operation', async () => {
  // test
}, 10000); // 10 second timeout
```

#### 3. Mocks not working

**Solution:**
```typescript
// Ensure mocks are defined before imports
jest.mock('module-name');
import { Component } from './component';
```

#### 4. Coverage not meeting threshold

**Solution:**
- Review uncovered lines in coverage report
- Add tests for edge cases
- Test error handling paths

### Getting Help

If tests fail:

1. Check error messages carefully
2. Review test logs
3. Verify all dependencies are installed
4. Ensure localnet is running (for integration tests)
5. Check that environment variables are set

## CI/CD Integration

Tests are automatically run in CI/CD pipeline:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: |
    cd app && npm test -- --coverage
    cd backend && npm test -- --coverage
```

## Performance

### Test Performance Tips

1. **Use `beforeEach` for setup**
   - Ensures clean state for each test

2. **Mock expensive operations**
   - Mock network calls
   - Mock blockchain interactions

3. **Parallel execution**
   - Jest runs tests in parallel by default
   - Use `--runInBand` for serial execution if needed

4. **Selective testing**
   ```bash
   # Run specific test file
   npm test -- SwapInterface.test.tsx

   # Run tests matching pattern
   npm test -- --testNamePattern="swap"
   ```

## Conclusion

This testing guide provides comprehensive coverage of the testing infrastructure. Regular testing ensures code quality and prevents regressions. Always run tests before committing code and ensure coverage thresholds are met.

For questions or issues, refer to the project README or open an issue on GitHub.

// Mock database module for testing
export const db = {
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

export const sql = jest.fn();
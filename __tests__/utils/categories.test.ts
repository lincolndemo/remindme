import { getCategoryConfig, DEFAULT_LEAD_TIMES, ALL_CATEGORIES } from '../../src/utils/categories';

describe('getCategoryConfig', () => {
  it('returns config for every category', () => {
    ALL_CATEGORIES.forEach((cat) => {
      const config = getCategoryConfig(cat);
      expect(config.icon).toBeTruthy();
      expect(config.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(config.label).toBeTruthy();
    });
  });

  it('returns distinct colors for appointment and payment', () => {
    expect(getCategoryConfig('appointment').color).not.toBe(getCategoryConfig('payment').color);
  });
});

describe('DEFAULT_LEAD_TIMES', () => {
  it('appointment has 2 default lead times', () => {
    expect(DEFAULT_LEAD_TIMES['appointment']).toHaveLength(2);
  });
  it('payment has 2 default lead times', () => {
    expect(DEFAULT_LEAD_TIMES['payment']).toHaveLength(2);
  });
  it('loan has 2 default lead times', () => {
    expect(DEFAULT_LEAD_TIMES['loan']).toHaveLength(2);
  });
});

const BudgetService = require('../../src/services/budgetServices');
const Budget = require('../../src/models/budget');
const { convertCurrency } = require('../../src/utils/currencyUtil');

jest.mock('../../src/models/budget', () => {
  const mockBudget = jest.fn(); // Mocking the Budget constructor

  // Mock methods of the Budget model
  mockBudget.prototype.save = jest.fn();
  mockBudget.find = jest.fn();
  mockBudget.findOneAndUpdate = jest.fn();
  mockBudget.findOneAndDelete = jest.fn();

  return mockBudget;
});

jest.mock('../../src/utils/currencyUtil', () => ({
  convertCurrency: jest.fn(),
}));

describe('BudgetService', () => {

  // Test for createBudget
  describe('createBudget', () => {
    it('should create a new budget and save it to the database', async () => {
      const budgetData = {
        category: 'Food',
        amount: 5000,
        currency: 'LKR',
        startDate: new Date(),
        endDate: new Date(),
      };

      // Simulate Budget instance creation
      const savedBudget = { ...budgetData, _id: 'budget123' };
      Budget.mockImplementationOnce(() => ({
        ...budgetData,
        _id: 'budget123',
        save: jest.fn().mockResolvedValue(savedBudget),
      }));

      const result = await BudgetService.createBudget('user123', budgetData);

      expect(Budget).toHaveBeenCalledWith(expect.objectContaining(budgetData));
      expect(result._id).toBe('budget123');
      expect(result.category).toBe('Food');
      expect(result.amount).toBe(5000);
    });
  });

  // Test for getBudgetsByUser
  describe('getBudgetsByUser', () => {
    it('should return all budgets for a user with optional currency conversion', async () => {
      const budgets = [
        { _id: 'budget123', category: 'Food', amount: 5000, currency: 'LKR', startDate: new Date(), endDate: new Date() },
        { _id: 'budget456', category: 'Transport', amount: 100, currency: 'USD', startDate: new Date(), endDate: new Date() },
      ];

      const targetCurrency = 'LKR';
      Budget.find.mockResolvedValue(budgets);
      convertCurrency.mockResolvedValue(15000); // Mock conversion for USD to LKR

      const result = await BudgetService.getBudgetsByUser('user123', targetCurrency);

      expect(Budget.find).toHaveBeenCalledWith({ userId: 'user123' });
      expect(convertCurrency).toHaveBeenCalledWith(100, 'USD', 'LKR');
      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe('5000 LKR');
      expect(result[1].amount).toBe('15000 LKR');
    });

    it('should return budgets without conversion if no target currency is provided', async () => {
      const budgets = [
        { _id: 'budget123', category: 'Food', amount: 5000, currency: 'LKR', startDate: new Date(), endDate: new Date() },
        { _id: 'budget456', category: 'Transport', amount: 100, currency: 'USD', startDate: new Date(), endDate: new Date() },
      ];

      Budget.find.mockResolvedValue(budgets);

      const result = await BudgetService.getBudgetsByUser('user123');

      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe('5000 LKR');
      expect(result[1].amount).toBe('100 USD');
    });
  });

  // Test for updateBudget
  describe('updateBudget', () => {
    it('should update an existing budget and return the updated budget', async () => {
      const updateData = { amount: 6000 };
      const updatedBudget = { _id: 'budget123', category: 'Food', amount: 6000, currency: 'LKR', startDate: new Date(), endDate: new Date() };

      Budget.findOneAndUpdate.mockResolvedValue(updatedBudget);

      const result = await BudgetService.updateBudget('budget123', 'user123', updateData);

      expect(Budget.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'budget123', userId: 'user123' },
        updateData,
        { new: true }
      );
      expect(result.amount).toBe(6000);
    });

    it('should throw an error if budget is not found or unauthorized', async () => {
      const updateData = { amount: 6000 };
      Budget.findOneAndUpdate.mockResolvedValue(null);  // Simulate not found

      await expect(BudgetService.updateBudget('budget123', 'user123', updateData))
        .rejects
        .toThrow('Budget not found or unauthorized');
    });
  });

  // Test for deleteBudget
  describe('deleteBudget', () => {
    it('should delete an existing budget and return a success message', async () => {
      const budgetId = 'budget123';
      const userId = 'user123';
      const deletedBudget = { _id: 'budget123', category: 'Food' };

      Budget.findOneAndDelete.mockResolvedValue(deletedBudget);

      const result = await BudgetService.deleteBudget(budgetId, userId);

      expect(Budget.findOneAndDelete).toHaveBeenCalledWith({ _id: budgetId, userId });
      expect(result.message).toBe('Budget deleted successfully');
    });

    it('should throw an error if budget is not found or unauthorized', async () => {
      const budgetId = 'budget123';
      const userId = 'user123';

      Budget.findOneAndDelete.mockResolvedValue(null);  // Simulate not found

      await expect(BudgetService.deleteBudget(budgetId, userId))
        .rejects
        .toThrow('Budget not found or unauthorized');
    });
  });
});

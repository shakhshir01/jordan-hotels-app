import { describe, test, expect, vi } from 'vitest';
import { generateChatResponse } from './chatbot';

// Mock the hotelAPI
vi.mock('./api', () => ({
  hotelAPI: {
    getAllHotels: vi.fn(),
    getDeals: vi.fn(),
    getExperiences: vi.fn()
  }
}));

describe('chatbot', () => {
  test('generateChatResponse handles hotel booking message', async () => {
    const mockHotel = { id: 1, name: 'Test Hotel', location: 'Amman', rating: 4.5, image: 'test.jpg' };
    const hotelAPI = (await import('./api')).hotelAPI;
    hotelAPI.getAllHotels.mockResolvedValue([mockHotel]);
    hotelAPI.getDeals.mockResolvedValue([]);
    hotelAPI.getExperiences.mockResolvedValue([]);

    const result = await generateChatResponse('I want to book a hotel in Amman');

    expect(result.text).toBeDefined();
    expect(result.hotels).toContain(mockHotel);
  });

  test('generateChatResponse handles general chat', async () => {
    const hotelAPI = (await import('./api')).hotelAPI;
    hotelAPI.getAllHotels.mockResolvedValue([]);
    hotelAPI.getDeals.mockResolvedValue([]);
    hotelAPI.getExperiences.mockResolvedValue([]);

    const result = await generateChatResponse('Hello Nashmi');

    expect(result.text).toBeDefined();
    expect(result.hotels).toEqual([]);
  });

  test('generateChatResponse handles API errors gracefully', async () => {
    const hotelAPI = (await import('./api')).hotelAPI;
    hotelAPI.getAllHotels.mockRejectedValue(new Error('API Error'));
    hotelAPI.getDeals.mockResolvedValue([]);
    hotelAPI.getExperiences.mockResolvedValue([]);

    const result = await generateChatResponse('Book hotel');

    expect(result.text).toBeDefined();
    // Should still return response even if API fails
    expect(result).toHaveProperty('text');
  });
});
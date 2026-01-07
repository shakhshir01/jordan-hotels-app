import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../home.jsx';

vi.mock('../../services/api', () => ({
  hotelAPI: {
    getAllHotels: vi.fn(() =>
      Promise.resolve([
        {
          id: 'h1',
          name: 'Test Hotel',
          image: '',
          rating: 4.5,
          location: 'Amman',
          price: 100,
        },
      ])
    ),
    getHotelsPage: vi.fn(() =>
      Promise.resolve({
        hotels: [
          {
            id: 'h1',
            name: 'Test Hotel',
            image: '',
            rating: 4.5,
            location: 'Amman',
            price: 100,
          },
        ],
        nextCursor: null,
      })
    ),
    searchAll: vi.fn(() =>
      Promise.resolve({
        hotels: [
          {
            id: 'h1',
            name: 'Test Hotel',
            image: '',
            rating: 4.5,
            location: 'Amman',
            price: 100,
          },
        ],
        destinations: [],
        deals: [],
        experiences: [],
      })
    ),
  },
}));

describe('Home page', () => {
  test('renders hotel list from API', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getAllByText('Test Hotel').length).toBeGreaterThan(0));
  });
});

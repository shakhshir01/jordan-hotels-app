import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../home.jsx';

vi.mock('../../services/realHotelsData', () => ({
  default: {
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

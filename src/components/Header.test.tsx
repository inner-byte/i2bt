import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import Header from './Header';

const renderHeader = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Header component', () => {
  test('renders logo and navigation links', () => {
    renderHeader();
    
    expect(screen.getByText('CS Association')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Members')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Forum')).toBeInTheDocument();
  });

  test('renders login link when user is not authenticated', () => {
    renderHeader();
    
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('renders theme toggle button and changes theme', () => {
    renderHeader();
    
    const themeToggle = screen.getByLabelText('Switch to dark mode');
    expect(themeToggle).toBeInTheDocument();

    fireEvent.click(themeToggle);
    expect(themeToggle).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  test('navigates to correct pages when links are clicked', () => {
    renderHeader();

    fireEvent.click(screen.getByText('Members'));
    expect(window.location.pathname).toBe('/members');

    fireEvent.click(screen.getByText('Events'));
    expect(window.location.pathname).toBe('/events');

    fireEvent.click(screen.getByText('Forum'));
    expect(window.location.pathname).toBe('/forum');
  });
});
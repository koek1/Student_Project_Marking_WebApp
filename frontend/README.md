# Student Project Marking WebApp - Frontend

React.js frontend for the Student Project Marking System, built with Vite and modern React practices.

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Development: http://localhost:3000
   - Build: `npm run build`
   - Preview: `npm run preview`

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx              # Main React application
│   ├── index.jsx           # React entry point
│   ├── styles/
│   │   ├── globals.css     # Global styles
│   │   └── akademia-theme.css # Akademia theme
│   └── images/             # Static assets
├── public/
│   └── index.html          # HTML template
├── index.html              # Vite development template
├── package.json
├── vite.config.js          # Vite configuration
└── README.md               # This file
```

## Technology Stack

- **React 18** - UI library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Vite** - Build tool and dev server
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications

## Features

### Core Components
- **Authentication**: Login/logout functionality
- **Dashboard**: Role-based dashboards for admins and judges
- **Team Management**: CRUD operations for teams
- **Scoring Interface**: Judge scoring interface
- **Results Display**: Real-time results and analytics

### UI/UX Features
- **Akademia Theme**: Custom color scheme and branding
- **Responsive Design**: Mobile-friendly interface
- **Loading States**: User-friendly feedback
- **Error Handling**: Comprehensive error boundaries
- **Form Validation**: Client-side validation

## Styling

The application uses a custom Akademia theme with:
- **Primary Colors**: Akademia blue (#0E1E3B)
- **Secondary Colors**: Complementary colors
- **Typography**: Inter font family
- **Components**: Custom styled components

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables
```env
VITE_API_URL=http://localhost:5000
```

## Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## Testing

### Manual Testing
- Test all user flows
- Verify responsive design
- Check error handling
- Validate form submissions

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Documentation

- **[Main Documentation](../DOCUMENTATION.md)** - Technical documentation
- **[Main README](../README.md)** - Setup and deployment instructions

## Recent Updates (2025)

The frontend has been optimized with:
- **Cleaner Structure**: Removed unused files
- **Better Performance**: Optimized build process
- **Enhanced Security**: Updated dependencies
- **Improved UX**: Better error handling and loading states

## Contributing

1. Follow React best practices
2. Use TypeScript for new components
3. Write meaningful commit messages
4. Test thoroughly before submitting

## License

This project is developed for Akademia's Computer Science Program.

---

**Built with React and Vite for optimal performance**

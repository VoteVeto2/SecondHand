# Student Second-Hand Marketplace Platform

A comprehensive web-based marketplace that accelerates second-hand goods exchange among students by providing real-time availability tracking and seamless appointment booking functionality.

## Features

- **Real-time Availability Management**: Dynamic status tracking for items (Available, Reserved, Sold, Pending Pickup)
- **Automated Appointment Booking**: Calendar integration with .ics file generation
- **Email Notifications**: Automated confirmations and reminders
- **Mobile-Responsive Design**: Optimized for smartphones and tablets
- **University SSO Integration**: Secure authentication with campus systems

## Tech Stack

### Frontend
- React.js with TypeScript
- Material-UI for consistent design
- Redux Toolkit for state management
- Socket.io for real-time updates

### Backend
- Node.js with Express.js
- PostgreSQL database with Redis caching
- Socket.io for real-time communication
- JWT authentication with OAuth2

### Third-Party Integrations
- Google Calendar API
- SendGrid for email services
- Firebase Cloud Messaging for push notifications
- AWS S3 for file storage

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL database
- Redis server

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd SecondHand
```

2. Install dependencies for all packages
```bash
npm run install:all
```

3. Set up environment variables (see .env.example files in backend and frontend)

4. Start development servers
```bash
npm run dev
```

## Project Structure

```
SecondHand/
├── backend/          # Node.js API server
├── frontend/         # React.js client application
├── shared/           # Shared types and utilities
├── docs/            # Documentation
└── package.json     # Root package configuration
```

## Development

- `npm run dev` - Start both backend and frontend in development mode
- `npm run build` - Build both applications for production
- `npm run test` - Run tests for both applications

## License

MIT
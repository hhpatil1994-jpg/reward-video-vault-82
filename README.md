
# RewardAd - Video Advertisement Rewards Platform

A full-stack web application where users watch video advertisements and earn reward points that can be redeemed for prizes. Administrators can upload and manage advertisements while monitoring user activity and performance metrics.

## Features

### 👤 User Features
- **Authentication**: Secure login and signup with email/password
- **Video Watching**: Stream video ads with built-in player controls
- **Reward System**: Earn points automatically after completing ads
- **Dashboard**: View total points, ads watched, and earning history
- **Redemptions**: Exchange points for gift cards and prizes
- **Progress Tracking**: Real-time video progress and completion tracking

### 👨‍💼 Admin Features
- **Admin Dashboard**: Comprehensive analytics and management interface
- **Video Upload**: Add new advertisements via URL (supports MP4, WebM, MOV, AVI)
- **Ad Management**: Edit, delete, and monitor advertisement performance
- **User Analytics**: Track user activity, views, and point distribution
- **Performance Metrics**: View total ads, users, views, and points distributed

## Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Animations**: Framer Motion for smooth transitions
- **UI Components**: Shadcn/ui component library
- **Backend**: Supabase (PostgreSQL + Real-time + Auth)
- **State Management**: React Context + React Query
- **Routing**: React Router v6
- **Form Handling**: React Hook Form + Zod validation

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Supabase account

### 1. Clone and Install
```bash
git clone <repository-url>
cd reward-ad
npm install
```

### 2. Supabase Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the database schema from `DATABASE_SCHEMA.md`
3. Enable authentication in your Supabase project settings
4. Get your project URL and anon key from Settings > API

### 3. Environment Variables
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Application
```bash
npm run dev
```

Visit `http://localhost:8080` to access the application.

## Database Schema

The application uses 5 main tables:
- `user_profiles` - User information and role management
- `ads` - Video advertisement storage
- `ad_views` - Tracking completed ad views and points
- `rewards` - Available redemption options
- `redemptions` - Reward redemption requests

See `DATABASE_SCHEMA.md` for complete setup instructions.

## Usage Guide

### For Users
1. **Sign Up**: Create an account with email/password (role: user)
2. **Browse Ads**: View available advertisements on your dashboard
3. **Watch Videos**: Click "Watch" to play ads and earn points
4. **Track Progress**: Monitor your points and viewing history
5. **Redeem Rewards**: Exchange points for gift cards and prizes

### For Administrators
1. **Admin Account**: Sign up with role set to "admin"
2. **Upload Ads**: Add new video advertisements via URL
3. **Manage Content**: Edit or delete existing advertisements
4. **Monitor Analytics**: View user activity and performance metrics
5. **Track Distribution**: Monitor total points distributed to users

## Supported Video Formats

The application supports multiple video formats:
- **MP4** (recommended)
- **WebM**
- **MOV**
- **AVI**

Videos should be hosted on accessible URLs (CDN, cloud storage, etc.)

## Key Components

- **VideoPlayer**: Custom video player with reward tracking
- **UserDashboard**: User interface for browsing and watching ads
- **AdminDashboard**: Administrative interface for content management
- **AuthSystem**: Complete authentication with role-based access

## Security Features

- JWT-based authentication via Supabase
- Row Level Security (RLS) policies
- Role-based access control (user/admin)
- Secure video completion tracking
- Protected admin routes and functionality

## Performance Optimizations

- Lazy loading of video content
- Efficient state management with React Query
- Optimized database queries with proper indexing
- Real-time updates for point balances
- Responsive design for all device sizes

## Deployment

The application is ready for deployment on platforms like:
- **Vercel** (recommended for React apps)
- **Netlify**
- **Railway**
- **Any Node.js hosting platform**

Make sure to set environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the database schema documentation
- Review the component documentation
- Create an issue in the repository

---

**Built with ❤️ using React, Supabase, and modern web technologies**

# Attendance Management System

A comprehensive attendance management system built with Vue.js frontend and Cloudflare Workers backend, using Cloudflare D1 database for data storage.

## Features

### Teacher Interface
- View assigned classes and schedules
- Take attendance with multiple status options (Present, Absent, Late, Excused, Early Leave)
- Bulk attendance operations
- Real-time attendance tracking

### Admin Interface
- Student management (add, edit, view students)
- Class and user management
- Comprehensive reporting and analytics
- Data export (CSV, Excel, PDF)
- System overview dashboard

### Technical Features
- Role-based access control
- Responsive design with Tailwind CSS
- Real-time data synchronization
- Secure authentication system
- Export functionality for reports

## Tech Stack

- **Frontend**: Vue.js 3, Vue Router, Tailwind CSS
- **Backend**: Cloudflare Workers (Serverless)
- **Database**: Cloudflare D1 (SQLite)
- **Hosting**: Cloudflare Pages (Frontend), Cloudflare Workers (API)
- **Build Tool**: Vite

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Cloudflare account (free tier works)
- Wrangler CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd attendance_system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

4. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

### Database Setup

1. **Create D1 database**
   ```bash
   wrangler d1 create attendance-db
   ```

2. **Update wrangler.toml with your database ID**
   Replace `your-database-id-here` in `wrangler.toml` with the database ID from step 1.

3. **Initialize database**
   ```bash
   wrangler d1 execute attendance-db --file=./database/schema.sql
   ```

### Development

1. **Start the backend worker**
   ```bash
   cd backend
   npm install
   wrangler dev --port 8787
   ```

2. **Start the frontend (in a new terminal)**
   ```bash
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8787

## Default Login Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`

### Teacher Account
- **Username**: `teacher`
- **Password**: `teacher123`

## Deployment

### Deploy Backend (Cloudflare Workers)

1. **Deploy the worker**
   ```bash
   cd backend
   wrangler deploy
   ```

2. **Update API URL in frontend**
   Update `src/api/index.js` with your worker URL:
   ```javascript
   const API_BASE_URL = 'https://attendance-system-api.your-subdomain.workers.dev'
   ```

### Deploy Frontend (Cloudflare Pages)

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Deploy to Cloudflare Pages**
   ```bash
   wrangler pages deploy dist
   ```

   Or connect your GitHub repo to Cloudflare Pages for automatic deployments.

## Configuration

### Environment Variables

Update `wrangler.toml` for production:

```toml
[env.production.vars]
ENVIRONMENT = "production"

[[env.production.d1_databases]]
binding = "DB"
database_name = "attendance-db"
database_id = "your-actual-database-id"
```

### Frontend Configuration

Update API endpoints in `src/api/index.js`:

```javascript
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:8787' 
  : 'https://your-worker-name.your-subdomain.workers.dev'
```

## Database Schema

The system includes the following main tables:
- `users` - Teachers and administrators
- `students` - Student information
- `classes` - Class definitions
- `grades` - Grade levels
- `subjects` - Subject areas
- `attendance` - Attendance records
- `class_enrollments` - Student-class relationships

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Classes
- `GET /api/classes` - Get user's classes
- `GET /api/classes/:id/students` - Get students in class

### Attendance
- `GET /api/attendance/:classId/:date` - Get attendance for date
- `POST /api/attendance` - Record attendance

### Admin
- `GET /api/admin/students` - Get all students
- `POST /api/admin/students` - Create student
- `GET /api/reports/attendance-summary` - Get attendance reports

## Customization

### Branding
Update the primary color in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#your-color-here', // Change this
    // ... other shades
  }
}
```

### Adding Features
1. Add new API routes in `backend/index.js`
2. Create corresponding frontend API calls in `src/api/index.js`
3. Build Vue components for new features
4. Update database schema if needed

## Cost Estimation (Cloudflare Free Tier)

- **Cloudflare Pages**: Free for unlimited static requests
- **Cloudflare Workers**: 100,000 requests/day free
- **Cloudflare D1**: 5GB storage, 5M reads, 100K writes/day free

For a typical school with 500 students and 20 teachers, this should comfortably fit within the free tier limits.

## Security Notes

1. **Password Security**: The demo uses simple SHA-256 hashing. For production, implement proper password hashing with salt.
2. **Session Management**: Sessions expire after 24 hours and are stored in the database.
3. **CORS**: Currently allows all origins for development. Restrict in production.
4. **Input Validation**: Add proper input validation and sanitization.

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure database ID is correct in `wrangler.toml`
   - Run `wrangler d1 execute attendance-db --file=./database/schema.sql` to initialize

2. **CORS Errors**
   - Make sure backend is running on port 8787
   - Check API_BASE_URL in frontend configuration

3. **Login Issues**
   - Use default credentials: admin/admin123 or teacher/teacher123
   - Check browser console for API errors

4. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check Node.js version (requires 18+)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Cloudflare Workers and D1 documentation
3. Open an issue on GitHub

## Roadmap

### Planned Features
- [ ] Advanced reporting with charts
- [ ] Email notifications for absences
- [ ] Mobile app support
- [ ] Bulk student import from CSV
- [ ] Class scheduling management
- [ ] Parent portal access
- [ ] Attendance analytics dashboard

### Performance Improvements
- [ ] Database query optimization
- [ ] Caching implementation
- [ ] Pagination for large datasets
- [ ] Real-time updates with WebSockets 
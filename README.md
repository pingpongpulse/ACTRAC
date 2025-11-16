# Actrac - Activity Tracker

A full-featured activity tracking web application with user authentication, activity management, and progress visualization. Built with modern web technologies, Actrac helps users track their activities and progress toward goals.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Features

- 🔐 **User Authentication**: Secure signup and login with password hashing
- 🎯 **Activity Tracking**: Add, edit, and delete activities with detailed information
- 📊 **Progress Visualization**: Real-time statistics and progress tracking
- 🌗 **Light/Dark Mode**: Toggle between light and dark themes with persistent preferences
- 📱 **Responsive Design**: Works on all device sizes
- 🎨 **Modern UI**: Glass-morphism design with smooth animations
- 📈 **Goal Tracking**: Visual progress toward 100 activity points
- ✨ **Achievements**: Celebration animations when reaching goals


*Login Page*
*Dashboard with Statistics*
*Activity Management Interface*

## Tech Stack

### Frontend
- **HTML5**: Markup language for structuring the web page
- **CSS3**: Styling with Flexbox, Grid, and modern features
- **Vanilla JavaScript (ES6+)**: Client-side scripting without frameworks
- **Responsive Design**: Media queries for all device sizes

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework for REST APIs
- **SQLite**: Lightweight database for data storage
- **Bcrypt**: Password hashing for security

### Development Tools
- **npm**: Package manager for Node.js dependencies
- **RESTful API Architecture**: Clear separation between frontend and backend

## Project Structure

```
Actrac/
|
├── server.js          # Main server file
├──package.json       # Node.js dependencies
└── db.sqlite          # SQLite database file
├── index.html          # Main dashboard page
├── login.html         # Authentication page             
├── script.js          # Main application logic    
├── auth.js            # Authentication logic    
└── styles.css         # Styling for the entire application
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Git (for version control)

**Note: This application does not require any API keys or external services. All functionality is self-contained.**

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/actrac.git
cd actrac
```

2. Install backend dependencies:
```bash
cd Backend
npm install
```

3. The following packages will be installed automatically:
   - express
   - cors
   - sqlite3
   - bcrypt

### Running the Application

1. Start the backend server:
```bash
cd Backend
node server.js
```

2. The server will start on `http://localhost:3001`

3. Open your browser and navigate to `http://localhost:3001/login.html` to access the application

## Usage

1. **Sign Up**: Create a new account with username, email, and password
2. **Log In**: Use your credentials to access your dashboard
3. **Add Activities**: Fill in activity details including name, points, date, host, and description
4. **Track Progress**: View real-time statistics and progress toward your 100-point goal
5. **Manage Activities**: Edit or delete existing activities
6. **Toggle Themes**: Switch between light and dark modes using the theme toggle
7. **Log Out**: Securely log out when finished

## API Endpoints

### Authentication
- `POST /register` - User registration
- `POST /login` - User login

### Activities
- `GET /activities` - Retrieve all user activities
- `POST /activities` - Create a new activity
- `PUT /activities/:id` - Update an existing activity
- `DELETE /activities/:id` - Delete an activity

### Statistics
- `GET /total` - Get user's total points
- `GET /stats` - Get detailed statistics
- `GET /health` - Health check endpoint

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Activities Table
```sql
CREATE TABLE activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  points INTEGER NOT NULL,
  date TEXT,
  host TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## Development

### Code Structure

The application follows a Single Page Application (SPA) architecture with an API-first approach:

1. **Frontend**: Vanilla JavaScript with modular components
2. **Backend**: RESTful API with Express.js
3. **Database**: SQLite with proper relationships

### Key Components

- **User Authentication**: Secure login/signup with password hashing
- **Activity Management**: Full CRUD operations for activities
- **Statistics Dashboard**: Real-time progress tracking
- **Theme Management**: Light/dark mode with localStorage persistence
- **Responsive Design**: Mobile-first approach with media queries

### Styling Guidelines

- **Color Palette**: 
  - Primary: `#6B3F69` (Violet)
  - Secondary: `#A376A2` (Light Violet)
  - Accent: `#DDC3C3` (Soft Pink)
  - Dark Mode: `#1A1A2E` (Dark Blue) background with `#CAB3D6` (Dusty Violet) text

- **Animations**: CSS animations for hover effects, loading states, and transitions
- **Glass-morphism**: Modern UI design with backdrop filters and transparency

## Deployment

### Production Deployment

1. Ensure all dependencies are installed:
```bash
cd Backend
npm install --production
```

2. Set environment variables (if needed):
```bash
PORT=3001
```

3. Start the server:
```bash
node server.js
```

### Hosting Options

- **Heroku**: Deploy with the Heroku CLI
- **DigitalOcean**: Use App Platform for easy deployment
- **AWS**: Deploy with Elastic Beanstalk
- **Vercel**: For frontend hosting (backend needs separate deployment)
- **Render**: For monolithic deployment to run the frontend as well as backend as a unit web service(currently using)

### Environment Variables

- `PORT`: Server port (default: 5000)

## Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write clear commit messages
- Test your changes thoroughly
- Update documentation as needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Express.js](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js
- [SQLite](https://www.sqlite.org/) - Lightweight database engine
- [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) - Library for password hashing
- [Google Fonts](https://fonts.google.com/) - Inter font family
- Inspiration from modern UI/UX design principles

---

**Made with (●'◡'●)**

# Aranyani Project

Aranyani is a full-stack application consisting of a Node.js/Express backend and a React Native (Expo) frontend. The project is structured to support animal detection and warning with record management.

---

## Table of Contents
- [Project Structure](#project-structure)
- [Backend](#backend)
  - [Features](#backend-features)
  - [Setup & Usage](#backend-setup--usage)
  - [API Endpoints](#backend-api-endpoints)
- [Frontend (User-side)](#frontend-user-side)
  - [Features](#frontend-features)
  - [Setup & Usage](#frontend-setup--usage)
- [Folder Structure](#folder-structure)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)

---

## Project Structure

```
Aranyani/
├── backend/         # Node.js/Express backend API
└── user-side/       # React Native (Expo) frontend app
```

---

## Backend

### Features
- RESTful API using Express.js
- MongoDB integration via Mongoose
- JWT-based authentication
- User and animal record management
- Environment variable support via dotenv

### Setup & Usage

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```
2. **Configure environment:**
   - Create a `.env` file in `backend/` with your MongoDB URI and JWT secret:
     ```env
     MONGODB_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     PORT=3000
     ```
3. **Run the server:**
   ```bash
   npm run dev
   # or
   npm start
   ```
   The server will start on the port specified in `.env` (default: 3000).

### API Endpoints
- `GET /` — Health check
- `POST /api/v1/users` — User registration/login
- `GET /api/v1/animal-records` — List animal records
- (See `src/routes/` for more endpoints)

---

## Frontend (User-side)

### Features
- Built with React Native and Expo
- Modern UI with Tailwind CSS (NativeWind)
- Navigation using Expo Router
- Device info and secure storage
- Toast notifications

### Setup & Usage

1. **Install dependencies:**
   ```bash
   cd user-side
   npm install
   ```
2. **Start the app:**
   ```bash
   npm start
   # or
   expo start
   ```
   - Use Expo Go app or an emulator to preview the app.

---

## Folder Structure

### Backend
- `index.js` — Entry point, loads environment and starts server
- `server.js` — Express app setup and route mounting
- `src/config/` — App and database configuration
- `src/controller/` — Controllers for business logic
- `src/middleware/` — Authentication middleware
- `src/models/` — Mongoose models for users and animal records
- `src/routes/` — API route definitions

### User-side
- `app/` — Main app screens and layout
- `assets/` — Images and static assets
- `constants/` — App-wide constants
- `utils/` — Utility functions (e.g., device info)
- `global.css` — Global styles
- `tailwind.config.js` — Tailwind CSS configuration

---

## Tech Stack
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, dotenv
- **Frontend:** React Native, Expo, NativeWind (Tailwind CSS), Expo Router, Toastify

---

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License
This project is licensed under the ISC License.

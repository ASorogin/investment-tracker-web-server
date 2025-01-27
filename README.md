# Investment Tracker Application

A full-stack application for tracking investments with role-based access control.

## Features
- Role-based authentication (Admin, Subscriber, User)
- Investment portfolio management
- Real-time analytics
- User management system

## Setup

### Server Setup
```bash
# Clone the repository
git clone https://github.com/ASorogin/investment-tracker-web-server.git
cd investment-tracker-web-server

# Install dependencies
npm install

# Create .env file
echo "MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
PORT=5000" > .env

# Start server
npm start
```

### Client Setup
```bash
# Clone the repository
git clone https://github.com/ASorogin/investment-tracker-web-client.git
cd investment-tracker-web-client

# Install dependencies
npm install

# Start client
npm start
```

## Test Data Setup

Create test users using curl commands:

```bash
# Create Admin User
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Test Admin\",\"email\":\"admin@example.com\",\"password\":\"123456\",\"role\":\"admin\"}"

# Create Subscriber
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Test Subscriber\",\"email\":\"subscriber@example.com\",\"password\":\"123456\",\"role\":\"subscriber\"}"

# Create Regular User
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Test User\",\"email\":\"user@example.com\",\"password\":\"123456\",\"role\":\"user\"}"
```

### Test Accounts
```json
{
  "admin": {
    "email": "admin@example.com",
    "password": "123456"
  },
  "subscriber": {
    "email": "subscriber@example.com",
    "password": "123456"
  },
  "user": {
    "email": "user@example.com",
    "password": "123456"
  }
}
```

### Create Test Investments

```bash
# Get admin token (save the token from response)
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"123456\"}"

# Create investment (replace [TOKEN] with the token from login)
curl -X POST http://localhost:5000/api/investments -H "Authorization: Bearer [TOKEN]" -H "Content-Type: application/json" -d "{\"symbol\":\"AAPL\",\"assetType\":\"stocks\",\"amount\":100,\"purchasePrice\":150,\"currentPrice\":175,\"status\":\"active\",\"notes\":\"Apple stock investment\"}"
```

## Features by Role

### Admin
- Full system statistics
- User management
- Investment management
- Analytics access

### Subscriber
- Investment tracking
- Advanced analytics
- Portfolio management

### Regular User
- Basic investment tracking
- Portfolio management

## API Endpoints

### Auth Routes
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login

### Investment Routes
- GET `/api/investments` - Get all investments
- POST `/api/investments` - Create investment
- PUT `/api/investments/:id` - Update investment
- DELETE `/api/investments/:id` - Delete investment

### Admin Routes
- GET `/api/admin/stats` - System statistics
- GET `/api/admin/users` - List all users

### Subscriber Routes
- GET `/api/subscriber/tracking` - Get tracking statistics

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License
MIT

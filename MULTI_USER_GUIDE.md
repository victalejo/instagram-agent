# Multi-User Instagram Agent System

This system has been upgraded to support multiple users, each with their own Instagram accounts and personalized AI training data.

## Features

- **User Authentication**: Secure registration and login system
- **Multiple Instagram Accounts**: Each user can connect multiple Instagram accounts
- **Personalized Training**: User-specific training data for each Instagram account
- **Account Management**: Enable/disable specific Instagram accounts
- **Isolated Sessions**: Each user's data and cookies are kept separate

## API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "your_username",
  "email": "your_email@example.com",
  "password": "your_password"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

### Instagram Account Management

#### Add Instagram Account
```
POST /api/instagram/accounts
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "username": "instagram_username",
  "password": "instagram_password"
}
```

#### Get Instagram Accounts
```
GET /api/instagram/accounts
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Toggle Account Status
```
PUT /api/instagram/accounts/{username}/toggle
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Delete Instagram Account
```
DELETE /api/instagram/accounts/{username}
Authorization: Bearer YOUR_JWT_TOKEN
```

### Training Data Management

#### Add Training Data
```
POST /api/training/data
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "instagramUsername": "instagram_username",
  "dataType": "text",
  "content": "Training content here...",
  "metadata": {
    "source": "manual_input"
  }
}
```

#### Get Training Data
```
GET /api/training/data/{instagramUsername}
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get All Training Data
```
GET /api/training/data
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Delete Training Data
```
DELETE /api/training/data/{trainingDataId}
Authorization: Bearer YOUR_JWT_TOKEN
```

## Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `GEMINI_API_KEY_1`: Gemini AI API key (at least one required)

### 2. Database Setup

Make sure MongoDB is running and accessible at your configured URI.

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

```bash
npm start
```

The server will start on port 3000 (or your configured PORT).

## How It Works

### User Registration Flow
1. User registers with username, email, and password
2. Password is hashed and stored securely
3. User receives JWT token for authentication

### Instagram Account Management
1. Authenticated users can add their Instagram credentials
2. Each Instagram account is associated with the user
3. Cookies are stored separately for each account in user-specific directories
4. Users can activate/deactivate accounts as needed

### AI Training Process
1. Users can add training data for each Instagram account
2. Training data includes text, PDFs, websites, or audio content
3. When the agent comments, it uses account-specific training data for personalization
4. Comments are generated based on the account's personality and style

### Agent Execution
1. The system processes all active Instagram accounts from all users
2. Each account runs independently with its own cookies and training data
3. Comments are personalized based on the account's training data
4. Activity is logged and tracked per account

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- User data isolation
- Secure cookie storage
- Input validation and sanitization

## File Structure

```
src/
├── models/
│   ├── User.ts              # User and Instagram account models
│   └── TrainingData.ts      # Training data model
├── routes/
│   ├── auth.ts              # Authentication endpoints
│   ├── instagram.ts         # Instagram account management
│   └── training.ts          # Training data management
├── middleware/
│   └── auth.ts              # JWT authentication middleware
├── services/
│   └── TrainingService.ts   # Training data processing
├── client/
│   └── Instagram.ts         # Multi-user Instagram automation
└── app.ts                   # Express app configuration
```

## Usage Examples

### Frontend Integration

```javascript
// Register user
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'johndoe',
    email: 'john@example.com',
    password: 'securepassword123'
  })
});
const { token } = await response.json();

// Add Instagram account
await fetch('/api/instagram/accounts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    username: 'my_insta_account',
    password: 'my_insta_password'
  })
});

// Add training data
await fetch('/api/training/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    instagramUsername: 'my_insta_account',
    dataType: 'text',
    content: 'I am passionate about technology and innovation...'
  })
});
```

## Migration from Single User

If you're migrating from the single-user version:

1. Your existing Instagram credentials will need to be added through the API
2. Training data will need to be re-imported for each account
3. The system will create new cookie files for each user/account combination
4. Old cookie files can be safely removed

## Troubleshooting

### Common Issues

1. **JWT Token Expired**: Re-authenticate by calling the login endpoint
2. **Instagram Login Failed**: Check credentials and try again
3. **Training Data Not Applied**: Ensure training data is associated with the correct Instagram username
4. **Database Connection**: Verify MongoDB is running and URI is correct

### Logs

The system provides detailed logging for:
- User authentication attempts
- Instagram account processing
- Training data operations
- Agent execution status

Check the console output for detailed information about system operations.
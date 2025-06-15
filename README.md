# Smart Interview Coach

AI-powered interview preparation tool using AWS Bedrock and Claude AI.

## Features

- 🎯 Job-specific interview questions
- 🧠 Multiple interviewer personas
- 💬 Answer practice with AI feedback
- 📱 Responsive design with light/dark mode

## Quick Start

1. **Setup**
   ```bash
   npm install
   cp .env.example .env
   # Edit .env with your AWS credentials
   ```

2. **Run**
   ```bash
   npm start
   # Open http://localhost:5000
   ```

## AWS Configuration

- **Region**: Set AWS_REGION in .env (default: us-east-1)
- **Authentication**: Use AWS CLI config, environment variables, or IAM roles

## Usage Flow

1. Enter job title → Select persona → Generate questions
2. Select question → Type answer → Get AI feedback
3. View detailed session report

## Security

- Input validation and sanitization
- Secure CORS and HTTP headers
- AWS credential best practices

## Production Deployment

- Set NODE_ENV=production
- Configure ALLOWED_ORIGINS
- Use HTTPS

## Author

Vincent Iroleh
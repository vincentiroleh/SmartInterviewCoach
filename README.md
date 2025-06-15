# Smart Interview Coach

AI-powered interview preparation tool using AWS Bedrock and Claude AI.

## Demo

Watch the [demo video](https://www.loom.com/share/6062e7fef6ba4f26a6ba1b5373cc7e6c?sid=6fa0a029-d99f-474e-96bd-3c0611789de3) to see the application in action.

<a href="https://www.loom.com/share/6062e7fef6ba4f26a6ba1b5373cc7e6c?sid=6fa0a029-d99f-474e-96bd-3c0611789de3">
  <img src="https://cdn.loom.com/sessions/thumbnails/6062e7fef6ba4f26a6ba1b5373cc7e6c-with-play.gif" alt="Smart Interview Coach Demo" width="600" />
</a>

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
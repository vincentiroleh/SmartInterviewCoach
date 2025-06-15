# Smart Interview Coach

An AI-powered interview preparation tool that generates tailored interview questions and provides feedback on your answers using AWS Bedrock and Claude AI.

![Smart Interview Coach](https://img.shields.io/badge/Smart-Interview_Coach-4361ee)

## Features

- 🎯 Generate job-specific interview questions
- 🧠 Choose different interviewer personas
- 💬 Practice answering questions
- 📊 Get AI-powered feedback on your responses
- 📱 Responsive design for desktop and mobile
- 🌓 Light/dark mode support

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **AI**: AWS Bedrock with Claude v2 model

## Prerequisites

- Node.js (v14+)
- AWS account with Bedrock access
- AWS credentials with permissions for Bedrock

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-interview-coach.git
   cd smart-interview-coach/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your AWS credentials:
   ```
   AWS_REGION=us-east-1
   PORT=5000
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:5000
   ```

   For AWS authentication, use one of these methods:
   - Configure AWS CLI (`aws configure`)
   - Set environment variables (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`)
   - Use IAM roles if deploying to AWS services

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## Usage

1. Enter a job title (e.g., "Frontend Developer")
2. Select an interviewer persona
3. Click "Generate Interview Questions"
4. Select a question to practice
5. Type your answer and click "Get Feedback"
6. Review the AI-generated feedback
7. View your session report for later reference

## Security Features

- Input validation and sanitization
- Secure CORS configuration
- Security headers (CSP, HSTS, etc.)
- AWS credential best practices
- Rate limiting and payload restrictions

## Deployment

For production deployment:
1. Set `NODE_ENV=production` in your environment
2. Configure `ALLOWED_ORIGINS` with your production domain
3. Ensure AWS credentials are properly secured
4. Deploy behind HTTPS

## License

MIT

## Author

Your Name
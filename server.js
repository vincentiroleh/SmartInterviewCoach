import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS with specific options
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 
    process.env.ALLOWED_ORIGINS || 'http://localhost:5000' : 
    'http://localhost:5000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Increase JSON payload size limit
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the frontend directory with security options
app.use(express.static(path.join(__dirname, 'frontend'), {
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (path.endsWith('.css') || path.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

// Configure AWS Bedrock client
const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION
  // Using AWS SDK default credential provider chain
  // This will automatically use credentials from environment variables,
  // shared credentials file, or IAM roles for EC2/ECS
});

// Helper function to call Claude API
async function callClaude(prompt, maxTokens = 800) {
  // Log without exposing full prompt content
  console.log("\n📤 Claude API call initiated");

  const input = {
    modelId: 'anthropic.claude-v2',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
      max_tokens_to_sample: maxTokens,
      temperature: 0.7,
      stop_sequences: ["\n\nHuman:"]
    })
  };

  try {
    const command = new InvokeModelCommand(input);
    const response = await client.send(command);
    const json = await response.body.transformToString();
    const data = JSON.parse(json);
    console.log("\n✅ Claude API call successful");
    return data.completion;
  } catch (error) {
    console.error("\n❌ Claude API Error:", error.message);
    throw new Error("Failed to process request");
  }
}

// API endpoint to generate interview questions
app.post('/api/questions', async (req, res) => {
  try {
    const { jobTitle, persona } = req.body;
    // Log without exposing full request body
    console.log("\n📥 POST /api/questions received");

    if (!jobTitle || !persona) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: jobTitle and persona are required' 
      });
    }

    // Validate and sanitize inputs
    const sanitizedJobTitle = String(jobTitle).trim().slice(0, 100);
    const allowedPersonas = ['Recruiter', 'Hiring Manager', 'Technical Lead', 'AI Interview Bot'];
    const sanitizedPersona = allowedPersonas.includes(persona) ? persona : 'Recruiter';

    const prompt = `Act like a ${sanitizedPersona} interviewing a ${sanitizedJobTitle}. Generate 5 relevant interview questions. For each question, include a clearly labeled ideal sample answer.`;
    
    const result = await callClaude(prompt);
    res.json({ success: true, result });
  } catch (err) {
    console.error("\n❌ Failed to generate questions:", err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate questions'
      // Don't expose detailed error messages to client
    });
  }
});

// API endpoint to critique answers
app.post('/api/critique-answer', async (req, res) => {
  try {
    const { question, answer, idealAnswer } = req.body;
    // Log without exposing full request body
    console.log("\n📥 POST /api/critique-answer received");

    if (!question || !answer) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: question and answer are required' 
      });
    }

    // Validate and sanitize inputs
    const sanitizedQuestion = String(question).trim().slice(0, 500);
    const sanitizedAnswer = String(answer).trim().slice(0, 2000);
    
    const prompt = `Question: ${sanitizedQuestion}\nUser's answer: ${sanitizedAnswer}\nRate this answer from 1–10. Give strengths, weaknesses, a rewrite, and a follow-up question.`;
    
    const result = await callClaude(prompt, 600);
    res.json({ success: true, result });
  } catch (err) {
    console.error("\n❌ Failed to critique answer:", err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to critique answer'
      // Don't expose detailed error messages to client
    });
  }
});

// Serve the main app for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Serve the report page
app.get('/report.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'report.html'));
});

// Add security headers middleware
app.use((req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';");
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Start the server
app.listen(port, () => {
  console.log(`\n🚀 Server running at http://localhost:${port}`);
});
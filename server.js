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

// Enable CORS for all routes
app.use(cors());

// Increase JSON payload size limit
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Configure AWS Bedrock client
const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Helper function to call Claude API
async function callClaude(prompt, maxTokens = 800) {
  console.log("\n📤 Claude Prompt Sent:", prompt);

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
    console.log("\n✅ Claude Response:", data);
    return data.completion;
  } catch (error) {
    console.error("\n❌ Claude API Error:", error);
    throw error;
  }
}

// API endpoint to generate interview questions
app.post('/api/questions', async (req, res) => {
  try {
    const { jobTitle, persona } = req.body;
    console.log("\n📥 POST /api/questions:", req.body);

    if (!jobTitle || !persona) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: jobTitle and persona are required' 
      });
    }

    const prompt = `Act like a ${persona} interviewing a ${jobTitle}. Generate 5 relevant interview questions. For each question, include a clearly labeled ideal sample answer.`;
    
    const result = await callClaude(prompt);
    res.json({ success: true, result });
  } catch (err) {
    console.error("\n❌ Failed to generate questions:", err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate questions',
      message: err.message 
    });
  }
});

// API endpoint to critique answers
app.post('/api/critique-answer', async (req, res) => {
  try {
    const { question, answer, idealAnswer } = req.body;
    console.log("\n📥 POST /api/critique-answer:", req.body);

    if (!question || !answer) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: question and answer are required' 
      });
    }

    const prompt = `Question: ${question}\nUser's answer: ${answer}\nRate this answer from 1–10. Give strengths, weaknesses, a rewrite, and a follow-up question.`;
    
    const result = await callClaude(prompt, 600);
    res.json({ success: true, result });
  } catch (err) {
    console.error("\n❌ Failed to critique answer:", err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to critique answer',
      message: err.message 
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

// Start the server
app.listen(port, () => {
  console.log(`\n🚀 Server running at http://localhost:${port}`);
});
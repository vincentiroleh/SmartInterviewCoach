// Global variables
let selectedQuestionData = null;

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');
  
  // Add click handler for generate button
  const generateBtn = document.getElementById('generateBtn');
  if (generateBtn) {
    console.log('Generate button found, adding event listener');
    generateBtn.addEventListener('click', generateQuestions);
  } else {
    console.error('Generate button not found!');
  }
  
  // Enable form submission with Enter key
  const jobTitleInput = document.getElementById('jobTitle');
  if (jobTitleInput) {
    jobTitleInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        generateQuestions();
      }
    });
  }
  
  // Enable answer submission with Ctrl+Enter
  const userAnswerInput = document.getElementById('userAnswer');
  if (userAnswerInput) {
    userAnswerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        submitAnswer();
      }
    });
  }
  
  // Add viewport height fix for mobile browsers
  setMobileViewportHeight();
  window.addEventListener('resize', setMobileViewportHeight);
  
  // Initialize theme toggle
  initThemeToggle();
});

// Fix for mobile viewport height issues
function setMobileViewportHeight() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}

// Main function to generate questions
function generateQuestions() {
  console.log('generateQuestions function called');
  
  const jobTitle = document.getElementById("jobTitle").value.trim();
  const persona = document.getElementById("persona").value;
  const spinner = document.getElementById("loadingSpinner");
  const questionList = document.getElementById("questionList");
  const generateBtn = document.getElementById("generateBtn");

  if (!jobTitle) {
    showToast("Please enter a job title");
    document.getElementById("jobTitle").focus();
    return;
  }

  // Disable button and show spinner
  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";
  spinner.classList.remove("hidden");
  questionList.innerHTML = "";
  
  console.log(`Sending request for ${jobTitle} with persona ${persona}`);

  // Make API request
  fetch("/api/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobTitle, persona })
  })
  .then(res => {
    console.log('Response received', res.status);
    if (!res.ok) {
      throw new Error(`Server responded with status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    console.log('Data received', data);
    
    // Process questions
    const questions = data.result
      .split(/\d+\.\s|QUESTION:\s*/)
      .map(q => q.trim())
      .filter(q => q && !q.toLowerCase().includes("here are"));
    
    console.log(`Processed ${questions.length} questions`);

    // Clear previous questions
    questionList.innerHTML = "";

    // Add questions to the list
    questions.forEach((q, index) => {
      const li = document.createElement("li");
      li.className = "card";
      li.setAttribute("role", "button");
      li.setAttribute("tabindex", "0");
      li.setAttribute("aria-label", `Question ${index + 1}`);

      // Attempt to split into Question + Answer
      const [questionPart, answerPart] = q.split(/IDEAL ANSWER:\s*/);
      
      const questionText = questionPart.trim();
      const answerText = answerPart ? answerPart.trim() : "";

      if (answerPart) {
        li.innerHTML = `
          <div class="question-part">
            <strong>Question:</strong><br>${questionText}
          </div>
          <div class="answer-part">
            <strong>Ideal Answer:</strong><br>${answerText}
          </div>
        `;
      } else {
        li.textContent = questionText;
      }

      // Store the full data for later use
      const questionData = {
        question: questionText,
        idealAnswer: answerText,
        fullText: q
      };

      // Add click event
      li.addEventListener('click', () => selectQuestion(questionData, li));
      
      // Add keyboard support
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectQuestion(questionData, li);
        }
      });

      questionList.appendChild(li);
    });

    document.getElementById("questionsArea").classList.remove("hidden");
    
    // Scroll to questions
    document.getElementById("questionsArea").scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Vibrate on mobile devices for feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  })
  .catch(err => {
    console.error('Error:', err);
    showToast("Something went wrong generating questions");
  })
  .finally(() => {
    spinner.classList.add("hidden");
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate Interview Questions";
  });
}

function selectQuestion(questionData, cardElement) {
  // Store the selected question data
  selectedQuestionData = questionData;
  
  // Update UI
  document.getElementById("selectedQuestion").textContent = questionData.question;
  document.getElementById("answerSection").classList.remove("hidden");
  document.getElementById("userAnswer").value = "";
  document.getElementById("feedbackOutput").innerHTML = "";
  
  // Clear previous selection and highlight new selection
  document.querySelectorAll(".card").forEach(c => c.classList.remove("selected"));
  cardElement.classList.add("selected");
  
  // Focus the answer textarea
  document.getElementById("userAnswer").focus();
  
  // Scroll to answer section
  document.getElementById("answerSection").scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  // Vibrate on mobile devices for feedback
  if (navigator.vibrate) {
    navigator.vibrate(30);
  }
}

function submitAnswer() {
  if (!selectedQuestionData) {
    showToast("Please select a question first");
    return;
  }
  
  const answer = document.getElementById("userAnswer").value.trim();
  const output = document.getElementById("feedbackOutput");
  
  if (!answer) {
    showToast("Please enter your answer");
    document.getElementById("userAnswer").focus();
    return;
  }

  output.innerHTML = "<div class='spinner'><div class='dot dot1'></div><div class='dot dot2'></div><div class='dot dot3'></div></div>";

  fetch("/api/critique-answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      question: selectedQuestionData.question, 
      answer: answer,
      idealAnswer: selectedQuestionData.idealAnswer || ""
    })
  })
  .then(res => {
    if (!res.ok) {
      throw new Error(`Server responded with status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    output.innerHTML = data.result;
    output.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Save report data for the report page
    localStorage.setItem("report", JSON.stringify({
      question: selectedQuestionData.question,
      userAnswer: answer,
      feedback: data.result,
      timestamp: new Date().toISOString()
    }));
    
    // Show report button
    const reportBtn = document.getElementById("reportBtn");
    reportBtn.classList.remove("hidden");
    reportBtn.onclick = function() {
      window.open('/report.html', '_blank');
    };
    
    // Vibrate on mobile devices for feedback
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }
  })
  .catch(err => {
    console.error(err);
    output.innerHTML = "Something went wrong while generating feedback.";
  });
}

// Theme toggle functionality
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;
  
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('theme');
  
  // Apply saved theme or use system preference
  if (savedTheme) {
    root.classList.add(savedTheme + '-theme');
    updateThemeToggle(savedTheme);
  }
  
  themeToggle.addEventListener('click', () => {
    // If no theme class or light theme, switch to dark
    if (!root.classList.contains('dark-theme')) {
      root.classList.remove('light-theme');
      root.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
      updateThemeToggle('dark');
    } else {
      // If dark theme, switch to light
      root.classList.remove('dark-theme');
      root.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
      updateThemeToggle('light');
    }
    
    // Provide haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  });
}

function updateThemeToggle(theme) {
  const icon = document.querySelector('#themeToggle .icon');
  const text = document.querySelector('#themeToggle .text');
  
  if (!icon || !text) return;
  
  if (theme === 'dark') {
    icon.textContent = '🌙';
    text.textContent = 'Light Mode';
  } else {
    icon.textContent = '☀️';
    text.textContent = 'Dark Mode';
  }
}

// Toast notification helper
function showToast(message) {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.style.cssText = `
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    margin-top: 10px;
    font-size: 14px;
    pointer-events: none;
    transition: opacity 0.3s, transform 0.3s;
    opacity: 0;
    transform: translateY(20px);
  `;
  toast.textContent = message;
  toast.setAttribute('role', 'alert');
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);
  
  // Vibrate on mobile devices for feedback
  if (navigator.vibrate) {
    navigator.vibrate(30);
  }
  
  // Remove after delay
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  }, 3000);
}
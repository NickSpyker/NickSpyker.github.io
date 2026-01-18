// Global variables
let allQuestionsData = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let mistakes = [];

// Initialize quiz on page load
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("next-btn").addEventListener("click", nextQuestion);
  document
    .getElementById("restart-full-btn")
    .addEventListener("click", () => startQuiz("full"));
  document
    .getElementById("retry-mistakes-btn")
    .addEventListener("click", () => startQuiz("mistakes"));

  // Load quiz data
  fetch("quiz.json?v=" + Date.now())
    .then((r) => {
      if (!r.ok) throw new Error("quiz.json not found");
      return r.json();
    })
    .then((data) => {
      allQuestionsData = data;
      document.getElementById("loading").classList.add("hidden");
      startQuiz("full");
    })
    .catch((err) => {
      document.getElementById("loading").textContent =
        "Error: unable to load quiz.json. Make sure it's in the same directory as this HTML file.";
      console.error(err);
    });
});

// Start or restart the quiz
function startQuiz(mode) {
  currentQuestionIndex = 0;
  score = 0;

  if (mode === "mistakes" && mistakes.length > 0) {
    currentQuestions = [...mistakes];
    mistakes = [];
  } else {
    currentQuestions = shuffleArray([...allQuestionsData]);
  }

  document.getElementById("quiz-interface").classList.remove("hidden");
  document.getElementById("result-interface").classList.add("hidden");
  
  showQuestion();
}

// Display current question
function showQuestion() {
  const question = currentQuestions[currentQuestionIndex];
  const nextBtn = document.getElementById("next-btn");
  
  nextBtn.style.display = "none";
  
  // Update progress and score
  document.getElementById("progress-text").textContent = 
    `Question ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
  document.getElementById("score-text").textContent = 
    `Score: ${score} / ${currentQuestions.length}`;
  
  // Display question
  document.getElementById("question-text").textContent = question.question;
  
  // Create option buttons
  const optionsContainer = document.getElementById("options-container");
  optionsContainer.innerHTML = "";
  
  const shuffledOptions = shuffleArray([...question.options]);
  
  shuffledOptions.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("option-btn");
    button.addEventListener("click", () => selectOption(option, question.answer));
    optionsContainer.appendChild(button);
  });
}

// Handle option selection
function selectOption(selectedOption, correctAnswer) {
  const optionsContainer = document.getElementById("options-container");
  const buttons = optionsContainer.querySelectorAll("button");
  const nextBtn = document.getElementById("next-btn");
  
  // Disable all buttons
  buttons.forEach((btn) => {
    btn.disabled = true;
    
    // Highlight correct and incorrect answers
    if (btn.textContent === correctAnswer) {
      btn.classList.add("correct");
    }
    if (btn.textContent === selectedOption && selectedOption !== correctAnswer) {
      btn.classList.add("incorrect");
    }
  });
  
  // Update score
  if (selectedOption === correctAnswer) {
    score++;
    document.getElementById("score-text").textContent = 
      `Score: ${score} / ${currentQuestions.length}`;
  } else {
    // Track mistakes for review
    mistakes.push(currentQuestions[currentQuestionIndex]);
  }
  
  // Show next button
  nextBtn.style.display = "block";
}

// Move to next question or show results
function nextQuestion() {
  currentQuestionIndex++;
  
  if (currentQuestionIndex < currentQuestions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

// Display final results
function showResults() {
  document.getElementById("quiz-interface").classList.add("hidden");
  document.getElementById("result-interface").classList.remove("hidden");
  
  const percentage = Math.round((score / currentQuestions.length) * 100);
  document.getElementById("final-score").textContent = 
    `${score} / ${currentQuestions.length} (${percentage}%)`;
  
  // Personalized feedback
  const feedbackMsg = document.getElementById("feedback-message");
  if (percentage === 100) {
    feedbackMsg.textContent = "Perfect score! Outstanding work! 🎉";
  } else if (percentage >= 80) {
    feedbackMsg.textContent = "Excellent job! You really know your stuff! 🌟";
  } else if (percentage >= 60) {
    feedbackMsg.textContent = "Good effort! Keep practicing to improve! 👍";
  } else {
    feedbackMsg.textContent = "Keep learning! Practice makes perfect! 📚";
  }
  
  // Show/hide retry mistakes button
  const retryBtn = document.getElementById("retry-mistakes-btn");
  if (mistakes.length > 0) {
    retryBtn.style.display = "block";
    retryBtn.textContent = `Review ${mistakes.length} mistake${mistakes.length > 1 ? 's' : ''}`;
  } else {
    retryBtn.style.display = "none";
  }
}

// Utility function to shuffle array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

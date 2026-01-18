// Global variables
let allQuestionsData = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let mistakes = [];

// Initialize quiz on page load
document.addEventListener("DOMContentLoaded", () => {
  // Attach event listeners
  document.getElementById("next-btn").addEventListener("click", nextQuestion);
  document
    .getElementById("restart-full-btn")
    .addEventListener("click", () => startQuiz("full"));
  document
    .getElementById("retry-mistakes-btn")
    .addEventListener("click", () => startQuiz("mistakes"));

  // Load quiz data from JSON
  fetch("quiz.json?v=" + Date.now())
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load quiz.json");
      return response.json();
    })
    .then((data) => {
      if (!data || data.length === 0) {
        throw new Error("Quiz data is empty");
      }
      allQuestionsData = data;
      document.getElementById("loading").classList.add("hidden");
      startQuiz("full");
    })
    .catch((error) => {
      document.getElementById("loading").innerHTML =
        '<p style="color: #ef4444; font-size: 1rem;">⚠️ Error: Unable to load quiz.json. Make sure the file exists in the same directory.</p>';
      console.error("Quiz loading error:", error);
    });
});

// Start or restart the quiz
function startQuiz(mode) {
  currentQuestionIndex = 0;
  score = 0;

  // Determine which questions to use
  if (mode === "mistakes" && mistakes.length > 0) {
    currentQuestions = [...mistakes];
    mistakes = [];
  } else {
    currentQuestions = shuffleArray([...allQuestionsData]);
  }

  // Show quiz interface
  document.getElementById("quiz-interface").classList.remove("hidden");
  document.getElementById("result-interface").classList.add("hidden");

  updateProgressBar();
  showQuestion();
}

// Update progress bar based on current question
function updateProgressBar() {
  const progressFill = document.getElementById("progress-fill");
  const percentage =
    ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
  progressFill.style.width = percentage + "%";
}

// Display current question
function showQuestion() {
  const question = currentQuestions[currentQuestionIndex];
  const nextBtn = document.getElementById("next-btn");

  nextBtn.style.display = "none";

  // Update stats
  document.getElementById("progress-text").textContent =
    `Question ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
  document.getElementById("score-text").textContent =
    `Score: ${score} / ${currentQuestions.length}`;
  document.getElementById("question-number").textContent =
    `Question ${currentQuestionIndex + 1}`;

  // Animate question text
  const questionText = document.getElementById("question-text");
  questionText.style.opacity = "0";
  questionText.textContent = question.question;

  setTimeout(() => {
    questionText.style.transition = "opacity 0.3s ease";
    questionText.style.opacity = "1";
  }, 100);

  // Create and display option buttons
  const optionsContainer = document.getElementById("options-container");
  optionsContainer.innerHTML = "";

  const shuffledOptions = shuffleArray([...question.options]);

  shuffledOptions.forEach((option, index) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("option-btn");
    button.style.opacity = "0";
    button.style.transform = "translateY(10px)";

    // Staggered animation
    setTimeout(
      () => {
        button.style.transition = "all 0.3s ease";
        button.style.opacity = "1";
        button.style.transform = "translateY(0)";
      },
      100 + index * 50,
    );

    button.addEventListener("click", () =>
      selectOption(option, question.answer),
    );
    optionsContainer.appendChild(button);
  });

  updateProgressBar();
}

// Handle answer selection
function selectOption(selectedOption, correctAnswer) {
  const optionsContainer = document.getElementById("options-container");
  const buttons = optionsContainer.querySelectorAll("button");
  const nextBtn = document.getElementById("next-btn");

  // Disable all buttons and highlight answers
  buttons.forEach((btn) => {
    btn.disabled = true;

    if (btn.textContent === correctAnswer) {
      btn.classList.add("correct");
    }
    if (
      btn.textContent === selectedOption &&
      selectedOption !== correctAnswer
    ) {
      btn.classList.add("incorrect");
    }
  });

  // Update score
  if (selectedOption === correctAnswer) {
    score++;
    document.getElementById("score-text").textContent =
      `Score: ${score} / ${currentQuestions.length}`;
  } else {
    mistakes.push(currentQuestions[currentQuestionIndex]);
  }

  // Show next button with animation
  setTimeout(() => {
    nextBtn.style.display = "flex";
    nextBtn.style.opacity = "0";
    nextBtn.style.transform = "translateY(10px)";

    setTimeout(() => {
      nextBtn.style.transition = "all 0.3s ease";
      nextBtn.style.opacity = "1";
      nextBtn.style.transform = "translateY(0)";
    }, 50);
  }, 600);
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

  // Update score display
  const scoreCircle = document.querySelector(".score-circle");
  scoreCircle.innerHTML = `
    <div class="score-value">${score} / ${currentQuestions.length}</div>
    <div class="score-label">${percentage}%</div>
  `;

  // Personalized feedback
  const feedbackMsg = document.getElementById("feedback-message");
  const trophyIcon = document.querySelector(".trophy-icon");

  if (percentage === 100) {
    feedbackMsg.textContent = "Perfect score! Outstanding work! 🎉";
    trophyIcon.textContent = "🏆";
  } else if (percentage >= 80) {
    feedbackMsg.textContent = "Excellent job! You really know your stuff! 🌟";
    trophyIcon.textContent = "⭐";
  } else if (percentage >= 60) {
    feedbackMsg.textContent = "Good effort! Keep practicing to improve! 👍";
    trophyIcon.textContent = "👍";
  } else {
    feedbackMsg.textContent = "Keep learning! Practice makes perfect! 📚";
    trophyIcon.textContent = "📚";
  }

  // Configure retry button
  const retryBtn = document.getElementById("retry-mistakes-btn");
  if (mistakes.length > 0) {
    retryBtn.style.display = "flex";
    retryBtn.innerHTML = `<span class="btn-icon">📝</span> Review ${mistakes.length} mistake${mistakes.length > 1 ? "s" : ""}`;
  } else {
    retryBtn.style.display = "none";
  }
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

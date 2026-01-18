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
      document.getElementById("loading").innerHTML =
        '<p style="color: #ef4444;">⚠️ Error: Unable to load quiz.json. Make sure it\'s in the same directory.</p>';
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

  updateProgressBar();
  showQuestion();
}

// Update progress bar
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

  // Update progress and score
  document.getElementById("progress-text").textContent =
    `Question ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
  document.getElementById("score-text").textContent =
    `Score: ${score} / ${currentQuestions.length}`;

  // Update question number badge
  document.getElementById("question-number").textContent =
    `Question ${currentQuestionIndex + 1}`;

  // Display question with animation
  const questionText = document.getElementById("question-text");
  questionText.style.opacity = "0";
  questionText.textContent = question.question;

  setTimeout(() => {
    questionText.style.opacity = "1";
    questionText.style.transition = "opacity 0.3s ease";
  }, 100);

  // Create option buttons
  const optionsContainer = document.getElementById("options-container");
  optionsContainer.innerHTML = "";

  const shuffledOptions = shuffleArray([...question.options]);

  shuffledOptions.forEach((option, index) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("option-btn");
    button.style.opacity = "0";
    button.style.transform = "translateY(10px)";

    // Staggered animation for options
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
    // Track mistakes for review
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
  }, 500);
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
    `${score} / ${currentQuestions.length}`;

  // Add percentage to score circle
  const scoreCircle = document.querySelector(".score-circle");
  const percentageLabel = document.createElement("div");
  percentageLabel.className = "score-label";
  percentageLabel.textContent = `${percentage}%`;
  percentageLabel.style.fontSize = "1.1rem";
  percentageLabel.style.fontWeight = "700";
  scoreCircle.appendChild(percentageLabel);

  // Personalized feedback with emojis
  const feedbackMsg = document.getElementById("feedback-message");
  if (percentage === 100) {
    feedbackMsg.textContent = "Perfect score! Outstanding work! 🎉";
    document.querySelector(".trophy-icon").textContent = "🏆";
  } else if (percentage >= 80) {
    feedbackMsg.textContent = "Excellent job! You really know your stuff! 🌟";
    document.querySelector(".trophy-icon").textContent = "⭐";
  } else if (percentage >= 60) {
    feedbackMsg.textContent = "Good effort! Keep practicing to improve! 👍";
    document.querySelector(".trophy-icon").textContent = "👍";
  } else {
    feedbackMsg.textContent = "Keep learning! Practice makes perfect! 📚";
    document.querySelector(".trophy-icon").textContent = "📚";
  }

  // Show/hide retry mistakes button
  const retryBtn = document.getElementById("retry-mistakes-btn");
  if (mistakes.length > 0) {
    retryBtn.style.display = "flex";
    retryBtn.innerHTML = `<span class="btn-icon">📝</span> Review ${mistakes.length} mistake${mistakes.length > 1 ? "s" : ""}`;
  } else {
    retryBtn.style.display = "none";
  }
}

// Utility function to shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

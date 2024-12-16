class KoreanStudiesQuiz {
  constructor() {
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.totalAnswered = 0;
    this.correctAnswers = 0;
    this.selectedOption = null;

    // DOM elements
    this.questionText = document.getElementById('question-text');
    this.optionsContainer = document.getElementById('options-container');
    this.progressText = document.getElementById('progress');
    this.scoreText = document.getElementById('score');
    this.feedbackContainer = document.getElementById('feedback-container');
    this.feedbackText = document.getElementById('feedback-text');
    this.nextButton = document.getElementById('next-button');

    // Event listeners
    this.nextButton.addEventListener('click', () => this.nextQuestion());

    // Initialize
    this.loadQuestions();
  }

  async loadQuestions() {
    try {
      const response = await fetch('questions.json');
      const questions = await response.json();
      this.questions = this.shuffleArray(questions);
      this.showQuestion();
    } catch (error) {
      console.error('Error loading questions:', error);
      this.questionText.textContent = 'Error loading questions. Please refresh the page.';
    }
  }

  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  showQuestion() {
    const question = this.questions[this.currentQuestionIndex];
    this.questionText.textContent = question.question;

    // Shuffle options
    const shuffledOptions = this.shuffleArray(question.options.map((text, index) => ({
      text, isCorrect: index === question.correct
    })));

    // Clear previous options
    this.optionsContainer.innerHTML = '';

    // Create new option elements
    shuffledOptions.forEach(option => {
      const button = document.createElement('button');
      button.className = 'option';
      button.textContent = option.text;
      button.dataset.correct = option.isCorrect;
      button.addEventListener('click', () => this.selectOption(button));
      this.optionsContainer.appendChild(button);
    });

    // Update progress
    this.progressText.textContent = `Question: ${this.currentQuestionIndex + 1}/${this.questions.length}`;
    this.updateScore();

    // Reset UI state
    this.feedbackContainer.classList.add('hidden');
    this.selectedOption = null;
  }

  selectOption(button) {
    // Prevent selection after answer is revealed
    if (this.selectedOption) return;

    this.selectedOption = button;
    const isCorrect = button.dataset.correct === 'true';

    // Update scores
    this.totalAnswered++;
    if (isCorrect) this.correctAnswers++;

    // Show feedback
    this.feedbackContainer.classList.remove('hidden');

    // Highlight correct and incorrect answers
    const options = this.optionsContainer.children;
    for (const option of options) {
      if (option.dataset.correct === 'true') {
        option.classList.add('correct');
      } else if (option === button && !isCorrect) {
        option.classList.add('incorrect');
      }
    }

    // Show feedback message
    this.feedbackText.textContent = this.questions[this.currentQuestionIndex].explanation;

    this.updateScore();
  }

  updateScore() {
    const percentage = this.totalAnswered === 0 ? 0 : Math.round((this.correctAnswers / this.totalAnswered) * 100);
    this.scoreText.textContent = `Score: ${this.correctAnswers}/${this.totalAnswered} (${percentage}%)`;
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex >= this.questions.length) {
      // Start over with reshuffled questions
      this.currentQuestionIndex = 0;
      this.questions = this.shuffleArray(this.questions);
    }
    this.showQuestion();
  }
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new KoreanStudiesQuiz();
});

class Quiz {
  categories = ['html', 'css'];
  // categories = ['html', 'css', 'javscript'];
  categoriesCount = this.categories.length;
  questionsCount = 6;

  currentPage = 1;
  questionsPerPage = 5;
  pages = Math.ceil(this.questionsCount / this.questionsPerPage);

  states = {
    none: 'none',
    preStart: 'pre-start',
    inProgress: 'in-progress',
    finished: 'finished'
  };
  state = this.states.none;

  questions = [];
  questionsRendered = 0;

  quizElement;
  quizQuestionsElement;
  quizInstructionsElement;

  init() {
    this.createQuiz();
  }

  createQuiz() {
    this.quizElement = this.createElement('main', document.body, ['quiz']);
    this.renderQuizHeader();
    this.quizQuestionsElement = this.createElement('div', this.quizElement, ['quiz__questions']);

    this.renderQuizInstructions();
    this.state = this.states.preStart;
  }

  renderQuizInstructions() {
    const instructions = `Celem quizu jest sprawdzenie Twojej wiedzy z zakresu języków HTML, CSS i Javascript.\n\nQuiz składa się z <em>${this.questionsCount} pytań</em> - po ${Math.floor(this.questionsCount / this.categoriesCount)} z każdej kategorii i jedno dodatkowe, z losowej kategorii.\n\nPytania podzielone są na <em>cztery stopnie trudności</em> - po 2 z każdego. Ostatnie - dwudzieste piąte - pytanie będzie zawsze o stopniu trudności 3.\n\nKażde pytanie oznaczone jest kategorią z lewej strony.\n\nPytania są losowane z większej puli, a więc dwa podejścia do quizu będą skutkowały innymi pytaniami oraz w innej kolejności. Odpowiedzi również mogą być w innej kolejności.\n\nNie ma limitu czasowego.\n\nPowodzenia!`;

    this.quizInstructionsElement = this.createElement('section', this.quizQuestionsElement, ['quiz__instructions']);
    this.createElement('h3', this.quizInstructionsElement, ['quiz__instructions-title'], 'Przed rozpoczęciem');
    this.createElement('p', this.quizInstructionsElement, ['quiz__instructions-content'], instructions, true);

    const startButton = this.createElement('button', this.quizInstructionsElement, ['quiz__start-button', 'button'], 'Rozpocznij');
    startButton.type = 'button';
    startButton.addEventListener('click', this.startQuiz.bind(this));
  }

  renderQuizHeader() {
    const quizHeader = this.createElement('header', this.quizElement, ['quiz__header', 'header']);
    const titleContainer = this.createElement('hgroup', quizHeader, ['header__title-container']);
    this.createElement('h1', titleContainer, ['header__title'], 'Quiz');
    this.createElement('h2', titleContainer, ['header__subtitle'], 'HTML, CSS i JS');
  }

  startQuiz() {
    this.hide(this.quizInstructionsElement);
    this.loadQuestions();
  }

  loadQuestions() {
    const selectedCategories = {
      html: 0,
      css: 0,
      javascript: 0,
    };

    const selectQuestion = (questions, category) => {
      let selectedQuestion = Math.floor(Math.random() * Object.keys(questions[category]).length);

      if (questions[category][selectedQuestion]) {
        this.questions.push({
          ...questions[category][selectedQuestion],
          type: category,
        });
        return selectedQuestion;
      }
      return selectQuestion(questions, category);
    };

    const selectCategory = (checkLimit) => {
      const pickFrom = Math.floor(Math.random() * this.categoriesCount);
      const selectedCategory = this.categories[pickFrom];
      if (checkLimit && selectedCategories[selectedCategory] < (this.questionsCount / this.categoriesCount) || !checkLimit) {
        selectedCategories[selectedCategory]++;
        return selectedCategory;
      }
      return selectCategory(true);
    };

    fetch('http://localhost:8000/questions.json')
      .then(res => res.json())
      .then(data => {
        let fetchedQuestions = { ...data };

        for (let i = 1; i <= this.questionsCount; i++) {
          const selectedCategory = selectCategory(true);
          const selectedQuestion = selectQuestion(fetchedQuestions, selectedCategory);

          fetchedQuestions = {
            ...fetchedQuestions,
            [selectedCategory]: {
              ...fetchedQuestions[selectedCategory],
              [selectedQuestion]: null
            },
          };
        }

        selectQuestion(fetchedQuestions, selectCategory(false)); // 25th question
        this.renderPage();
        this.state = this.states.inProgress;
      });
  }

  renderPage() {
    const questionsToRender = [...this.questions].splice((this.currentPage - 1) * this.questionsPerPage, this.questionsPerPage);

    questionsToRender.forEach(question => {
      this.questionsRendered++;
      this.renderQuestion(this.questionsRendered, question.type, this.parseText(question.question), question.answers);
    });
  }

  // helper methods
  hide(element) {
    element.classList.add('display:none');
  }
  
  parseText(string) {
    return string
      .replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('--[', '<code class="block">').replaceAll(']--', '</code>')
      .replaceAll('-[', '<code>').replaceAll(']-', '</code>');
  }

  createElement(tag, parent, classList, content = null, contentAsHtml = false) {
    const element = document.createElement(tag);
    if (content) {
      if (contentAsHtml) element.innerHTML = content;
      else element.textContent = content;
    }
    if (classList.length) element.classList.add(...classList);
    parent.append(element);
    return element;
  }

  renderQuestion(id, type, content, answers) {
    const answerLetters = ['a', 'b', 'c', 'd'];
    const quizQuestion = this.createElement('section', this.quizQuestionsElement, ['quiz__question', 'quiz-question', `--${type}`]);
    quizQuestion.id = `question-${id}`;

    const question = this.createElement('h3', quizQuestion, ['quiz-question__question']);
    this.createElement('span', question, ['quiz-question__label'], `Pytanie ${id}: `);
    this.createElement('span', question, [], content, true);

    const answersContainer = this.createElement('div', quizQuestion, ['quiz-question__answers-container']);

    for (let i = 1; i <= 4; i++) {
      this.renderAnswer(i, answersContainer, id, answerLetters[i-1], this.parseText(answers[i-1]));
    }
  }

  renderAnswer(id, container, questionId, value, content) {
    const label = this.createElement('label', container, ['quiz-question__answer']);

    const input = this.createElement('input', label, ['quiz-question__answer-input']);
    input.type = 'radio';
    input.value = value;
    input.name = `question-${questionId}`;
    input.id = `answer-${id}`;

    label.innerHTML += content;
  }
}

(() => {
  new Quiz().init();
})();

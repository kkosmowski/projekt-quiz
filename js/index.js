class Quiz {
  categories = ['html', 'css'];
  // categories = ['html', 'css', 'javscript'];
  categoriesCount = this.categories.length;
  questionsCount = 25;

  currentPage = 0;
  questionsPerPage = 5;
  pages = Math.ceil(this.questionsCount / this.questionsPerPage);
  lastCachedPage = 0;

  states = {
    none: 'none',
    preStart: 'pre-start',
    inProgress: 'in-progress',
    finished: 'finished'
  };
  state = this.states.none;

  backControl;
  continueControl;

  questions = [];
  questionsRendered = 0;

  answerLetters = ['a', 'b', 'c', 'd'];
  userAnswers = new Array(this.questionsCount).fill(null);
  correctAnswers = [null];

  quizElement;
  quizPageElements = [];
  quizPagesWrapperElement;
  quizInstructionsElement;

  progressBarValue;
  progressTextValue;
  progressValueVisible = false;
  progressBoxesVisible = false;

  deviceIsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  screenNotSmall = window.innerWidth >= 1000;

  init() {
    this.createQuiz();
  }

  createQuiz() {
    this.quizElement = this.createElement('main', document.body, ['quiz']);
    this.renderQuizHeader();
    this.quizPagesWrapperElement = this.createElement('div', this.quizElement, ['quiz__pages']);
    this.addAnswerListener();
    this.renderQuizInstructions();
    this.state = this.states.preStart;
  }

  addAnswerListener() {
    this.quizPagesWrapperElement.addEventListener('input', this.inputListenerFunction);
  }

  inputListenerFunction = (event) => {
    event.stopPropagation();
    const questionId = event.target.name.split('-')[1];
    this.userAnswers[questionId] = event.target.id.split('-')[1];
    if (this.progressBoxesVisible) this.markProgressBox(questionId);
    else if (this.progressValueVisible) this.setProgressValue(questionId);
    this.checkIfAllPageAnswersAreGiven();
  };

  checkIfAllPageAnswersAreGiven() {
    // TODO: Refactor start and end into global constants
    const start = (this.currentPage - 1) * this.questionsPerPage + 1;
    const end = start + this.questionsPerPage;
    const currentAnswers = this.userAnswers.slice(start, end);

    if (!currentAnswers.includes(null)) {
      this.setControl(this.continueControl, false);
    }
    return !currentAnswers.includes(null);
  }

  removeAnswerListener() {
    this.quizPagesWrapperElement.removeEventListener('input', this.inputListenerFunction);
  }

  markProgressBox(questionId) {
    document.getElementById(`progress-box-${questionId}`).classList.add('--answered');
  }

  setProgressValue() {
    const answeredQuestionsCount = this.userAnswers.filter(answer => !!answer).length;
    const answeredQuestionsPercent = `${Math.floor(answeredQuestionsCount / this.questionsCount * 100)}%`;

    this.progressTextValue.textContent = answeredQuestionsPercent;
    this.progressBarValue.style.width = answeredQuestionsPercent;
  }

  renderQuizInstructions() {
    const instructions = `Celem quizu jest sprawdzenie Twojej wiedzy z zakresu języków HTML, CSS i Javascript.\n\nQuiz składa się z <em>${this.questionsCount} pytań</em> - po ${Math.floor(this.questionsCount / this.categoriesCount)} z każdej kategorii i jedno dodatkowe, z losowej kategorii.\n\nPytania podzielone są na <em>cztery stopnie trudności</em> - po 2 z każdego. Ostatnie - dwudzieste piąte - pytanie będzie zawsze o stopniu trudności 3.\n\nKażde pytanie oznaczone jest kategorią z lewej strony.\n\nPytania są losowane z większej puli, a więc dwa podejścia do quizu będą skutkowały innymi pytaniami oraz w innej kolejności. Odpowiedzi również mogą być w innej kolejności.\n\nNie ma limitu czasowego.\n\nPowodzenia!`;

    this.quizPageElements.push(this.createElement('div', this.quizPagesWrapperElement, ['quiz__questions']));
    this.quizInstructionsElement = this.createElement('section', this.quizPageElements[0], ['quiz__instructions']);
    this.createElement('h3', this.quizInstructionsElement, ['quiz__instructions-title'], 'Zanim zaczniesz');
    this.createElement('p', this.quizInstructionsElement, ['quiz__instructions-content'], instructions, true);

    const startButton = this.createElement('button', this.quizInstructionsElement, ['quiz__start-button', 'button'], 'Rozpocznij');
    startButton.type = 'button';
    // TODO: remove EL after event is fired
    startButton.addEventListener('click', () => this.startQuiz());
  }

  renderQuizHeader() {
    const quizHeader = this.createElement('header', this.quizElement, ['quiz__header', 'header']);
    const titleContainer = this.createElement('hgroup', quizHeader, ['header__title-container']);
    this.createElement('h1', titleContainer, ['header__title'], 'Quiz');
    this.createElement('h2', titleContainer, ['header__subtitle'], 'HTML, CSS i JS');
  }

  startQuiz() {
    this.loadQuestions();
    this.setupControls();
  }

  setupControls() {
    this.renderControls();

    this.backControl.addEventListener('click', () => this.setPreviousPage());
    this.continueControl.addEventListener('click', () => this.setNextPage());
  }

  setControl(control, disabled) {
    control.disabled = disabled;
  }

  setPreviousPage() {
    if (this.currentPage !== 1) {
      this.changePage(false);
    }
  }

  setNextPage() {
    if (this.checkIfAllPageAnswersAreGiven()) {
      if (this.currentPage !== this.pages) {
        this.changePage(true);
      } else {
        this.removeAnswerListener();
        document.write('koniec');
      }
    }
  }

  changePage(increase) {
    increase ? this.currentPage++ : this.currentPage--;
    this.renderPage(increase);
    if (this.progressBoxesVisible) this.rerenderCurrentBoxes();
    this.checkControlsValidity();
  }

  checkControlsValidity() {
    this.setControl(this.continueControl, true);
    this.checkIfAllPageAnswersAreGiven();
    this.setControl(this.backControl,this.currentPage === 1);
    this.continueControl.textContent = this.currentPage === this.pages ? 'Zakończ' : 'Kontynuuj';
  }

  renderControls() {
    const controlsElement = this.createElement('div', this.quizElement, ['quiz__controls', 'controls']);

    this.backControl = this.createElement('button', controlsElement, ['button', 'controls__button--back'], 'Cofnij');
    this.backControl.type = 'button';

    if (!this.deviceIsMobile && this.screenNotSmall) {
      const progress = this.createElement('div', controlsElement, ['controls__progress']);
      for (let i = 1; i <= this.questionsCount; i++) {
        const progressBox = this.createElement('div', progress, ['controls__progress-box']);
        progressBox.id = `progress-box-${i}`;

        if (i <= this.questionsPerPage) {
          progressBox.classList.add('--current');
        }
      }

      this.progressBoxesVisible = true;
    } else {
      const progressBar = this.createElement('div', controlsElement, ['controls__progress-bar']);
      this.progressBarValue = this.createElement('div', progressBar, ['controls__progress-value']);
      this.progressTextValue = this.createElement('span',progressBar, ['controls__progress-text'], '0%');

      this.progressValueVisible = true;
    }

    this.continueControl = this.createElement('button', controlsElement, ['button', 'controls__button--continue'], 'Kontynuuj');
    this.continueControl.type = 'button';
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
        this.setNextPage();
        this.state = this.states.inProgress;
      });
  }

  checkIfPageCached() {
    if (this.lastCachedPage < this.currentPage) {
      this.lastCachedPage = this.currentPage;
      return false;
    }
    return true;
  }

  renderPage(next) {
    const pageCached = this.checkIfPageCached();
    const questionsToRender = [...this.questions].splice((this.currentPage - 1) * this.questionsPerPage, this.questionsPerPage);

    this.hide(this.quizPageElements[next ? this.currentPage - 1 : this.currentPage + 1]);

    if (!pageCached) {
      this.quizPageElements.push(this.createElement('div', this.quizPagesWrapperElement, ['quiz__questions']));
      questionsToRender.forEach(question => {
        this.questionsRendered++;
        this.renderQuestion(this.quizPageElements[this.currentPage], this.questionsRendered, question.type, this.parseText(question.question), question.answers);
      });
    } else {
      this.show(this.quizPageElements[this.currentPage]);
    }
    this.quizPagesWrapperElement.scrollTo(0,0);
  }


  rerenderCurrentBoxes() {
    const start = (this.currentPage - 1) * this.questionsPerPage + 1;
    const end = start + this.questionsPerPage;

    document.querySelectorAll('.controls__progress-box').forEach(
      box => box.classList.remove('--current')
    );

    for (let i = start; i < end; i++) {
      document.getElementById(`progress-box-${i}`).classList.add('--current');
    }
  }

  // helper methods
  hide(element) {
    element.classList.add('display:none');
  }

  show(element) {
    element.classList.remove('display:none');
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

  renderQuestion(parentElement, id, type, content, answers) {
    const quizQuestion = this.createElement('section', parentElement, ['quiz__question', 'quiz-question', `--${type}`]);
    quizQuestion.id = `question-${id}`;

    const question = this.createElement('h3', quizQuestion, ['quiz-question__question']);
    this.createElement('span', question, ['quiz-question__label'], `Pytanie ${id}: `);
    this.createElement('span', question, [], content, true);

    const answersContainer = this.createElement('div', quizQuestion, ['quiz-question__answers-container']);

    const answerPositions = this.randomizeAnswerPositions(new Array(4).fill(null).map((element, index) => index + 1));
    this.correctAnswers.push(answerPositions.indexOf(1) + 1);
    for (let i = 1; i <= 4; i++) {
      const j = answerPositions[i-1];
      this.renderAnswer(j, answersContainer, id, this.answerLetters[i-1], this.parseText(answers[j-1]));
    }
  }

  randomizeAnswerPositions(positions) {
    let currentLength = positions.length;
    let temp;
    let random;

    while (0 !== currentLength) {

      random = Math.floor(Math.random() * currentLength);
      currentLength -= 1;

      temp = positions[currentLength];
      positions[currentLength] = positions[random];
      positions[random] = temp;
    }

    return positions;
  }

  renderAnswer(id, container, questionId, value, content) {
    const label = this.createElement('label', container, ['quiz-question__answer']);

    const input = this.createElement('input', label, ['quiz-question__answer-input']);
    input.type = 'radio';
    input.value = value;
    input.name = `question-${questionId}`;
    input.id = `answer-${id}`;

    label.innerHTML += `<span>${content}</span>`;
  }
}

(() => {
  new Quiz().init();
})();

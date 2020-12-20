import Base from './base.js';
import Render from './render.js';

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

  userAnswers = new Array(this.questionsCount).fill(null);
  correctAnswers = [null];

  init() {
    this.createQuiz();
  }

  createQuiz() {
    Render.init();
    this.addAnswerListener();
    Render.instructions(
      this.questionsCount,
      Math.floor(this.questionsCount / this.categoriesCount),
      this.startQuiz.bind(this)
    );
    this.state = this.states.preStart;
  }

  addAnswerListener() {
    Render.quizPagesWrapperElement.addEventListener('input', this.inputListenerFunction.bind(this));
  }

  inputListenerFunction = (event) => {
    event.stopPropagation();
    const questionId = event.target.name.split('-')[1];
    this.userAnswers[questionId] = event.target.id.split('-')[1];
    if (Render.progressBoxesVisible) this.markProgressBox(questionId);
    else if (Render.progressValueVisible) this.setProgressValue(questionId);
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
    Render.quizPagesWrapperElement.removeEventListener('input', this.inputListenerFunction.bind(this));
  }

  markProgressBox(questionId) {
    Base.addClassToId(`progress-box-${questionId}`, '--answered');
  }

  setProgressValue() {
    const answeredQuestionsCount = this.userAnswers.filter(answer => !!answer).length;
    const answeredQuestionsPercent = `${Math.floor(answeredQuestionsCount / this.questionsCount * 100)}%`;

    Render.progressTextValue.textContent = answeredQuestionsPercent;
    Render.progressBarValue.style.width = answeredQuestionsPercent;
  }

  startQuiz() {
    this.loadQuestions();
    this.setupControls();
  }

  setupControls() {
    [this.backControl, this.continueControl] = Render.controls(
      this.questionsCount,
      this.questionsPerPage
    );

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
    if (Render.progressBoxesVisible) Render.currentBoxes(this.currentPage, this.questionsPerPage, increase);
    this.checkControlsValidity();
  }

  checkControlsValidity() {
    this.setControl(this.continueControl, true);
    this.checkIfAllPageAnswersAreGiven();
    this.setControl(this.backControl,this.currentPage === 1);
    this.continueControl.textContent = this.currentPage === this.pages ? 'Zakończ' : 'Kontynuuj';
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

    Base.hide(Render.quizPageElements[next ? this.currentPage - 1 : this.currentPage + 1]);

    if (!pageCached) {
      Render.page(questionsToRender, this.currentPage, this.correctAnswers);
    } else {
      Base.show(Render.quizPageElements[this.currentPage]);
    }
    Render.quizPagesWrapperElement.scrollTo(0,0);
  }
}

(() => {
  new Quiz().init();
})();

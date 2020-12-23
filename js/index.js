import Base from './base.js';
import Render from './render.js';

class Quiz {
  categories = ['html', 'css'];
  // categories = ['html', 'css', 'javscript'];
  categoriesCount = this.categories.length;
  questionsCount = 5;
  requiredPercentToPass = 75;

  currentPage = 0;
  questionsPerPage = 5;
  pages = Math.ceil(this.questionsCount / this.questionsPerPage);
  lastCachedPage = 0;

  states = {
    none: 'none',
    preStart: 'pre-start',
    inProgress: 'in-progress',
    finished: 'finished',
  };
  state = this.states.none;

  backControl;
  continueControl;

  questions = [];

  userAnswers = new Array(this.questionsCount).fill(null);
  correctAnswers = [];


  init() {
    this.createQuiz();
  }


  /*
    Creates and setups quiz.
    Renders instructions.
   */
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


  startQuiz() {
    this.loadQuestions();
    this.setupControls();
    this.state = this.states.inProgress;
  }


  // TODO: add definition if necessary
  endQuiz() {
    Base.hide(Render.quizPageElements[this.currentPage]);
    Base.hide(Render.quizControlsElement);
    this.removeAnswerListener();
    this.renderEndScreen();
    this.state = this.states.finished;
  }


  addAnswerListener() {
    Render.quizPagesWrapperElement.addEventListener('input', this.inputListenerFunction.bind(this));
  }


  /*
    Increases or decreases current page based on Boolean input.
    Fires controls validators.
   */
  changePage(increase) {
    increase ? this.currentPage++ : this.currentPage--;
    this.renderPage(increase);

    if (Render.progressBoxesVisible) {
      Render.currentBoxes(this.currentPage, this.questionsPerPage, increase);
    }

    this.checkControlsValidity();
  }


  /*
    Enables or disabled control based on number of conditions.
   */
  checkControlsValidity() {
    this.disableControl(this.continueControl);
    this.currentPage === 1 ? this.disableControl(this.backControl) : this.enableControl(this.backControl);

    this.checkIfAllPageAnswersAreGiven();

    this.continueControl.textContent = this.currentPage === this.pages ? 'Zakończ' : 'Kontynuuj';
  }


  /*
    Checks whether all questions on the page are answered.
    Enables the continue control if so.
    Returns boolean.
   */
  checkIfAllPageAnswersAreGiven() {
    // TODO: Refactor start and end into global constants
    const start = (this.currentPage - 1) * this.questionsPerPage + 1;
    const end = start + this.questionsPerPage;
    const currentAnswers = this.userAnswers.slice(start, end);

    if (!currentAnswers.includes(null)) {
      this.enableControl(this.continueControl);
    }
    return !currentAnswers.includes(null);
  }


  /*
    If page was already created, make it visible.
    If not, then it needs to be created.
   */
  checkIfPageCached() {
    if (this.lastCachedPage < this.currentPage) {
      this.lastCachedPage = this.currentPage;
      return false;
    }
    return true;
  }


  // TODO: finish definition
  /*
    Listener method,
   */
  inputListenerFunction(event) {
    event.stopPropagation();

    const questionId = event.target.name.split('-')[1];
    this.userAnswers[questionId - 1] = Number(event.target.id.split('-')[1]);

    if (Render.progressBoxesVisible) this.markProgressBox(questionId);
    else if (Render.progressValueVisible) this.setProgressValue(questionId);

    this.checkIfAllPageAnswersAreGiven();
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
        let fetchedQuestions = {...data};

        for (let i = 1; i < this.questionsCount; i++) {
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


  markProgressBox(questionId) {
    Base.addClassToId(`progress-box-${ questionId }`, '--answered');
  }


  removeAnswerListener() {
    Render.quizPagesWrapperElement.removeEventListener('input', this.inputListenerFunction.bind(this));
  }


  // TODO: add definition if necessary
  renderEndScreen() {
    const correctAnswersCount = this.userAnswers.filter((answer, index) => answer === this.correctAnswers[index]).length;
    const correctAnswersPercent = correctAnswersCount / this.questionsCount * 100;

    Render.endScreen(this.pages + 1);
    Render.endScreenResult(correctAnswersPercent >= this.requiredPercentToPass);
    console.log(this.questions)
    Render.endScreenScores(correctAnswersCount, this.questionsCount, correctAnswersPercent);
    // TODO
    // Render.endScreenScorePerLanguage({
    //   html: {
    //     correctAnswers: '2/8',
    //     percent: 50,
    //   },
    //   css: {
    //     correctAnswers: '9/9',
    //     percent: 100,
    //   },
    //   javascript: {
    //     correctAnswers: '2/8',
    //     percent: 50,
    //   }
    // });
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
    Render.quizPagesWrapperElement.scrollTo(0, 0);
  }


  setupControls() {
    [this.backControl, this.continueControl] = Render.controls(
      this.questionsCount,
      this.questionsPerPage
    );

    this.backControl.addEventListener('click', () => this.setPreviousPage());
    this.continueControl.addEventListener('click', () => this.setNextPage());
  }


  disableControl(control) {
    control.disabled = true;
  }

  enableControl(control) {
    control.disabled = false;
  }


  setProgressValue() {
    const answeredQuestionsCount = this.userAnswers.filter(answer => !!answer).length;
    const answeredQuestionsPercent = `${ Math.floor(answeredQuestionsCount / this.questionsCount * 100) }%`;

    Render.progressTextValue.textContent = answeredQuestionsPercent;
    Render.progressBarValue.style.width = answeredQuestionsPercent;
  }


  setNextPage() {
    if (
      this.checkIfAllPageAnswersAreGiven()
      && this.state !== this.states.none
      && this.state !== this.states.finished
    ) {
      if (this.currentPage !== this.pages) {
        this.changePage(true);
      } else {
        this.endQuiz();
      }
    }
  }


  setPreviousPage() {
    if (
      this.currentPage !== 1
      && this.state !== this.states.none
      && this.state !== this.states.finished
    ) {
      this.changePage(false);
    }
  }
}


(() => {
  new Quiz().init();
})();

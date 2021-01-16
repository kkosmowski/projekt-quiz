import Base from './base.js';
import Render from './render.js';
import Text from '../pl.js';

class Quiz {
  categories = ['html', 'css'];
  // categories = ['html', 'css', 'javascript'];
  categoriesCount = this.categories.length;
  questionsCount = 4; // TODO: Check why 1 is buggy
  requiredPercentToPass = 75;

  currentPage;
  questionsPerPage = Math.min(2, this.questionsCount);
  pages = Math.ceil(this.questionsCount / this.questionsPerPage);
  lastCachedPage;

  states = {
    none: 'none',
    restarted: 'restarted',
    preStart: 'pre-start',
    inProgress: 'in-progress',
    finished: 'finished',
    reviewing: 'reviewing',
  };
  state;

  backControl;
  continueControl;
  restartControl;

  questions;
  questionsDetails;

  userAnswers;
  correctAnswers;
  explanations;


  init() {
    this.currentPage = 0;
    this.lastCachedPage = 0;
    this.state = this.states.none;

    this.questions = [];
    this.questionsDetails = {};
    this.userAnswers = new Array(this.questionsCount).fill(null);
    this.correctAnswers = [];
    this.explanations = [];
    this.createQuiz();
  }


  /*
    Creates and setups quiz.
    Renders instructions.
   */
  createQuiz() {
    Render.init();
    this.addAnswerListener();
    if (this.state === this.states.none) {
      Render.instructions(
        this.questionsCount,
        Math.floor(this.questionsCount / this.categoriesCount),
        this.startQuiz.bind(this)
      );
    } else if (this.state === this.states.restarted) {
      this.startQuiz();
    }
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
  changePage(increase, specificPageNumber) {
    if (typeof increase === 'boolean') {
      increase ? this.currentPage++ : this.currentPage--;
      this.renderPage(increase);
    } else {
      if (typeof specificPageNumber === 'number') {
        this.currentPage = specificPageNumber;
        this.renderPage(null);
      }
    }

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
    this.currentPage === 1
      ? this.disableControl(this.backControl)
      : this.enableControl(this.backControl);

    this.checkIfAllPageAnswersAreGiven();

    if (this.state !== this.states.reviewing) {
      this.continueControl.textContent = this.currentPage === this.pages ? Text.common.finish : Text.common.continue;
    } else {
      this.continueControl.textContent = Text.common.continue;
      this.currentPage === this.pages
        ? this.disableControl(this.continueControl)
        : this.enableControl(this.continueControl);
    }
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
    const currentAnswers = this.userAnswers.slice(start - 1, end - 1);

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


  /*
    Removes entire quiz element.
   */
  clearQuiz() {
    this.removeAnswerListener();
    document.body.removeChild(Render.quizElement);
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


  // TODO: add definition
  loadQuestions() {
    const selectedCategories = {};

    this.categories.forEach(category => {
      selectedCategories[category] = 0;
      this.questionsDetails[category] = {
        questions: []
      };
    });

    // TODO: add definition
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

    // TODO: add definition
    const selectCategory = (checkLimit) => {
      const pickFrom = Math.floor(Math.random() * this.categoriesCount);
      const selectedCategory = this.categories[pickFrom];
      if (checkLimit && selectedCategories[selectedCategory] < (this.questionsCount / this.categoriesCount) || !checkLimit) {
        selectedCategories[selectedCategory]++;
        return selectedCategory;
      }
      return selectCategory(true);
    };

    // TODO: add definition
    const getQuestion = (fetchedQuestions, i, lastQuestion) => {
      const selectedCategory = selectCategory(!lastQuestion);
      const selectedQuestion = selectQuestion(fetchedQuestions, selectedCategory);
      this.explanations.push(fetchedQuestions[selectedCategory][selectedQuestion].explanation);
      this.questionsDetails[selectedCategory].questions.push(i);

      if (lastQuestion) {
        this.categories.forEach(category => this.questionsDetails[category] = {
          ...this.questionsDetails[category],
          count: selectedCategories[category]
        });
      }

      this.questionsDetails[selectedCategory].questions.push(i);
      return [selectedCategory, selectedQuestion];
    };

    // TODO: add definition
    fetch('questions.json', {
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
    })
      .then(res => res.json())
      .then(data => {
        let fetchedQuestions = {...data};

        for (let i = 1; i < this.questionsCount; i++) {
          const [selectedCategory, selectedQuestion] = getQuestion(fetchedQuestions, i, false);

          fetchedQuestions = {
            ...fetchedQuestions,
            [selectedCategory]: {
              ...fetchedQuestions[selectedCategory],
              [selectedQuestion]: null
            },
          };
        }

        getQuestion(fetchedQuestions, this.questionsCount, true);

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
    Render.endScreenScores(correctAnswersCount, this.questionsCount, correctAnswersPercent);
    Render.endScreenScorePerCategory(this.getScoresByCategory(), this.categories);
    Render.endScreenControls(this.reviewAnswers.bind(this), this.restartQuiz.bind(this));
  }


  getScoresByCategory() {
    const result = {};
    const counter = {};

    this.categories.forEach(category => counter[category] = 0);

    this.userAnswers.forEach((userAnswer, index) => {
      if (userAnswer === this.correctAnswers[index]) {
        for (let j = 0; j < this.categories.length; j++) {
          if (this.questionsDetails[this.categories[j]].questions.includes(index + 1)) {
            counter[this.categories[j]]++;
            break;
          }
        }
      }
    });

    this.categories.forEach(category => result[category] = {
      correctAnswers: `${ counter[category] }/${ this.questionsDetails[category].count }`,
      percentage: +(counter[category] / this.questionsDetails[category].count * 100).toFixed(2) + '%',
    });

    return result;
  }


  renderPage(next) {
    const pageCached = this.checkIfPageCached();
    const questionsToRender = [...this.questions].splice((this.currentPage - 1) * this.questionsPerPage, this.questionsPerPage);

    if (typeof next === 'boolean') {
      Base.hide(Render.quizPageElements[next ? this.currentPage - 1 : this.currentPage + 1]);
    } else {
      Render.quizPageElements.forEach(pageElement => Base.hide(pageElement));
    }

    if (!pageCached) {
      Render.page(questionsToRender, this.currentPage, this.correctAnswers);
    } else {
      Base.show(Render.quizPageElements[this.currentPage]);
    }

    Render.quizPagesWrapperElement.scrollTo(0, 0);
  }


  // TODO: add definition if necessary
  restartQuiz() {
    if (this.state === this.states.finished || this.state === this.states.reviewing) {
      this.state = this.states.restarted;
      this.clearQuiz();
      this.init();
    }
  }


  // TODO: add definition if necessary
  reviewAnswers() {
    Base.hide(Render.quizEndScreenElement);
    this.state = this.states.reviewing;
    Render.disableAnswerRadios();
    Render.markSelectedAnswers(this.userAnswers);
    Render.markCorrectAnswers(this.correctAnswers);
    Render.explanations(this.explanations);
    Base.show(Render.quizControlsElement);
    Base.hide(Render.progressElement);
    Base.show(this.restartControl);
    this.changePage(null, 1);

  }


  setupControls() {
    [this.backControl, this.restartControl, this.continueControl] = Render.controls(
      this.questionsCount,
      this.questionsPerPage
    );
    Base.hide(this.restartControl);

    this.backControl.addEventListener('click', () => this.setPreviousPage());
    this.continueControl.addEventListener('click', () => this.setNextPage());
    this.restartControl.addEventListener('click', () => this.restartQuiz());
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

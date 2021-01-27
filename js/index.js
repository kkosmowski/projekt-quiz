import Base from './base.js';
import Render from './render.js';
import Text from '../pl.js';

/*
  Main class responsible for the logic of Quiz application.
  Uses Base class as a helper, uses Render class as an extension to manage DOM.
 */
class Quiz {
  authorShown = false;
  categories = ['html', 'css', 'javascript'];
  categoriesCount = this.categories.length;
  questionsCount = 25;
  requiredPercentToPass = 75;

    /*
     Sets amount of questions on a page to either custom value or amount of questions.
     The example explaining the reason:
      If we set the questions count to 10, and the question per page to 15
      it is obvious we should display only 10 questions on a page.
     */
  questionsPerPage = 1;
  pages = Math.ceil(this.questionsCount / this.questionsPerPage);
  currentPage;
  lastCachedPage;

  states = {
    none: 'none', // Quiz does not yet exist, but its creation was initialized.
    restarted: 'restarted', // Quiz was restarted.
    preStart: 'pre-start', // First screen (instructions etc. - page 0) right before first launch.
    inProgress: 'in-progress',
    finished: 'finished', // End screen displayed.
    reviewing: 'reviewing',
  };
  state = this.states.none; // Current quiz state, depending on its value some actions may be allowed and/or blocked.

  backControl;
  continueControl;
  restartControl;

  questions; // Stores all the questions.
  questionsDetails; // Stores details such as which questions are from which category.

  userAnswers;
  correctAnswers;
  explanations;
  moreInfoUrls;
  reviewRendered;

  /*
    Initialization method, used to start (and restart) the creation of the quiz.
    After setting all the data, executes createQuiz() method.
   */
  init() {
    this.currentPage = 0;
    this.lastCachedPage = 0;

    this.questions = [];
    this.questionsDetails = {};
    this.userAnswers = new Array(this.questionsCount).fill(null);
    this.correctAnswers = [];
    this.explanations = [];
    this.moreInfoUrls = [];
    this.reviewRendered = false;
    Render.init();
    this.createQuiz();
    if (!this.authorShown) {
      console.log('Quiz v. 1.4.0\nAutor: Krzysztof Kosmowski\nhttps://github.com/zaxanq/projekt-quiz');
      this.authorShown = true;
    }
  }


  /*
    Creates and setups quiz.
    Renders instructions.
   */
  createQuiz() {
    this.addAnswerListener();
      // Show quiz instructions only on the first launch.
    if (this.state === this.states.none) {
      Render.instructions(
        this.questionsCount,
        this.categoriesCount,
        this.startQuiz.bind(this)
      );
      this.state = this.states.preStart;
    } else if (this.state === this.states.restarted) {
      this.startQuiz();
    }
  }


  /*
    Removes entire quiz element.
   */
  clearQuiz() {
    this.removeAnswerListener();
    document.body.removeChild(Render.quizElement);
  }


  /*
    Loads (asynchronously) questions of the quiz.
   */
  startQuiz() {
    this.loadQuestions();
  }


  /*
    Hides question pages and controls, instead shows an end screen.
   */
  endQuiz() {
    Base.hide(Render.quizPageElements[this.currentPage]);
    Base.hide(Render.quizControlsElement);
    this.renderEndScreen();
    this.state = this.states.finished;
  }


  /*
    Adds a single event listener on pages wrapper element.
    The input event will be fired on radio input selection and will bubble up (propagate)
     to pages wrapper element, where it will be stopped with event.stopPropagation.
    This is standard Event Delegation technique.
   */
  addAnswerListener() {
    Render.quizPagesWrapperElement.addEventListener('input', this.inputListenerFunction.bind(this));
  }


  /*
    Increases or decreases current page based on boolean input.
    Fires controls validators.

    Additionally accepts a second, optional input - specificPageNumber, most of the time it is skipped.
    Specific page number is relevant when and increase is not passed, and it allows us to set the page
    to a specific page id, instead of changing it to previous or next.
   */
  changePage(increase, specificPageNumber = null, permanentHide = false) {
    if (typeof increase === 'boolean') {
      increase ? this.currentPage++ : this.currentPage--;
      this.renderPage(increase, permanentHide);
    } else {
      if (typeof specificPageNumber === 'number') {
        this.currentPage = specificPageNumber;
        this.renderPage(null, permanentHide);
      }
    }

      // If ProgressBoxes are visible, update them.
    if (Render.progressBoxesVisible) {
      Render.currentBoxes(this.currentPage, this.questionsPerPage, increase);
    }

    this.checkControlsValidity();
  }


  /*
    Enables or disables BackControl and ContinueControl based on number of conditions.
    Additional settings for ContinueControl based on state of the quiz.
   */
  checkControlsValidity() {
    this.disableControl(this.continueControl);
    this.currentPage === 1
      ? this.disableControl(this.backControl)
      : this.enableControl(this.backControl);

    this.checkIfAllPageAnswersAreGiven();

    if (this.state !== this.states.reviewing) {
        // If the state is not reviewing, then if the page is last set the ContinueControl label
        // to Finish, otherwise set it to Continue.
      this.continueControl.textContent = this.currentPage === this.pages ? Text.common.finish : Text.common.continue;
    } else {
      this.continueControl.textContent = Text.common.continue;
        // In reviewing state the ContinueControl should be disabled on the last page.
      this.currentPage === this.pages
        ? this.disableControl(this.continueControl)
        : this.enableControl(this.continueControl);
    }
  }


  /*
    Checks whether all questions on the page are answered. Enables the continue control if so.
    Returns a boolean.
   */
  checkIfAllPageAnswersAreGiven() {
    const start = (this.currentPage - 1) * this.questionsPerPage;
    const end = start + this.questionsPerPage;
    const currentAnswers = this.userAnswers.slice(start, end);

    if (!currentAnswers.includes(null)) {
      this.enableControl(this.continueControl);
    }
    return !currentAnswers.includes(null);
  }


  /*
    If page was already created make it visible. If not, then it has to be created.
    Returns a boolean whether the page is already in DOM (with display: none).
   */
  checkIfPageCached() {
    if (this.lastCachedPage < this.currentPage) {
      this.lastCachedPage = this.currentPage;
      return false;
    }
    return true;
  }


  /*
    Disabled a Control specified in the input.
   */
  disableControl(control) {
    control.disabled = true;
  }


  /*
    Enables a Control specified in the input.
   */
  enableControl(control) {
    control.disabled = false;
  }


  /*
    Calculates scores by each category, giving amount and percentage of correct answers.
    In-depth documentation inside the method due to high level of complexity.

    Returns a result, an object similar to this:
      {
        [category1]: {
          correctAnswers: '1/2',
          percentage: 50%,
        },
        [category2]: {
          correctAnswers: '4/6',
          percentage: 66.67,
        },
        ...
      }
   */
  getScoresByCategory() {
    const result = {};
    const counter = {}; // Counter object, will store counters of each category.

      /*
        Get all categories and set them to 0 inside counter object.
        Right now counter objects looks roughly like this:
          {
            [category1]: 0,
            [category2]: 0,
            ...
          }
       */
    this.categories.forEach(category => counter[category] = 0);

      // For each given answer...
    this.userAnswers.forEach((userAnswer, index) => {
        // If answer is correct
      if (userAnswer === this.correctAnswers[index]) {
          // Go through each category to find the right one.
        for (let j = 0; j < this.categories.length; j++) {
            // If the correctly answered question is in this category...
            // (questions start from 1 and indexes from 0 thus "+ 1" is necessary)
          if (this.questionsDetails[this.categories[j]].includes(index + 1)) {
              // Then increment counter of this category.
            counter[this.categories[j]]++;
              // Finish looking for the right category as it has been found.
            break;
          }
        }
      }
    });

      // Finally, after all of the correct answers were assigned to their category,
      // go through each category and build the result object out of the collected data.
    this.categories.forEach(category => {
      if (this.questionsDetails[category].length) {
        result[category] = {
          correctAnswers: `${ counter[category] }/${ this.questionsDetails[category].length }`,
          percentage: counter[category] / this.questionsDetails[category].length * 100,
        }
      }
    });

    return result;
  }


  /*
    Listener method used on answer inputs.
    Updates progress indicator on event (radio selection).
    Executes a method to verify if all questions on the current page are answered.
   */
  inputListenerFunction(event) {
      // Stops the bubbling of the input event as it is unnecessary in pages wrapper's ancestors.
    event.stopPropagation();

    const questionId = event.target.name.split('-')[1];
    this.userAnswers[questionId - 1] = Number(event.target.id.split('-')[1]);

    if (Render.progressBoxesVisible) this.markProgressBox(questionId);
    else if (Render.progressValueVisible) this.setProgressValue(questionId);

    this.checkIfAllPageAnswersAreGiven();
  }


  /*
    Method responsible for loading and processing questions.
    Setups controls after question processing is finished and proceeds to first page.
    In-depth documentation inside the method due to high level of complexity.
   */
  loadQuestions() {
      // Selected categories counter object.
    const selectedCategories = {};
      // Selected difficulties counter object.
    const selectedDifficulties = {};

    this.categories.forEach(category => {
        // Set counters to 0 for each category.
      selectedCategories[category] = 0;
      selectedDifficulties[category] = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
      };
        // Set an array of questions belonging to the category.
      this.questionsDetails[category] = [];
    });

    /*
      The first step to drawing a question - drawing a category.

      Accepts a single input - a boolean, determining whether the method should check if the limit
      of questions from drawn category is exceeded. This is used to make sure that questions are
      divided equally between each category.
      The exception occurs when the question number is not divisible by categories count:
        E.g. if there are 25 questions and 3 categories, each category will have 8 questions - the limit.
        One last question has to be drawn from a random category, in this case the limit is irrelevant.
     */
    const selectCategory = (checkLimit) => {
      const pickFrom = Math.floor(Math.random() * this.categoriesCount);
      const selectedCategory = this.categories[pickFrom];
        // If (limit is checked and it is not exceeded) or (limit is ignored)...
      if (checkLimit && selectedCategories[selectedCategory] < Math.floor(this.questionsCount / this.categoriesCount) || !checkLimit) {
          // Select the category and increase the selected categories counter.
        selectedCategories[selectedCategory]++;
        return selectedCategory;
      }
        // Else recursively draw another category (Note: this will never happen with checkLimit = false).
      return selectCategory(true);
    };

    /*
      Selects a pseudorandom question out of question array.
      Adds it to the "the.questions" array that includes all of the selected questions.

      The "questions" array (includes all of the possible questions) may have
      a null assigned in place of the selected question, this means
      that this question was already selected and a new number must be drawn.
      The recursion occurs until the question was selected.

      Returns a number - an id of the selected question.
     */
    const selectQuestion = (questions, category, checkLimit) => {
        // Draw a pseudorandom id of the question.
      let selectedQuestionId = Math.floor(Math.random() * Object.keys(questions[category]).length);
      const selectedQuestion = questions[category][selectedQuestionId];

        // Check if the question exists in the questions array...
      if (selectedQuestion && (!checkLimit || canSelectQuestionDifficulty(selectedQuestion.difficulty, category))) {
          // If it does, add it to the "this.questions" array and return its id.
        this.questions.push({
          ...selectedQuestion,
          type: category,
        });

        selectedDifficulties[category][selectedQuestion.difficulty]++;
        return selectedQuestionId;
      }
        // If it doesn't exist, that means the question was already drawn
        // and a new question needs to be drawn by the method executing itself.
      return selectQuestion(questions, category);
    };

    /*
      Returns a boolean informing whether question of specified category and difficult can be selected.
     */
    const canSelectQuestionDifficulty = (difficulty, category) => {
      const difficultyCountLimit = Math.floor(Math.floor(this.questionsCount / this.categoriesCount) / 4);
      return selectedDifficulties[category][difficulty] < difficultyCountLimit;
    };

    /*
      Method that groups category and question selection methods.
      Additionally adds a question's explanation into "this.explanations" array and adds the question id
      into specific category array in "this.questionDetails" for further category-based statistics.
     */
    const getQuestion = (fetchedQuestions, i, checkLimit) => {
      const selectedCategory = selectCategory(checkLimit);
      const selectedQuestion = selectQuestion(fetchedQuestions, selectedCategory, checkLimit);
      this.explanations.push(fetchedQuestions[selectedCategory][selectedQuestion].explanation);
      this.moreInfoUrls.push(fetchedQuestions[selectedCategory][selectedQuestion].moreInfoUrl);
      this.questionsDetails[selectedCategory].push(i);
      return [selectedCategory, selectedQuestion];
    };

    /*
      Fetches a JSON containing all possible questions, with their answers and explanations.
     */
    fetch('questions.json', {
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
    })
        // get data from the response
      .then(res => res.json())
      .then(questions => {
        const questionsToDrawInsideTheLoop = Math.floor(this.questionsCount / this.categoriesCount) * this.categoriesCount;
        const questionsToDrawOutsideTheLoop = this.questionsCount % this.categoriesCount;
        for (let i = 1; i <= questionsToDrawInsideTheLoop; i++) {
            // get required number of questions
          const [selectedCategory, selectedQuestion] = getQuestion(questions, i, true);

            // after each draw, mark current question as taken by setting it to null
          questions[selectedCategory][selectedQuestion] = null;
        }

        if (questionsToDrawOutsideTheLoop) {
          for (let i = 1; i <= questionsToDrawOutsideTheLoop; i++) {
            const [selectedCategory, selectedQuestion] = getQuestion(
              questions,
              questionsToDrawInsideTheLoop+i,
              false
            );
            questions[selectedCategory][selectedQuestion] = null;
          }
        }

        this.setupControls();
        if (this.state === this.states.preStart) {
          this.setNextPage(true);
        } else {
          Render.quizPageElements.push(undefined);
          this.changePage(null, 1);
        }
        this.state = this.states.inProgress;
      });
  }


  /*
    If an answer input was selected mark the ProgressBox representing this question as answered.
    This method will be executed only if ProgressBoxes are visible.
    The input is the number - an id of the answered question.
   */
  markProgressBox(questionId) {
    Base.addClassToId(`progress-box-${ questionId }`, '--answered');
  }

  //TODO: Add documentation
  printScores() {
    Render.disableAnswerRadios();
    Render.markSelectedAnswers(this.userAnswers);
    Render.markCorrectAnswers(this.correctAnswers);
    this.reviewRendered = true;

    Render.printPage(this.getScoresByCategory(), this.categories);
  }


  /*
    Removes EventListener from pages wrapper element.
    Used only once during quiz life cycle - right before quiz element will be removed from the DOM.
   */
  removeAnswerListener() {
    Render.quizPagesWrapperElement.removeEventListener('input', this.inputListenerFunction.bind(this));
  }


  /*
    Method grouping many Render methods responsible for rendering end screen.
    Calculates percentage of correct answers.
   */
  renderEndScreen() {
    const correctAnswersCount = this.userAnswers.filter((answer, index) => answer === this.correctAnswers[index]).length;
    const correctAnswersPercent = correctAnswersCount / this.questionsCount * 100;

    Render.endScreen(this.pages + 1);
    Render.endScreenResult(correctAnswersPercent >= this.requiredPercentToPass);
    Render.endScreenScores(correctAnswersCount, this.questionsCount, correctAnswersPercent);
    Render.endScreenScorePerCategory(this.getScoresByCategory(), this.categories);
    Render.endScreenControls(this.reviewAnswers.bind(this), this.restartQuiz.bind(this), this.printScores.bind(this));
  }


  /*
    Renders a page either by showing the previously hidden page or by rendering a new one.

    Accepts an "next" input - a boolean saying whether a page that will be rendered is:
      the next page (next = true)
      the previous page (next = false)
   */
  renderPage(next, permanentHide) {
    const pageCached = this.checkIfPageCached();

      // If next is a boolean, hide adjacent page.
    if (typeof next === 'boolean') {
      Base.hide(Render.quizPageElements[next ? this.currentPage - 1 : this.currentPage + 1], permanentHide);
      // Else hide all (currently rendered) pages.
    } else {
      if (this.state !== this.states.restarted && this.state !== this.states.reviewing) {
        Render.quizPageElements.forEach(pageElement => Base.hide(pageElement));
      }
    }

    if (!pageCached) {
      Render.page(
          // Get only portion of the questions that will be displayed in the page.
        [...this.questions].splice((this.currentPage - 1) * this.questionsPerPage, this.questionsPerPage),
        this.currentPage,
        this.correctAnswers
      );
    } else {
      Base.show(Render.quizPageElements[this.currentPage]);
    }

      // On each page change scroll the page to the top for a better UX.
    Render.quizPagesWrapperElement.scrollTo(0, 0);
  }


  /*
    Method re-inits the quiz if it is possible in the current state.
    This function can be invoked by clicking the RestartButton in the end-screen state
    or RestartControl in the reviewing state, thus these are the required states.
   */
  restartQuiz() {
    if (this.state === this.states.finished || this.state === this.states.reviewing) {
      this.state = this.states.restarted;
      this.clearQuiz();
      this.init();
    }
  }


  /*
    Method grouping many other methods responsible for rendering a review answers state correctly.
    Each line is pretty self-explanatory so most of them do not require further explanation.
   */
  reviewAnswers() {
    Base.hide(Render.quizEndScreenElement);
    this.state = this.states.reviewing;
    if (!this.reviewRendered) {
      Render.disableAnswerRadios();
      Render.markSelectedAnswers(this.userAnswers);
      Render.markCorrectAnswers(this.correctAnswers);
    }
    Render.explanations(this.explanations, this.moreInfoUrls);
    Base.show(Render.quizControlsElement);
    Base.hide(Render.progressElement); // hide Progress (between BackControl and ContinueControl)
    Base.show(this.restartControl); // show RestartControl instead of Progress
      // make specific-page changePage() call, this is kind of a exception to reuse the method
    this.changePage(null, 1);

  }


  /*
    Executes Render.controls() method to get three buttons used to control the quiz.
    RestartControl is hidden unless in review state.

    Additionally these controls are assigned with a methods on click.
   */
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


  /*
    ContinueControl method, executed on button click.
    Current page is increased assuming:
      * all questions on it are answered,
      * the quiz is created,
      * the quiz is not in the end-screen state.

    Additionally if the page is last and the button is clicked, the quiz is ended.

    This method is also used after this quiz' question have been drawn to set page to quest page 1.
   */
  setNextPage(permanentHide = false) {
    if (
      this.checkIfAllPageAnswersAreGiven()
      && this.state !== this.states.none
      && this.state !== this.states.finished
    ) {
      if (this.currentPage !== this.pages) {
        this.changePage(true, null, permanentHide);
      } else {
        this.endQuiz();
      }
    }
  }


  /*
    BackControl method, executed on button click.
    Current page is decreased assuming:
      * it is not equal to 1,
      * the quiz is created,
      * the quiz is not in the end-screen state.
   */
  setPreviousPage() {
    if (
      this.currentPage !== 1
      && this.state !== this.states.none
      && this.state !== this.states.finished
    ) {
      this.changePage(false);
    }
  }


  /*
    Sets proper progress value in ProgressValue indicator.
    This method is executed only if ProgressValue indicator is displayed.
   */
  setProgressValue() {
    // Count the current progress in percents.
    const answeredQuestionsCount = this.userAnswers.filter(answer => !!answer).length;
    const answeredQuestionsPercent = `${ Math.floor(answeredQuestionsCount / this.questionsCount * 100) }%`;

    // Render current progress in DOM.
    Render.progressTextValue.textContent = answeredQuestionsPercent;
    Render.progressBarValue.style.width = answeredQuestionsPercent;
  }
}


(() => {
  new Quiz().init();
})();

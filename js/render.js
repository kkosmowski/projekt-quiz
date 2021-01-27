import Base from './base.js';
import Text from '../pl.js';

/*
  Responsible for DOM rendering and updating. Stores DOM elements.
  Uses Base class as a helper. Is not invoked by itself, is used as a extension for Quiz class.
 */
export default class Render {
  static quizElement; // Main quiz element.
  static quizPageElements; // Array of Page elements.
  static quizPagesWrapperElement; // Parent element of Page elements.
  static quizInstructionsElement;
  static quizControlsElement;
  static quizEndScreenElement;

  static progressElement; // This is either ProgressBar or ProgressBoxes element depending on what was rendered.
  static progressBarValue;
  static progressTextValue;
  static progressValueVisible; // Boolean flag saying whether ProgressValue was rendered.
  static progressBoxesVisible; // Boolean flag saying whether ProgressBoxes were rendered.

  static deviceIsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  static screenNotSmall = window.innerWidth >= 1000;

  static questionsRenderedCount;

  static resultPassed;
  static resultCorrectAnswersCount;
  static resultCorrectAnswersPercent;
  static resultPerCategory;


  /*
    Initial method, renders fundamental elements and declares default values.
   */
  static init() {
    this.quizPageElements = [];
    this.questionsRenderedCount = 0;
    this.progressValueVisible = false;
    this.progressBoxesVisible = false;
    this.quiz();
    this.header();
    this.pagesWrapper();
  }


  static quiz() {
    this.quizElement = Base.createElement(
      'main',
      document.body,
      'quiz'
    );
  }


  /*
    Creates answer element.
    Requires its id, parent container, and its content.
   */
  static answer(id, container, content) {
    // render label (text)
    const label = Base.createElement('label', container, 'quiz-question__answer');

    // render and setup the input
    const input = Base.createElement('input', label, 'quiz-question__answer-input');
    input.type = 'radio';
    input.name = `question-${ this.questionsRenderedCount }`;
    input.id = `answer-${ id }`;

    // this is appended to label HTML — already containing an input — and it has to be the last.
    // Note: skipDashes is necessary to avoid parsing '--var' into '–var'
    label.innerHTML += `<span>${ Base.parseText(content) }</span>`;
  }


  /*
    Creates and returns BackControl, RestartControl and ContinueControl buttons.
    Invokes indicators() method to create progress indicator between controls.
   */
  static controls(questionsCount, questionsPerPage) {
    this.quizControlsElement = Base.createElement(
      'div',
      this.quizElement,
      ['quiz__controls', 'controls']
    );

    const backControl = Base.createElement(
      'button',
      this.quizControlsElement,
      ['button', 'controls__button--back'],
      Text.common.back
    );
    backControl.type = 'button';

    this.indicators(questionsCount, questionsPerPage);

    const restartControl = Base.createElement(
      'button',
      this.quizControlsElement,
      ['button', 'controls__button--restart'],
      Text.common.restart
    );
    restartControl.type = 'button';

    const continueControl = Base.createElement(
      'button',
      this.quizControlsElement,
      ['button', 'controls__button--continue'],
      Text.common.continue
    );
    continueControl.type = 'button';
    return [backControl, restartControl, continueControl];
  }


  /*
    Re-renders progress boxes.
    In order to do this, current page and questions per page need to be provided.
    Since it is executed after page change, a Boolean information whether the page number
     increased or decreased is required as well. Necessary to unmark the previous boxes.
   */
  static currentBoxes(currentPage, questionsPerPage, increase) {
    // if current page number is 1 and it was increased, it means it is initial execution.
    // in such case there are no "previous" boxes, so their removal should not happen.
    if (!(currentPage === 1 && increase)) {
      const previousFirstBox = (currentPage - (increase ? 2 : 0)) * questionsPerPage + 1;
      const previousLastBox = previousFirstBox + questionsPerPage;

      for (let i = previousFirstBox; i < previousLastBox; i++) {
        Base.removeClassFromId(`progress-box-${ i }`, '--current');
      }
    }

    const firstBox = (currentPage - 1) * questionsPerPage + 1;
    const lastBox = firstBox + questionsPerPage;

    for (let i = firstBox; i < lastBox; i++) {
      Base.addClassToId(`progress-box-${ i }`, '--current');
    }
  }


  /*
    Finds all answer inputs and disables each and one of them.
   */
  static disableAnswerRadios() {
    [...this.quizPagesWrapperElement.querySelectorAll('input.quiz-question__answer-input')].forEach(input => {
      input.disabled = true;
    });
  }


  /*
    Renders an end screen by rendering a new page without any questions.
   */
  static endScreen(currentPage) {
    this.page(null, currentPage, null);
    this.quizEndScreenElement = this.quizPageElements[currentPage];
    this.progressBoxesVisible = false;
    this.progressValueVisible = false;
    Base.addClass(this.quizEndScreenElement, 'end-screen');
  }


  /*
    Renders controls in the end screen - the reviewAnswers and restart buttons.
    Also adds EventListeners with provided functions in input.
    The EventListeners are removed after single click.
   */
  static endScreenControls(reviewAnswersFn, restartFn, printFn) {
    const controlsElement = Base.createElement(
      'div',
      this.quizEndScreenElement,
      ['end-screen__controls'],
    );

    const reviewAnswersButton = Base.createElement(
      'button',
      controlsElement,
      ['end-screen__control--review-answers', 'button'],
      Text.end.reviewAnswers
    );

    // Add a EventListener and immediately remove it after function has been invoked.
    // Follow with specified function.
    reviewAnswersButton.addEventListener('click', function _reviewAnswersFn() {
      reviewAnswersButton.removeEventListener('click', _reviewAnswersFn);
      reviewAnswersFn();
    });

    const restartButton = Base.createElement(
      'button',
      controlsElement,
      ['end-screen__control--restart', 'button'],
      Text.end.tryAgain
    );

    // Add a EventListener and immediately remove it after function has been invoked.
    // Follow with specified function.
    restartButton.addEventListener('click', function _restartFn() {
      restartButton.removeEventListener('click', _restartFn);
      restartFn();
    });

    const printButton = Base.createElement(
      'button',
      controlsElement,
      ['end-screen__control--print', 'button'],
      Text.end.printScore
    );

    // Add a EventListener and immediately remove it after function has been invoked.
    // Follow with specified function.
    printButton.addEventListener('click', function _printFn() {
      printFn();
    });
  }


  /*
    Renders general score in the end screen.
   */
  static endScreenScores(correctAnswersCount, questionsCount, correctAnswersPercent) {
    this.resultCorrectAnswersCount = correctAnswersCount;
    this.resultCorrectAnswersPercent = +(correctAnswersPercent).toFixed(2);
    Base.createElement(
      'p',
      this.quizEndScreenElement,
      ['end-screen__paragraph', 'end-screen__general-score'],
      Base.interpolate(Text.end.generalScoreText, correctAnswersCount, questionsCount, this.resultCorrectAnswersPercent),
      true
    );
  }


  /*
    Renders scores per category in the end screen.
    Displays a table with each category as a new row, containing correct answers count and percentage.
   */
  static endScreenScorePerCategory(scores, categories, parent = this.quizEndScreenElement) {
    this.resultPerCategory = scores;
    let content = `${ Text.end.categoryScoresText }: <table class="end-screen__scores-table">`;
    content += `<tr><th>${ Text.end.category }</th><th>${ Text.end.correctAnswers }</th><th>${ Text.end.percentage }</th></tr>`;

    categories.forEach(category => {
      if (scores[category]) {
        content += `<tr><td>${ Text.categories[category] }</td><td>${ scores[category].correctAnswers }</td><td>${ +(scores[category].percentage || 0).toFixed(2) }%</td></tr>`;
      }
    });

    content += '</table>';

    Base.createElement(
      'p',
      parent,
      ['end-screen__paragraph', 'end-screen__languages-score'],
      content,
      true
    );
  }


  /*
    Renders the result of the quiz in the end screen.
    The result is an icon, either a green tick or red cross visualizing the pass/fail result.
   */
  static endScreenResult(passed) {
    this.resultPassed = passed;
    const graphicResult = Base.createElement(
      'div',
      this.quizEndScreenElement,
      ['end-screen__graphic-result', passed ? '--passed' : '--failed']
    );

    if (passed) {
      graphicResult.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none"/><path d="M16.59 7.58L10 14.17l-3.59-3.58L5 12l5 5 8-8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>';
    } else {
      graphicResult.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
    }

    Base.createElement(
      'h3',
      this.quizEndScreenElement,
      'end-screen__title',
      passed ? Text.end.congrats : Text.end.failed
    );
  }

  /*
    TODO: Add documentation
    TODO: make explanation rendering optional
    TODO: add "more info url" rendering
   */
  static explanations(explanations, moreInfoUrls) {
    explanations.forEach((explanationText, index) => {
      const questionElement = this.quizPagesWrapperElement
        .querySelector(`.quiz-question__answer-input[name="question-${index + 1}"]`).parentElement.parentElement;

      if (explanationText) {
        Base.createElement(
          'div',
          questionElement,
          'explanation',
          `<strong>${ Text.review.explanation }: </strong>` + Base.parseText(explanationText),
          true
        );
      }

      if (moreInfoUrls[index]) {
        Base.createElement(
          'div',
          questionElement,
          'more-info-url',
          `<strong>${ Text.review.moreInfoUrl }: </strong><a href=${ moreInfoUrls[index] } target="_blank">${ moreInfoUrls[index] }</a>`,
          true
        )
      }
    })
  }


  /*
    Creates quiz header, containing title and subtitle.
    TODO: Add Vistula logo with URL to Vistula website.
   */
  static header() {
    const quizHeader = Base.createElement(
      'header',
      this.quizElement,
      ['quiz__header', 'header']
    );

    const titleContainer = Base.createElement(
      'hgroup',
      quizHeader,
      'header__title-container'
    );

    Base.createElement(
      'h1',
      titleContainer,
      'header__title',
      Text.common.quiz
    );

    Base.createElement(
      'h2',
      titleContainer,
      'header__subtitle',
      Text.common.htmlCssAndJs
    );

    const logoLink = Base.createElement(
      'a',
      quizHeader,
      'header__logo-container'
    );
    logoLink.href = '//www.vistula.edu.pl/';
    logoLink.target = '_blank';
    logoLink.tabIndex = '-1';

    const logo = Base.createElement(
      'img',
      logoLink,
      'header__logo',
    );
    const logoText = 'Akademia Finansów i Biznesu Vistula';
    logo.src = './afib-icon.png';
    logo.alt = logoText;
    logo.title = logoText;
  }


  /*
    Creates progress indicator depending on the screen size and device.
    If browser suggests it's not mobile device and screen size is large enough,
     a progress boxes will be rendered, allowing the track of answered questions and current page.
    If either it is a mobile device or the screen size is not large enough,
     a progress percent will be rendered instead, allowing only the track of answered questions.
   */
  static indicators(questionsCount, questionsPerPage) {
    if (!this.deviceIsMobile && this.screenNotSmall) {
      this.progressElement = Base.createElement(
        'div',
        this.quizControlsElement,
        'controls__progress'
      );

      for (let i = 1; i <= questionsCount; i++) {
        const progressBox = Base.createElement(
          'div',
          this.progressElement,
          'controls__progress-box'
        );
        progressBox.id = `progress-box-${ i }`;

        if (i <= questionsPerPage) {
          Base.addClass(progressBox, '--current');
        }
      }

      this.progressBoxesVisible = true;
    } else {
      this.progressElement = Base.createElement(
        'div',
        this.quizControlsElement,
        'controls__progress-bar'
      );

      this.progressBarValue = Base.createElement(
        'div',
        this.progressElement,
        'controls__progress-value'
      );

      this.progressTextValue = Base.createElement(
        'span',
        this.progressElement,
        'controls__progress-text',
        '0%'
      );

      this.progressValueVisible = true;
    }
  }


  /*
    Creates instructions start screen (page 0).
    It is necessary to pass questionsCount, questionsPerCategoryCount to add these values to instructions content.
    The last argument is startQuizFn which has to be a function, invoked on start button click.
   */
  static instructions(questionsCount, categoriesCount, startQuizFn) {
    const questionsPerCategoryCount = Math.floor(questionsCount / categoriesCount);
    const additionalQuestionsCount = questionsCount % categoriesCount;
    let instructions = Text.start.instructions.purpose;

    instructions += Base.interpolate(Text.start.instructions.questionCount, questionsCount, questionsPerCategoryCount);

    if (additionalQuestionsCount) {
      instructions += Base.interpolate(Text.start.instructions.additionalQuestionCount, additionalQuestionsCount);
    }

    instructions += Base.interpolate(Text.start.instructions.questionsDivided, Math.floor(questionsPerCategoryCount / 4));

    if (additionalQuestionsCount === 1) {
      instructions += Text.start.instructions.additionalDividedSingleQuestion;
    } else if (additionalQuestionsCount > 1) {
      instructions += Base.interpolate(
        Text.start.instructions.additionalDividedMultipleQuestion,
        additionalQuestionsCount
      );
    }

    instructions += Text.start.instructions.rest;

    this.quizPageElements.push(
      Base.createElement(
        'div',
        this.quizPagesWrapperElement,
        'quiz__questions'
      )
    );

    this.quizInstructionsElement = Base.createElement(
      'section',
      this.quizPageElements[0],
      ['quiz__instructions', 'instructions']
    );

    Base.createElement(
      'h3',
      this.quizInstructionsElement,
      'instructions__title',
      Text.start.beforeYouStart
    );

    Base.createElement(
      'p',
      this.quizInstructionsElement,
      'instructions__content',
      instructions,
      true
    );

    const startButton = Base.createElement(
      'button',
      this.quizInstructionsElement,
      ['quiz__start-button', 'button'],
      Text.start.begin
    );

    startButton.type = 'button';
    // TODO: remove EL after event is fired
    startButton.addEventListener('click', () => startQuizFn());
  }


  /*
    Marks specified answers with specified css class or classes.
    Input: An array of answers, a single string className or an array of string classNames.
   */
  static markAnswers(answers, className) {
    answers.forEach((answer, index) => {
      this.quizPagesWrapperElement
          // Identification of answer happens on input...
        .querySelector(`.quiz-question__answer-input[name="question-${index + 1}"][id="answer-${answer}"]`)
          // But we want to add the class to its parent element, to mark both input and its text value.
        .parentElement
        .classList.add(className)
    })
  }


  /*
    Uses markAnswer to mark specified (correct) answers as correct.
   */
  static markCorrectAnswers(correctAnswers) {
    this.markAnswers(correctAnswers, 'answer--correct');
  }


  /*
    Uses markAnswer to mark specified (user given) answers as selected.
   */
  static markSelectedAnswers(selectedAnswers) {
    this.markAnswers(selectedAnswers, 'answer--selected');
  }


  /*
    Renders page with questions.
    Arguments: questionsToRender (an array of questions), current page id and correctAnswers.
    Note: correctAnswers aren't used in this method, but they are necessary in this.question().
   */
  static page(questionsToRender, currentPage, correctAnswers) {
    this.quizPageElements.push(
      Base.createElement(
        'div',
        this.quizPagesWrapperElement,
        'quiz__page'
      )
    );

    if (questionsToRender) {
      questionsToRender.forEach(question => {
        this.questionsRenderedCount++;
        this.question(
          this.quizPageElements[currentPage],
          question.type,
          Base.parseText(question.question),
          question.answers,
          correctAnswers
        );
      });
    }
  }


  /*
    Creates a parent element for all of the page elements.
   */
  static pagesWrapper() {
    this.quizPagesWrapperElement = Base.createElement(
      'div',
      this.quizElement,
      ['quiz__pages']
    );
  }


  /*
    Creates a question element and invokes creation of answers.
    Question element requires a answersContainer, a parent element of answer elements.
   */
  static question(parentElement, type, content, answers, correctAnswers) {
    // Create and identify question element
    const quizQuestion = Base.createElement(
      'section',
      parentElement,
      ['quiz__question', 'quiz-question', `--${ type }`]
    );
    quizQuestion.id = `question-${ this.questionsRenderedCount }`;

    // Render question content
    const question = Base.createElement('h3', quizQuestion, 'quiz-question__question');
    Base.createElement(
      'span',
      question,
      'quiz-question__label',
      `${ Text.common.question } ${ this.questionsRenderedCount }: `
    );
    Base.createElement('span', question, null, content, true);

    // Create answers container
    const answersContainer = Base.createElement('div', quizQuestion, 'quiz-question__answers-container');

    // Proceed rendering 4 answers in a random order
    const answerPositions = this.randomizeAnswerPositions([1, 2, 3, 4]);
    correctAnswers.push(answerPositions.indexOf(1) + 1);
    for (let i = 1; i <= 4; i++) {
      const j = answerPositions[i - 1];
      this.answer(i, answersContainer, answers[j - 1]);
    }
  }


  /*
    Input is an array (of position ids).
    Output is the shuffled array of same position ids.
    Example:
      [1,2,3,4]  =>  [4,1,3,2] etc.
   */
  static randomizeAnswerPositions(positions) {
    let currentLength = positions.length;
    let temp;
    let random;

    while (0 !== currentLength) { // assuming received array is of length n:
      // generate random number from 0 to n-1 and decrease n
      random = Math.floor(Math.random() * currentLength);
      currentLength--;

      // switch nth array item with random id
      temp = positions[currentLength];
      positions[currentLength] = positions[random];
      positions[random] = temp;
    }
    return positions;
  }

  static printPage(scores, categories) {
    const printPageScoreGeneralPercentage = 'Uzyskałeś(aś) <strong>' + this.resultCorrectAnswersPercent + '%</strong> z testu z wiedzy HTML, CSS, Javascript.';
    const printPageScoreGeneralCount = 'W wyniku poprawnej odpowiedzi na <strong>' + this.resultCorrectAnswersCount + '</strong> z <strong>' + this.questionsRenderedCount + '</strong> pytań.';

    const printPage = Base.createElement(
      'section',
      this.quizPagesWrapperElement,
      'print-page',
      '',
      false,
      true
    );

    Base.createElement(
      'h2',
      printPage,
      'print-page__title',
      Text.printPage.certificate
    );

    Base.createElement(
        'p',
      printPage,
      ['print-page__score', 'print-page__score--general-percentage'],
      printPageScoreGeneralPercentage,
      true
    );

    Base.createElement(
        'p',
      printPage,
      ['print-page__score', 'print-page__score--general-count'],
      printPageScoreGeneralCount,
      true
    );

    Render.endScreenScorePerCategory(scores, categories, printPage);

    Base.createElement(
        'p',
      printPage,
      'print-page__your-answers',
      'Twoje odpowiedzi:'
    );

    Base.addClass(Render.quizElement, 'print');
    Render.quizPageElements.forEach(element => Base.show(element));
    Base.hide(Render.quizEndScreenElement);

    html2pdf(document.body);

    Base.hide(printPage);
    Base.removeClass(Render.quizElement, 'print');
    Render.quizPageElements.forEach(element => Base.hide(element));
    Base.show(Render.quizEndScreenElement);
  }
}

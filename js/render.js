import Base from './base.js';

export default class Render {
  static quizElement;
  static quizPageElements = [];
  static quizPagesWrapperElement;
  static quizInstructionsElement;
  static quizControlsElement;
  static quizEndScreenElement;

  static progressBarValue;
  static progressTextValue;
  static progressValueVisible = false;
  static progressBoxesVisible = false;

  static deviceIsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  static screenNotSmall = window.innerWidth >= 1000;

  static questionsRenderedCount = 0;


  /*
    Initial method, renders fundamental elements.
   */
  static init() {
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
      'Quiz'
    );

    Base.createElement(
      'h2',
      titleContainer,
      'header__subtitle',
      'HTML, CSS i JS'
    );
  }


  static pagesWrapper() {
    this.quizPagesWrapperElement = Base.createElement(
      'div',
      this.quizElement,
      ['quiz__pages']
    );
  }


  /*
    Creates instructions start screen (page 0).
    It is necessary to pass questionsCount, questionsPerCategoryCount to add these values to instructions content.
    The last argument is startQuizFn which has to be a function, invoked on start button click.
   */
  static instructions(questionsCount, questionsPerCategoryCount, startQuizFn) {
    const instructions = `Celem quizu jest sprawdzenie Twojej wiedzy z zakresu języków HTML, CSS i Javascript.\n\nQuiz składa się z <em>${ questionsCount } pytań</em> - po ${ questionsPerCategoryCount } z każdej kategorii i jedno dodatkowe, z losowej kategorii.\n\nPytania podzielone są na <em>cztery stopnie trudności</em> - po 2 z każdego. Ostatnie - dwudzieste piąte - pytanie będzie zawsze o stopniu trudności 3.\n\nKażde pytanie oznaczone jest kategorią z lewej strony.\n\nPytania są losowane z większej puli, a więc dwa podejścia do quizu będą skutkowały innymi pytaniami oraz w innej kolejności. Odpowiedzi również mogą być w innej kolejności.\n\nNie ma limitu czasowego.\n\nPowodzenia!`;

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
      'Zanim zaczniesz'
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
      'Rozpocznij'
    );

    startButton.type = 'button';
    // TODO: remove EL after event is fired
    startButton.addEventListener('click', () => startQuizFn());
  }


  /*
    Renders page with question(s).
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
    Creates and returns back and continue controls.
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
      'Cofnij'
    );
    backControl.type = 'button';

    this.indicators(questionsCount, questionsPerPage);

    const continueControl = Base.createElement(
      'button',
      this.quizControlsElement,
      ['button', 'controls__button--continue'],
      'Kontynuuj'
    );
    continueControl.type = 'button';
    return [backControl, continueControl];
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
      const progress = Base.createElement(
        'div',
        this.quizControlsElement,
        'controls__progress'
      );

      for (let i = 1; i <= questionsCount; i++) {
        const progressBox = Base.createElement(
          'div',
          progress,
          'controls__progress-box'
        );
        progressBox.id = `progress-box-${ i }`;

        if (i <= questionsPerPage) {
          Base.addClass(progressBox, '--current');
        }
      }

      this.progressBoxesVisible = true;
    } else {
      const progressBar = Base.createElement(
        'div', this.quizControlsElement,
        'controls__progress-bar'
      );

      this.progressBarValue = Base.createElement(
        'div', progressBar,
        'controls__progress-value'
      );

      this.progressTextValue = Base.createElement(
        'span', progressBar,
        'controls__progress-text',
        '0%'
      );

      this.progressValueVisible = true;
    }
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
    Base.createElement('span', question, 'quiz-question__label', `Pytanie ${ this.questionsRenderedCount }: `);
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
    label.innerHTML += `<span>${ Base.parseText(content) }</span>`;
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

  // TODO: add definition if necessary
  static endScreen(currentPage) {
    this.page(null, currentPage, null);
    this.quizEndScreenElement = this.quizPageElements[currentPage];
    Base.addClass(this.quizEndScreenElement, 'end-screen');
  }

  // TODO: add definition if necessary
  static endScreenScores(correctAnswersCount, questionsCount, correctAnswersPercent) {
    Base.createElement(
      'p',
      this.quizEndScreenElement,
      ['end-screen__paragraph', 'end-screen__general-score'],
      `Odpowiedziałeś(aś) poprawnie na ${ correctAnswersCount } z ${ questionsCount } odpowiedzi.\nDaje to wynik <em>${ correctAnswersPercent + '%' }</em>!`,
      true
    );
  }

  // TODO: add definition if necessary
  static endScreenScorePerLanguage(scores) {
    Base.createElement(
      'p',
      this.quizEndScreenElement,
      ['end-screen__paragraph', 'end-screen__languages-score'],
      `Wyniki w poszczególnych językach: <ul class="end-screen__language-scores"><li>HTML: ${scores.html.correctAnswers} (${scores.html.percent})</li><li>CSS: ${scores.css.correctAnswers} (${scores.css.percent})</li><li>Javascript: ${scores.javascript.correctAnswers} (${scores.javascript.percent})</li></ul>`,
      true
    );
  }

  // TODO: add definition if necessary
  static endScreenResult(passed) {
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

    Base.createElement('h3', this.quizEndScreenElement, ['end-screen__title'], passed ? 'Brawo!' : ':(');
  }
}

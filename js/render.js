import Base from './base.js';

export default class Render {
  static quizElement;
  static quizPageElements = [];
  static quizPagesWrapperElement;
  static quizInstructionsElement;
  static quizControlsElement;

  static progressBarValue;
  static progressTextValue;
  static progressValueVisible = false;
  static progressBoxesVisible = false;

  static deviceIsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  static screenNotSmall = window.innerWidth >= 1000;

  static answerLetters = ['a', 'b', 'c', 'd'];

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
    this.quizElement = Base.createElement('main', document.body, ['quiz']);
  }


  /*
    Creates quiz header, containing title and subtitle.
    TODO: Add Vistula logo with URL to Vistula website.
   */
  static header() {
    const quizHeader = Base.createElement('header', this.quizElement, ['quiz__header', 'header']);
    const titleContainer = Base.createElement('hgroup', quizHeader, ['header__title-container']);
    Base.createElement('h1', titleContainer, ['header__title'], 'Quiz');
    Base.createElement('h2', titleContainer, ['header__subtitle'], 'HTML, CSS i JS');
  }


  static pagesWrapper() {
    this.quizPagesWrapperElement = Base.createElement('div', this.quizElement, ['quiz__pages']);
  }


  /*
    Creates instructions start screen (page 0).
    It is necessary to pass questionsCount, questionsPerCategoryCount to add these values to instructions content.
    The last argument is startQuizFn which has to be a function, invoked on start button click.
   */
  static instructions(questionsCount, questionsPerCategoryCount, startQuizFn) {
    const instructions = `Celem quizu jest sprawdzenie Twojej wiedzy z zakresu języków HTML, CSS i Javascript.\n\nQuiz składa się z <em>${questionsCount} pytań</em> - po ${questionsPerCategoryCount} z każdej kategorii i jedno dodatkowe, z losowej kategorii.\n\nPytania podzielone są na <em>cztery stopnie trudności</em> - po 2 z każdego. Ostatnie - dwudzieste piąte - pytanie będzie zawsze o stopniu trudności 3.\n\nKażde pytanie oznaczone jest kategorią z lewej strony.\n\nPytania są losowane z większej puli, a więc dwa podejścia do quizu będą skutkowały innymi pytaniami oraz w innej kolejności. Odpowiedzi również mogą być w innej kolejności.\n\nNie ma limitu czasowego.\n\nPowodzenia!`;

    this.quizPageElements.push(Base.createElement('div', this.quizPagesWrapperElement, ['quiz__questions']));
    this.quizInstructionsElement = Base.createElement('section', this.quizPageElements[0], ['quiz__instructions']);
    Base.createElement('h3', this.quizInstructionsElement, ['quiz__instructions-title'], 'Zanim zaczniesz');
    Base.createElement('p', this.quizInstructionsElement, ['quiz__instructions-content'], instructions, true);

    const startButton = Base.createElement('button', this.quizInstructionsElement, ['quiz__start-button', 'button'], 'Rozpocznij');
    startButton.type = 'button';
    // TODO: remove EL after event is fired
    startButton.addEventListener('click', () => startQuizFn());
  }


  /*
    Renders page with question(s).
    Arguments — questionsToRender (an array of questions), currentPage id and correctAnswers.
    Note: correctAnswers aren't used in this method, but they are necessary in this.question().
   */
  static page(questionsToRender, currentPage, correctAnswers) {
    this.quizPageElements.push(Base.createElement('div', this.quizPagesWrapperElement, ['quiz__questions']));
    questionsToRender.forEach(question => {
      this.questionsRenderedCount++;
      this.question(this.quizPageElements[currentPage], question.type, Base.parseText(question.question), question.answers, correctAnswers);
    });
  }


  /*
    Creates and returns back and continue controls.
    Invokes indicators() method to create progress indicator between controls.
   */
  static controls(questionsCount, questionsPerPage) {
    this.quizControlsElement = Base.createElement('div', this.quizElement, ['quiz__controls', 'controls']);

    const backControl = Base.createElement('button', this.quizControlsElement, ['button', 'controls__button--back'], 'Cofnij');
    backControl.type = 'button';

    this.indicators(questionsCount, questionsPerPage);

    const continueControl = Base.createElement('button', this.quizControlsElement, ['button', 'controls__button--continue'], 'Kontynuuj');
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
      const progress = Base.createElement('div', this.quizControlsElement, ['controls__progress']);
      for (let i = 1; i <= questionsCount; i++) {
        const progressBox = Base.createElement('div', progress, ['controls__progress-box']);
        progressBox.id = `progress-box-${i}`;

        if (i <= questionsPerPage) {
          Base.addClass(progressBox, '--current');
        }
      }

      this.progressBoxesVisible = true;
    } else {
      const progressBar = Base.createElement('div', this.quizControlsElement, ['controls__progress-bar']);
      this.progressBarValue = Base.createElement('div', progressBar, ['controls__progress-value']);
      this.progressTextValue = Base.createElement('span',progressBar, ['controls__progress-text'], '0%');

      this.progressValueVisible = true;
    }
  }


  /*
    Creates a question element and invokes creation of answers.
    Question element requires a answersContainer, a parent element of answer elements.
   */
  static question(parentElement, type, content, answers, correctAnswers) {
    // Create and identify question element
    const quizQuestion = Base.createElement('section', parentElement, ['quiz__question', 'quiz-question', `--${ type }`]);
    quizQuestion.id = `question-${ this.questionsRenderedCount }`;

    // Render question content
    const question = Base.createElement('h3', quizQuestion, ['quiz-question__question']);
    Base.createElement('span', question, ['quiz-question__label'], `Pytanie ${ this.questionsRenderedCount }: `);
    Base.createElement('span', question, [], content, true);

    // Create answers container
    const answersContainer = Base.createElement('div', quizQuestion, ['quiz-question__answers-container']);

    // Proceed rendering 4 answers in a random order
    const answerPositions = this.randomizeAnswerPositions([1,2,3,4]);
    correctAnswers.push(answerPositions.indexOf(1) + 1);
    for (let i = 1; i <= 4; i++) {
      const j = answerPositions[i - 1];
      this.answer(j, answersContainer, this.answerLetters[i - 1], Base.parseText(answers[j - 1]));
    }
  }


  static answer(id, container, value, content) {
    const label = Base.createElement('label', container, ['quiz-question__answer']);

    const input = Base.createElement('input', label, ['quiz-question__answer-input']);
    input.type = 'radio';
    input.value = value;
    input.name = `question-${ this.questionsRenderedCount }`;
    input.id = `answer-${id}`;

    label.innerHTML += `<span>${content}</span>`;
  }


  static currentBoxes(currentPage, questionsPerPage, increase) {
    const previousStart = (currentPage - (increase ? 2 : 0)) * questionsPerPage + 1;
    const previousEnd = previousStart + questionsPerPage;

    const start = (currentPage - 1) * questionsPerPage + 1;
    const end = start + questionsPerPage;

    for (let i = previousStart; i < previousEnd; i++) {
      Base.removeClassFromId(`progress-box-${i}`, '--current');
    }

    for (let i = start; i < end; i++) {
      Base.addClassToId(`progress-box-${i}`, '--current');
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
}

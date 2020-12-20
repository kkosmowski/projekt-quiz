import Base from './base.js';

export default class Render {
  static quizElement;
  static quizPageElements = [];
  static quizPagesWrapperElement;
  static quizInstructionsElement;

  static progressBarValue;
  static progressTextValue;
  static progressValueVisible = false;
  static progressBoxesVisible = false;

  static deviceIsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  static screenNotSmall = window.innerWidth >= 1000;

  static answerLetters = ['a', 'b', 'c', 'd'];

  static questionsRenderedCount = 0;

  static init() {
    this.quiz();
    this.header();
    this.pagesWrapper();
  }


  static quiz() {
    this.quizElement = Base.createElement('main', document.body, ['quiz']);
  }


  static header() {
    const quizHeader = Base.createElement('header', this.quizElement, ['quiz__header', 'header']);
    const titleContainer = Base.createElement('hgroup', quizHeader, ['header__title-container']);
    Base.createElement('h1', titleContainer, ['header__title'], 'Quiz');
    Base.createElement('h2', titleContainer, ['header__subtitle'], 'HTML, CSS i JS');
  }


  static pagesWrapper() {
    this.quizPagesWrapperElement = Base.createElement('div', this.quizElement, ['quiz__pages']);
  }


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


  static page(questionsToRender, currentPage, correctAnswers) {
    this.quizPageElements.push(Base.createElement('div', this.quizPagesWrapperElement, ['quiz__questions']));
    questionsToRender.forEach(question => {
      this.questionsRenderedCount++;
      this.question(this.quizPageElements[currentPage], question.type, Base.parseText(question.question), question.answers, correctAnswers);
    });
  }


  static controls(questionsCount, questionsPerPage) {
    const controlsElement = Base.createElement('div', this.quizElement, ['quiz__controls', 'controls']);

    const backControl = Base.createElement('button', controlsElement, ['button', 'controls__button--back'], 'Cofnij');
    backControl.type = 'button';

    if (!this.deviceIsMobile && this.screenNotSmall) {
      const progress = Base.createElement('div', controlsElement, ['controls__progress']);
      for (let i = 1; i <= questionsCount; i++) {
        const progressBox = Base.createElement('div', progress, ['controls__progress-box']);
        progressBox.id = `progress-box-${i}`;

        if (i <= questionsPerPage) {
          progressBox.classList.add('--current');
        }
      }

      this.progressBoxesVisible = true;
    } else {
      const progressBar = Base.createElement('div', controlsElement, ['controls__progress-bar']);
      this.progressBarValue = Base.createElement('div', progressBar, ['controls__progress-value']);
      this.progressTextValue = Base.createElement('span',progressBar, ['controls__progress-text'], '0%');

      this.progressValueVisible = true;
    }

    const continueControl = Base.createElement('button', controlsElement, ['button', 'controls__button--continue'], 'Kontynuuj');
    continueControl.type = 'button';
    return [backControl, continueControl];
  }


  static question(parentElement, type, content, answers, correctAnswers) {
    const quizQuestion = Base.createElement('section', parentElement, ['quiz__question', 'quiz-question', `--${ type }`]);
    quizQuestion.id = `question-${ this.questionsRenderedCount }`;

    const question = Base.createElement('h3', quizQuestion, ['quiz-question__question']);
    Base.createElement('span', question, ['quiz-question__label'], `Pytanie ${ this.questionsRenderedCount }: `);
    Base.createElement('span', question, [], content, true);

    const answersContainer = Base.createElement('div', quizQuestion, ['quiz-question__answers-container']);

    const answerPositions = this.randomizeAnswerPositions(new Array(4).fill(null).map((element, index) => index + 1));
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


  static currentBoxes(currentPage, questionsPerPage) {
    const start = (currentPage - 1) * questionsPerPage + 1;
    const end = start + questionsPerPage;

    document.querySelectorAll('.controls__progress-box').forEach(
      box => box.classList.remove('--current')
    );

    for (let i = start; i < end; i++) {
      document.getElementById(`progress-box-${i}`).classList.add('--current');
    }
  }


  static randomizeAnswerPositions(positions) {
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
}

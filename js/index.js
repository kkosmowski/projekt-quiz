class Quiz {
  quizElement;
  quizQuestionsWrapper;
  data = test;

  init() {
    this.createQuiz();
    this.createQuestion(1);
  }

  createQuiz() {
    this.quizElement = this.createElement('main', document.body, ['quiz']);
    this.renderQuizHeader();
    this.quizQuestionsWrapper = this.createElement('div', this.quizElement, ['quiz__questions']);

    let i = 1;
    this.data.HTML.forEach(question => {
      this.renderQuestion(i, 'html', this.parseText(question.question), question.answers);
      i++;
    });
    this.data.CSS.forEach(question => {
      this.renderQuestion(i, 'css',this.parseText(question.question), question.answers);
      i++;
    });
  }

  renderQuizHeader() {
    const quizHeader = this.createElement('header', this.quizElement, ['quiz__header', 'header']);
    const titleContainer = this.createElement('hgroup', quizHeader, ['header__title-container']);
    this.createElement('h1', titleContainer, ['header__title'], 'Quiz');
    this.createElement('h2', titleContainer, ['header__subtitle'], 'HTML, CSS i JS');
  }

  createQuestion(id) {
    this.renderQuestion(id, 'html', 'Lorem ipsum, dolor sit amet?', ['answer 1', 'answer 2', 'answer 3', 'answer 4']);
    this.renderQuestion(id+1, 'css', 'Lorem ipsum, dolor sit amet?', ['answer 1', 'answer 2', 'answer 3', 'answer 4']);
    this.renderQuestion(id+2, 'js', 'Lorem ipsum, dolor sit amet?', ['answer 1', 'answer 2', 'answer 3', 'answer 4']);
  }

  // helper methods
  parseText(string) {
    return string.replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('[[', '<code>').replaceAll(']]', '</code>');
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
    const quizQuestion = this.createElement('section', this.quizQuestionsWrapper, ['quiz__question', 'quiz-question', `--${type}`]);
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
    label.htmlFor = `answer-${id}`;

    const input = this.createElement('input', label, ['quiz-question__answer-input']);
    input.type = 'radio';
    input.value = value;
    input.name = `question-${questionId}`;
    input.id = `answer-${id}`;

    label.innerHTML += content;
  }
}

const test = {
  "HTML": [
    {
      "question": "Czym różni się [[<span>]] od [[<p>]]?",
      "difficulty": 2,
      "answers": [
        "[[<span>]] to generyczny element [[inline]] bez wartości semantycznej, podczas gdy [[<p>]] to paragraf.",
        "[[<span>]] to generyczny element [[block]], podczas gdy [[<p>]] to generyczny element [[inline-block]]",
        "[[<p>]] i [[<span>]] służą do tego samego, różnią się jedynie stylami.",
        "[[<p>]] to element grupujący elementy [[<span>]]."
      ],
      "explanation": "[[<span>]] to generyczny element [[inline]] którym zawsze powinniśmy oplatać tekst (chyba, że ten jest już zawarty w innym elemencie)."
    }
  ],
  "CSS": [
    {
      "question": "Jaki kolory będą miały elementy?\n[[.parent > * {\ncolor: beige;\n}\n.item-1 {\ncolor: steelblue !important;\n}\n.parent span {\ncolor: coral;\n}\n.parent > .item-3 {\ncolor: darkslateblue;\n}\n.parent #item-3 {\ncolor: hotpink;\n}\n.parent .item-1,\n.parent .item-2 {\ncolor: chocolate;\n}]]\n[[<p class=\"parent\">\n  <span id=\"item-1\" class=\"item-1\" data-name=\"item-1\">Item 1</span>\n  <span id=\"item-2\" class=\"item-2\" data-name=\"item-2\" style=\"color: greenyellow\">Item 2</span>\n  <span id=\"item-3\" class=\"item-3\" data-name=\"item-3\">Item 3</span>\n</p>]]",
      "difficulty": 3,
      "answers": [
        "Kolejno: [[steelblue]], [[limegreen]] i [[hotpink]].",
        "Kolejno: [[chocolate]], [[limegreen]] i [[darkslateblue]].",
        "Kolejno: [[chocolate]], [[chocolate]] i [[darkslateblue]].",
        "Kolejno: [[steelblue]], [[chocolate]] i [[hotpink]]."
      ],
      "explanation": "Pierwszy [[<span>]] będzie o kolorze [[steelblue]] ponieważ reguła [[!important]] jest ponad wszystkimi innymi regułami. Następny element będzie w kolorze [[limegreen]] ponieważ [[specificity]] styli [[inline]] jest najwyższym możliwym. Ostatni element będzie w kolorze [[hotpink]] ponieważ selektor id ma większe specificity niż jakiekolwiek kombinacje selektorów klas."
    }
  ]
};

(() => {
  new Quiz().init();
})();

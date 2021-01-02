const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const image = Array.from(document.getElementsByClassName("image"))[0];
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("score");
const progressBarFull = document.getElementById("progressBarFull");
const loader = document.getElementById("loader");
const game = document.getElementById("game");


let currentQuestion = {};
let acceptingAnswers = false; 
let score = 0; 
let questionCounter = 0;
let availableQuestions = [];

var questionIndex = Math.floor(Math.random() * 71)*80;
const bad = "https://isic-archive.com/api/v1/image?limit=80&offset=" + questionIndex + "&sort=name&sortdir=1&detail=false&filter=%7B%22operator%22%3A%22in%22%2C%22operands%22%3A%5B%7B%22identifier%22%3A%22meta.clinical.benign_malignant%22%2C%22type%22%3A%22string%22%7D%2C%5B%22malignant%22%5D%5D%7D&uid=1609555750696"
var questionIndex = Math.floor(Math.random() * 667)*80;
const good = "https://isic-archive.com/api/v1/image?limit=80&offset=" + questionIndex + "&sort=name&sortdir=1&detail=false&filter=%7B%22operator%22%3A%22in%22%2C%22operands%22%3A%5B%7B%22identifier%22%3A%22meta.clinical.benign_malignant%22%2C%22type%22%3A%22string%22%7D%2C%5B%22benign%22%5D%5D%7D&uid=1609555750696"
const proxyurl = "https://cors-anywhere.herokuapp.com/";

function get_questions(url, right_answer_index) {
  return fetch(proxyurl + good)
  .then(res => {
    return res.json();
  })
  .then(loadedQuestions => {
    console.log(loadedQuestions);
    new_questions = loadedQuestions.map( loadedQuestion => {
      const formattedQuestion = {
        question: "Benign or malignant?",
        image: "https://isic-archive.com/api/v1/image/" + loadedQuestion["_id"] +"/thumbnail?height=553&width=1000"
      };

      const answerChoices = ["Benign","Malignant"];
      formattedQuestion.answer = right_answer_index;
      answerChoices.forEach((choice, index) => {
        formattedQuestion["choice" + (index + 1)] = choice;
      })
      return formattedQuestion;
    });
    return new_questions;
  })
  .catch(err => {
    console.error(err);
  });
}

bad_questions = get_questions(good, 1);
good_questions = get_questions(bad, 2);
bad_questions.then((results_bad) => {
  good_questions.then((results_good) => {
    questions = results_good.concat(results_bad);
    startGame();
  })
})

// CONSTANTS 
const CORRECT_BONUS = 10; 
const MAX_QUESITONS = 10; 

startGame = () => {
    questionCounter = 0;
    score = 0; 
    availableQuestions = [...questions];
    getNewQuestion();
    game.classList.remove("hidden");
    loader.classList.add("hidden");
};

getNewQuestion = () => {

    if (availableQuestions.length === 0 || questionCounter >= MAX_QUESITONS){
      localStorage.setItem('mostRecentScore', score);
      // Go to the final page 
      return(window.location.assign('end.html'));
    }
    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${MAX_QUESITONS}`;

    // Update the progress bar
    progressBarFull.style.width = `${(questionCounter / MAX_QUESITONS) * 100}%`;

    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
    question.innerText = currentQuestion.question;

    choices.forEach( choice => {
        const number = choice.dataset["number"];
        choice.innerText = currentQuestion["choice" + number];
    });

    image.src = currentQuestion.image

    availableQuestions.splice(questionIndex, 1);

    acceptingAnswers = true;
};

choices.forEach(choice => {
  choice.addEventListener('click', e => {
    if (!acceptingAnswers) return;

    acceptingAnswers = false;
    const selectedChoice = e.target;
    const selectedAnswer = selectedChoice.dataset['number'];

    const classToApply = selectedAnswer == currentQuestion.answer ? 'correct' : 'incorrect';

    if (classToApply == 'correct'){
      incrementScore(CORRECT_BONUS);
    }

    // Adds a class to the element
    selectedChoice.parentElement.classList.add(classToApply);
    
    setTimeout( () => {
      selectedChoice.parentElement.classList.remove(classToApply);
      getNewQuestion();
    }, 1000);
    
  });
});

incrementScore = num => {
  score += num;
  scoreText.innerText = score;
};
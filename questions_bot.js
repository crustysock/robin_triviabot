SCORE_ORDER_TABLE = [3, 2, 1];
BASE_SCORE = 1;

MAX_MESSAGE_LENGTH = 140;
TIME_PER_QUESTION = 24000;
TIME_PER_BREAK = 14000;

QUESTIONS_PER_SCORE_DISPLAY = 8;
NUM_SCORES_TO_DISPLAY = 15;

SAVE_STRING = "robin-quiz-scores";

_q = []
_question_num = 0

scores = { }
function loadScores() {
  var scoresText = localStorage[SAVE_STRING];
  console.log(scoresText);
  if (scoresText) {
    scores = JSON.parse(scoresText);
  }
  else {
    scores = { };
  }
  return scores;
}
function saveScores(scores) {
  localStorage[SAVE_STRING] = JSON.stringify(scores);
}
function userInfoStr(user) {
  return user + " (" + (scores[user] != null ? scores[user] : "0") + ")";
}
function computeTopScoresStr(scores, num) {
  var scoresArray = [ ];
  for (var user in scores) {
    scoresArray.push([user, scores[user]]);
  }
  scoresArray.sort(function(a, b) { return -(a[1] - b[1]); });
  var buildScores = "HIGH SCORES: ";
  buildScores += scoresArray.map(i => userInfoStr(i[0])).slice(0, num).join(", ");
  return buildScores;
}

function increaseScores(users) {
  for (var i=0; i<users.length; ++i) {
    var user = users[i];
    if (scores[user] == null) {
      scores[user] = 0;
    }
    scores[user] += (i < SCORE_ORDER_TABLE.length ? SCORE_ORDER_TABLE[i] : BASE_SCORE);
  }
}
/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 * Taken verbatim from
 * http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

function sendMessage(message) {
  var truncated_message = message;
  if (truncated_message.length > MAX_MESSAGE_LENGTH) {
    truncated_message = truncated_message.substr(0, MAX_MESSAGE_LENGTH-3) + "...";
  }
  $(".text-counter-input").val(truncated_message).submit();
}
function printQuestion(index) {
  sendMessage("CATEGORY: " + _q[index][0] + " || " + _q[index][1]);
}
function poseSingleQuestion(index, timeout) {
  printQuestion(index);
  var usersCorrect = [ ];
  setTimeout(function() {
    var answers = pullNewAnswers();
    usersCorrect = judgeAnswers(_q[index][3], answers);
    usersCorrect = usersCorrect.filter(function(item, pos, self) {
      return self.indexOf(item) == pos;
    });
    increaseScores(usersCorrect);
    saveScores(scores);
    var buildAnswerMessage = "The answer was " + _q[index][2].replace(/#/, "") + "! Correct users: ";
    buildAnswerMessage += usersCorrect.map(i => userInfoStr(i)).join(", ");
    if (usersCorrect.length == 0) {
      buildAnswerMessage += "(nobody) :(";
    }
    sendMessage(buildAnswerMessage);
  }, timeout);
}

function _poseSeveralQuestions(indices, timeout, breaktime, currentIndex) {
  if (current_index >= indices.length) {
    return;
  }
  poseSingleQuestion(indices[currentIndex], timeout);
  _question_num++;
  var adj_breaktime = timeout + breaktime;
  if (_question_num % QUESTIONS_PER_SCORE_DISPLAY == 0) {
    setTimeout(function() {
      sendMessage(computeTopScoresStr(scores, NUM_SCORES_TO_DISPLAY));
    }, timeout + breaktime);
    adj_breaktime = timeout + 2 * breaktime;
  }
  setTimeout(function() {
    _poseSeveralQuestions(indices, timeout, breaktime, currentIndex+1);
  }, adj_breaktime);
}
function poseSeveralQuestions(indices, timeout, breaktime) {
  _poseSeveralQuestions(indices, timeout, breaktime, 0);
}

function customTrim(str) {
  return str.replace(/^[\s!\?]+|[\s!\?]+$/gm, '');
}
function answerMatch(raw_key, raw_answer) {
  var key_regex = new RegExp("^" + raw_key.toLowerCase() + "$");
  return key_regex.test(customTrim(raw_answer.toLowerCase()));
}
function pullNewAnswers() {
  var re = new Array();
  $('.robin-message--message:not(.addon--judged)').each(function() {
    var user = $('.robin-message--from', $(this).closest('.robin-message')).text();
    re.push([user, $(this).text()]);
    $(this).addClass('addon--judged');
  });
  return re;
}
function judgeAnswers(key, answers) {
  var re = new Array();
  for (var i=0; i<answers.length; ++i) {
    if (answerMatch(key, answers[i][1])) {
      re.push(answers[i][0]);
    }
  }
  return re;
}

function simpleTriviaLoop(q) {
  _q = q;
  var r = [ ];
  for (var i=0; i<_q.length; ++i) {
    r.push(i);
  }
  loadScores();
  shuffle(r);
  poseSeveralQuestions(r, TIME_PER_QUESTION, TIME_PER_BREAK);
}

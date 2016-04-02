SCORE_ORDER_TABLE = [3, 2, 1];
BASE_SCORE = 1;

TIME_PER_QUESTION = 24000;
TIME_PER_BREAK = 18000;


scores = { }
function initScores() {
  scores = { };
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
  if (truncated_message.length > 140) {
    truncated_message = truncated_message.substr(0, 137) + "...";
  }
  $(".text-counter-input").val(truncated_message).submit();
}
function printQuestion(index) {
  sendMessage("CATEGORY: " + q[index][0] + "  //  " + q[index][1]);
}
function poseSingleQuestion(index, timeout) {
  printQuestion(index);
  var usersCorrect = [ ];
  setTimeout(function() {
    var answers = pullNewAnswers();
    usersCorrect = judgeAnswers(q[index][3], answers);
    usersCorrect = usersCorrect.filter(function(item, pos, self) {
      return self.indexOf(item) == pos;
    });
    increaseScores(usersCorrect);
    var buildAnswerMessage = "The answer was " + q[index][2].replace(/#/, "") + "!! Correct users: ";
    for (var i=0; i<usersCorrect.length; ++i) {
      if (i > 0) {
        buildAnswerMessage += ", ";
      }
      buildAnswerMessage += usersCorrect[i] + " (" + scores[usersCorrect[i]] + ")";
    }
    if (usersCorrect.length == 0) {
      buildAnswerMessage += "(nobody) :(";
    }
    sendMessage(buildAnswerMessage);
  }, timeout);
}

function _poseSeveralQuestions(indices, timeout, breaktime, current_index) {
  if (current_index >= indices.length) {
    return;
  }
  poseSingleQuestion(indices[current_index], timeout);
  setTimeout(function() {
    _poseSeveralQuestions(indices, timeout, breaktime, current_index+1);
  }, timeout + breaktime);
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
  var r = [ ];
  for (var i=0; i<q.length; ++i) {
    r.push(i);
  }
  shuffle(r);
  poseSeveralQuestions(r, TIME_PER_QUESTION, TIME_PER_BREAK);
}

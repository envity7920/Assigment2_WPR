const mongodb = require('mongodb');
const express = require('express');
const router = express.Router();







router.post("/attempts", async function(req, res) {
    const questionList = await req.database.collection('questions').aggregate([{ $sample: { size: 10 } }]).toArray();
    console.log(questionList);
    let correctAnswers = {};
    for (const questions of questionList) {
        correctAnswers[questions._id] = questions.correctAnswer;

    }

    let attemptQuiz = {
        questions: questionList,
        correctAnswers,
        completed: false,
        startAt: new Date()
    };

    let newAttemptQuiz = await req.database.collection('attempts').insertOne(attemptQuiz);

    let retreiveAttemptQuiz = await req.database.collection('attempts').findOne({ _id: mongodb.ObjectID(`${newAttemptQuiz.insertedId}`) })

    const showQuestion = retreiveAttemptQuiz.questions;
    let list = [];
    let question = {};
    for (const element of showQuestion) {
        question.text = element.text;
        question._id = element._id;
        question.answers = element.answers;
        list.push(question);

    }

    let responseAttempt = {
        _id: retreiveAttemptQuiz._id,
        questions: list,
        completed: false,
        startAt: new Date()
    };
    res.json(responseAttempt);
});

router.post("/attempts/:id/submit", async function(req, res) {
    const ID = req.params.id;
    const requestAnswer = req.body.answers;
    let score = 0;
    let scoreText = "";
    const attempt = await req.database.collection('attempts').findOne({ _id: mongodb.ObjectID(`${ID}`) });
    for (const item in requestAnswer) {
        for (const newItem in attempt.correctAnswers) {
            if (item == newItem) {
                if (requestAnswer.item == attempt.correctAnswers.newItem) {
                    score++;
                }
            }
        }
    }

    if (score < 5) {
        scoreText = 'Practice more to improve it :D';
    } else if (5 <= score < 7) {
        scoreText = 'Good, keep up!';
    } else if (7 <= score < 9) {
        scoreText = 'Well done!';
    } else {
        scoreText = 'Perfect';
    }

    console.log(score);



    const newQuiz = []

    for (let element of attempt.questions) {
        question = {
            _id: element._id,
            text: element.text,
            answers: element.answers
        }
        newQuiz.push(question);
    }

    res.json({
        _id: ID,
        questions: newQuiz,
        correctAnswers: attempt.correctAnswers,
        startAt: attempt.startAt,
        answers: requestAnswer,
        score: score,
        scoreText: scoreText,
        completed: true
    })
    console.log(score, scoreText);


})


module.exports = router;
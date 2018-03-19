const Sequelize = require('sequelize');

const sequelize = new Sequelize("sqlite:quizzes.sqlite", {logging: false});


sequelize.define('quiz', {
    question: {
        type: Sequelize.STRING,
        unique: {msg: "Ya existe esta pregunta."},
        validate: {notEmpty: {msg: "La pregunta no puede estar vacía."}}
    },
    answer: {
        type: Sequelize.STRING,
        validate: {notEmpty: {msg: "La respuesta no puede estar vacía."}}
    }

});


sequelize.sync()
    .then (() => sequelize.models.quiz.count())
    .then (count => {
        if(!count) {
    return sequelize.models.quiz.bulkCreate([
        {question: "¿En que año dieron su primer oscar a Roger Deakins?", answer: "2018"},
        {question: "¿A qué ritmo [min/km] hay que correr 10Km para recorrerlos en 50 minutos?", answer: "5"},
        {question: "¿Qué queremos?", answer: "el perro de fry"},
        {question: "¿Cuándo lo queremos?", answer: "el perro de fry"}
    ])
}
})
.catch(error => {
    console.log(error);
})

module.exports = sequelize;






const fs = require("fs");

const DB_FILENAME = "quizzes.json";


let quizzes = [
    {
        question: "¿En que año dieron su primer oscar a Roger Deakins?",
        answer: "2018"
    },
    {
        question: "¿A qué ritmo [min/km] hay que correr 10Km para recorrerlos en 50 minutos?",
        answer: "5"
    },
    {
        question: "¿Qué queremos?",
        answer: "el perro de fry"
    },
    {
        question: "¿Cuándo lo queremos?",
        answer: "el perro de fry"
    },

];

const load = () => {

    fs.readFile(DB_FILENAME, (err, data) => {
        if (err) {

            if (err.code === "ENOENT") {
                save();
                return;
            }
            throw err;
        }

        let json = JSON.parse(data);

        if (json) {
            quizzes = json;
        }
    });
};

const save = () => {

    fs.writeFile(DB_FILENAME,
        JSON.stringify(quizzes),
        err => {
        if (err) throw err;
        });
};

exports.count = () => quizzes.length;

exports.add = (question, answer) => {
    quizzes.push({
        question: (question || "").trim(),
        answer: (answer || "").trim()
    });
    save();
};

exports.update = (id, question, answer) => {

    const quiz = quizzes[id];
    if (typeof quiz === "undefined") {
        throw new Error(`El valor del parámetro id no es válido.`);
    }
    quizzes.splice(id, 1, {
        question: (question || "").trim(),
        answer: (answer || "").trim()
    });
    save();
};

exports.getAll = () => JSON.parse(JSON.stringify(quizzes));

exports.getByIndex = id => {

    const quiz = quizzes[id];
    if (typeof quiz === "undefined"){
        throw new Error(`El valor del parámetro no es válido.`);
    }
    return JSON.parse(JSON.stringify(quiz));
};
exports.deleteByIndex = id => {

    const quiz = quizzes[id];
    if (typeof quiz === "undefined"){
        throw new Error(`El valor del parámetro no es válido.`);
    }
    quizzes.splice(id, 1);
    save();
};

load();
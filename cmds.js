
const model = require('./model');
var isEmptyArray = require('is-empty-array')
var lowerCase = require('lower-case');
const trim = require('trim-whitespace');

const {log, biglog, errorlog, colorize} = require('./out');

exports.helpCmd = rl => {
    log("Comandos:");
    log("  h|help - Muestra esta ayuda.");
    log("  list - Listar los quizzes existentes.");
    log("  show <id> - muestra la pregunta y la respuesta al quiz indicado.");
    log("  add - Añadir un nuevo quiz interactivamente.");
    log("  delete <id> - Borrar el quiz indicado.");
    log("  edit <id>  Editar el quiz indicado.");
    log("  test <id> - Probar el quiz indicado.");
    log("  p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log("  credits - Créditos.");
    log("  q|quit - salir del programa.");
    rl.prompt();
};

exports.quitCmd = rl => {
    rl.close();
};

exports.addCmd = rl => {
    rl.question(colorize(   'Introduzca una pregunta:', 'red'), question => {

        rl.question(colorize('  Introduzca la respuesta:', 'red'), answer => {

            model.add(question,answer);
            log(`   ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
            rl.prompt();
        });
    })

};


exports.listCmd = rl => {

    model.getAll().forEach((quiz, id) => {
        log(`   [${colorize(id, 'magenta')}]: ${quiz.question}`);
    });
    rl.prompt();
};
exports.showCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
    } else {
        try {
            const quiz = model.getByIndex(id);
            log(`   [${colorize(id, 'magenta')}]:   ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);

        }catch(error) {
            errorlog(error.message);
        }

    }
    rl.prompt();
};

exports.testCmd = (rl, id) => {
    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else {
        try {

            const quiz = model.getByIndex(id);

            rl.question(quiz.question, respuesta => {
                respuestaCorrectaMinuscula = trim(lowerCase(quiz.answer));
                respuestaIntroducidaMinuscula = trim(lowerCase(respuesta));
                log(`Su respuesta es:`);
                if (respuestaIntroducidaMinuscula === respuestaCorrectaMinuscula) {
                    biglog('Correcta', 'green');
                } else {
                    biglog('Incorrecta', 'red');
                }
                rl.prompt();


            });

        }catch(error) {
            errorlog(error.message);
            rl.prompt();
        }

    }



};

exports.playCmd = rl => {
    let score = 0;
    const ids = model.count();
    let toBeResolved = model.getAll();


    /* meter if para comprobar que hay preguntas desde el principio*/

    const playOne = () => {
        if (isEmptyArray(toBeResolved)) {
            log(`No hay nada más que preguntar.`);
            log(`Fin del examen. Aciertos:`);
            biglog(`${score}`);
            rl.prompt();
        } else {
            let id = Math.floor(Math.random() * (toBeResolved.length));
            /* Comprobación
            log(`${toBeResolved.length}`);
            log(`${id}`);*/
            let quiz = model.getByIndex(id);

            rl.question(quiz.question, respuesta => {
                respuestaCorrectaMinuscula = trim(lowerCase(quiz.answer));
                respuestaIntroducidaMinuscula = trim(lowerCase(respuesta));

                if (respuestaIntroducidaMinuscula === respuestaCorrectaMinuscula) {
                    score++;
                    log(`CORRECTO - Lleva ${score} acierto(s)`);
                    toBeResolved.pop(id);
                    playOne();

                } else {
                    log(`Fin del examen. Aciertos:`);
                    biglog(`${score}`);
                    rl.prompt();
                }


            });
        }


    }
playOne();
};
exports.deleteCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
    } else {
        try {
           model.deleteByIndex(id);

        }catch(error) {
            errorlog(error.message);
        }

    }
    rl.prompt();
};

exports.editCmd = (rl, id) => {
    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else {
        try {

            const quiz = model.getByIndex(id);

            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);

            rl.question(colorize('  Introduzca una pregunta:', 'red'), question => {

                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);

                rl.question(colorize('  Introduzca la respuesta:', 'red'), answer => {

                    model.update(id, question, answer);
                    log(`  Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
                    rl.prompt();

                });
            });

        }catch(error) {
            errorlog(error.message);
                    rl.prompt();
        }

    }

};
exports.creditsCmd = (rl) => {
    log(`Autores de la práctica:`);
    log(`Antonio Fernández Cáceres (usuario Git: retonho)`, `green`);
    rl.prompt();
};

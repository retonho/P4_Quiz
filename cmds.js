
const Sequelize = require('sequelize');
const {models} = require('./model');
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
    makeQuestion(rl, ' Introduzca una pregunta: ')
        .then(q =>{
        return makeQuestion(rl, ' Introduzca la respuesta: ')
        .then(a => {
           return {question: q, answer: a};
    });
})
    .then(quiz =>{
        return models.quiz.create(quiz);
    })

    .then((quiz) =>{
        log(` ${colorize('Se ha añadido', 'magenta')}:  ${quiz.question} ${colorize('=>', 'magenta')}  ${quiz.answer}`);
    })
    .catch(Sequelize.ValidationError, error => {
        errorlog('El quiz es erróneo:');
        error.errors.forEach(({message}) => errorlog(message));
    })


.catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();
});

};


exports.listCmd = rl => {

models.quiz.findAll()
    .each(quiz => {
            log(`   [${colorize(quiz.id, 'magenta')}]:  ${quiz.question}`);
})

 .catch(error => {
 errorlog(error.message);
 })
 .then(() => {
 rl.prompt();
});

}

const validateId = id => {

    return new Sequelize.Promise((resolve, reject) => {
        if(typeof id === "undefined") {
        reject(new Error(`Falta el parámetro <id>.`));
    } else {
            id = parseInt(id);
            if (Number.isNaN(id)) {
                reject(new Error(`El valor del parámetro <id> no es un número.`));
            } else {
                resolve(id);
            }
    }
    });
};

const makeQuestion = (rl, text) =>{

    return new Sequelize.Promise((resolve, reject) => {
        rl.question(colorize(text, 'red'), answer => {
            resolve(answer.trim());
    });
    });
};

exports.showCmd = (rl, id) => {

    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
        if(!quiz) {
        throw new Error(`No existe un quiz asociado al id =${id}.`);
    }

    log(`   [${colorize(quiz.id, 'magenta')}]:  ${quiz.question} ${colorize('=>', 'magenta')}  ${quiz.answer}`);
})

.catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();
});
};

exports.testCmd = (rl, id) => {

    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
        if(!quiz) {
        throw new Error(`No existe un quiz asociado al id =${id}.`);
    }
    makeQuestion(rl, quiz.question + ' ')
        .then(answer => {
            respuestaCorrectaMinuscula = trim(lowerCase(quiz.answer));
            respuestaIntroducidaMinuscula = trim(lowerCase(answer));

    log(`Su respuesta es:`);
    if (respuestaIntroducidaMinuscula === respuestaCorrectaMinuscula) {
        biglog('Correcta', 'green');
    } else {
        biglog('Incorrecta', 'red');
    }

});




})

.catch(Sequelize.ValidationError, error => {
        errorlog('El quiz es erróneo: ');
    error.errors.forEach(({message}) => errorlog(message));
})

.catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();
});

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
                    log(`INCORRECTO.`);
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

    validateId(id)
        .then(id => models.quiz.destroy({where: {id}}))

        .catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();
});

};

exports.editCmd = (rl, id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
    .then(quiz => {
        if(!quiz){
        throw new Error(`No existe un quiz asociado al id =${id}.`);
    }

    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);

    return makeQuestion(rl, ' Introduzca la pregunta: ')
        .then(q => {
        process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
    return makeQuestion(rl, ' Introduzca la respuesta: ')
        .then(a => {
            quiz.question = q;
            quiz.answer = a;
            return quiz;
    });
    });



    })

    .then(quiz =>{
        return quiz.save();
    })
    .then(quiz => {
        log(` Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por:  ${quiz.question} ${colorize('=>', 'magenta')}  ${quiz.answer}`);
    })
.catch(Sequelize.ValidationError, error => {
    errorlog('El quiz es erróneo:');
    error.errors.forEach(({message}) => errorlog(message));
    })

.catch(error => {
        errorlog(error.message);
})
.then(() => {
        rl.prompt();
});

};
exports.creditsCmd = (rl) => {
    log(`Autores de la práctica:`);
    log(`Antonio Fernández Cáceres (usuario Git: retonho)`, `green`);
    rl.prompt();
};

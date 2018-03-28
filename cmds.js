
const Sequelize = require('sequelize');
const {models} = require('./model');
var isEmptyArray = require('is-empty-array')
var lowerCase = require('lower-case');
const trim = require('trim-whitespace');

const {log, biglog, errorlog, colorize} = require('./out');

exports.helpCmd = (socket, rl) => {
    log(socket, "Comandos:");
    log(socket, "  h|help - Muestra esta ayuda.");
    log(socket, "  list - Listar los quizzes existentes.");
    log(socket, "  show <id> - muestra la pregunta y la respuesta al quiz indicado.");
    log(socket, "  add - Añadir un nuevo quiz interactivamente.");
    log(socket, "  delete <id> - Borrar el quiz indicado.");
    log(socket, "  edit <id>  Editar el quiz indicado.");
    log(socket, "  test <id> - Probar el quiz indicado.");
    log(socket, "  p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log(socket, "  credits - Créditos.");
    log(socket, "  q|quit - salir del programa.");
    rl.prompt();
};

exports.quitCmd = (socket, rl) => {
    rl.close();
    socket.end();
};

exports.addCmd = (socket, rl) => {
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
        log(socket, ` ${colorize('Se ha añadido', 'magenta')}:  ${quiz.question} ${colorize('=>', 'magenta')}  ${quiz.answer}`);
    })
    .catch(Sequelize.ValidationError, error => {
        errorlog(socket, 'El quiz es erróneo:');
        error.errors.forEach(({message}) => errorlog(socket, message));
    })


.catch(error => {
        errorlog(socket, error.message);
})
.then(() => {
        rl.prompt();
});

};


exports.listCmd = (socket, rl) => {

models.quiz.findAll()
    .each(quiz => {
            log(socket, `   [${colorize(quiz.id, 'magenta')}]:  ${quiz.question}`);
})

 .catch(error => {
 errorlog(socket, error.message);
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

exports.showCmd = (socket, rl, id) => {

    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
        if(!quiz) {
        throw new Error(`No existe un quiz asociado al id =${id}.`);
    }

    log(socket, `   [${colorize(quiz.id, 'magenta')}]:  ${quiz.question} ${colorize('=>', 'magenta')}  ${quiz.answer}`);
})

.catch(error => {
        errorlog(socket, error.message);
})
.then(() => {
        rl.prompt();
});
};

exports.testCmd = (socket, rl, id) => {

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

    log(socket, `Su respuesta es:`);
    if (respuestaIntroducidaMinuscula === respuestaCorrectaMinuscula) {
        biglog(socket, 'Correcta', 'green');
    } else {
        biglog(socket, 'Incorrecta', 'red');
    }

});




})

.catch(Sequelize.ValidationError, error => {
        errorlog(socket, 'El quiz es erróneo: ');
    error.errors.forEach(({message}) => errorlog(socket, message));
})

.catch(error => {
        errorlog(socket, error.message);
})
.then(() => {
        rl.prompt();
});

};

exports.playCmd = (socket, rl) => {
    let score = 0;
    let toBeResolved = [];


    /* meter if para comprobar que hay preguntas desde el principio*/

    const playOne = () => {

        return Promise.resolve()
            .then(() => {

            if(toBeResolved.length <= 0){
            log(socket, `No hay nada más que preguntar.`);
            log(socket, `Fin del examen. Aciertos:`);
            biglog(socket, `${score}`);
            return;
        }
        let id = Math.floor(Math.random() * (toBeResolved.length));
        /* Comprobación
        log(`${toBeResolved.length}`);
        log(`${id}`);*/
        let quiz = toBeResolved[id];
        toBeResolved.splice(id, 1);

        return makeQuestion(rl, quiz.question)

            .then(answer => {
            respuestaCorrectaMinuscula = trim(lowerCase(quiz.answer));
            respuestaIntroducidaMinuscula = trim(lowerCase(answer));


        if (respuestaIntroducidaMinuscula === respuestaCorrectaMinuscula) {
            score++;
            log(socket, `CORRECTO - Lleva ${score} acierto(s)`);
            return playOne();

        } else {
            log(socket, `INCORRECTO.`);
            log(socket, `Fin del examen. Aciertos:`);
            biglog(socket, `${score}`);
        }


    })
    })



}

models.quiz.findAll({raw: true})

    .then(quizzes => {
    toBeResolved = quizzes;

})
.then(() => {
    return playOne();

})
.
catch(error => {
    errorlog(socket, error.message);
})
.then(() => {
log(socket, 'Fin.');
log(socket, 'Tu resultado es: ' + score);
rl.prompt();
})
};


exports.deleteCmd = (socket, rl, id) => {

    validateId(id)
        .then(id => models.quiz.destroy({where: {id}}))

        .catch(error => {
        errorlog(socket, error.message);
})
.then(() => {
        rl.prompt();
});

};

exports.editCmd = (socket, rl, id) => {
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
        log(socket, ` Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por:  ${quiz.question} ${colorize('=>', 'magenta')}  ${quiz.answer}`);
    })
.catch(Sequelize.ValidationError, error => {
    errorlog(socket, 'El quiz es erróneo:');
    error.errors.forEach(({message}) => errorlog(message));
    })

.catch(error => {
        errorlog(socket, error.message);
})
.then(() => {
        rl.prompt();
});

};
exports.creditsCmd = (socket, rl) => {
    log(socket, `Autores de la práctica:`);
    log(socket, `ANTONIO Fernández Cáceres (usuario Git: retonho)`, `green`);
    rl.prompt();
};

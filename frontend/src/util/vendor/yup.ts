/* eslint-disable no-template-curly-in-string */
import { setLocale } from 'yup';

const ptBR = {

    mixed: {
        required: '${path} é obrigatorio',
        notType: '${path} é inválido'
    },
    string: {
        max: '${path} precisa ter máximo ${max} caracteres'
    },
    number: {
        min: '${path} precisa ser no mínimo ${min}'
    }
}

setLocale(ptBR);

export * from 'yup';
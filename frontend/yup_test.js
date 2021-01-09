import * as yup from 'yup';

const schema = yup.object().shape({
    name: yup
        .string()
        .required()
});


schema.isValid({ name: ''})
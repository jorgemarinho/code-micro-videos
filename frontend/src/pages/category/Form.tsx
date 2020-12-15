import { Box, Button, ButtonProps, makeStyles, TextField, Checkbox,  Theme } from '@material-ui/core';
import *  as React from 'react';
import {useForm} from 'react-hook-form';
import categoryHttp from '../../util/http/category-http';

const useStyles = makeStyles((theme: Theme) => {
    return  {
        submit: {
            margin: theme.spacing(1)
        }
    }
});

export const Form = () => {

    const classes = useStyles();
    
    const buttonProps: ButtonProps = {
        variant: "outlined",
        className: classes.submit

    }

    const {register, handleSubmit, getValues} = useForm({
        defaultValues: {
            is_active: true
        }
    });

    function onSubmit(formData, event){

        console.log(event);

        categoryHttp
            .create(formData)
            .then((response) => console.log(response));
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                name="name"
                inputRef={register}
                label="Nome"
                fullWidth
                variant="outlined"
            />
            <TextField
                name="description"
                inputRef={register}
                label="Descrição"
                multiline
                rows="4"
                fullWidth
                variant="outlined"
                margin="normal"
            />
            <Checkbox
                name="is_active"
                inputRef={register}
                defaultChecked
            />
            Ativo?

            <Box dir={"rtl"}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)} >Salvar</Button>
                <Button {...buttonProps} type="submit" >Salvar e continuar editando</Button>
            </Box>
        </form>
    );
}
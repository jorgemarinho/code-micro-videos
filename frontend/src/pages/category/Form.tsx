import { Box, Button, ButtonProps, makeStyles, TextField, Checkbox, Theme, FormControlLabel } from '@material-ui/core';
import *  as React from 'react';
import { useForm } from 'react-hook-form';
import categoryHttp from '../../util/http/category-http';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from '../../util/vendor/yup';
import { useHistory, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
});

const validationSchema = yup.object().shape({
    name: yup
        .string()
        .label('Nome')
        .required()
});

export const Form = () => {
    interface IFormInputs {
        name: string
        description: string
        is_active: boolean
    }

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        errors,
        reset,
        watch
    } = useForm<IFormInputs>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            is_active: true
        }
    });

    interface ParamTypes {
        id: string
    }

    const classes = useStyles();
    const snackbar = useSnackbar();
    const history = useHistory();
    const { id } = useParams<ParamTypes>();
    const [category, setCategory] = React.useState<{ id: string } | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: 'secondary',
        variant: "contained",
        disabled: loading
    }

    React.useEffect(() => {

        if (!id) {
            return;
        }

        (async function getCategory() {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             

            setLoading(true);
            try {

                const {data} = await categoryHttp.get(id);
                
                setCategory(data.data);
                reset(data.data);
            }
            catch (error) {
                console.log(error);
                snackbar.enqueueSnackbar(
                    'Não foi possível carregar as informações',
                    { variant: 'error' }
                )
            }
            finally {
                setLoading(false);
            }
        })();

        /*
        setLoading(true);
        categoryHttp
            .get(id)
            .then(({data}) => {
                setCategory(data.data)
                reset(data.data);
            })
            .finally(() => setLoading(false))
            */

    }, [id, reset, snackbar]);

    React.useEffect(() => {
        register({ name: "is_active" })
    }, [register]);

    async function onSubmit(formData, event) {

        setLoading(true);
        try {

            const http = !category
                ? categoryHttp.create(formData)
                : categoryHttp.update(category.id, formData)

            const { data } = await http;

            snackbar.enqueueSnackbar(
                'Cadastrado com sucesso! ', {
                variant: 'success'
            });

            setTimeout(() => {
                event
                    ? (
                        id
                            ? history.replace('/categories/' + data.data.id + '/edit')
                            : history.push('/categories/' + data.data.id + '/edit')
                    )
                    : history.push('/categories')
            });

        } catch (error) {

            console.log(error);
            snackbar.enqueueSnackbar(
                'Não foi possível salvar a categoria :( ', {
                variant: 'error'
            })

        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                name="name"
                label="Nome"
                fullWidth
                variant="outlined"
                inputRef={register}
                disabled={loading}
                error={errors.name !== undefined}
                helperText={errors.name && errors.name.message}
                InputLabelProps={{ shrink: true }}
            />

            <TextField
                name="description"
                label="Descrição"
                multiline
                rows="4"
                fullWidth
                variant="outlined"
                margin="normal"
                inputRef={register}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
            />
            <FormControlLabel
                disabled={loading}
                control={
                    <Checkbox
                        name="is_active"
                        color={'primary'}
                        onChange={
                            () => setValue('is_active', !getValues()['is_active'])
                        }
                        checked={watch('is_active')}
                    />
                }
                label={'Ativo?'}
                labelPlacement={'end'}
            />
            <Box dir={"rtl"}>
                <Button
                    color={"primary"}
                    {...buttonProps} onClick={() => onSubmit(getValues(), null)} >Salvar</Button>
                <Button {...buttonProps} type="submit" >Salvar e continuar editando</Button>
            </Box>
        </form>
    );
}
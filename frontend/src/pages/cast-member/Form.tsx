import { Box, Button, ButtonProps, makeStyles, TextField, Theme, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, FormHelperText } from '@material-ui/core';
import *  as React from 'react';
import { useForm } from 'react-hook-form';
import castMemberHttp from '../../util/http/cast-member-http';
import * as yup from '../../util/vendor/yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import { useHistory, useParams } from 'react-router-dom';
import { Watch } from '@material-ui/icons';


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
        .max(255),
    type: yup
        .number()
        .label('Tipo')
        .required()
});

export const Form = () => {

    interface ParamTypes {
        id: string
    }

    const { register, handleSubmit, getValues, setValue, errors, reset, watch } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const classes = useStyles();
    const snackbar = useSnackbar();
    const history = useHistory();
    const { id } = useParams<ParamTypes>();
    const [castMember, setCastMember] = React.useState<{ id: string } | null>(null);
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

        async function getCastMember() {

            setLoading(true);
            try {
                const { data } = await castMemberHttp.get(id);
                setCastMember(data.data)
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
        }
        getCastMember();
    }, [id, reset, snackbar]);

    React.useEffect(() => {
        register({ name: "type" })
    }, [register]);


    async function onSubmit(formData, event) {

        setLoading(true);
        try {

            const http = !castMember
                ? castMemberHttp.create(formData)
                : castMemberHttp.update(castMember.id, formData)

            const { data } = await http;

            snackbar.enqueueSnackbar(
                'Cadastrado com sucesso! ', {
                variant: 'success'
            });

            setTimeout(() => {
                event
                    ? (
                        id
                            ? history.replace('/cast-members/' + data.data.id + '/edit')
                            : history.push('/cast-members/' +  data.data.id + '/edit')
                    )
                    : history.push('/cast-members')
            });

        } catch (error) {

            console.log(error);
            snackbar.enqueueSnackbar(
                'Não foi possível salvar o membro de elenco :( ', {
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
            <FormControl 
                margin={"normal"}
                error={errors.name !== undefined} 
                disabled={loading}
            >
                <FormLabel component="legend">Tipo</FormLabel>
                <RadioGroup
                    name="type"
                    onChange={(e) => {
                        setValue('type', parseInt(e.target.value));
                    }}
                    value={watch('type') + ""}
                >

                    <FormControlLabel value='1' control={<Radio color={"primary"} />} label="Diretor" />
                    <FormControlLabel value='2' control={<Radio color={"primary"} />} label="Ator" />

                </RadioGroup>
                {
                    errors.type && <FormHelperText id="type-helper-text" >{errors.type.message}</FormHelperText>
                }
            </FormControl>
            <Box dir={"rtl"}>
                <Button
                    color={"primary"}
                    {...buttonProps} onClick={() => onSubmit(getValues(), null)} >Salvar</Button>
                <Button {...buttonProps} type="submit" >Salvar e continuar editando</Button>
            </Box>
        </form>
    );
}
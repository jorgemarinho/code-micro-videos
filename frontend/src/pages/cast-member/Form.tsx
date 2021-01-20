import { TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, FormHelperText } from '@material-ui/core';
import *  as React from 'react';
import { useForm } from 'react-hook-form';
import castMemberHttp from '../../util/http/cast-member-http';
import * as yup from '../../util/vendor/yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import { useHistory, useParams } from 'react-router-dom';
import { CastMember } from '../../util/models';
import SubmitActions from '../../components/SubmitActions';

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

    const { register, handleSubmit, getValues, setValue, errors, reset, watch, trigger } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const snackbar = useSnackbar();
    const history = useHistory();
    const { id } = useParams<ParamTypes>();
    const [castMember, setCastMember] = React.useState<CastMember | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);

    React.useEffect(() => {

        if (!id) {
            return;
        }

        (async () => {

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
        })();

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
                            : history.push('/cast-members/' + data.data.id + '/edit')
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
            <SubmitActions
                disabledButtons={loading}
                handleSave={() =>
                    trigger().then(isValid => {
                        isValid && onSubmit(getValues(), null)
                    })
                }
            />
        </form>
    );
}
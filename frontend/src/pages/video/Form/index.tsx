import { TextField, Grid, FormControlLabel, Typography, Checkbox, useMediaQuery, useTheme, Button } from '@material-ui/core';
import *  as React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from '../../../util/vendor/yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import { useHistory, useParams } from 'react-router-dom';
import SubmitActions from '../../../components/SubmitActions';
import videoHttp from '../../../util/http/video-http';
import { DefaultForm } from '../../../components/DefaultForm';
import { Video } from '../../../util/models';
import Rating from '../../../components/Rating';
import { RatingField } from './RatingField';
import InputFile from '../../../components/InputFile';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

const validationSchema = yup.object().shape({
    title: yup
        .string()
        .label('Titulo')
        .required()
        .max(255),
    description: yup
        .string()
        .label('Sinopse')
        .required(),
    year_launched: yup
        .number()
        .label('Ano de lançamento')
        .required()
        .min(1),
    duration: yup
        .number()
        .label('Duração')
        .required()
        .min(1),
    rating: yup
        .string()
        .label('Classificação')
        .required()
});

export const Form = () => {

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        watch,
        errors,
        reset,
        trigger
    } = useForm<{
            rating: any, 
            opened: any, 
            title: string,
            description: string,
            year_launched: number,
            duration: number
        }>({
        resolver: yupResolver(validationSchema),
        defaultValues: {

        }
    });

    const snackbar = useSnackbar();
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const [video, setVideo] = React.useState<Video | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const theme = useTheme();
    const isGreaterMd = useMediaQuery(theme.breakpoints.up('md'));

    React.useEffect(() => {
        ['rating', 'opened'].forEach(name => register({name}));
    },[register]);

    React.useEffect(() => {

        if (!id) {
            return;
        }

        let isSubscribed = true;
        (async () => {

            setLoading(true);
            try {

                const { data } = await videoHttp.get(id);
                if (isSubscribed) {
                    setVideo(data.data);
                    reset(data.data);
                }

            } catch (error) {
                snackbar.enqueueSnackbar(
                    'Não foi possível carregar as informações',
                    { variant: 'error' }
                )

            } finally {
                setLoading(false);
            }
        })();

        return () => {
            isSubscribed = false;
        }

    }, []);

    async function onSubmit(formData, event) {

        setLoading(true);
        try {

            const http = !video
                ? videoHttp.create(formData)
                : videoHttp.update(video.id, formData)

            const { data } = await http;

            snackbar.enqueueSnackbar(
                'Cadastrado com sucesso! ', {
                variant: 'success'
            });

            setTimeout(() => {
                event
                    ? (
                        id
                            ? history.replace('/videos/' + data.data.id + '/edit')
                            : history.push('/videos/' + data.data.id + '/edit')
                    )
                    : history.push('/videos')
            });

        } catch (error) {

            snackbar.enqueueSnackbar(
                'Não foi possível salvar o membro de elenco :( ', {
                variant: 'error'
            })

        } finally {
            setLoading(false);
        }
    }

    return (

        <DefaultForm
            GrindItemProps={{ xs: 12 }}
            onSubmit={handleSubmit(onSubmit)}
        >
            <Grid container spacing={5}>
                <Grid item xs={12} md={6}>
                    <TextField
                        name="title"
                        label="Título"
                        variant={'outlined'}
                        fullWidth
                        inputRef={register}
                        disabled={loading}
                        InputLabelProps={{ shrink: true }}
                        error={errors.title !== undefined}
                        helperText={errors.title && errors.title.message}
                    />
                    <TextField
                        name="description"
                        label="Sinopse"
                        multiline
                        rows="4"
                        margin="normal"
                        variant="outlined"
                        fullWidth
                        inputRef={register}
                        disabled={loading}
                        InputLabelProps={{ shrink: true }}
                        error={errors.description !== undefined}
                        helperText={errors.description && errors.description.message}
                    />
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <TextField
                                name="year_launched"
                                label="Ano de lançamento"
                                type="number"
                                margin="normal"
                                variant="outlined"
                                fullWidth
                                inputRef={register}
                                disabled={loading}
                                InputLabelProps={{ shrink: true }}
                                error={errors.year_launched !== undefined}
                                helperText={errors.year_launched && errors.year_launched.message}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="duration"
                                label="Duração"
                                type="number"
                                margin="normal"
                                variant="outlined"
                                fullWidth
                                inputRef={register}
                                disabled={loading}
                                InputLabelProps={{ shrink: true }}
                                error={errors.duration !== undefined}
                                helperText={errors.duration && errors.duration.message}
                            />
                        </Grid>
                    </Grid>
                    Elenco
                    <br />
                    Gêneros e categorias
                </Grid>
                <Grid item xs={6}>
                    <RatingField 
                        value={watch('rating')}
                        setValue={(value) => setValue('rating' as never, value, { shouldValidate: true })}
                        error={errors.rating} 
                        disabled={loading}
                        FormControlProps={{
                            margin: isGreaterMd ? 'none' : 'normal'
                        }}
                    />
                    <br />
                    Uploads
                    <InputFile ButtonFile={
                        <Button
                            endIcon={<CloudUploadIcon />}
                            variant={"contained"}
                            color={"primary"}
                            onClick={() => {}}
                        >
                            Adicionar
                        </Button>
                    }/>
                    <br />
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="opened"
                                color={'primary'}
                                onChange={
                                    () => setValue('opened' as never, !getValues()['opened'])
                                }
                                checked={watch('opened')}
                                disabled={loading}
                            />
                        }
                        label={
                            <Typography color="primary" variant={"subtitle2"}>
                                Quero que este conteúdo apareça na seção lançamento
                            </Typography>
                        }
                        labelPlacement="end"
                    />
                </Grid>
            </Grid>
            <SubmitActions
                disabledButtons={loading}
                handleSave={() =>
                    trigger().then(isValid => {
                        isValid && onSubmit(getValues(), null)
                    })
                }
            />
        </DefaultForm>
    );
}
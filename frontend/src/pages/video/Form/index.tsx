import { TextField, Grid, FormControlLabel, Typography, Checkbox, useMediaQuery, useTheme, Card, CardContent, makeStyles, Theme, FormHelperText } from '@material-ui/core';
import *  as React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from '../../../util/vendor/yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import { useHistory, useParams } from 'react-router-dom';
import SubmitActions from '../../../components/SubmitActions';
import videoHttp from '../../../util/http/video-http';
import { DefaultForm } from '../../../components/DefaultForm';
import { Video, VideoFileFieldsMap } from '../../../util/models';
import { RatingField } from './RatingField';
import UploadField, { UploadFielComponent } from './UploadField';
import GenreField, { GenreFieldComponent } from './GenreField';
import CategoryField, { CategoryFieldComponent } from './CategoryField';
import CastMemberField, { CastMemberFieldComponent } from './CastMemberField';
import { useRef, MutableRefObject, createRef } from "react";
import { omit, zipObject } from 'lodash';

const useStyles = makeStyles((theme: Theme) => ({
    cardUpload: {
        borderRadius: "4px",
        backgroundColor: "#f5f5f5",
        margin: theme.spacing(2, 0)
    },
    cardOpened: {
        borderRadius: "4px",
        backgroundColor: "#f5f5f5"
    },
    cardContentOpened: {
        paddingBottom: theme.spacing(2) + 'px !important'
    }
}));

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
    cast_members: yup
        .array()
        .label('Elenco')
        .required(),
    genres: yup
        .array()
        .label('Gêneros')
        .required()
        .test({
            message: 'Cada gênero escolhido precisa ter pelo menos uma categoria selecionada',
            test(value){
                return (value as any).every(
                    v => v.categories.filter(
                        cat => this.parent.categories.map(c => c.id).includes(cat.id)
                    ).length !== 0
                );
            }
        }),
    categories: yup
        .array()
        .label('Categorias')
        .required(),
    rating: yup
        .string()
        .label('Classificação')
        .required()
});

const fileFields = Object.keys(VideoFileFieldsMap);

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
        duration: number,
        genres: Array<any>,
        categories: Array<any>,
        cast_members: Array<any>
    }>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            rating: null,
            opened: false,
            genres: [],
            categories: [],
            cast_members: []
        }
    });

    const classes = useStyles();
    const snackbar = useSnackbar();
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const [video, setVideo] = React.useState<Video | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const theme = useTheme();
    const isGreaterMd = useMediaQuery(theme.breakpoints.up('md'));
    const castMemberRef = useRef() as MutableRefObject<CastMemberFieldComponent>;
    const genreRef = useRef() as MutableRefObject<GenreFieldComponent>;
    const categoryRef = useRef() as MutableRefObject<CategoryFieldComponent>;
    const uploadsRef = useRef(
        zipObject(fileFields, fileFields.map(() => createRef()))
    ) as MutableRefObject<{ [key: string]: MutableRefObject<UploadFielComponent> }>;

    React.useEffect(() => {
        [
            'rating',
            'opened',
            'genres',
            'categories',
            ...fileFields
        ].forEach(name => register({ name }));
    }, [register]);

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
        
        const sendData = omit(formData, ['cast_members', 'genres', 'categories']);
        sendData['cast_members_id'] = formData['cast_members'].map(cast_member => cast_member.id);
        sendData['categories_id'] = formData['categories'].map(category => category.id);
        sendData['genres_id'] = formData['genres'].map(genre => genre.id);

        setLoading(true);
        try {

            const http = !video
                ? videoHttp.create(sendData)
                : videoHttp.update(video.id, { ...sendData, _method :'PUT'}, { http: { usePost: true } });

            const { data } = await http;

            snackbar.enqueueSnackbar(
                'Cadastrado com sucesso! ', {
                variant: 'success'
            });
            id && resetForm(video);
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

    function resetForm(data) {
        Object.keys(uploadsRef.current).forEach(
            field => uploadsRef.current[field].current.clear()
        );
        castMemberRef.current.clear();
        genreRef.current.clear();
        categoryRef.current.clear();
        reset(data);
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
                    <CastMemberField
                        ref={castMemberRef}
                        castMembers={watch('cast_members')}
                        setCastMembers={(value) => setValue('cast_members', value, { shouldValidate: true })}
                        error={errors.cast_members}
                        disabled={loading}
                    />

                    <Grid container spacing={1}>
                        <Grid item xs={12} md={6}>
                            <GenreField
                                ref={genreRef}
                                genres={watch('genres')}
                                setGenres={(value) => setValue('genres', value, { shouldValidate: true })}
                                categories={watch('categories')}
                                setCategories={(value) => setValue('categories', value, { shouldValidate: true })}
                                error={errors.genres}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <CategoryField
                                ref={categoryRef}
                                categories={watch('categories')}
                                setCategories={(value) => setValue('categories', value, { shouldValidate: true })}
                                genres={watch('genres')}
                                error={errors.categories}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormHelperText>
                                Escolha os gêneros do vídeos
                            </FormHelperText>
                            <FormHelperText>
                                Escolha pelo menos uma categoria de cada gênero
                            </FormHelperText>
                        </Grid>
                    </Grid>
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
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color="primary" variant="h6">
                                Imagens
                            </Typography>
                            <UploadField
                                ref={uploadsRef.current['thumb_file']}
                                accept={'images/*'}
                                label={'Thumb'}
                                setValue={(value) => setValue('thumb_file', value)}
                            />
                            <UploadField
                                ref={uploadsRef.current['banner_file']}
                                accept={'images/*'}
                                label={'Banner'}
                                setValue={(value) => setValue('banner_file', value)}
                            />
                        </CardContent>
                    </Card>

                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color="primary" variant="h6">
                                Videos
                            </Typography>
                            <UploadField
                                ref={uploadsRef.current['trailer_file']}
                                accept={'video/mp4'}
                                label={'Trailer'}
                                setValue={(value) => setValue('trailer_file', value)}
                            />
                            <UploadField
                                ref={uploadsRef.current['video_file']}
                                accept={'video/mp4'}
                                label={'Principal'}
                                setValue={(value) => setValue('video_file', value)}
                            />
                        </CardContent>
                    </Card>
                    <br />
                    <Card className={classes.cardOpened}>
                        <CardContent className={classes.cardContentOpened}>
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
                        </CardContent>
                    </Card>
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
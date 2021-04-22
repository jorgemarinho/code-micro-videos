import { TextField, MenuItem } from '@material-ui/core';
import *  as React from 'react';
import { useForm } from 'react-hook-form';
import genreHttp from '../../util/http/genre-http';
import * as yup from '../../util/vendor/yup';
import { yupResolver } from '@hookform/resolvers/yup';
import categoryHttp from '../../util/http/category-http';
import { useSnackbar } from 'notistack';
import { useHistory, useParams } from 'react-router-dom';
import { Category, Genre } from '../../util/models';
import SubmitActions from '../../components/SubmitActions';

const validationSchema = yup.object().shape({
    name: yup
        .string()
        .label('Nome')
        .required()
        .max(255),
    categories_id: yup
        .array()
        .label('Categorias')
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
    } = useForm<{ name: any, categories_id: any }>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            categories_id: []
        }
    });

    const {enqueueSnackbar} = useSnackbar();
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const [genre, setGenre] = React.useState<Genre | null>(null);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);

    React.useEffect(() => {

        let isSubscribed = true;
        (async () => {

            setLoading(true);
            const promises = [categoryHttp.list({ queryParams: { 'all': '' } })];

            if (id) {
                promises.push(genreHttp.get(id));
            }

            try {

                const [categoriesResponse, genreResponse] = await Promise.all(promises);

                if (isSubscribed) {
                    setCategories(categoriesResponse.data.data);

                    if (id) {
                        setGenre(genreResponse.data.data);
                        reset({
                            ...genreResponse.data.data,
                            categories_id: genreResponse.data.data.categories.map(category => category.id)
                        });
                    }
                }

            } catch (error) {

                enqueueSnackbar(
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

    }, [id, reset, enqueueSnackbar]);


    React.useEffect(() => {
        register({ name: "categories_id" })
    }, [register]);

    async function onSubmit(formData, event) {

        setLoading(true);
        try {

            const http = !genre
                ? genreHttp.create(formData)
                : genreHttp.update(genre.id, formData)

            const { data } = await http;

            enqueueSnackbar(
                'Cadastrado com sucesso! ', {
                variant: 'success'
            });

            setTimeout(() => {
                event
                    ? (
                        id
                            ? history.replace('/genres/' + data.data.id + '/edit')
                            : history.push('/genres/' + data.data.id + '/edit')
                    )
                    : history.push('/genres')
            });

        } catch (error) {

            enqueueSnackbar(
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
            <TextField
                select
                name="categories_id"
                value={watch('categories_id')}
                label="Categorias"
                margin={'normal'}
                variant="outlined"
                fullWidth
                onChange={(e) => {
                    setValue('categories_id', e.target.value);
                }}
                SelectProps={{
                    multiple: true
                }}
                disabled={loading}
                error={errors.categories_id !== undefined}
                helperText={errors.categories_id && errors.categories_id.message}
                InputLabelProps={{ shrink: true }}
            >
                <MenuItem value="" disabled >
                    <em>Selecione categorias</em>
                </MenuItem>
                {
                    categories.map(
                        (category, key) => (
                            <MenuItem key={key} value={category.id}>{category.name}</MenuItem>
                        )
                    )
                }
            </TextField>
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
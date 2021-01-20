// @flow 

import * as React from 'react';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { CastMember, ListResponse } from '../../util/models';
import castMemberHttp from '../../util/http/cast-member-http';
import DefaultTable, { TableColumn , makeActionStyles} from '../../components/Table';
import { IconButton, MuiThemeProvider} from '@material-ui/core';
import {Link} from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';
import { useSnackbar } from 'notistack';

const CastMemberTypeMap = {
    1: 'Diretor',
    2: 'Ator'
}

const columnsDefinition: TableColumn[] = [

    {
        name: 'id', 
        label: 'ID',
        width: '27%',
        options: {
            sort: false
        }
    },
    {
        name: 'name',
        label: 'Nome',
        width: '46%'
    },
    {
        name: 'type',
        label: 'Tipo',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
               return CastMemberTypeMap[value];
            }
        }
    },
    {
        name: 'created_at',
        label: 'Criado em',
        width: '10%',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>;
            }
        }
    },
    {
        name: 'actions',
        label: 'Ações',
        width: '13%',
        options: {
            sort: false,
            customBodyRender: (value, tableMeta) => {
                return(
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={'/cast-members/' + tableMeta.rowData[0] + '/edit'}
                    >
                        <EditIcon fontSize={'inherit'} />
                    </IconButton>
                )
            }
        }
    }
];

const Table = () => {

    const snackbar = useSnackbar();
    const [data, setData] = React.useState<CastMember[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);

    React.useEffect(() => {

        let isSubscribed = true;
        (async () => {

            setLoading(true);
            try{ 
                const {data} = await castMemberHttp.list<ListResponse<CastMember>>();
                if(isSubscribed){
                    setData(data.data);
                }
            }catch(error){
                snackbar.enqueueSnackbar(
                    'Não foi possível carregar as informações',
                    { variant: 'error' }
                )
            }  finally {
                setLoading(false);
            }

        })();

        return () => {
            isSubscribed = false;
        }

    }, [snackbar]);

    return (

        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length-1)} >
            <DefaultTable
                title="Listagem de membros do elenco"
                columns={columnsDefinition}
                data={data}
                loading={loading}
                options={{responsive: "standard"}}
            />
        </MuiThemeProvider>  

    );
};

export default Table;
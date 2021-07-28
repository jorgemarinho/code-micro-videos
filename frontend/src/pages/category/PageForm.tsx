import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Page } from "../../components/Navbar/Page";
import { Form } from "./Form";

const PageForm = () => {

    interface ParamTypes {
        id: string
    }

    const { id } = useParams<ParamTypes>();
    
    return (
        <Page title={!id ? 'Criar categoria' : 'Editar categoria'}>
            <Form />
        </Page>
    );
}
export default PageForm;
import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Page } from "../../components/Navbar/Page";
import { Form } from "./Form";

const PageForm = () => {
    const { id } = useParams<{ id: string }>();
    return (
        <Page title={!id ? 'Criar vídeo' : 'Editar vídeo'}>
            <Form/>
        </Page>
    );
}
export default PageForm;
import * as React from 'react';
import { Page } from "../../components/Navbar/Page";
import { Form } from "./Form";



const PageForm = () => {

    return (
        <Page title={'Criar membro do elenco'}>
            <Form/>
        </Page>
    );
}
export default PageForm;
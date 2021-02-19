// @flow 
import { InputAdornment, TextField, TextFieldProps } from '@material-ui/core';
import * as React from 'react';
import { useRef, MutableRefObject, useState } from 'react';


interface InputFileProps {
    ButtonFile: React.ReactNode;
    InputFileProps?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    TextFieldProps?: TextFieldProps;
};
export const InputFile: React.FC<InputFileProps> = (props) => {

    const fileRef = useRef() as MutableRefObject<HTMLInputElement>;
    const [filename, setFileName] = useState("");

    const textFieldProps: TextFieldProps = {
        variant: 'outlined',
        ...props.TextFieldProps,
        InputProps: {
            readOnly: true,
            ...(
                props.TextFieldProps && props.TextFieldProps.inputProps &&
                {...props.TextFieldProps.inputProps}
            ),
            endAdornment: (
                <InputAdornment position={"end"}>
                    {props.ButtonFile}
                </InputAdornment>
            )
        },
        value: filename
    }

    const inputFileProps = {
        ...props.InputFileProps,
        hidden: true,
        ref: fileRef,
        onChange(event) {
            const files = event.target.files;

            if (files && files.length) {
                setFileName(
                    Array.from(files).map((file: any) => file.name).join(',')
                );
            }

            if (props.InputFileProps && props.InputFileProps.onChange) {
                props.InputFileProps.onChange(event);
            }
        }
    };

    return (
        <>
            <input type="file" {...inputFileProps} />
            <TextField {...textFieldProps} />
        </>
    );
};

export default InputFile;
import { yupResolver } from '@hookform/resolvers/yup';
import React, { ReactElement } from 'react';
import { Button, Col, Form, Row, Stack } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Asserts, Schema, type AnyObjectSchema } from 'yup';
import classes from './RegistrationForm.module.css';
import YupFormControl from './YupFormControl';

interface Props<Schema extends AnyObjectSchema> {
    schema: Schema;
    onSubmit(data: Asserts<Schema>): void | Promise<void>;
}

function isSchema(entry: [string, unknown]): entry is [string, Schema] {
    const [, schema] = entry;
    return schema instanceof Schema;
}

export default function YupForm<TShape extends AnyObjectSchema>(props: Props<TShape>): ReactElement | null {
    const { schema, onSubmit } = props;
    const { register, handleSubmit, control } = useForm({
        mode: 'onBlur',
        resolver: yupResolver(schema),
    });

    const fieldSchemas = Object.entries(schema.fields);

    return (
        <Form onSubmit={handleSubmit(onSubmit)} noValidate className={classes.form}>
            <Stack gap={3}>
                {fieldSchemas.filter(isSchema).map(([name, schema]) => (
                    <YupFormControl key={name} name={name} control={control} schema={schema} register={register} />
                ))}
                <Row>
                    <Col>
                        * Pflichtfeld
                    </Col>
                    <Col>
                        <Button variant="primary" type="submit">
                            Anmelden
                        </Button>
                    </Col>
                </Row>
            </Stack>
        </Form>
    );
}

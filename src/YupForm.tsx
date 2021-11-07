import { yupResolver } from '@hookform/resolvers/yup';
import React, { ReactElement } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Asserts, BaseSchema } from 'yup';
import ObjectSchema, { ObjectShape } from 'yup/lib/object';
import classes from './RegistrationForm.module.css';
import YupFormControl from './YupFormControl';

interface Props<TShape extends ObjectShape, Schema extends ObjectSchema<TShape> = ObjectSchema<TShape>> {
    schema: Schema;
    onSubmit(data: Asserts<Schema>): void | Promise<void>;
}

function isSchema(entry: [string, unknown]): entry is [string, BaseSchema] {
    const [, schema] = entry;
    return schema instanceof BaseSchema;
}

export default function YupForm<TShape extends ObjectShape>(props: Props<TShape>): ReactElement | null {
    const { schema, onSubmit } = props;
    const { register, handleSubmit, control } = useForm({
        mode: 'onBlur',
        resolver: yupResolver(schema),
    });

    const fieldSchemas = Object.entries(schema.fields);

    return (
        <Form onSubmit={handleSubmit(onSubmit as any)} noValidate className={classes.form}>
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
        </Form>
    );
}
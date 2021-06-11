import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import React, { ReactElement, useCallback, useRef, useState } from 'react';
import { Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import FormControl from './FormControl';
import useFormConfig from './useFormConfig';
import classes from './RegistrationForm.module.css';

type FormState = 'initial' | 'loading' | 'success' | Error;

export default function RegistrationForm(): ReactElement | null {
    const { schema, fields } = useFormConfig();
    const { register, handleSubmit, control } = useForm({
        mode: 'onBlur',
        resolver: yupResolver(schema),
    });
    const [formState, setFormState] = useState<FormState>('initial');
    const errorRef = useRef<HTMLDivElement>(null)

    const sendForm = useCallback(async (data: Record<string, unknown>) => {
        setFormState('loading');

        try {
            const response = await fetch('/api/register', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                setFormState(new Error(`${response.status} ${response.statusText}`));
                requestAnimationFrame(() => errorRef?.current?.scrollIntoView());
            } else {
                setFormState('success');
            }

        } catch (error) {
            setFormState(error);
        }
    }, []);

    if (formState === 'loading') {
        return (
            <div className="text-center">
                <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (formState === 'success') {
        return (
            <Card bg="success" text="white" body>
                <Card.Title>Vielen Dank!</Card.Title>
                <p>
                    Wir haben deine Anmeldung erhalten und werden sie bearbeiten. Du erhälst dann eine
                    E-Mail mit den Kontodaten für die Überweisung oder eine Information zu deinem Platz
                    in der Warteliste von uns. Ab dem erhalt der E-Mail hast du 14 Tage Zeit um den
                    Betrag zu überweisen oder dein Platz wird wieder vergeben.
                </p>
            </Card>
        );
    }

    return (
        <>
            {formState instanceof Error && (
                <div ref={errorRef} className="mb-4">
                    <Card bg="danger" text="white" body >
                        <Card.Title>Fehler</Card.Title>
                        <p>Folgender Fehler ist aufgetreten:</p>
                        <blockquote>{formState.message}</blockquote>
                        <p>
                            Bitte versuche es erneut oder benachrichtige die Orga wenn der Fehler weiterhin
                            auftritt!
                        </p>
                    </Card>
                </div>
            )}
            <Card>
                <Card.Header>
                    Anmeldung
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit(sendForm)} noValidate className={classes.form}>
                        {fields.map(field => (
                            <FormControl key={field.name} control={control} field={field} register={register} />
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
                </Card.Body>
            </Card>
        </>
    );
}
import clsx from 'clsx';
import { ReactElement, useMemo } from 'react';
import { Col, Form, InputGroup, Row } from 'react-bootstrap';
import { Control, FieldValues, UseFormRegister, useFormState } from 'react-hook-form';
import { AnySchema } from 'yup';

interface Props {
    name: string;
    schema: AnySchema;
    register: UseFormRegister<FieldValues>;
    control: Control;
}

export default function YupFormControl(props: Props): ReactElement | null {
    const { control, name, register, schema } = props;

    const { label, tests, meta, oneOf, type } = useMemo(() => schema.describe(), [schema]);
    const { props: extraProps = {}, hint, textarea = false } = meta as any ?? {};
    const required = tests.some(t => t.name === 'required') ?? false;
    const isSelect = oneOf && oneOf.length > 0;

    const elementType = useMemo(() => {
        if (isSelect) return 'select';
        if (textarea) return 'textarea';
        return 'input';
    }, [textarea, isSelect]);

    const inputType = useMemo(() => {
        if (elementType !== 'input') return undefined;
        if (type === 'date') return 'date';
        if (tests.some(t => t.name === 'email')) return 'email';
        return 'text';
    }, [elementType, type, tests]);

    const { touchedFields, errors, isSubmitted } = useFormState({ control, name });
    const isTouched = touchedFields[name];
    const fieldError = errors[name];

    if (type === 'boolean') {
        return (
            <Row>
                <Col xs={{ offset: 4 }}>
                    <Form.Check
                        type="checkbox"
                        className={clsx('mb-3', { required })}
                        id={name}
                    >
                        <Form.Check.Input
                            type="checkbox"
                            isValid={isTouched && !fieldError}
                            isInvalid={(isSubmitted || isTouched) && !!fieldError}
                            {...register(name)}
                        />
                        <Form.Check.Label>
                            {name !== 'accept' && label}
                            {name === 'accept' && (
                                <span>
                                    {'Ich habe die '}
                                    <a href="https://docs.google.com/document/d/1UDr9y04V7tZ9o__k6f3UfUFqogA5wMK0D97jTqqqTkY/edit?usp=sharing" target="_blank" rel="noreferrer">AGB</a>
                                    {' und die Datenschutzerklärung gelesen und akzeptiere sie! Ich willige ein, dass meine Daten für den Zweck dieser Veranstaltung erhoben, gespeichert und verarbeitet werden dürfen.'}
                                </span>
                            )}
                        </Form.Check.Label>
                        <Form.Control.Feedback type="invalid">
                            {fieldError?.message}
                        </Form.Control.Feedback>
                        {hint && (
                            <Form.Text>
                                {hint}
                            </Form.Text>
                        )}
                    </Form.Check>
                </Col>
            </Row>
        );
    }

    if (isSelect) {
        return (
            <Form.Group as={Row} controlId={name} className={clsx({ required })}>
                <Form.Label column sm={4}>{label}</Form.Label>
                <Col sm={8}>
                    <InputGroup hasValidation>
                        <Form.Select
                            {...register(name)}
                            {...extraProps}
                            isValid={isTouched && !fieldError}
                            isInvalid={(isSubmitted || isTouched) && !!fieldError}
                            defaultValue={schema.spec.default}
                        >
                            {['', ...oneOf].map(String).map(option => (
                                <option key={option} value={option}>
                                    {option || 'Bitte auswählen'}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {fieldError?.message}
                        </Form.Control.Feedback>
                    </InputGroup>
                    {hint && (
                        <Form.Text>
                            {hint}
                        </Form.Text>
                    )}
                </Col>
            </Form.Group>
        );
    }

    return (
        <Form.Group as={Row} controlId={name} className={clsx({ required })}>
            <Form.Label column sm={4}>{label}</Form.Label>
            <Col sm={8}>
                <InputGroup hasValidation>
                    <Form.Control
                        as={elementType}
                        type={inputType}
                        {...register(name)}
                        {...extraProps}
                        isValid={isTouched && !fieldError}
                        isInvalid={(isSubmitted || isTouched) && !!fieldError}
                        defaultValue={schema.spec.default}
                    />
                    <Form.Control.Feedback type="invalid">
                        {fieldError?.message}
                    </Form.Control.Feedback>
                </InputGroup>
                {hint && (
                    <Form.Text>
                        {hint}
                    </Form.Text>
                )}
            </Col>
        </Form.Group>
    );
}
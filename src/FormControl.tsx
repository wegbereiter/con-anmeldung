import clsx from 'clsx';
import { ComponentProps, ElementType, ReactElement } from 'react';
import { Col, Form, InputGroup, Row } from 'react-bootstrap';
import { Control, UseFormRegister, useFormState, FieldValues, RegisterOptions } from 'react-hook-form';
import { FieldConfig } from './useFormConfig';

interface Props extends ComponentProps<typeof Form.Control> {
    field: FieldConfig;
    register: UseFormRegister<FieldValues>;
    control: Control;
}

function getElementType(field: FieldConfig): ElementType {
    if (field.type === 'textarea') return 'textarea';
    if (field.type === 'select') return 'select';
    return 'input';
}

export default function FormControl(props: Props): ReactElement | null {
    const { field, register, control } = props;
    const { touchedFields, errors, isSubmitted } = useFormState({ control, name: field.name });
    const isTouched = touchedFields[field.name];
    const fieldError = errors[field.name];

    const registerOptions: RegisterOptions = {
        valueAsDate: field.type === 'date'
    };
    const required = field.validation?.spec.presence === 'required';

    if (field.type === 'checkbox') {
        return (
            <Row>
                <Col xs={{ offset: 4 }}>
                    <Form.Check
                        type="checkbox"
                        className={clsx('mb-3', { required })}
                        id={field.name}
                    >
                        <Form.Check.Input
                            type="checkbox"
                            isValid={isTouched && !fieldError}
                            isInvalid={(isSubmitted || isTouched) && !!fieldError}
                            {...register(field.name, registerOptions)}
                        />
                        <Form.Check.Label>
                            {field.name !== 'accept' && field.label}
                            {field.name === 'accept' && (
                                <span>
                                    {'Ich habe die '}
                                    <a href="https://docs.google.com/document/d/1UDr9y04V7tZ9o__k6f3UfUFqogA5wMK0D97jTqqqTkY/edit?usp=sharing" target="_blank">AGB</a>
                                    {' und die '}
                                    <a >Datenschutzerklärung</a>
                                    {' gelesen und akzeptiere sie! Ich willige ein, dass meine Daten für den Zweck dieser Veranstaltung erhoben, gespeichert und verarbeitet werden dürfen.'}
                                </span>
                            )}
                        </Form.Check.Label>
                        <Form.Control.Feedback type="invalid">
                            {fieldError?.message}
                        </Form.Control.Feedback>
                        {field.hint && (
                            <Form.Text>
                                {field.hint}
                            </Form.Text>
                        )}
                    </Form.Check>
                </Col>
            </Row>
        );
    }

    return (
        <Form.Group as={Row} controlId={field.name} className={clsx({ required })}>
            <Form.Label column sm={4}>{field.label}</Form.Label>
            <Col sm={8}>
                <InputGroup hasValidation>
                    <Form.Control
                        as={getElementType(field)}
                        type={field.type ?? 'text'}
                        {...register(field.name, registerOptions)}
                        {...(field.props ?? {})}
                        isValid={touchedFields[field.name] && !errors[field.name]}
                        isInvalid={(isSubmitted || touchedFields[field.name]) && !!errors[field.name]}
                        defaultValue={field.value}
                    >
                        {field.options && ['', ...field.options].map(option => (
                            <option key={option} value={option}>
                                {option || 'Bitte auswählen'}
                            </option>
                        ))}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                        {errors[field.name]?.message}
                    </Form.Control.Feedback>
                </InputGroup>
                {field.hint && (
                    <Form.Text>
                        {field.hint}
                    </Form.Text>
                )}
            </Col>
        </Form.Group>
    );
}

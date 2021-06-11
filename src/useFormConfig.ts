import { endOfDay, format, parseISO, sub } from 'date-fns';
import { ComponentProps, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import * as yup from 'yup';
import { AnyObjectSchema, AnySchema } from 'yup';
import useConfig from './useConfig';

export interface FieldConfig {
    readonly name: string,
    label: string;
    type?: string;
    hint?: string;
    options?: string[];
    validation?: AnySchema;
    value?: any;
    props?: ComponentProps<typeof Form.Control>;
}

type Result = { schema: AnyObjectSchema, fields: FieldConfig[] }

function createField(name: string, label: string, options: Omit<FieldConfig, 'name' | 'label'>): FieldConfig {
    return {
        name,
        label,
        ...options,
        validation: options.validation?.label(label),
    };
}

export default function useFormConfig(): Result {
    const config = useConfig();

    return useMemo(() => {
        if (!config) return { schema: yup.object({}), fields: [] };

        const maxBirthday = endOfDay(sub(config.start ? parseISO(config.start) : new Date(), { years: config.minAge }));

        const fields = [
            createField('name', 'Vor- und Nachname', { validation: yup.string().required() }),
            createField('email', 'E-Mail', { type: 'email', validation: yup.string().required().email() }),
            createField('street', 'Straße', { validation: yup.string().required() }),
            createField('zip', 'PLZ', { validation: yup.string().required() }),
            createField('city', 'Ort', { validation: yup.string().required() }),
            createField('country', 'Land', { validation: yup.string().required(), value: 'Deutschland' }),
            createField('mobile', 'Handy-Nummer', { validation: yup.string().required() }),
            createField('licensePlate', 'KFZ-Kennzeichen', {
                hint: 'Nur erforderlich, wenn du mit deinem eigenen PKW anreist.',
            }),
            createField('diet', 'Ich bin...', {
                type: 'select',
                options: ['Allesesser', 'Vegetarier', 'Veganer'],
                validation: yup.string().required(),
            }),
            createField('allergies', 'Allergien / Unverträglichkeiten', { type: 'textarea' }),
            config.fears && createField('fears', 'Ängste / Phobien', {
                type: 'textarea',
                hint: 'Beispiel: Höhenangst',
            }),
            createField('birthday', 'Geburtstag', {
                type: 'date',
                value: null,
                validation: yup
                    .date()
                    .max(maxBirthday)
                    .required()
                    .nullable()
                    .default(null),
                props: {
                    max: format(maxBirthday, 'yyyy-MM-dd'),
                },
            }),
            createField('itName', 'IT-Name', { validation: yup.string().required() }),
            config.npcBeds && createField('npc', 'Anmeldung als NSC', {
                type: 'checkbox',
                hint: config.npcPermit ? 'Bitte nur nach vorheriger Rücksprache!' : undefined,
            }),
            createField('itPowers', 'Charakter-Besonderheiten', {
                hint: `Bist du ein Freundschaftsträger der Elemente oder sogar ein Mitray'Kor?`,
            }),
            createField('sigil', 'Siegel', {
                type: 'select',
                options: ['Keines', 'Osten', 'Norden', 'Westen', 'Süden', 'Reich der Rosen'],
                validation: yup.string().required(),
            }),
            config.itRooms && createField('itBedroom', 'Ein durchgängig bespielter Schlafraum ist...', {
                type: 'select',
                options: [
                    'unerwünscht',
                    'erwünscht',
                    'erwünscht, aber nicht wenn es durch Dritte (NSC) betreten wird',
                ],
                hint: 'Deine persönlichen Gegenstände dürfen niemals entwendet, beschädigt oder bewegt werden.',
                validation: yup.string().required(),
            }),
            config.roomRequest && createField('room', 'Ich möchte ein Zimmer mit...', {
                hint: 'Wir versuchen allen Wünschen nachzugehen, können aber nichts versprechen.',
            }),
            createField('comment', 'Sonstige Anmerkungen', { type: 'textarea' }),
            createField(
                'vaccine',
                'Ich bin vollständig gegen SARS-CoV-2 geimpft',
                {
                    type: 'select',
                    options: [
                        'keine Angabe',
                        'Ja',
                        'Nein',
                    ],
                    hint: 'Die Angabe bezieht sich auf den Zeitpunkt der Veranstaltung.',
                    validation: yup.string().required(),
                },
            ),
            createField('accept', 'AGB', {
                type: 'checkbox',
                validation: yup.boolean().oneOf([true], 'Du musst die AGB und Datenschutzerklärung lesen und akzeptieren.'),
            }),
            config.minAge && createField(
                'minAge',
                `Ich bin mir über die Natur dieser Veranstaltung bewusst. Diese Con ist für Teilnehmer ab ${config.minAge} Jahren gedacht.`,
                {
                    type: 'checkbox',
                    validation: yup.boolean().oneOf([true], `Du musst bestätigen, dass du mindestens ${config.minAge} Jahre alt bist.`),
                },
            ),
        ].filter((field): field is FieldConfig => Boolean(field));

        const validators: Record<string, AnySchema> = {};

        fields.forEach((field) => {
            if (!field.validation) return;
            validators[field.name] = field.validation;
        });

        const schema = yup.object(validators);

        return { fields, schema };
    }, [config]);
}
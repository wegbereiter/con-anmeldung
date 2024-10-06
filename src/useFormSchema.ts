import { endOfDay, format, parseISO, sub } from 'date-fns';
import { useMemo } from 'react';
import { boolean, object, string, date } from 'yup';
import useConfig from './useConfig';

function opt<T>(x: unknown, schema: T): T {
    if (x) return schema;
    return undefined as unknown as T;
}

export default function useFormSchema() {
    const config = useConfig();

    return useMemo(() => {
        const maxBirthday = config
            ? endOfDay(sub(config.start ? parseISO(config.start) : new Date(), { years: config.minAge }))
            : new Date();

        return object({
            name: string().label('Vor- und Nachname').required(),
            email: string().label('E-Mail').email().required(),
            street: string().label('Straße').required(),
            zip: string().label('PLZ').required(),
            city: string().label('Ort').required(),
            country: string().label('Land').required().default('Deutschland'),
            mobile: string().label('Handy-Nummer').required(),
            licensePlate: string()
                .label('KFZ-Kennzeichen')
                .meta({ hint: 'Nur erforderlich, wenn du mit deinem eigenen PKW anreist.' }),
            diet: string()
                .label('Ich bin...')
                .required()
                .oneOf(['Allesesser', 'Vegetarier', 'Veganer']),
            allergies: string().label('Allergien / Unverträglichkeiten').meta({ textarea: true }),
            fears: opt(config?.fears, string())?.label('Ängste / Phobien').meta({ textarea: true, hint: 'Beispiel: Höhenangst' }),
            birthday: date().label('Geburtstag')
                .max(maxBirthday)
                .required()
                .nullable()
                .default(null)
                .meta({ props: { max: format(maxBirthday, 'yyyy-MM-dd') } }),
            itName: string().label('IT-Name').required(),
            npc: opt(config?.npcBeds, boolean())
                ?.label('Anmeldung als NSC')
                .meta({ hint: config?.npcPermit ? 'Bitte nur nach vorheriger Rücksprache!' : undefined }),
            itPowers: string()
                .label('Charakter-Besonderheiten'),
            sigil: opt(config?.mythodea, string()
                .label('Siegel')
                .oneOf(['Keines', 'Osten', 'Norden', 'Westen', 'Süden', 'Reich der Rosen'])
                .required()),
            itBedroom: opt(config?.itRooms, string())
                ?.label('Ein durchgängig bespielter Schlafraum ist...')
                .oneOf([
                    'unerwünscht',
                    'erwünscht',
                    'erwünscht, aber nicht wenn es durch Dritte (NSC) betreten wird',
                ])
                .required()
                .meta({ hint: 'Deine persönlichen Gegenstände dürfen niemals entwendet, beschädigt oder bewegt werden.' }),
            room: opt(config?.roomRequest, string())
                ?.label('Ich möchte ein Zimmer mit...')
                .meta({ hint: 'Wir versuchen allen Wünschen nachzugehen, können aber nichts versprechen.' }),
            comment: string().label('Sonstige Anmerkungen').meta({ textarea: true }),
            vaccine: string()
                .label('Ich bin vollständig gegen SARS-CoV-2 geimpft')
                .oneOf(['keine Angabe', 'Ja', 'Nein'])
                .required()
                .meta({ hint: 'Die Angabe bezieht sich auf den Zeitpunkt der Veranstaltung.' }),
            accept: opt(config?.agb, boolean())
                ?.label(`Ich habe die <a href="${config?.agb}" target="_blank" rel="noreferrer">AGB</a> und die Datenschutzerklärung gelesen und akzeptiere sie! Ich willige ein, dass meine Daten für den Zweck dieser Veranstaltung erhoben, gespeichert und verarbeitet werden dürfen.`)
                .oneOf([true], 'Du musst die AGB und Datenschutzerklärung lesen und akzeptieren.'),
            minAge: opt(config?.minAge, boolean())
                ?.label(`Ich bin mir über die Natur dieser Veranstaltung bewusst. Diese Con ist für Teilnehmer ab ${config?.minAge} Jahren gedacht.`)
                .oneOf([true], `Du musst bestätigen, dass du mindestens ${config?.minAge} Jahre alt bist.`),
        });
    }, [config]);
}

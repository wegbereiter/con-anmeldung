import 'bootstrap/dist/css/bootstrap.min.css';
import { format, parseISO } from 'date-fns';
import React, { Fragment, useEffect, useState } from 'react';
import { Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import './App.css';
import siegel from './assets/mythodea_siegel.png';
import logo from './assets/symbol.png';
import ImprintDialog from './ImprintDialog';
import RegistrationForm from './RegistrationForm';
import useConfig from './useConfig';

interface BedCount {
    remaining: number;
    current: number;
}

interface TotalBedCount {
    pc?: BedCount,
    npc?: BedCount,
}

const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

function AvailableBeds(props: { label: string, beds?: BedCount, total: number }) {
    const { label, beds, total } = props;
    return (
        <div>
            <strong>{`${label}: `}</strong>
            {beds && (
                <span>
                    {beds.remaining > 0 && `${beds.remaining} von ${total} verfügbar`}
                    {beds.remaining <= 0 && (
                        <>
                            <strong>Alle Plätze wurden reserviert.</strong>
                            Weitere Anmeldungen landen auf der Warteliste und rutschen nach falls es Absagen gibt.
                        </>
                    )}
                </span>
            )}
            {!beds && <span>{total}</span>}
        </div>
    );
}

function App() {
    const [beds, setBeds] = useState<TotalBedCount>({});
    const [showImprint, setShowImprint] = useState(false);
    const config = useConfig();

    useEffect(() => {
        if (!config?.showRemainingBeds) {
            return () => { };
        }

        fetch('/api/count')
            .then(response => response.json())
            .then(result => setBeds(result))
            .catch(e => console.error('Failed to load bed count', e));

        const interval = setInterval(() => {
            fetch('/api/count')
                .then(response => response.json())
                .then(result => setBeds(result))
                .catch(e => console.error('Failed to load bed count', e));
        }, 20000);

        return () => { clearInterval(interval); };
    }, [config?.showRemainingBeds]);

    if (!config) {
        return (
            <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    // If no logo is defined in config, use the default.
    // If the logo in config is falsey, don't display a logo at all.
    const actualLogo = (config.logo ?? logo) || null;

    return (
        <Container>
            <Row>
                <Col>
                    {actualLogo ? (
                        <p className="text-center">
                            <img src={actualLogo} alt="Name" style={{ width: '350px', margin: '15px' }} />
                        </p>
                    ) : null}
                    <h1>
                        {config.name}
                        <small className="text-muted" style={{ marginLeft: '1rem', fontSize: '1.6rem' }}>
                            {config.subname}
                        </small>
                    </h1>

                    {/* eslint-disable-next-line @typescript-eslint/naming-convention */}
                    <div dangerouslySetInnerHTML={{ __html: config.description ?? '' }} />
                </Col>
            </Row>
            <Row>
                <Col sm={6}>
                    <Row as="dl">
                        <Col as="dt" xs={4} className="text-right">Con-Art</Col>
                        <Col as="dd" xs={8}>
                            <p>{config.type}</p>
                        </Col>

                        {config.minAge ? (
                            <>
                                <Col as="dt" xs={4} className="text-right">Mindestalter</Col>
                                <Col as="dd" xs={8}>
                                    <p>{config.minAge} Jahre</p>
                                </Col>
                            </>
                        ) : null}

                        {config.start && config.end ? (
                            <>
                                <Col as="dt" xs={4} className="text-right">Datum</Col>
                                <Col as="dd" xs={8}>
                                    <p>
                                        {format(parseISO(config.start), 'dd.MM.yyyy')}
                                        {' – '}
                                        {format(parseISO(config.end), 'dd.MM.yyyy')}
                                    </p>
                                </Col>
                            </>
                        ) : null}

                        <Col as="dt" xs={4} className="text-right">Location</Col>
                        <Col as="dd" xs={8}>
                            <address>
                                {config.location?.map((location, idx) => (
                                    <div key={location}>
                                        {config.website && idx === 0 && (
                                            <a href={config.website} target="_blank" rel="noreferrer">{location}</a>
                                        )}
                                        {(!config.website || idx !== 0) && location}
                                    </div>
                                ))}
                            </address>
                        </Col>

                        <Col as="dt" xs={4} className="text-right">Preis</Col>
                        <Col as="dd" xs={8}>
                            <p>
                                {config.pcPrice ? (
                                    <>
                                        {euro.format(config.pcPrice)}
                                        {config.pcCatering && ' inkl. Verpflegung'}
                                        {' für Spieler'}
                                        <br />
                                    </>
                                ) : null}
                                {config.npcPrice ? (
                                    <>
                                        {euro.format(config.npcPrice)}
                                        {config.npcCatering && ' inkl. Verpflegung'}
                                        {' für NSCs'}
                                        <br />
                                        {config.npcPermit && (
                                            <small>NSC Anmeldungen nur nach vorheriger Rücksprache!</small>
                                        )}
                                    </>
                                ) : null}
                            </p>
                        </Col>

                        {config.ruleset ? (
                            <>
                                <Col as="dt" xs={4} className="text-right">Regelwerk</Col>
                                <Col as="dd" xs={8}>
                                    <p>{config.ruleset}</p>
                                </Col>
                            </>
                        ) : null}

                        <Col as="dt" xs={4} className="text-right">Orga</Col>
                        <Col as="dd" xs={8}>
                            <p className="orga">
                                {config.orga?.map((orga, index) => (
                                    <Fragment key={orga.name || orga.email}>
                                        {index > 0 && ', '}
                                        {orga.email && <a href={`mailto:${orga.email}`}>{orga.name}</a>}
                                        {!orga.email && orga.name}
                                    </Fragment>
                                ))}
                            </p>
                        </Col>

                        {(config.pcBeds || config.npcBeds) ? (
                            <>
                                <Col as="dt" xs={4} className="text-right">Verfügbare Plätze</Col>
                                <Col as="dd" xs={8}>
                                    {config.pcBeds ? (
                                        <AvailableBeds
                                            label="Spieler"
                                            total={config.pcBeds}
                                            beds={beds.pc}
                                        />
                                    ) : null}
                                    {config.npcBeds ? (
                                        <AvailableBeds
                                            label="NSC"
                                            total={config.npcBeds}
                                            beds={beds.npc}
                                        />
                                    ) : null}
                                </Col>
                            </>
                        ) : null}
                    </Row>
                </Col>
                <Col sm={6} className="text-right">
                    {config.mythodea ? (
                        <a
                            href="https://www.live-adventure.de/de/spielwelt-medien/weitere-veranstaltungen/siedlercons"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <img src={siegel} alt="Mythodea Siegel" />
                        </a>
                    ) : null}
                </Col>
            </Row>

            <Row>
                <Col md={8}>
                    <RegistrationForm />
                </Col>
            </Row>

            <p>
                <Button variant="link" onClick={() => setShowImprint(true)}>Impressum & Datenschutz</Button>
            </p>

            <ImprintDialog show={showImprint} onHide={() => setShowImprint(false)} />
        </Container>
    );
}

export default App;

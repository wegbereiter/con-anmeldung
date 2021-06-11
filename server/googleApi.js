const { GoogleSpreadsheet } = require('google-spreadsheet');
const dateRegExp = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
const moment = require('moment-timezone');

const columns = {
    name: 'Name',
    email: 'E-Mail',
    street: 'Straße',
    zip: 'PLZ',
    city: 'Ort',
    country: 'Land',
    mobile: 'Handy-Nummer',
    licensePlate: 'KFZ-Kennzeichen',
    diet: 'Ernährung',
    allergies: 'Allergien',
    fears: 'Phobien',
    birthday: 'Geburtstag',
    npc: 'NPC',
    itName: 'IT-Name',
    itPowers: 'Char-Besonderheiten',
    itBedroom: 'Bespieltes Zimmer',
    sigil: 'Siegel',
    room: 'Zimmerwunsch',
    accept: 'AGB',
    minAge: 'Mindestalter',
    comment: 'Kommentar',
    vaccine: 'Impfung',
};

class GoogleApi {
    constructor(credentials, spreadSheetId) {
        this.credentials = credentials;
        this.spreadSheet = new GoogleSpreadsheet(spreadSheetId);
    }

    authenticate() {
        return this.spreadSheet.useServiceAccountAuth(this.credentials);
    }

    async register(person) {
        const data = this.transformData(person);
        console.info('Register person:', data);
        await this.spreadSheet.loadInfo();
        const sheet = this.spreadSheet.sheetsByIndex[0];
        await sheet.addRow(data)
    }

    async countRows() {
        await this.spreadSheet.loadInfo();
        const sheet = this.spreadSheet.sheetsByIndex[0];
        const rows = await sheet.getRows();

        return {
            pc: rows.filter(row => row.NPC.toLowerCase() !== 'ja').length,
            npc: rows.filter(row => row.NPC.toLowerCase() === 'ja').length,
        }
    }

    transformData(data) {
        const output = {};
        Object
            .entries(columns)
            .forEach(([key, targetKey]) => {
                if (!data.hasOwnProperty(key)) {
                    console.warn('Data is missing property:', key);
                }

                output[targetKey] = data[key];

                if (output[targetKey] == null) output[targetKey] = '';
                if (output[targetKey] === false) output[targetKey] = 'Nein';
                else if (output[targetKey] === true) output[targetKey] = 'Ja';
                else if (['birthday'].includes(key)) {
                    output[targetKey] = moment(output[targetKey])
                        .tz('Europe/Berlin')
                        .format('DD.MM.YYYY');
                } else if (!output[targetKey].match(dateRegExp)) {
                    output[targetKey] = "'" + output[columns[key]];
                }
            });

        output['Datum'] = moment()
            .tz('Europe/Berlin')
            .format('DD.MM.YYYY, HH:mm');

        return output;
    }
}

module.exports = GoogleApi;

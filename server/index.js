require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const pathUtil = require('path');
const commander = require('commander');
const GoogleApi = require('./googleApi');

commander
    .version('1.0.0')
    .option('-p, --port <port>', 'Port', process.env.PORT || 80)
    .option('-s, --sheet <sheetId>', 'The ID for the spread sheet', process.env.SHEET)
    .option('-k, --key <key>', 'The private key for the google API user', process.env.GOOGLE_KEY)
    .option('-d, --dir <path>', 'The path to the application directory', process.env.DIRECTORY)
    .option('-b, --pcs <number>', 'The maximum number of pc beds', process.env.BEDS_PC || 0)
    .option('-n, --npcs <number>', 'The maximum number of npc beds', process.env.BEDS_NPC || 0)
    .option('-a, --age <number>', 'The minimum age of players', process.env.MIN_AGE || 0)
    .option('--start <yyyymm-dd>', 'The start date', process.env.START_DATE)
    .option('--end <yyyy-mm-dd>', 'The end date', process.env.END_DATE)
    .option('--name <string>', 'Name of con', process.env.CON_NAME)
    .option('--subname <string>', 'Sub title of con', process.env.CON_NAME_SUB)
    .option('--description <string>', 'Name of con', process.env.CON_DESCRIPTION)
    .option('--type <string>', 'Type of con', process.env.CON_TYPE)
    .option('--location <string>', 'Location of con', process.env.CON_LOCATION)
    .option('--website <string>', 'Location website', process.env.CON_LOCATION_WEBSITE)
    .option('--pcprice <number>', 'PC price', process.env.PRICE_PC)
    .option('--npcprice <number>', 'NPC price', process.env.PRICE_NPC)
    .option('--orga <name,email,name2|email2>', 'Orga list', process.env.CON_ORGA)
    .option('--itrooms <boolean>', 'IT rooms select', process.env.IT_ROOMS)
    .option('--fears <boolean>', 'Fears input field', process.env.FEARS)
    .option('--roomrequest <boolean>', 'Room request input field', process.env.ROOM_REQUEST)
    .option('--npccatering <boolean>', 'NPC catering', process.env.NPC_CATERING)
    .option('--pccatering <boolean>', 'PC catering', process.env.PC_CATERING)
    .option('--npcpermit <boolean>', 'NPCs need a permit', process.env.NPC_PERMIT)
    .option('--showremainingbeds <boolean>', 'NPCs need a permit', process.env.SHOW_REMAINING_BEDS)
    .option('--vaccine <boolean>', 'NPCs need a permit', process.env.CORONA_VACCINE)
    .parse(process.argv);

const app = express();

const cmdOptions = commander.opts();

const options = {
    npcBeds: Number(cmdOptions.npcs),
    pcBeds: Number(cmdOptions.pcs),
    showRemainingBeds: cmdOptions.showremainingbeds === 'true',
    coronaVaccine: cmdOptions.vaccine === 'true',
    minAge: Number(cmdOptions.age),
    start: cmdOptions.start,
    end: cmdOptions.end,
    name: cmdOptions.name,
    subname: cmdOptions.subname,
    description: cmdOptions.description,
    type: cmdOptions.type,
    location: cmdOptions.location.split('\n'),
    website: cmdOptions.website,
    pcPrice: Number(cmdOptions.pcprice),
    npcPrice: Number(cmdOptions.npcprice),
    orga: cmdOptions.orga
        .split(',')
        .map(entry => entry.split('|'))
        .map(([name, email]) => ({ name, email })),
    itRooms: cmdOptions.itrooms === 'true',
    fears: cmdOptions.fears === 'true',
    roomRequest: cmdOptions.roomrequest === 'true',
    npcCatering: cmdOptions.npccatering === 'true',
    pcCatering: cmdOptions.pccatering === 'true',
    npcPermit: cmdOptions.npcpermit === 'true',
};

app.use(bodyParser.json());

app.get('/api/config', (req, res) => {
    res.status(200).json(options);
});

if (cmdOptions.key && cmdOptions.sheet) {
    const key = JSON.parse(cmdOptions.key);
    const sheetId = cmdOptions.sheet;

    const api = new GoogleApi(key, sheetId);

    app.post('/api/register', (req, res) => {
        api.authenticate()
            .then(() => api.register(req.body))
            .then(() => res.status(200).json({ message: 'success' }))
            .catch(e => res.status(500).json({ message: e.message }));
    });

    app.get('/api/count', (req, res) => {
        api.authenticate()
            .then(() => api.countRows())
            .then(count =>
                res.status(200).json({
                    pc: { current: count.pc, remaining: options.pcBeds - count.pc },
                    npc: { current: count.npc, remaining: options.npcBeds - count.npc },
                }),
            )
            .catch(e => res.status(500).json({ message: e.message }));
    });
} else {
    console.warn('Warning: /api endpoints are disabled');
}

if (cmdOptions.dir) {
    const root = pathUtil.resolve(process.cwd(), cmdOptions.dir.trim());

    console.log('Static directory:', root);
    app.use(compression());
    app.use(express.static(root));
} else {
    console.warn('Warning: no files will be served via this server');
}

app.listen(cmdOptions.port, () => {
    console.log(`Listening to port ${cmdOptions.port}!`);
});

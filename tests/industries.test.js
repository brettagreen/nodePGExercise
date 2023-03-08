// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const createTestData  = require('../testData');
const db = require('../db');

beforeAll(createTestData);

afterAll(async function() {
    await db.end();
    process.env.NODE_ENV = 'dev';
});

describe('GET /', function() {
    test('return a list of all industries and their company affiliations', async function() {
        const res = await request(app).get('/industries');
        expect(res.statusCode).toBe(200);
        console.log(res.body);
        expect(res.body).toEqual({ "industries": [
            {code: 'tech', industry: 'Information Technology', comp_id: 'dell'},
            {code: 'tech', industry: 'Information Technology', comp_id: 'ibm'},
            {code: 'food', industry: 'Commercial food product', comp_id: 'jenny'},
            {code: 'advTech', industry: 'Quantum Computing', comp_id: 'dell'}
        ]});
    });
});

describe('POST /', function() {
    test('create an industry (lol)', async function() {
        const res = await request(app).post('/industries').send({ code: "sleep", industry: 'Melatonin manufacturers of Zion' });

        expect(res.status).toEqual(201);
        
        expect(res.body).toEqual({
            industry: {
                code: "sleep",
                industry: "Melatonin manufacturers of Zion"
            }
        });
    });
});

describe('POST /:industry/:company', function() {
    test('associate an industry with a company', async function() {
        const res = await request(app).post('/industries/advTech/ibm');
        expect(res.status).toEqual(201);
            
        expect(res.body).toEqual({
            industry: {
                code_id: "advTech",
                comp_id: "ibm"
            }
        });
    });
});


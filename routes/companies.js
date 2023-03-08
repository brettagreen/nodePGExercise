const db = require('../db');
const sluggish = require('slugify');
const express = require("express");
const router = new express.Router();

const ExpressError = require("../expressError");

router.get("/", async function(req, res, next) {
    try {
        const results = await db.query('SELECT code, name FROM companies');
        return res.json({companies: results.rows});
    
    } catch (err) {
        return next(err);
    }
});

router.get('/:compCode', async function(req, res, next) {
    try {
        const { compCode } = req.params;
        const results = await db.query(`SELECT c.code, c.name, c.description, i.industry FROM companies c 
            LEFT JOIN industry_affiliation ia ON c.code = ia.comp_id
            LEFT JOIN industries i ON i.code = ia.code_id
            WHERE c.code=$1`, [compCode]);

        if (results.rows.length === 0) {
            throw new ExpressError(`that company code - ${compCode} - cannot be found`, 404);
        }

        const { code, name, description } = results.rows[0];
        const industryAffiliations = results.rows.map(row => row.industry);

        return res.json({company: {code, name, description, industryAffiliations}});
    } catch(err) {
        return next(err);
    }
});

router.post('/', async function(req, res, next) {
    try {
        const { name, description } = req.body;
        const code = sluggish(name);
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description',
     [code, name, description]);
     return res.status(201).json({company: results.rows[0]});
    } catch (err) {
        return next(err);
    }
});

router.put('/:code', async function(req, res, next) {
    try {
        const code = req.params.code;
        const { name, description } = req.body;
        const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description',
            [name, description, code]);

        if (results.rows.length === 0) {
            throw new ExpressError(`that company code - ${code} - cannot be found`, 404);
        }

        return res.json({company: results.rows[0]})
    } catch (err) {
        return next(err);
    }
});

router.delete('/:code', async function(req, res, next) {
    try {
        const code = req.params.code;
        const results = await db.query('DELETE FROM companies WHERE code=$1 RETURNING code', [code]);
        
        if (results.rows.length === 0) {
            throw new ExpressError(`that company code - ${code} - cannot be found`, 404);
        }

        return res.json({status: "deleted"});
    } catch (err) {
        return next(err);
    }
});

module.exports = router;

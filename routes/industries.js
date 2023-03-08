const db = require('../db');
const express = require("express");
const router = new express.Router();

const ExpressError = require("../expressError");

router.get("/", async function(req, res, next) {
    try {
        const results = await db.query(`SELECT i.code, i.industry, ia.comp_id FROM industries i
                                        LEFT JOIN industry_affiliation ia ON i.code = ia.code_id`);

        return res.json({industries: results.rows});
    } catch (err) {
        return next(err);
    }
});

router.post('/', async function (req, res, next) {
    const { code, industry } = req.body;
    try {
        const results = await db.query('INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry', [code, industry]);
        return res.status(201).json({industry: results.rows[0]});
    } catch (err) {
        return next(err);
    }
});

router.post('/:industry/:company', async function (req, res, next) {
    const { industry, company } = req.params;
    try {
        const results = await db.query('INSERT INTO industry_affiliation (code_id, comp_id) VALUES ($1, $2) RETURNING code_id, comp_id',
             [industry, company]);

        return res.status(201).json({industry: results.rows[0]});
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
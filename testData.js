const db = require("./db");

async function createTestData() {
    //delete everything from data first
    await db.query('DELETE FROM invoices');
    await db.query('DELETE FROM companies');
    await db.query('DELETE FROM industries');

    await db.query("SELECT setval('invoices_id_seq', 1, false)");

    await db.query(
       `INSERT INTO companies (code, name, description)
              VALUES ('dell', 'Dell computers', 'donchya wish'),
                     ('ibm', 'IBM', 'Big blue.'),
                     ('jenny', 'Jenny-O Turkey', 'yum yum')`
    );

    await db.query(
       `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
              VALUES ('dell', 100, false, '2021-01-01', null),
                     ('jenny', 200, true, '2019-02-28', '2022-05-05'), 
                     ('ibm', 300, false, '2020-03-19', null)`
    );

    await db.query(
       `INSERT INTO industries (code, industry) 
              VALUES ('tech', 'Information Technology'),
                     ('food', 'Commercial food product'),
                     ('advTech', 'Quantum Computing')`
    );

   await db.query(
       `INSERT INTO industry_affiliation (code_id, comp_id)
              VALUES ('tech', 'dell'), ('tech', 'ibm'), ('food', 'jenny'), ('advTech', 'dell')`
   );
}

module.exports = createTestData;
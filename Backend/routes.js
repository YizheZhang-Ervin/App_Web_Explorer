let express = require('express');
let vm = require("vm");
let exec = require('child_process').exec;
// var userQuery = require('./models')

let router = express.Router();

/* GET from DB */
// router.get('/api/users', function(req, res, next) {
//     let sql = "select * from nodebook.users";
//     userQuery.queryAll(sql,function(err,rows,fields){
//         console.log(rows);
//     });
// });


router.get('/', function(req, res, next) {
    res.render("index");
});

router.post('/api/js/', function(req, res, next) {
    let codes = JSON.parse(req.body["key"]);
    let context = {};
    const script = new vm.Script(codes);
    vm.createContext(context);
    script.runInContext(context);
    res.status(200);
    res.json({
      result: JSON.stringify(context)
    });
});

router.post('/api/shell/', function(req, res, next) {
    let codes = JSON.parse(req.body["key"]);
    exec(codes,(error, stdout, stderr)=>{
        if(error) {
            console.error('error: ' + error);
            return;
        }
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + typeof stderr);
        res.status(200);
        res.json({
            result: JSON.stringify(stdout)
        });
    });
});

module.exports = router;
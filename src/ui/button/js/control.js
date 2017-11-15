var model = require('./model');
var view = require('./view');
let mainTpl = require('../tpl/main.juicer')
require('../less/main.less')
$('body').append(mainTpl())
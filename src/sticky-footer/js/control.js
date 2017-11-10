console.log('test');
require('../less/main.less');
var mainTplCreate = require('../tpl/main.juicer');

$('body').append(mainTplCreate())
/* Jison generated parser */
var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"module_statements":3,"statements":4,"eof":5,"statements_list":6,"hash_entries":7,",":8,"expression":9,"statement":10,"arguments":11,"arguments_list":12,"argument":13,":":14,"parameters":15,"parameter_list":16,"=":17,":=":18,"operator_expression":19,"operator_with_newline":20,"operator":21,"unary_operator_expression":22,"object_operation":23,"unary_operator":24,"object_reference_with_newline":25,".":26,"complex_expression":27,"basic_expression_list":28,"terminal_list":29,"terminal":30,"async_operator":31,"!":32,"(":33,")":34,"@":35,"block_start":36,"}":37,"=>":38,"[":39,"]":40,"{":41,"float":42,"integer":43,"identifier":44,"string":45,"reg_exp":46,"interpolated_string":47,"...":48,"@{":49,"interpolated_terminal":50,"start_interpolated_string":51,"interpolated_string_components":52,"end_interpolated_string":53,"interpolated_string_component":54,"interpolated_string_body":55,"escaped_interpolated_string_terminal_start":56,"escape_sequence":57,"$accept":0,"$end":1},
terminals_: {2:"error",5:"eof",8:",",14:":",17:"=",18:":=",21:"operator",26:".",32:"!",33:"(",34:")",35:"@",37:"}",38:"=>",39:"[",40:"]",41:"{",42:"float",43:"integer",44:"identifier",45:"string",46:"reg_exp",48:"...",49:"@{",51:"start_interpolated_string",53:"end_interpolated_string",55:"interpolated_string_body",56:"escaped_interpolated_string_terminal_start",57:"escape_sequence"},
productions_: [0,[3,2],[4,1],[7,3],[7,1],[7,0],[6,3],[6,1],[6,0],[11,1],[11,0],[12,3],[12,1],[13,3],[13,1],[15,1],[15,0],[16,3],[16,1],[10,1],[9,3],[9,3],[9,1],[20,2],[20,1],[19,3],[19,1],[22,1],[22,2],[25,2],[25,1],[23,3],[23,1],[27,1],[28,1],[29,2],[29,2],[29,1],[31,1],[30,3],[30,4],[30,3],[30,4],[30,3],[30,3],[30,1],[30,1],[30,1],[30,1],[30,1],[30,1],[30,1],[36,2],[36,1],[24,1],[24,1],[50,3],[47,3],[47,2],[52,2],[52,1],[54,1],[54,1],[54,1],[54,1]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1:return $$[$0-1];
break;
case 2:this.$ = yy.terms.asyncStatements($$[$0]);
break;
case 3:$$[$0-2].push($$[$0].hashEntry()); this.$ = $$[$0-2];
break;
case 4:this.$ = [$$[$0].hashEntry()];
break;
case 5:this.$ = [];
break;
case 6:$$[$0-2].push($$[$0]); this.$ = $$[$0-2];
break;
case 7:this.$ = [$$[$0]];
break;
case 8:this.$ = [];
break;
case 9:this.$ = $$[$0];
break;
case 10:this.$ = [];
break;
case 11:$$[$0-2].push($$[$0]); this.$ = $$[$0-2];
break;
case 12:this.$ = [$$[$0]];
break;
case 13:this.$ = $$[$0-2].definition($$[$0].expression()).hashEntry(true);
break;
case 14:this.$ = $$[$0]
break;
case 15:this.$ = $$[$0];
break;
case 16:this.$ = [];
break;
case 17:$$[$0-2].push($$[$0]); this.$ = $$[$0-2];
break;
case 18:this.$ = [$$[$0]];
break;
case 19:this.$ = $$[$0].expression();
break;
case 20:this.$ = $$[$0-2].definition($$[$0].expression());
break;
case 21:this.$ = $$[$0-2].definition($$[$0].expression(), {assignment: true});
break;
case 22:this.$ = $$[$0];
break;
case 23:this.$ = $$[$0-1]
break;
case 24:this.$ = $$[$0]
break;
case 25:$$[$0-2].addOperatorExpression($$[$0-1], $$[$0]); this.$ = $$[$0-2];
break;
case 26:this.$ = yy.terms.operatorExpression($$[$0]);
break;
case 27:this.$ = $$[$0];
break;
case 28:this.$ = yy.terms.unaryOperatorExpression($$[$0-1], $$[$0].expression());
break;
case 29:this.$ = $$[$0-1]
break;
case 30:this.$ = $$[$0]
break;
case 31:this.$ = $$[$0].objectOperation($$[$0-2].expression());
break;
case 32:this.$ = $$[$0];
break;
case 33:this.$ = yy.terms.complexExpression($$[$0]);
break;
case 34:this.$ = [$$[$0]];
break;
case 35:$$[$0-1].push($$[$0]); this.$ = $$[$0-1];
break;
case 36:$$[$0-1].push($$[$0]); this.$ = $$[$0-1];
break;
case 37:this.$ = [$$[$0]];
break;
case 38:this.$ = yy.loc(yy.terms.asyncArgument(), this._$);
break;
case 39:this.$ = yy.loc(yy.terms.argumentList($$[$0-1]), this._$);
break;
case 40:this.$ = yy.loc(yy.terms.parameters($$[$0-1]), this._$);
break;
case 41:this.$ = yy.loc(yy.terms.block([], $$[$0-1]), this._$);
break;
case 42:this.$ = yy.loc(yy.terms.block([], $$[$0-1], {redefinesSelf: true}), this._$);
break;
case 43:this.$ = yy.loc(yy.terms.list($$[$0-1]), this._$);
break;
case 44:this.$ = yy.loc(yy.terms.hash($$[$0-1]), this._$);
break;
case 45:this.$ = yy.loc(yy.terms.float(parseFloat(yytext)), this._$);
break;
case 46:this.$ = yy.loc(yy.terms.integer(parseInt(yytext, 10)), this._$);
break;
case 47:this.$ = yy.loc(yy.terms.identifier(yytext), this._$);
break;
case 48:this.$ = yy.loc(yy.terms.string(yy.unindentBy(yy.normaliseString(yytext), this._$.first_column + 1)), this._$);
break;
case 49:this.$ = yy.loc(yy.terms.regExp(yy.parseRegExp(yy.unindentBy(yytext, this._$.first_column + 2))), this._$);
break;
case 50:this.$ = yy.loc($$[$0], this._$);
break;
case 51:this.$ = yy.loc(yy.terms.splat(), this._$);
break;
case 52:this.$ = '@{'
break;
case 53:this.$ = '@{'
break;
case 54:this.$ = $$[$0];
break;
case 55:this.$ = $$[$0];
break;
case 56:this.$ = $$[$0-1];
break;
case 57:this.$ = yy.terms.interpolatedString(yy.normaliseStringComponentsUnindentingBy($$[$0-1], this._$.first_column + 1));
break;
case 58:this.$ = yy.terms.interpolatedString([]);
break;
case 59:$$[$0-1].push($$[$0]); this.$ = $$[$0-1];
break;
case 60:this.$ = [$$[$0]];
break;
case 61:this.$ = $$[$0];
break;
case 62:this.$ = yy.terms.string($$[$0]);
break;
case 63:this.$ = yy.terms.string("#");
break;
case 64:this.$ = yy.terms.string(yy.normaliseInterpolatedString($$[$0]));
break;
}
},
table: [{3:1,4:2,5:[2,8],6:3,8:[2,8],9:5,10:4,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{1:[3]},{5:[1,31]},{5:[2,2],8:[1,32],37:[2,2]},{5:[2,7],8:[2,7],37:[2,7]},{5:[2,19],8:[2,19],17:[1,33],18:[1,34],34:[2,19],37:[2,19]},{5:[2,22],8:[2,22],14:[2,22],17:[2,22],18:[2,22],20:35,21:[1,36],34:[2,22],37:[2,22],40:[2,22]},{5:[2,26],8:[2,26],14:[2,26],17:[2,26],18:[2,26],21:[2,26],34:[2,26],37:[2,26],40:[2,26]},{5:[2,27],8:[2,27],14:[2,27],17:[2,27],18:[2,27],21:[2,27],25:37,26:[1,38],34:[2,27],37:[2,27],40:[2,27]},{21:[1,11],22:39,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{5:[2,32],8:[2,32],14:[2,32],17:[2,32],18:[2,32],21:[2,32],26:[2,32],34:[2,32],37:[2,32],40:[2,32]},{21:[2,54],32:[2,54],33:[2,54],35:[2,54],38:[2,54],39:[2,54],41:[2,54],42:[2,54],43:[2,54],44:[2,54],45:[2,54],46:[2,54],48:[2,54],49:[2,54],51:[2,54]},{21:[2,55],32:[2,55],33:[2,55],35:[2,55],38:[2,55],39:[2,55],41:[2,55],42:[2,55],43:[2,55],44:[2,55],45:[2,55],46:[2,55],48:[2,55],49:[2,55],51:[2,55]},{5:[2,33],8:[2,33],14:[2,33],17:[2,33],18:[2,33],21:[2,33],26:[2,33],34:[2,33],37:[2,33],40:[2,33]},{5:[2,34],8:[2,34],14:[2,34],17:[2,34],18:[2,34],21:[2,34],26:[2,34],30:40,31:41,32:[1,42],33:[1,16],34:[2,34],35:[1,17],36:18,37:[2,34],38:[1,19],39:[1,20],40:[2,34],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{5:[2,37],8:[2,37],14:[2,37],17:[2,37],18:[2,37],21:[2,37],26:[2,37],32:[2,37],33:[2,37],34:[2,37],35:[2,37],37:[2,37],38:[2,37],39:[2,37],40:[2,37],41:[2,37],42:[2,37],43:[2,37],44:[2,37],45:[2,37],46:[2,37],48:[2,37],49:[2,37],51:[2,37]},{9:46,10:47,11:43,12:44,13:45,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],34:[2,10],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{33:[1,48],41:[1,49]},{4:50,6:3,8:[2,8],9:5,10:4,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,37:[2,8],38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{35:[1,52],36:51,49:[1,29]},{9:46,10:47,11:53,12:44,13:45,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],40:[2,10],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{7:54,8:[2,5],9:55,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,37:[2,5],38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{5:[2,45],8:[2,45],14:[2,45],17:[2,45],18:[2,45],21:[2,45],26:[2,45],32:[2,45],33:[2,45],34:[2,45],35:[2,45],37:[2,45],38:[2,45],39:[2,45],40:[2,45],41:[2,45],42:[2,45],43:[2,45],44:[2,45],45:[2,45],46:[2,45],48:[2,45],49:[2,45],51:[2,45]},{5:[2,46],8:[2,46],14:[2,46],17:[2,46],18:[2,46],21:[2,46],26:[2,46],32:[2,46],33:[2,46],34:[2,46],35:[2,46],37:[2,46],38:[2,46],39:[2,46],40:[2,46],41:[2,46],42:[2,46],43:[2,46],44:[2,46],45:[2,46],46:[2,46],48:[2,46],49:[2,46],51:[2,46]},{5:[2,47],8:[2,47],14:[2,47],17:[2,47],18:[2,47],21:[2,47],26:[2,47],32:[2,47],33:[2,47],34:[2,47],35:[2,47],37:[2,47],38:[2,47],39:[2,47],40:[2,47],41:[2,47],42:[2,47],43:[2,47],44:[2,47],45:[2,47],46:[2,47],48:[2,47],49:[2,47],51:[2,47]},{5:[2,48],8:[2,48],14:[2,48],17:[2,48],18:[2,48],21:[2,48],26:[2,48],32:[2,48],33:[2,48],34:[2,48],35:[2,48],37:[2,48],38:[2,48],39:[2,48],40:[2,48],41:[2,48],42:[2,48],43:[2,48],44:[2,48],45:[2,48],46:[2,48],48:[2,48],49:[2,48],51:[2,48]},{5:[2,49],8:[2,49],14:[2,49],17:[2,49],18:[2,49],21:[2,49],26:[2,49],32:[2,49],33:[2,49],34:[2,49],35:[2,49],37:[2,49],38:[2,49],39:[2,49],40:[2,49],41:[2,49],42:[2,49],43:[2,49],44:[2,49],45:[2,49],46:[2,49],48:[2,49],49:[2,49],51:[2,49]},{5:[2,50],8:[2,50],14:[2,50],17:[2,50],18:[2,50],21:[2,50],26:[2,50],32:[2,50],33:[2,50],34:[2,50],35:[2,50],37:[2,50],38:[2,50],39:[2,50],40:[2,50],41:[2,50],42:[2,50],43:[2,50],44:[2,50],45:[2,50],46:[2,50],48:[2,50],49:[2,50],51:[2,50]},{5:[2,51],8:[2,51],14:[2,51],17:[2,51],18:[2,51],21:[2,51],26:[2,51],32:[2,51],33:[2,51],34:[2,51],35:[2,51],37:[2,51],38:[2,51],39:[2,51],40:[2,51],41:[2,51],42:[2,51],43:[2,51],44:[2,51],45:[2,51],46:[2,51],48:[2,51],49:[2,51],51:[2,51]},{8:[2,53],21:[2,53],32:[2,53],33:[2,53],35:[2,53],37:[2,53],38:[2,53],39:[2,53],41:[2,53],42:[2,53],43:[2,53],44:[2,53],45:[2,53],46:[2,53],48:[2,53],49:[2,53],51:[2,53]},{33:[1,63],50:59,52:56,53:[1,57],54:58,55:[1,60],56:[1,61],57:[1,62]},{1:[2,1]},{9:5,10:64,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{9:65,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{9:66,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{21:[1,11],22:67,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{8:[1,68],21:[2,24],32:[2,24],33:[2,24],35:[2,24],38:[2,24],39:[2,24],41:[2,24],42:[2,24],43:[2,24],44:[2,24],45:[2,24],46:[2,24],48:[2,24],49:[2,24],51:[2,24]},{27:69,28:13,29:14,30:15,33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{8:[1,70],33:[2,30],35:[2,30],38:[2,30],39:[2,30],41:[2,30],42:[2,30],43:[2,30],44:[2,30],45:[2,30],46:[2,30],48:[2,30],49:[2,30],51:[2,30]},{5:[2,28],8:[2,28],14:[2,28],17:[2,28],18:[2,28],21:[2,28],34:[2,28],37:[2,28],40:[2,28]},{5:[2,35],8:[2,35],14:[2,35],17:[2,35],18:[2,35],21:[2,35],26:[2,35],32:[2,35],33:[2,35],34:[2,35],35:[2,35],37:[2,35],38:[2,35],39:[2,35],40:[2,35],41:[2,35],42:[2,35],43:[2,35],44:[2,35],45:[2,35],46:[2,35],48:[2,35],49:[2,35],51:[2,35]},{5:[2,36],8:[2,36],14:[2,36],17:[2,36],18:[2,36],21:[2,36],26:[2,36],32:[2,36],33:[2,36],34:[2,36],35:[2,36],37:[2,36],38:[2,36],39:[2,36],40:[2,36],41:[2,36],42:[2,36],43:[2,36],44:[2,36],45:[2,36],46:[2,36],48:[2,36],49:[2,36],51:[2,36]},{5:[2,38],8:[2,38],14:[2,38],17:[2,38],18:[2,38],21:[2,38],26:[2,38],32:[2,38],33:[2,38],34:[2,38],35:[2,38],37:[2,38],38:[2,38],39:[2,38],40:[2,38],41:[2,38],42:[2,38],43:[2,38],44:[2,38],45:[2,38],46:[2,38],48:[2,38],49:[2,38],51:[2,38]},{34:[1,71]},{8:[1,72],34:[2,9],40:[2,9]},{8:[2,12],34:[2,12],40:[2,12]},{8:[2,19],14:[1,73],17:[1,33],18:[1,34],34:[2,19],40:[2,19]},{8:[2,14],34:[2,14],40:[2,14]},{9:5,10:76,15:74,16:75,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],34:[2,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{8:[2,52],21:[2,52],32:[2,52],33:[2,52],35:[2,52],37:[2,52],38:[2,52],39:[2,52],41:[2,52],42:[2,52],43:[2,52],44:[2,52],45:[2,52],46:[2,52],48:[2,52],49:[2,52],51:[2,52]},{37:[1,77]},{4:78,6:3,8:[2,8],9:5,10:4,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,37:[2,8],38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{41:[1,49]},{40:[1,79]},{8:[1,81],37:[1,80]},{8:[2,4],17:[1,33],18:[1,34],37:[2,4]},{33:[1,63],50:59,53:[1,82],54:83,55:[1,60],56:[1,61],57:[1,62]},{5:[2,58],8:[2,58],14:[2,58],17:[2,58],18:[2,58],21:[2,58],26:[2,58],32:[2,58],33:[2,58],34:[2,58],35:[2,58],37:[2,58],38:[2,58],39:[2,58],40:[2,58],41:[2,58],42:[2,58],43:[2,58],44:[2,58],45:[2,58],46:[2,58],48:[2,58],49:[2,58],51:[2,58]},{33:[2,60],53:[2,60],55:[2,60],56:[2,60],57:[2,60]},{33:[2,61],53:[2,61],55:[2,61],56:[2,61],57:[2,61]},{33:[2,62],53:[2,62],55:[2,62],56:[2,62],57:[2,62]},{33:[2,63],53:[2,63],55:[2,63],56:[2,63],57:[2,63]},{33:[2,64],53:[2,64],55:[2,64],56:[2,64],57:[2,64]},{9:5,10:84,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{5:[2,6],8:[2,6],37:[2,6]},{5:[2,20],8:[2,20],14:[2,20],17:[1,33],18:[1,34],34:[2,20],37:[2,20],40:[2,20]},{5:[2,21],8:[2,21],14:[2,21],17:[1,33],18:[1,34],34:[2,21],37:[2,21],40:[2,21]},{5:[2,25],8:[2,25],14:[2,25],17:[2,25],18:[2,25],21:[2,25],34:[2,25],37:[2,25],40:[2,25]},{21:[2,23],32:[2,23],33:[2,23],35:[2,23],38:[2,23],39:[2,23],41:[2,23],42:[2,23],43:[2,23],44:[2,23],45:[2,23],46:[2,23],48:[2,23],49:[2,23],51:[2,23]},{5:[2,31],8:[2,31],14:[2,31],17:[2,31],18:[2,31],21:[2,31],26:[2,31],34:[2,31],37:[2,31],40:[2,31]},{33:[2,29],35:[2,29],38:[2,29],39:[2,29],41:[2,29],42:[2,29],43:[2,29],44:[2,29],45:[2,29],46:[2,29],48:[2,29],49:[2,29],51:[2,29]},{5:[2,39],8:[2,39],14:[2,39],17:[2,39],18:[2,39],21:[2,39],26:[2,39],32:[2,39],33:[2,39],34:[2,39],35:[2,39],37:[2,39],38:[2,39],39:[2,39],40:[2,39],41:[2,39],42:[2,39],43:[2,39],44:[2,39],45:[2,39],46:[2,39],48:[2,39],49:[2,39],51:[2,39]},{9:46,10:47,13:85,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{9:86,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{34:[1,87]},{8:[1,88],34:[2,15]},{8:[2,18],34:[2,18]},{5:[2,41],8:[2,41],14:[2,41],17:[2,41],18:[2,41],21:[2,41],26:[2,41],32:[2,41],33:[2,41],34:[2,41],35:[2,41],37:[2,41],38:[2,41],39:[2,41],40:[2,41],41:[2,41],42:[2,41],43:[2,41],44:[2,41],45:[2,41],46:[2,41],48:[2,41],49:[2,41],51:[2,41]},{37:[1,89]},{5:[2,43],8:[2,43],14:[2,43],17:[2,43],18:[2,43],21:[2,43],26:[2,43],32:[2,43],33:[2,43],34:[2,43],35:[2,43],37:[2,43],38:[2,43],39:[2,43],40:[2,43],41:[2,43],42:[2,43],43:[2,43],44:[2,43],45:[2,43],46:[2,43],48:[2,43],49:[2,43],51:[2,43]},{5:[2,44],8:[2,44],14:[2,44],17:[2,44],18:[2,44],21:[2,44],26:[2,44],32:[2,44],33:[2,44],34:[2,44],35:[2,44],37:[2,44],38:[2,44],39:[2,44],40:[2,44],41:[2,44],42:[2,44],43:[2,44],44:[2,44],45:[2,44],46:[2,44],48:[2,44],49:[2,44],51:[2,44]},{9:90,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{5:[2,57],8:[2,57],14:[2,57],17:[2,57],18:[2,57],21:[2,57],26:[2,57],32:[2,57],33:[2,57],34:[2,57],35:[2,57],37:[2,57],38:[2,57],39:[2,57],40:[2,57],41:[2,57],42:[2,57],43:[2,57],44:[2,57],45:[2,57],46:[2,57],48:[2,57],49:[2,57],51:[2,57]},{33:[2,59],53:[2,59],55:[2,59],56:[2,59],57:[2,59]},{34:[1,91]},{8:[2,11],34:[2,11],40:[2,11]},{8:[2,13],17:[1,33],18:[1,34],34:[2,13],40:[2,13]},{5:[2,40],8:[2,40],14:[2,40],17:[2,40],18:[2,40],21:[2,40],26:[2,40],32:[2,40],33:[2,40],34:[2,40],35:[2,40],37:[2,40],38:[2,40],39:[2,40],40:[2,40],41:[2,40],42:[2,40],43:[2,40],44:[2,40],45:[2,40],46:[2,40],48:[2,40],49:[2,40],51:[2,40]},{9:5,10:92,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{5:[2,42],8:[2,42],14:[2,42],17:[2,42],18:[2,42],21:[2,42],26:[2,42],32:[2,42],33:[2,42],34:[2,42],35:[2,42],37:[2,42],38:[2,42],39:[2,42],40:[2,42],41:[2,42],42:[2,42],43:[2,42],44:[2,42],45:[2,42],46:[2,42],48:[2,42],49:[2,42],51:[2,42]},{8:[2,3],17:[1,33],18:[1,34],37:[2,3]},{33:[2,56],53:[2,56],55:[2,56],56:[2,56],57:[2,56]},{8:[2,17],34:[2,17]}],
defaultActions: {31:[2,1]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == "undefined")
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === "function")
        this.parseError = this.yy.parseError;
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || 1;
        if (typeof token !== "number") {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == "undefined") {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
        if (typeof action === "undefined" || !action.length || !action[0]) {
            var errStr = "";
            if (!recovering) {
                expected = [];
                for (p in table[state])
                    if (this.terminals_[p] && p > 2) {
                        expected.push("'" + this.terminals_[p] + "'");
                    }
                if (this.lexer.showPosition) {
                    errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                } else {
                    errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1?"end of input":"'" + (this.terminals_[symbol] || symbol) + "'");
                }
                this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }
        }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0)
                    recovering--;
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
            if (ranges) {
                yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
            }
            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
            if (typeof r !== "undefined") {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}
};
undefined/* Jison generated lexer */
var lexer = (function(){
var lexer = ({EOF:1,
parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },
setInput:function (input) {
        this._input = input;
        this._more = this._less = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
        if (this.options.ranges) this.yylloc.range = [0,0];
        this.offset = 0;
        return this;
    },
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) this.yylloc.range[1]++;

        this._input = this._input.slice(1);
        return ch;
    },
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length-len-1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length-1);
        this.matched = this.matched.substr(0, this.matched.length-1);

        if (lines.length-1) this.yylineno -= lines.length-1;
        var r = this.yylloc.range;

        this.yylloc = {first_line: this.yylloc.first_line,
          last_line: this.yylineno+1,
          first_column: this.yylloc.first_column,
          last_column: lines ?
              (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length:
              this.yylloc.first_column - len
          };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        return this;
    },
more:function () {
        this._more = true;
        return this;
    },
less:function (n) {
        this.unput(this.match.slice(n));
    },
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
    },
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c+"^";
    },
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) this.done = true;

        var token,
            match,
            tempMatch,
            index,
            col,
            lines;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i=0;i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (!this.options.flex) break;
            }
        }
        if (match) {
            lines = match[0].match(/(?:\r\n?|\n).*/g);
            if (lines) this.yylineno += lines.length;
            this.yylloc = {first_line: this.yylloc.last_line,
                           last_line: this.yylineno+1,
                           first_column: this.yylloc.last_column,
                           last_column: lines ? lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length};
            this.yytext += match[0];
            this.match += match[0];
            this.matches = match;
            this.yyleng = this.yytext.length;
            if (this.options.ranges) {
                this.yylloc.range = [this.offset, this.offset += this.yyleng];
            }
            this._more = false;
            this._input = this._input.slice(match[0].length);
            this.matched += match[0];
            token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
            if (this.done && this._input) this.done = false;
            if (token) return token;
            else return;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
                    {text: "", token: null, line: this.yylineno});
        }
    },
lex:function lex() {
        var r = this.next();
        if (typeof r !== 'undefined') {
            return r;
        } else {
            return this.lex();
        }
    },
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },
popState:function popState() {
        return this.conditionStack.pop();
    },
_currentRules:function _currentRules() {
        return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
    },
topState:function () {
        return this.conditionStack[this.conditionStack.length-2];
    },
pushState:function begin(condition) {
        this.begin(condition);
    }});
lexer.options = {};
lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START
switch($avoiding_name_collisions) {
case 0:/* ignore hashbang */
break;
case 1:/* ignore whitespace */
break;
case 2:return yy.eof();
break;
case 3:return yy.eof();
break;
case 4:var indentation = yy.indentation(yy_.yytext); if (indentation) { return indentation; }
break;
case 5:yy.setIndentation(yy_.yytext); if (yy.interpolation.interpolating()) {yy.interpolation.openBracket()} return "(";
break;
case 6:if (yy.interpolation.interpolating()) {yy.interpolation.closeBracket(); if (yy.interpolation.finishedInterpolation()) {this.popState(); yy.interpolation.stopInterpolation()}} return yy.unsetIndentation(')');
break;
case 7:yy.setIndentation(yy_.yytext); return 41;
break;
case 8:return yy.unsetIndentation('}');
break;
case 9:yy.setIndentation(yy_.yytext); return 39;
break;
case 10:return yy.unsetIndentation(']')
break;
case 11:return yy.indentation(yy_.yytext);
break;
case 12:return 42;
break;
case 13:return 43;
break;
case 14:return "operator";
break;
case 15:return "...";
break;
case 16:return yy.lexOperator(yy, yy_.yytext);
break;
case 17:return 46;
break;
case 18:return 44;
break;
case 19:return 5;
break;
case 20:return 45;
break;
case 21:this.begin('interpolated_string'); return 51;
break;
case 22:return 56;
break;
case 23:yy.setIndentation('('); yy.interpolation.startInterpolation(); this.begin('INITIAL'); return 33;
break;
case 24:return 55;
break;
case 25:this.popState(); return 53;
break;
case 26:return 57;
break;
case 27:return 55;
break;
case 28:return 'non_token';
break;
}
};
lexer.rules = [/^(?:^#![^\n]*)/,/^(?: +)/,/^(?:\s*$)/,/^(?:\s*((\/\*([^*](\*[^\/]|))*(\*\/|$)|\/\/[^\n]*)\s*)+$)/,/^(?:\s*((\/\*([^*](\*[^\/]|))*(\*\/|$)|\/\/[^\n]*)\s*)+)/,/^(?:\(\s*)/,/^(?:\s*\))/,/^(?:{\s*)/,/^(?:\s*})/,/^(?:\[\s*)/,/^(?:\s*\])/,/^(?:(\r?\n *)*\r?\n *)/,/^(?:[0-9]+\.[0-9]+)/,/^(?:[0-9]+)/,/^(?:@[a-zA-Z_$][a-zA-Z_$0-9]*)/,/^(?:\.\.\.)/,/^(?:([:;=,?!.@~#%^&*+<>\/?\\|-])+)/,/^(?:r\/([^\\\/]*\\.)*[^\/]*\/(img|mgi|gim|igm|gmi|mig|im|ig|gm|mg|mi|gi|i|m|g|))/,/^(?:[a-zA-Z_$][a-zA-Z_$0-9]*)/,/^(?:$)/,/^(?:'([^']*'')*[^']*')/,/^(?:")/,/^(?:\\#)/,/^(?:#\()/,/^(?:#)/,/^(?:")/,/^(?:\\.)/,/^(?:[^"#\\]*)/,/^(?:.)/];
lexer.conditions = {"interpolated_string":{"rules":[22,23,24,25,26,27],"inclusive":false},"interpolated_string_terminal":{"rules":[],"inclusive":false},"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,28],"inclusive":true}};
return lexer;})()
parser.lexer = lexer;
function Parser () { this.yy = {}; }Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); }
}

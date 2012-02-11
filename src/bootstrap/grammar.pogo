identifier pattern = '[a-zA-Z_$][a-zA-Z_$0-9]*'

exports: grammar = {
    lex {
        start conditions {interpolated_string, interpolated_string_terminal}

        rules [
            ['\s*$'. 'return yy.eof();']
            ['\(\s*'. 'yy.setIndentation(yytext); if (yy.terms.interpolation.interpolating()) {yy.terms.interpolation.openBracket()} return "(";']
            ['#\(\s*'. 'yy.setIndentation(yytext); if (yy.terms.interpolation.interpolating()) {yy.terms.interpolation.openBracket()} return "#(";']
            ['\s*\)'. 'yy.unsetIndentation(); if (yy.terms.interpolation.interpolating()) {yy.terms.interpolation.closeBracket(); if (yy.terms.interpolation.finishedInterpolation()) {this.popState(); this.popState(); yy.terms.interpolation.stopInterpolation()}} return '')'';']
            ['{\s*'. 'yy.setIndentation(yytext); return ''{'';']
            ['\s*}'. 'yy.unsetIndentation(); return ''}'';']
            ['\[\s*'. 'yy.setIndentation(yytext); return ''['';']
            ['\s*\]'. 'yy.unsetIndentation(); return '']'';']
            ['(\n *)*\n *'. 'return yy.indentation(yytext);']
            [' +'. '/* ignore whitespace */']
            ['[0-9]+\.[0-9]+'. 'return ''float'';']
            ['[0-9]+'. 'return ''integer'';']
            ['@' + identifier pattern. 'return ''argument'';']
            ['@:' + identifier pattern. 'return ''self_argument'';']
            ['[?#]' + identifier pattern. 'return ''parameter'';']
            [identifier pattern. 'return ''identifier'';']
            ['\.\.\.'. 'return ''...''']
            ['([:=,?!.@~#$%^&*+<>/?\\|-])+'. 'return yy.terms.lexOperator(yytext);']
            ['$'. 'return ''eof'';']
            ['''([^'']*'''')*[^'']*'''. 'return ''string'';']
            ['`([^\\]*\\`)*[^`]*`(img|mgi|gim|igm|gmi|mig|im|ig|gm|mg|mi|gi|i|m|g|)'. 'return ''reg_exp'';']
            ['"'. 'this.begin(''interpolated_string''); return ''start_interpolated_string'';']
            
            [['interpolated_string']. '\\@'. 'return ''escaped_interpolated_string_terminal_start'';']
            [['interpolated_string']. '@'. 'this.begin(''interpolated_string_terminal''); return ''interpolated_string_terminal_start'';']
            [['interpolated_string_terminal']. identifier pattern. 'this.popState(); return ''identifier'';']
            [['interpolated_string_terminal']. '\('. 'yy.setIndentation(yytext); yy.terms.interpolation.startInterpolation(); this.begin(''INITIAL''); return ''('';']
            [['interpolated_string']. '"'. 'this.popState(); return ''end_interpolated_string'';']
            [['interpolated_string']. '\\.'. 'return ''escape_sequence'';']
            [['interpolated_string']. '[^"@\\]*'. 'return ''interpolated_string_body'';']
            
            ['.'. 'return ''non_token'';']
        ]
    }

    operators [
        ['right'. '=']
        ['left'. ':']
    ]

    start 'module'

    bnf {
        module [
            ['statements eof'. 'return yy.terms.module($1);']
        ]
        statements [
            ['statements_list'. '$$ = yy.terms.statements($1);']
        ]
        hash_entries [
            ['hash_entries comma_dot basic_expression'. '$1.push($3.hashEntry()); $$ = $1;']
            ['basic_expression'. '$$ = [$1.hashEntry()];']
            [''. '$$ = [];']
        ]
        comma_dot [
            ['.'. '$$ = $1;']
            [','. '$$ = $1;']
        ]
        statements_list [
            ['statements_list . statement'. '$1.push($3); $$ = $1;']
            ['statement'. '$$ = [$1];']
            [''. '$$ = [];']
        ]
        list_statements_list [
            ['list_statements_list comma_dot list_statement'. '$1.push($3); $$ = $1;']
            ['list_statement'. '$$ = [$1];']
            [''. '$$ = [];']
        ]
        statement [
            ['expression'. '$$ = $1.expression();']
        ]
        list_statement [
            ['list_expression'. '$$ = $1.expression();']
        ]
        expression [
            ['expression = expression'. '$$ = $1.definition($3.expression());']
            ['operator_expression'. '$$ = $1;']
        ]
        list_expression [
            ['list_expression = list_expression'. '$$ = $1.definition($3.expression());']
            ['list_operator_expression'. '$$ = $1;']
        ]
        operator_with_newline [
            ['operator .'. '$$ = $1']
            ['operator'. '$$ = $1']
        ]
        operator_expression [
            ['operator_expression operator_with_newline unary_operator_expression'. '$1.addOperatorExpression($2, $3); $$ = $1;']
            ['unary_operator_expression'. '$$ = yy.terms.operatorExpression($1);']
        ]
        list_operator_expression [
            ['list_operator_expression operator_with_newline list_unary_operator_expression'. '$1.addOperatorExpression($2, $3); $$ = $1;']
            ['list_unary_operator_expression'. '$$ = yy.terms.operatorExpression($1);']
        ]
        unary_operator_expression [
            ['object_operation'. '$$ = $1;']
            ['unary_operator object_operation'. '$$ = yy.terms.newUnaryOperatorExpression({operator: $1, expression: $2.expression()});']
        ]
        list_unary_operator_expression [
            ['list_object_operation'. '$$ = $1;']
            ['unary_operator list_object_operation'. '$$ = yy.terms.newUnaryOperatorExpression({operator: $1, expression: $2.expression()});']
        ]
        object_reference_with_newline [
            [': .'. '$$ = $1']
            [':'. '$$ = $1']
        ]
        object_operation [
            ['object_operation object_reference_with_newline complex_expression'. '$$ = $3.objectOperation($1.expression());']
            [': complex_expression'. '$$ = $2.objectOperation(yy.terms.selfExpression());']
            ['complex_expression'. '$$ = $1;']
        ]
        list_object_operation [
            ['list_object_operation object_reference_with_newline list_complex_expression'. '$$ = $3.objectOperation($1.expression());']
            [': list_complex_expression'. '$$ = $2.objectOperation(yy.terms.selfExpression());']
            ['list_complex_expression'. '$$ = $1;']
        ]
        complex_expression [
            ['basic_expression_list'. '$$ = yy.terms.complexExpression($1);']
        ]
        list_complex_expression [
            ['list_basic_expression'. '$$ = yy.terms.complexExpression($1);']
        ]
        basic_expression_list [
            ['basic_expression_list , terminal_list'. '$1.push($3); $$ = $1;']
            ['terminal_list_no_arg'. '$$ = [$1];']
        ]
        list_basic_expression [
            ['terminal_list_no_arg'. '$$ = [$1];']
        ]
        terminal_list_no_arg [
            ['terminal_list no_arg_punctuation'. '$1.push($2); $$ = $1;']
            ['terminal_list'. '$$ = $1;']
        ]
        basic_expression [
            ['terminal_list'. '$$ = yy.terms.basicExpression($1);']
        ]
        no_arg_punctuation [
            ['no_arg'. '$$ = yy.terms.loc(yy.terms.noArgSuffix(), @$);']
        ]
        no_arg [
            ['!'. '$$ = $1;']
            ['?'. '$$ = $1;']
        ]
        terminal_list [
            ['terminal_list terminal'. '$1.push($2); $$ = $1;']
            ['terminal'. '$$ = [$1];']
        ]
        terminal [
            ['( statement )'. '$$ = $2;']
            ['#( statement )'. '$$ = yy.terms.parameter($2);']
            ['block_start statements }'. '$$ = yy.terms.loc(yy.terms.block([], $2), @$);']
            ['=> block_start statements }'. '$$ = yy.terms.loc(yy.terms.block([], $3, {redefinesSelf: true}), @$);']
            ['[ list_statements_list ]'. '$$ = yy.terms.loc(yy.terms.list($2), @$);']
            ['{ hash_entries }'. '$$ = yy.terms.loc(yy.terms.hash($2), @$);']
            ['float'. '$$ = yy.terms.loc(yy.terms.float(parseFloat(yytext)), @$);']
            ['integer'. '$$ = yy.terms.loc(yy.terms.integer(parseInt(yytext)), @$);']
            ['identifier'. '$$ = yy.terms.loc(yy.terms.identifier(yytext), @$);']
            ['argument'. '$$ = yy.terms.loc(yy.terms.variable([yytext.substring(1)]), @$);']
            ['self_argument'. '$$ = yy.terms.loc(yy.terms.fieldReference(yy.terms.variable([''self'']), [yytext.substring(2)]), @$);']
            ['parameter'. '$$ = yy.terms.loc(yy.terms.parameter(yy.terms.variable([yytext.substring(1)])), @$);']
            ['string'. '$$ = yy.terms.loc(yy.terms.string(yy.terms.unindent(@$.first_column + 1, yy.terms.normaliseString(yytext))), @$);']
            ['reg_exp'. '$$ = yy.terms.loc(yy.terms.regExp(yy.terms.parseRegExp(yy.terms.unindent(@$.first_column + 1, yytext))), @$);']
            ['interpolated_string'. '$$ = yy.terms.loc($1, @$);']
            ['...'. '$$ = yy.terms.loc(yy.terms.splat(), @$);']
        ]
        block_start [
            ['@ {'. '$$ = ''@{''']
            ['@{'. '$$ = ''@{''']
        ]
        operator [
            ['raw_operator'. '$$ = $1;']
        ]
        unary_operator [
            ['operator'. '$$ = $1;']
            ['!'. '$$ = $1;']
        ]
        interpolated_terminal [
            ['( statement )'. '$$ = $2;']
            ['identifier'. '$$ = yy.terms.variable([$1]);']
        ]
        interpolated_string [
            ['start_interpolated_string interpolated_string_components end_interpolated_string'. '$$ = yy.terms.interpolatedString($2, @$.first_column);']
            ['start_interpolated_string end_interpolated_string'. '$$ = yy.terms.interpolatedString([], @$.first_column);']
        ]
        interpolated_string_components [
            ['interpolated_string_components interpolated_string_component'. '$1.push($2); $$ = $1;']
            ['interpolated_string_component'. '$$ = [$1];']
        ]
        interpolated_string_component [
            ['interpolated_string_terminal_start interpolated_terminal'. '$$ = $2;']
            ['interpolated_string_body'. '$$ = yy.terms.string($1);']
            ['escaped_interpolated_string_terminal_start'. '$$ = yy.terms.string("@");']
            ['escape_sequence'. '$$ = yy.terms.string(yy.terms.normaliseInterpolatedString($1));']
        ]
    }
}

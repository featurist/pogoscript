/*
editor = ace.edit ($'.pogo-editor'.0)
result = $'.pogo-result'

on change () =
    try
        pogo result = JSON.stringify (pogoscript.evaluate (editor.get value ()))

        if (pogo result == nil)
            result.text ''
        else
            result.text (pogo result)

        result.remove class 'error'
    catch (e) @{
        result.text (e.message)
        result.add class 'error'
    }

editor.on 'change' (_.debounce (on change, 100))

window.editor = editor
*/

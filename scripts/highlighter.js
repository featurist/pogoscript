$(function () {
    $('pre > code').each(function () {
        this.innerHTML = this.innerHTML
            .replace(/([:=*+/,-]|\.\.\.|\.\.|&gt;|&lt;)/g, '<span class="operator">$1</span>')
            .replace(/([()])/g, '<span class="argument">$1</span>')
            .replace(/([0-9])/g, '<span class="argument">$1</span>')
            .replace(/(@[a-zA-Z_$]+)/g, '<span class="argument">$1</span>')
            .replace(/(#[a-zA-Z_$]+)/g, '<span class="parameter">$1</span>')
            .replace(/([{}])/g, '<span class="parameter">$1</span>')
            ;
    });
});

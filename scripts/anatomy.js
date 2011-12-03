$(function () {
    $('.anatomy .term-reference').each(function () {
        var anatomy = $(this).closest('.anatomy');
        var terms = anatomy.find('.term [data-term = "' + $(this).data('term') + '"');

        console.log('found', terms.size(), 'terms');

        $(this).hover(function () {
            terms.addClass('highlight-term');
        }, function () {
            terms.removeClass('highlight-term');
        });
    });
});

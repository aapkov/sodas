$(document).ready( () => {
    $('.fa-solid').on('click', (e) => {
        $target = $(e.target);
        const id = $target.attr('data-id');
        const value = $target.attr('value');
        let data = { value: value }
        $.ajax({
            type:'PUT',
            url: '/unban/update/'+id,
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(response) {
                $target.text((parseInt($target.text(), 10) + 1));
            },
            error: function(err) {
                console.log(err);
            }
        })
    });
})
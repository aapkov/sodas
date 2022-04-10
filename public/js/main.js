$(document).ready( () => {
    $('.delete-color').on('click', (e) => {
        $target = $(e.target);
        const id = $target.attr('data-id');
        $.ajax({
            type:'DELETE',
            url: '/colors/'+id,
            success: function(response) {
                alert("Deleted color with id "+id);
                window.location.href= '/'
            },
            error: function(err) {
                console.log(err);
            }
        })
    })
    $('.alert').delay(3000).fadeOut()
})
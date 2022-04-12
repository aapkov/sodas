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
    $('.alert').delay(3000).fadeOut();
    $(function() {
        $('.textContainer').on('input keyup paste', function() {
          var $el = $(this),
              offset = $el.innerHeight() - $el.height();
      
          if ($el.innerHeight() < this.scrollHeight) {
            // Grow the field if scroll height is smaller
            $el.height(this.scrollHeight - offset);
          } else {
            // Shrink the field and then re-set it to the scroll height in case it needs to shrink
            $el.height(1);
            $el.height(this.scrollHeight - offset);
          }
        });
      });
})
$(document).ready( () => {
    $('.delete-color').on('click', (e) => {
        $target = $(e.target);
        const id = $target.attr('data-id');
        $.ajax({
            type:'DELETE',
            url: '/colors/'+id,
            success: function(response) {
                window.location.href= '/'
            },
            error: function(err) {
                console.log(err);
            }
        })
    });
    $('.mod-action').on('click', (e) => {
      $target = $(e.target);
      const id = $target.attr('data-id');
      let resolution = $target.attr('value');
      let data = {resolution: resolution}
      $.ajax(
        {
          url: '/mod/update/' +id,
          type: 'PUT',
          contentType: "application/json",
          data: JSON.stringify(data),
          success: function(response) {
            window.location.href= `/mod/view/${resolution}`;
          }, error: function(err) {
            console.log(err); }
      })
    });
    $('.mod-action').hover( (e) => {
      $targetButton = $(e.target);
      $targetBorder = $('#border');
      let borderDefaultClass = 'border-' + $targetBorder.attr('value');
      let buttonClass = 'border-' + $targetButton.attr('value');
      $targetBorder.removeClass(borderDefaultClass);
      $targetBorder.addClass(buttonClass);
    }, (e) => {
      $targetButton = $(e.target);
      $targetBorder = $('#border');
      let borderDefaultClass = 'border-' + $targetBorder.attr('value');
      let buttonClass = 'border-' + $targetButton.attr('value');
      $targetBorder.removeClass(buttonClass);
      $targetBorder.addClass(borderDefaultClass);
    });
      
    $('.alert').delay(3000).fadeOut()
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
    $(function() {
      var pathName = window.location.pathname;
      if (pathName.includes('/mod/view/u')) {
        $( "a[href='/mod/view/u']" ).addClass('active');
      } else if (pathName.includes('/mod/view/d')) {
        $( "a[href='/mod/view/d']" ).addClass('active');
      } else if (pathName.includes('/mod/view/a')) {
        $( "a[href='/mod/view/a']" ).addClass('active');
      }
    });   
})
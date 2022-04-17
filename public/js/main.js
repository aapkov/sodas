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
      let modAction = $target.attr('mod-action');
      let data = { resolution: resolution }
      $.ajax(
        {
          url: `${modAction}/update/` +id,
          type: 'PUT',
          contentType: "application/json",
          data: JSON.stringify(data),
          success: function(response) {
            window.location.href= `${modAction}/view/${resolution}`;
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
      if (pathName.includes('view/u')) {
        $( "a[href*='view/u']" ).addClass('active');
      } else if (pathName.includes('view/d')) {
        $( "a[href*='view/d']" ).addClass('active');
      } else if (pathName.includes('view/a')) {
        $( "a[href*='view/a']" ).addClass('active');
      }
    }); 

    $('.unban-button').on('click', (e) => {
      $target = $(e.target);
      let isDiscord = $target.attr('isDiscord');
      window.location.href= '/unban/form?' + `isDiscord=${isDiscord}`;
    });

})
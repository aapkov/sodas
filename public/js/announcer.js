$(function() {
    if ($('#isEnabled').attr('value-actual') == 'true') {
        $('#isEnabled').addClass('btn-outline-danger').val('Toggle announcements to DISABLE')
        $('#isEnabledActual').val('true')
    } else {
        $('#isEnabled').addClass('btn-outline-success').val('Toggle announcements to ENABLE')
        $('#isEnabledActual').val('false')
    }
});

$('#isEnabled').on('click', (e) => {
    if (!$('#save-warn').is(":visible")) {
        $('#save-warn').show()
    }
    if ($('#isEnabled').attr('value-actual') == 'true') {
        $('#isEnabled').attr('value-actual', 'false').removeClass('btn-outline-success').addClass('btn-outline-danger').val('Announcements will be DISABLED');
        $('#isEnabledActual').val('false')
    } else {
        $('#isEnabled').attr('value-actual', 'true').removeClass('btn-outline-danger').addClass('btn-outline-success').val('Announcements will be ENABLED');
        $('#isEnabledActual').val('true')
    }  
  });
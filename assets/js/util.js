function postStatusMessage(channelName, message) {
  var div = $('<div style="text-align: center">----- '+message+' -----</div>');
  $('#'+channelName).append(div);

}

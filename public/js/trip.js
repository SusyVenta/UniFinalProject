function showAddFriendsModal(){
  /* 
  When user clicks on 'Add friend' button, opens the modal to carry out this action.
  Inside the modal, initialize multiselect searchable dropdown menu
  */
  let tripModal = document.getElementById("add-friend-modal");
  let modal = new bootstrap.Modal(tripModal, {});
  modal.show();

  // render searchable select used to add friends to trip
  // https://stackoverflow.com/questions/69530889/adding-bootstrap-5-search-bar-dropdown
  // https://tom-select.js.org/plugins/remove-button/
  new TomSelect("#multiselect-friends", {
    plugins: ['remove_button'],
    create: true,
    onItemAdd: function() {
      this.setTextboxValue('');
      this.refreshOptions();
    },
    render: {
      item: function(data, escape) {
        return '<div>' + escape(data.text) + '</div>';
      }
    }
  });

};

function addFriendsToTrip(){
  /* Calls API endpoint to add friends to trip */
  let select = document.getElementById('multiselect-friends');
  let control = select.tomselect;
  let selectedItems = control.items;
  let askAllParticipantsDates = document.getElementById("askAllParticipantsDates").value;
  let tripID = (window.location.href).split("/").at(-1);

  if( selectedItems.length > 0){
    let payload = { 
      friendsToAdd: selectedItems,
      tripID: tripID,
      askAllParticipantsDates: askAllParticipantsDates
    };

    $.ajax({
      url: `/trips/` + tripID,
      method: "POST",
      xhrFields: {
        withCredentials: true
      },
      data: jQuery.param(payload)
    });
  }

  console.log(selectedItems);
  // reload page
  window.location.href = "/trips/" + tripID;
  
};

function removeFriendFromTrip(tripID, friendUID){

}
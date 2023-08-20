function showAddEventModal(){
    /* 
    When user clicks on 'Add event' button, opens the modal to carry out this action.
    Inside the modal, initialize multiselect searchable dropdown menu to add friends
    */
    $('#new-event-modal').show();
    
    try{
        // render searchable select used to add friends to trip
        // https://stackoverflow.com/questions/69530889/adding-bootstrap-5-search-bar-dropdown
        // https://tom-select.js.org/plugins/remove-button/
        new TomSelect("#new-trip-event-multiselect-friends", {
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
    }catch(e){
        if(e.message != "Tom Select already initialized on this element"){
            alert(e.message);
        }
    }

  };
  
  function saveEvent(tripID){
    /* Calls API endpoint to add friends to trip */
    let select = document.getElementById('new-trip-event-multiselect-friends');
    let control = select.tomselect;

    let payload = {
        participants: control.items,
        eventType: document.getElementById("event-type").innerHTML,
        title: document.getElementById("new-event-title").value,
        startDatetime: document.getElementById("new-event-availability-start").value,
        endDatetime: document.getElementById("new-event-availability-end").value,
        address: document.getElementById("new-event-address").value,
        description: document.getElementById("new-event-description").value,
        askParticipantsIfTheyJoin: document.getElementById("new-event-ask-participation-confirmation").checked,
        status: document.getElementById("event-status").innerHTML
    }

    $.ajax({
        url: `/trips/` + tripID + "/itinerary",
        method: "POST",
        xhrFields: {
          withCredentials: true
        },
        data: jQuery.param(payload),
        success: function() {   
          // if successful call, reload page
          location.reload();  
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
          alert(XMLHttpRequest.responseText, textStatus, errorThrown); 
        }
      });
  };
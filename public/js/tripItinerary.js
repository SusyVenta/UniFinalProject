function showAddEventModal(tripParticipants, friendsProfilesIn, userID){
    /* 
    When user clicks on 'Add event' button, opens the modal to carry out this action.
    Inside the modal, initialize multiselect searchable dropdown menu to add friends.

    tripParticipants: {<uid>: <owner / collaborator / pending>, ..}
    */
    $('#new-event-modal').show();

    let participants = JSON.parse(tripParticipants);
    let friendsProfiles = JSON.parse(friendsProfilesIn);

    // <option value="<%= friendUid %>"><%= friendProfile.username %></option>
    let options = [];

    for (const [uid, status] of Object.entries(participants)) {
        let username = "";
        if(uid == userID){
            username = 'you'
        }else{
            username = friendsProfiles[uid].username;
        }
        options.push({value: uid, text: username})
    }

    try{
        // render searchable select used to add friends to trip
        // https://stackoverflow.com/questions/69530889/adding-bootstrap-5-search-bar-dropdown
        // https://tom-select.js.org/plugins/remove-button/
        new TomSelect("#new-trip-event-multiselect-friends", {
            plugins: ['remove_button'],
            create: true,
            labelField: 'text', // name displayed when element is selected
            searchField: 'text', // name displayed in the search bar
            valueField: 'value', // actual value that is sent to the backend below
            onItemAdd: function() {
                this.setTextboxValue('');
                this.refreshOptions();
            },
            options: options,
            items: Object.keys(participants) // initially selected items. specified by ID (valueField)
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
        status: document.getElementById("event-status").innerHTML,
        comments: []
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

  
function getTripEvents(tripID){
    /* 
    Gets data for currently authenticates user in real time. 
    Whenever anything changes in this document, data is pushed to the client.
    Updates events as they're added or removed

    https://firebase.google.com/docs/firestore/query-data/listen
    */
    let eventsContainer = document.getElementById("events-container");

    
    db.collection(`trips`).doc(tripID).collection("events").onSnapshot((querySnapshot) => {
        let allEvents = [];

        querySnapshot.forEach((doc) => {
            let data = doc.data();
            data.docID = doc.id;
            allEvents.push(data);
        });

        allEvents.sort(function(a,b){
            // Sort ascending (oldest to newest). To get descending, swap a and b below
            return a.startDatetime.toDate() - b.startDatetime.toDate();
        });

        // remove previous events
        eventsContainer.innerHTML = "";

        for (let eventData of allEvents){
            // create div for the event
            let divEventContainer = document.createElement("div");
            divEventContainer.setAttribute("class", `event-container`);
            divEventContainer.setAttribute("id", eventData.docID);

            let divEventTitleAndTypeContainer = document.createElement("div");
            divEventTitleAndTypeContainer.setAttribute("class", `event-type-title-container`);

            let divEventCategory = document.createElement("p");
            divEventCategory.setAttribute("class", `listed-event-event-type`);
            divEventCategory.innerHTML = eventData.eventType;

            let pEventTitle = document.createElement("p");
            pEventTitle.setAttribute("class", `event-title`);
            pEventTitle.innerHTML = eventData.title;

            divEventTitleAndTypeContainer.appendChild(pEventTitle);
            divEventTitleAndTypeContainer.appendChild(divEventCategory);
            divEventContainer.appendChild(divEventTitleAndTypeContainer);

            let pEventDates = document.createElement("p");
            pEventDates.setAttribute("class", `event-dates`);
            pEventDates.innerHTML = moment(eventData.startDatetime.toDate()).format("DD MMM YYYY hh:mm A") + " - " + moment(eventData.endDatetime.toDate()).format("DD MMM YYYY hh:mm A");
            divEventContainer.appendChild(pEventDates);

            let eventStatus = document.createElement("p");
            eventStatus.setAttribute("class", `event-status`);
            eventStatus.innerHTML = "Status: " + eventData.status;
            divEventContainer.appendChild(eventStatus);

            eventsContainer.appendChild(divEventContainer);
        }
        
    });
}

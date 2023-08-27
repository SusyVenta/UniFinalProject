function showAddEventModal(tripParticipants, friendsProfilesIn, userID){
    /* 
    When user clicks on 'Add event' button, opens the modal to carry out this action.
    Inside the modal, initialize multiselect searchable dropdown menu to add friends.

    tripParticipants: {<uid>: <owner / collaborator / pending>, ..}
    */
    $('#new-event-modal').show();

    let participants = JSON.parse(tripParticipants);
    let friendsProfiles = JSON.parse(friendsProfilesIn);

    // [value: <uid>, text: <username>]
    let options = [];

    for (const [uid, status] of Object.entries(participants)) {
        let username = "";
        if(uid == userID){
            username = 'you'
        }else{
            username = friendsProfiles[uid].username;
        }

        if (status != "pending"){
            options.push({value: uid, text: username})
        }
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

function deleteEvent(tripID, eventID){
    $.ajax({
        url: `/trips/` + tripID + "/itinerary/" + eventID,
        method: "DELETE",
        xhrFields: {
          withCredentials: true
        },
        success: function() {   
          // if successful call, reload page
          location.reload();  
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
          alert(XMLHttpRequest.responseText, textStatus, errorThrown); 
        }
    });
}

function createEventDetailsModal(eventData){
    let eventID = eventData.docID;
    let tripID = document.getElementById("hidden-trip-id").innerHTML.trim();

    // clone new-event-modal
    let newEventModal = document.getElementById("new-event-modal");
    let selectedEventModal = newEventModal.cloneNode(true); //clone element and children

    // change element id
    let newDivID = eventID + "-" + selectedEventModal.id;

    // check if new id already exists. If so, delete it. 
    let potentiallyExistingID = document.getElementById(newDivID);
    if((potentiallyExistingID !== undefined) && (potentiallyExistingID !== null)){
        potentiallyExistingID.remove();
    }

    selectedEventModal.setAttribute("id", newDivID);

    // rename all child elements with an ID
    let allDescendantNodes = selectedEventModal.querySelectorAll("*");

    for (let child of allDescendantNodes){
        if (child.hasAttribute('id')){
            child.setAttribute("id", eventID + "-" + child.id);
        }
    }

    // add to page body 
    document.body.appendChild(selectedEventModal);

    // reset title
    document.getElementById(eventID + "-new-event-modal-title").innerHTML = eventData.title;
    
    // close button
    let closeButton = document.getElementById(eventID + "-new-event-modal-close-button");
    if(closeButton !== null){
        closeButton.setAttribute("onclick", `$('#${newDivID}').hide();`);
    }
    let closeButtonRedirect = document.getElementById(eventID + "-new-event-modal-close-button-redirect-itinerary");
    if(closeButtonRedirect !== null){
        closeButtonRedirect.setAttribute("onclick", `window.location = '//${window.location.host}/trips/${tripID}/itinerary';`);
    }
    
    document.getElementById(eventID + "-event-type").innerHTML = eventData.eventType;
    let eventTypeOptions = document.querySelectorAll(`[id^="${eventID}-event-type-option"]`);
    for (let eventTypeOption of eventTypeOptions){
        eventTypeOption.setAttribute(
            "onclick", 
            `document.getElementById('${eventID}-event-type').innerHTML = '${eventTypeOption.innerHTML.trim()}';`);
    }

    document.getElementById(eventID + "-event-status").innerHTML = eventData.status;
    let eventStatusOptions = document.querySelectorAll(`[id^="${eventID}-event-status-option"]`);
    for (let eventStatusOption of eventStatusOptions){
        eventStatusOption.setAttribute(
            "onclick", 
            `document.getElementById('${eventID}-event-status').innerHTML = '${eventStatusOption.innerHTML.trim()}';`);
    }

    document.getElementById(eventID + "-new-event-title").value = eventData.title;

    for (let startOrEnd of ["start", "end"]){
        document.getElementById(eventID + `-new-event-availability-${startOrEnd}`).value = eventData[`${startOrEnd}Datetime`];
        
        $(`#${eventID}-new-event-availability-${startOrEnd}`).daterangepicker({
            timePicker: true,
            singleDatePicker: true,
            opens: 'left',
            locale: {
              format: 'DD/MM/YYYY hh:mm A'
            }
        });
    
        $(`#${eventID}-new-event-availability-${startOrEnd}`).on('apply.daterangepicker', function(event, picker) {
          let newValue = picker.startDate.format('DD/MM/YYYY hh:mm A');
    
          document.getElementById(`${eventID}-new-event-availability-${startOrEnd}`).value = newValue;
        });
    }
    
    document.getElementById(eventID + "-new-event-address").value = eventData.address;
    document.getElementById(eventID + "-new-event-description").value = eventData.description;
    document.getElementById(eventID + "-new-event-ask-participation-confirmation").checked = eventData.askParticipantsIfTheyJoin;
    
    // event participants 
    let friendsProfiles = JSON.parse(document.getElementById("hidden-friends-profiles").innerHTML);
    let tripParticipants = JSON.parse(document.getElementById("hidden-trip-participants").innerHTML);
    let userUID = document.getElementById("hidden-user-uid").innerHTML.trim();
    // [value: <uid>, text: <username>]
    let options = [];
    
    for (const [participantUID, status] of Object.entries(tripParticipants)) {
        if(participantUID == userUID){
            options.push({value: participantUID, text: "you"})
        } else {
            options.push({value: participantUID, text: friendsProfiles[participantUID].username})
        }
    }

    try{
        // render prepopulated searchable select showing existing event participants
        let tomElement = document.getElementById(`${eventID}-new-trip-event-multiselect-friends`);
        new TomSelect(tomElement, {
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
            items: eventData.participants // initially selected items. specified by ID (valueField)
        });
    }catch(e){
        if(e.message != "Tom Select already initialized on this element"){
            alert("Tom select error\n" + e.message);
        }
    }

    // change save function
    let saveButton = document.getElementById(`${eventID}-new-event-create-button`);
    saveButton.setAttribute(
        "onclick", 
        `saveEvent('${saveButton.name}', '${eventID}');`);

    // add delete event button
    let deleteEventButton = document.createElement("button");
    deleteEventButton.setAttribute("class", `btn btn-secondary`);
    deleteEventButton.setAttribute("type", `button`);
    deleteEventButton.setAttribute("id", `${eventID}-event-delete-button`);
    deleteEventButton.innerHTML = "Delete event";

    deleteEventButton.addEventListener(
        "click", 
        function(){
            // opens pop up with OK or Cancel buttons
            if (confirm("Are you sure you want to remove this trip event?")) {
                deleteEvent(tripID, eventID);
            }
        }
    );
    let deleteEventContainer = document.getElementById(`${eventID}-event-modal-footer-left`);
    deleteEventContainer.appendChild(deleteEventButton);

    //cancel button
    let cancelButton = document.getElementById(`${eventID}-new-event-cancel-button`);
    if(cancelButton !== null){
        // element not present when loading 'trips/<trip id>/itinerary/<event id>
        cancelButton.setAttribute(
            "onclick", 
            `$('#${eventID}-new-event-modal').hide();`);
    }

    let cancelButtonRedirect = document.getElementById(`${eventID}-new-event-cancel-button-redirect-itinerary`);
    if(cancelButtonRedirect !== null){
        // element not present when loading 'trips/<trip id>/itinerary/<event id>
        cancelButtonRedirect.addEventListener(
            "click", 
            function(){
                window.location = `//${window.location.host}/trips/${tripID}/itinerary`
            }
        );
    }

}
  
function saveEvent(tripID, eventID=null){
    /* Calls API endpoint to add friends to trip */
    let idPart = `${eventID}-`;
    if (eventID === null){
        idPart = '';
    }

    let select = document.getElementById(`${idPart}new-trip-event-multiselect-friends`);
    let control = select.tomselect;

    let payload = {
        participants: control.items,
        eventType: document.getElementById(`${idPart}event-type`).innerHTML,
        title: document.getElementById(`${idPart}new-event-title`).value,
        startDatetime: document.getElementById(`${idPart}new-event-availability-start`).value,
        endDatetime: document.getElementById(`${idPart}new-event-availability-end`).value,
        address: document.getElementById(`${idPart}new-event-address`).value,
        description: document.getElementById(`${idPart}new-event-description`).value,
        askParticipantsIfTheyJoin: document.getElementById(`${idPart}new-event-ask-participation-confirmation`).checked,
        status: document.getElementById(`${idPart}event-status`).innerHTML,
        comments: []
    }

    let urlEnd = eventID;
    if (eventID === null){
        urlEnd = "new";
    }

    $.ajax({
        url: `/trips/` + tripID + "/itinerary/" + urlEnd,
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
            return moment(a.startDatetime, 'DD/MM/YYYY hh:mm A') - moment(b.startDatetime, 'DD/MM/YYYY hh:mm A');
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
            pEventDates.innerHTML = eventData.startDatetime + " - " + eventData.endDatetime;
            divEventContainer.appendChild(pEventDates);

            let eventStatus = document.createElement("p");
            eventStatus.setAttribute("class", `event-status`);
            eventStatus.innerHTML = "Status: " + eventData.status;
            divEventContainer.appendChild(eventStatus);
            

            let divParticipantsAndCommentsContainer = document.createElement("div");
            divParticipantsAndCommentsContainer.setAttribute("class", `participants-comments-container`);

            let participants = document.createElement("div");
            participants.setAttribute("class", `participants-container`);
            let participantsTextP = document.createElement("p");
            participantsTextP.setAttribute("class", `number-participants-p`);
            participantsTextP.innerHTML = eventData.participants.length + " participants ";
            participants.appendChild(participantsTextP);
            divParticipantsAndCommentsContainer.appendChild(participants);

            let pNumberComments = document.createElement("p");
            pNumberComments.setAttribute("class", `number-comments-p`);
            pNumberComments.innerHTML = eventData.comments.length + " comments ";
            divParticipantsAndCommentsContainer.appendChild(pNumberComments);

            divEventContainer.appendChild(divParticipantsAndCommentsContainer);

            // add event modal to DOM
            createEventDetailsModal(eventData);

            divEventContainer.addEventListener('click', function(){
                $(`#${eventData.docID}-new-event-modal`).show();
            });

            eventsContainer.appendChild(divEventContainer);

        }

        // called when user navigates to trip event URL. Automatically open requested modal
        let eventToOpen = document.getElementById("hidden-eventToOpen").innerHTML.trim();
        if(eventToOpen != 'null'){
            $(`#${eventToOpen}-new-event-modal`).show();
        }
        
    });
}

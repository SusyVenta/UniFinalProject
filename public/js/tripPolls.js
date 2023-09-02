
function showAddPollModal(tripParticipants, friendsProfilesIn, userID){
    /* 
    When user clicks on 'Add event' button, opens the modal to carry out this action.
    Inside the modal, initialize multiselect searchable dropdown menu to add friends.

    tripParticipants: {<uid>: <owner / collaborator / pending>, ..}
    */
    $('#new-poll-modal').show();

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
        new TomSelect("#new-poll-multiselect-friends", {
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

function addPollOptionsInput(pollOptionsContainerID){
    /* Adds poll options inputs within the div containing all poll options inputs */
    let parentDiv = document.getElementById(pollOptionsContainerID);

    let numberExistingPollOptions = document.querySelectorAll('[id^="input-poll-option-"]').length;
    let newPollOptionNumber = numberExistingPollOptions + 1;

    let inputDiv = document.createElement("div");
    inputDiv.setAttribute("class", `input-group mb-3`);
    inputDiv.setAttribute("id", `poll-option-container-div-` + newPollOptionNumber);

    let span = document.createElement("span");
    span.setAttribute("class", `input-group-text`);
    span.setAttribute("id", `poll-option-label-` + newPollOptionNumber);
    span.innerHTML = "Option " + newPollOptionNumber;

    let input = document.createElement("input");
    input.setAttribute("type", `text`);
    input.setAttribute("autocomplete", `one-time-code`);
    input.setAttribute("class", `form-control`);
    input.setAttribute("id", `input-poll-option-` + newPollOptionNumber);
    input.setAttribute("required", `true`);
    input.setAttribute("aria-describedby", `poll-option-label-` + newPollOptionNumber);

    let deleteOptionButton = document.createElement("button");
    deleteOptionButton.setAttribute("class", `btn btn-secondary`);
    deleteOptionButton.setAttribute("type", `button`);
    deleteOptionButton.setAttribute("id", `option-delete-button-` + newPollOptionNumber);
    deleteOptionButton.innerHTML = "✘";
    deleteOptionButton.addEventListener(
        "click", 
        function(event){
            let optionNumberBeingRemoved = parseInt(event.target.parentNode.id.replace("poll-option-container-div-", ""));
            let existingOptions = document.querySelectorAll('[id^="input-poll-option-"]').length;

            event.target.parentNode.remove();

            // rename IDs after the one we're removing
            let idsToRename = [
                `poll-option-container-div-`, 
                `poll-option-label-`, 
                `input-poll-option-`,
                `option-delete-button-`
            ];
            for (let i=optionNumberBeingRemoved + 1; i <= existingOptions; i++){
                let newID = i - 1;

                for (let idToRename of idsToRename){
                    let inputDivToChange = document.getElementById(idToRename + i);
                    inputDivToChange.setAttribute("id", idToRename + newID);

                    if(idToRename == `poll-option-label-`){
                        inputDivToChange.innerHTML = "Option " + newID;
                    }
                }
            }
        }
    );

    inputDiv.appendChild(span);
    inputDiv.appendChild(input);
    inputDiv.appendChild(deleteOptionButton);

    parentDiv.appendChild(inputDiv);
}

function savePoll(tripID, pollID=null){
    /* Calls API endpoint to add friends to trip */
    let idPart = `${pollID}-`;
    if (pollID === null){
        idPart = '';
    }

    let select = document.getElementById(`${idPart}new-poll-multiselect-friends`);
    let control = select.tomselect;

    let existingOptions = document.querySelectorAll(`[id^="${idPart}input-poll-option-"]`);
    let options = {};
    for (let optionElement of existingOptions){
        let optionNumber = parseInt(optionElement.id.split("-").pop());
        options[optionNumber] = optionElement.value;
    }

    let optionsToChoose = parseInt(document.getElementById(`${idPart}number-poll-options`).value);

    if(optionsToChoose > existingOptions.length){
        alert("Please specify a number of selectable options less than or equal to the number of options available.");
        return;
    }

    let payload = {
        participants: control.items,
        question: document.getElementById(`${idPart}new-poll-question`).value,
        options: options,
        numberOptionsToChoose: optionsToChoose
    }
    console.log(JSON.stringify(payload));

    let urlEnd = pollID;
    if (pollID === null){
        urlEnd = "new";
    }

    $.ajax({
        url: `/trips/` + tripID + "/polls/" + urlEnd,
        method: "POST",
        xhrFields: {
          withCredentials: true
        },
        data: jQuery.param(payload),
        success: function() {   
          // if successful call, reload page
          window.location.href = `/trips/` + tripID + "/polls/"
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
          alert(XMLHttpRequest.responseText, textStatus, errorThrown); 
        }
      });
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

function createNewEventDOMElements(eventData){
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
    pNumberComments.addEventListener('click', function(event){
        event.stopPropagation(); // don't open event modal
        
        let commentsSection = document.getElementById(`comments-container-`+ eventData.docID);
        commentsSection.style.display = commentsSection.style.display === 'none' ? 'flex' : 'none';
    });
    divParticipantsAndCommentsContainer.appendChild(pNumberComments);

    divEventContainer.appendChild(divParticipantsAndCommentsContainer);

    // add comment section
    let divAddCommentContainer = document.createElement("div");
    divAddCommentContainer.setAttribute("class", `add-comment-container`);

    let addCommentButton = document.createElement("button");
    addCommentButton.setAttribute("class", `btn btn-secondary`);
    addCommentButton.setAttribute("id", `add-comment-button-` + eventData.docID);
    addCommentButton.setAttribute("name", eventData.docID);
    addCommentButton.innerHTML = " Comment";
    let addCommentIcon = document.createElement("i");
    addCommentIcon.setAttribute("class", `fas fa-comment`);
    addCommentButton.prepend(addCommentIcon);
    addCommentButton.addEventListener('click', function(event){
        event.stopPropagation(); // don't open event modal

        // check if comment section exists
        let commentSection = document.getElementById(`add-comment-input-` + event.target.name);
        if (commentSection === null){
            // create comment input section
            let divAddCommentInputContainer = document.createElement("div");
            divAddCommentInputContainer.setAttribute("id", `add-comment-input-container-`+ eventData.docID);
            divAddCommentInputContainer.setAttribute("class", `input-group mb-3`);
            let inputField = document.createElement("input");
            inputField.setAttribute("id", `add-comment-input-` + eventData.docID);
            inputField.setAttribute("class", `form-control form-control-lg`);
            inputField.setAttribute("placeholder", `Add a comment...`);
            inputField.setAttribute("type", `text`);
            inputField.setAttribute("aria-describedby", `post-comment-button-` + eventData.docID);
            inputField.addEventListener('click', function(event){
                event.stopPropagation(); // don't open event modal
            });
            divAddCommentInputContainer.appendChild(inputField);
            // post button
            let postCommentButton = document.createElement("button");
            postCommentButton.setAttribute("id", `post-comment-button-` + eventData.docID);
            postCommentButton.setAttribute("class", `btn btn-secondary`);
            postCommentButton.setAttribute("type", `button`);
            postCommentButton.innerHTML = "post";
            postCommentButton.addEventListener('click', function(event){
                event.stopPropagation(); // don't open event modal
                let commentText = document.getElementById(`add-comment-input-` + eventData.docID).value;
                
                $.ajax({
                    url: `/trips/` + tripID + "/itinerary/" + eventData.docID,
                    method: "POST",
                    xhrFields: {
                      withCredentials: true
                    },
                    data: jQuery.param({
                        "comment": commentText,
                        "time": moment().format('DD/MM/YYYY hh:mm A')
                    }),
                    success: function() {   
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) { 
                      alert(XMLHttpRequest.responseText, textStatus, errorThrown); 
                    }
                  });
            });
            divAddCommentInputContainer.appendChild(postCommentButton);

            let commentEventContainer = document.getElementById(event.target.name);
            commentEventContainer.appendChild(divAddCommentInputContainer);
        } else {
            document.getElementById(`add-comment-input-container-` + eventData.docID).remove();
        }
    });
    divAddCommentContainer.appendChild(addCommentButton);
    divEventContainer.appendChild(divAddCommentContainer);

    // display comments
    let divCommentsContainer = document.createElement("div");
    divCommentsContainer.setAttribute("id", `comments-container-`+ eventData.docID);
    divCommentsContainer.setAttribute("class", `comments-container`);

    let parsedTripParticipantsUIDsPictures = JSON.parse(tripParticipantsUIDsPictures);
    for (let commentData of eventData.comments){
        let divCommentToDisplayContainer = document.createElement("div");
        divCommentToDisplayContainer.setAttribute("class", `saved-event-comment`);
        
        let commenterImage = document.createElement("img");
        let profilePic = parsedTripParticipantsUIDsPictures[commentData.userID].picture;
        if(profilePic === null){
            profilePic = "/assets/defaultUserImage.jpg";
        }
        commenterImage.setAttribute("src", profilePic);
        commenterImage.setAttribute("class", "commenter-image");
        divCommentToDisplayContainer.appendChild(commenterImage);

        let commenterUsernameAndTextContainer = document.createElement("div");
        commenterUsernameAndTextContainer.setAttribute("class", `commenterUsernameAndTextContainer`);

        let commenerUsername = document.createElement("p");
        commenerUsername.setAttribute("class", "commenter-username");
        commenerUsername.innerHTML = parsedTripParticipantsUIDsPictures[commentData.userID].username;
        commenterUsernameAndTextContainer.appendChild(commenerUsername);

        let commentDateTime = document.createElement("p");
        commentDateTime.setAttribute("class", "comment-datetime");
        commentDateTime.innerHTML = commentData.time;
        commenterUsernameAndTextContainer.appendChild(commentDateTime);

        let commentText = document.createElement("p");
        commentText.setAttribute("class", "comment-text");
        commentText.innerHTML = commentData.commentText;
        commenterUsernameAndTextContainer.appendChild(commentText);

        divCommentToDisplayContainer.appendChild(commenterUsernameAndTextContainer);

        divCommentsContainer.appendChild(divCommentToDisplayContainer);
    }
    divEventContainer.appendChild(divCommentsContainer);

    // add event modal to DOM
    createEventDetailsModal(eventData);

    divEventContainer.addEventListener('click', function(){
        $(`#${eventData.docID}-new-event-modal`).show();
    });
    return divEventContainer;
}

function removeExistingEventDomElements(docID){
    let elementToRemove = document.getElementById(docID);
    if(elementToRemove !== null){
        elementToRemove.remove();
    }
}

function addNewEventDomElements(eventData, docID, allEvents){
    eventData.docID = docID;

    let eventsContainer = document.getElementById("events-container");
    let docIDMapTODocIDMinusOne = getPreviousDocIDMap(allEvents);
    console.log(docIDMapTODocIDMinusOne);

    let newEventDomElements = createNewEventDOMElements(eventData);
    let elementBeforeID = docIDMapTODocIDMinusOne[docID];
    if(elementBeforeID === null){
        // add as first element
        eventsContainer.prepend(newEventDomElements);
    }else{
        let elementBefore = document.getElementById(elementBeforeID);
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement
        elementBefore.insertAdjacentElement('afterend', newEventDomElements);
    }
}

function getSortedEvents(querySnapshot){
    // returns list of trip events, sorted by start date in ascending order
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
    return allEvents;
}

function getPreviousDocIDMap(allEvents){
    /* Events appear ordered by event date on the page.
    If any new events are added, we need to make sure to add them in the correct order,
    after existing elements with previous start dates.

    :returns: {<null or previous docID>: <next docID>}
    */

    // for new elements, need to know after what existing element to insert
    let docIDMapTODocIDMinusOne = {};
    for (let i = 0; i < allEvents.length; i++) {
        if(i > 0){
            docIDMapTODocIDMinusOne[allEvents[i].docID] = allEvents[i - 1].docID;
        }else{
            docIDMapTODocIDMinusOne[allEvents[i].docID] = null;
        }
    }
    return docIDMapTODocIDMinusOne;
}
 
function getTripEvents(tripID){
    /* 
    Gets data for currently authenticates user in real time. 
    Whenever anything changes in this document, data is pushed to the client.
    Updates events as they're added or removed

    https://firebase.google.com/docs/firestore/query-data/listen
    */
    db.collection(`trips`).doc(tripID).collection("events").onSnapshot((querySnapshot) => {
        let addedOrModifiedDocs = {}
        // https://firebase.google.com/docs/firestore/query-data/listen#view_changes_between_snapshots
        querySnapshot.docChanges().forEach((change) => {
            // shows only documents that changed. If first time loading, loads all documents as new changes.
            if (change.type === "added") {
                addedOrModifiedDocs[change.doc.id] = {"data": change.doc.data(), "type": "added"};
            }
            if (change.type === "modified") {
                addedOrModifiedDocs[change.doc.id] = {"data": change.doc.data(), "type": "modified"};
            } 
            if (change.type === "removed") {
                removeExistingEventDomElements(change.doc.id);
            }
        });

        let allSortedEvents = getSortedEvents(querySnapshot);

        for (let event of allSortedEvents){
            if(addedOrModifiedDocs.hasOwnProperty(event.docID)){
                // deal with events to add or remove
                if (addedOrModifiedDocs[event.docID].type === "added") {
                    addNewEventDomElements(addedOrModifiedDocs[event.docID].data, 
                                           event.docID, allSortedEvents);
                }
                if (addedOrModifiedDocs[event.docID].type === "modified") {
                    // TODO: IMPROVE - update existing elements instead of deleting and recreating
                    removeExistingEventDomElements(event.docID);
                    addNewEventDomElements(addedOrModifiedDocs[event.docID].data, 
                                           event.docID, allSortedEvents);
                }
            }
        }

        // called when user navigates to trip event URL. Automatically open requested modal
        let eventToOpen = document.getElementById("hidden-eventToOpen").innerHTML.trim();
        if(eventToOpen != 'null'){
            $(`#${eventToOpen}-new-event-modal`).show();
        }
        
    });
}

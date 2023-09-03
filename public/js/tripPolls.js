
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

function addPollOptionsInput(pollOptionsContainerID, pollID=null){
    /* Adds poll options inputs within the div containing all poll options inputs */
    let idPart = `${pollID}-`;
    if (pollID === null){
        idPart = '';
    }

    let parentDiv = document.getElementById(pollOptionsContainerID);

    let numberExistingPollOptions = document.querySelectorAll(`[id^="${idPart}input-poll-option-"]`).length;
    let newPollOptionNumber = numberExistingPollOptions + 1;

    let inputDiv = document.createElement("div");
    inputDiv.setAttribute("class", `input-group mb-3`);
    inputDiv.setAttribute("id", `${idPart}poll-option-container-div-` + newPollOptionNumber);

    let span = document.createElement("span");
    span.setAttribute("class", `input-group-text`);
    span.setAttribute("id", `${idPart}poll-option-label-` + newPollOptionNumber);
    span.innerHTML = "Option " + newPollOptionNumber;

    let input = document.createElement("input");
    input.setAttribute("type", `text`);
    input.setAttribute("autocomplete", `one-time-code`);
    input.setAttribute("class", `form-control`);
    input.setAttribute("id", `${idPart}input-poll-option-` + newPollOptionNumber);
    input.setAttribute("required", `true`);
    input.setAttribute("aria-describedby", `poll-option-label-` + newPollOptionNumber);

    let deleteOptionButton = document.createElement("button");
    deleteOptionButton.setAttribute("class", `btn btn-secondary`);
    deleteOptionButton.setAttribute("type", `button`);
    deleteOptionButton.setAttribute("id", `${idPart}option-delete-button-` + newPollOptionNumber);
    deleteOptionButton.innerHTML = "✘";
    deleteOptionButton.addEventListener(
        "click", 
        function(event){
            let optionNumberBeingRemoved = parseInt(event.target.parentNode.id.replace(`${idPart}poll-option-container-div-`, ""));
            let existingOptions = document.querySelectorAll(`[id^="${idPart}input-poll-option-"]`).length;

            event.target.parentNode.remove();

            // rename IDs after the one we're removing
            let idsToRename = [
                `${idPart}poll-option-container-div-`, 
                `${idPart}poll-option-label-`, 
                `${idPart}input-poll-option-`,
                `${idPart}option-delete-button-`
            ];
            for (let i=optionNumberBeingRemoved + 1; i <= existingOptions; i++){
                let newID = i - 1;

                for (let idToRename of idsToRename){
                    let domElementToChange = document.getElementById(idToRename + i);
                    domElementToChange.setAttribute("id", idToRename + newID);

                    if(idToRename == `${idPart}poll-option-label-`){
                        domElementToChange.innerHTML = "Option " + newID;
                    }
                    if(idToRename == `${idPart}input-poll-option-`){
                        domElementToChange.setAttribute("aria-describedby", `${idPart}poll-option-label-` + newID);
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

function deletePoll(tripID, eventID){
    $.ajax({
        url: `/trips/` + tripID + "/polls/" + eventID,
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
    let newEventModal = document.getElementById("new-poll-modal");
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
    document.getElementById(eventID + "-new-poll-modal-title").innerHTML = eventData.question;

    // choosable options 
    document.getElementById(eventID + "-number-poll-options").value = eventData.numberOptionsToChoose;

    // add options button
    document.getElementById(eventID + "-add-options-button").addEventListener(
        "click", 
        function(){
            addPollOptionsInput(eventID + '-new-poll-options-container', eventID);
        }
    );

    // options
    document.getElementById(eventID + "-input-poll-option-1").value = eventData.options["option_1"];
    document.getElementById(eventID + "-input-poll-option-2").value = eventData.options["option_2"];

    for (const [key, value] of Object.entries(eventData.options)) {
        if ((key != "option_1") && (key != "option_2")){
            addPollOptionsInput(eventID + '-new-poll-options-container', eventID);
            let optionNumber = key.split("_").pop();
            document.getElementById(eventID + "-input-poll-option-" + optionNumber).value = value;
        }
    }
    
    // close button
    let closeButton = document.getElementById(eventID + "-new-poll-modal-close-button");
    if(closeButton !== null){
        closeButton.setAttribute("onclick", `$('#${newDivID}').hide();`);
    }
    let closeButtonRedirect = document.getElementById(eventID + "-new-poll-modal-close-button-redirect-polls");
    if(closeButtonRedirect !== null){
        closeButtonRedirect.setAttribute("onclick", `window.location = '//${window.location.host}/trips/${tripID}/polls';`);
    }

    document.getElementById(eventID + "-new-poll-question").value = eventData.question;

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
        let tomElement = document.getElementById(`${eventID}-new-poll-multiselect-friends`);
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
    let saveButton = document.getElementById(`${eventID}-new-poll-create-button`);
    saveButton.setAttribute(
        "onclick", 
        `savePoll('${saveButton.name}', '${eventID}');`);

    // add delete event button
    let deleteEventButton = document.createElement("button");
    deleteEventButton.setAttribute("class", `btn btn-secondary`);
    deleteEventButton.setAttribute("type", `button`);
    deleteEventButton.setAttribute("id", `${eventID}-poll-delete-button`);
    deleteEventButton.innerHTML = "Delete poll";

    deleteEventButton.addEventListener(
        "click", 
        function(){
            // opens pop up with OK or Cancel buttons
            if (confirm("Are you sure you want to remove this trip poll?")) {
                deletePoll(tripID, eventID);
            }
        }
    );
    let deleteEventContainer = document.getElementById(`${eventID}-poll-modal-footer-left`);
    deleteEventContainer.appendChild(deleteEventButton);

    //cancel button
    let cancelButton = document.getElementById(`${eventID}-new-poll-cancel-button`);
    if(cancelButton !== null){
        // element not present when loading 'trips/<trip id>/itinerary/<event id>
        cancelButton.setAttribute(
            "onclick", 
            `$('#${eventID}-new-poll-modal').hide();`);
    }

    let cancelButtonRedirect = document.getElementById(`${eventID}-new-poll-cancel-button-redirect-polls`);
    if(cancelButtonRedirect !== null){
        // element not present when loading 'trips/<trip id>/itinerary/<event id>
        cancelButtonRedirect.addEventListener(
            "click", 
            function(){
                window.location = `//${window.location.host}/trips/${tripID}/polls`
            }
        );
    }
}

function createPollResultsModal(pollData, parsedTripParticipantsUIDsPictures){
    // pollData: all data about poll as saved in DB
    let existingModal = document.getElementById(pollData.docID + "-poll-results-modal");
    if(existingModal !== null){
        existingModal.remove();
    }

    let modalDiv = document.createElement("div");
    modalDiv.setAttribute("class", `modal`);
    modalDiv.setAttribute("id", pollData.docID + "-poll-results-modal");
    modalDiv.setAttribute("tabindex", "-1");
    modalDiv.setAttribute("data-bs-backdrop", "static");

    let modalDialogDiv = document.createElement("div");
    modalDialogDiv.setAttribute("class", `modal-dialog modal-fullscreen`);

    let modalContentDiv = document.createElement("div");
    modalContentDiv.setAttribute("class", `modal-content`);

    // --------------------- modal header ------------------------------------------
    let modalHeaderDiv = document.createElement("div");
    modalHeaderDiv.setAttribute("class", `modal-header`);

    let h1 = document.createElement("h1");
    h1.setAttribute("class", `modal-title`);
    h1.innerHTML = pollData.question;

    let buttonCloseModalX = document.createElement("button");
    buttonCloseModalX.setAttribute("class", `btn-close`);
    buttonCloseModalX.setAttribute("type", `button`);
    buttonCloseModalX.setAttribute("aria-label", `Close`);
    buttonCloseModalX.addEventListener('click', function(event){
        event.stopPropagation(); 
        $(`#${pollData.docID}-poll-results-modal`).hide()
    });
    modalHeaderDiv.appendChild(h1);
    modalHeaderDiv.appendChild(buttonCloseModalX);
    modalContentDiv.appendChild(modalHeaderDiv);

    // --------------------- modal body --------------------------------------------
    let modalBodyDiv = document.createElement("div");
    modalBodyDiv.setAttribute("class", `modal-body`);
    modalBodyDiv.setAttribute("id", `poll-answers-modal-body-` + pollData.docID);

    let pOwner = document.createElement("p");
    pOwner.innerHTML = `Asked by: ${parsedTripParticipantsUIDsPictures[pollData.pollOwner].username}`;
    modalBodyDiv.appendChild(pOwner);

    let pAnswersReceived = document.createElement("p");
    pAnswersReceived.innerHTML = Object.keys(pollData.answersToPoll).length + " / " + pollData.participants.length + " answers received";
    modalBodyDiv.appendChild(pAnswersReceived);

    // users still to answer
    let usersStillToAnswer = [];
    for (let participantUID of pollData.participants){
        if (!pollData.answersToPoll.hasOwnProperty(participantUID)){
            usersStillToAnswer.push(parsedTripParticipantsUIDsPictures[participantUID]);
        }
    }

    let divUsersStillToAnswer = document.createElement("div");
    divUsersStillToAnswer.setAttribute("class", `users-still-answering-container`);
    if (usersStillToAnswer.length === 0){
        let pUsersStillToAnswer = document.createElement("p");
        pUsersStillToAnswer.innerHTML = "All users submitted their answers.";
        divUsersStillToAnswer.appendChild(pUsersStillToAnswer);
    }else{
        let pUsersStillToAnswer = document.createElement("p");
        pUsersStillToAnswer.innerHTML = "The following users still need to reply:";
        divUsersStillToAnswer.appendChild(pUsersStillToAnswer);

        for (let userStillToAnswer of usersStillToAnswer){
            let divUserStillToAnswer = document.createElement("div");
            divUserStillToAnswer.setAttribute("class", `user-still-answering-container`);

            let profilePic = userStillToAnswer.picture;
            if(profilePic === null){
                profilePic = "/assets/defaultUserImage.jpg";
            }

            let userImg = document.createElement("img"); 
            userImg.setAttribute("class", `user-img`);
            userImg.setAttribute("src", profilePic);
            divUserStillToAnswer.appendChild(userImg);

            let username = document.createElement("p"); 
            username.setAttribute("class", `username`);
            username.innerHTML = userStillToAnswer.username;
            divUserStillToAnswer.appendChild(username);

            divUsersStillToAnswer.appendChild(divUserStillToAnswer);
        }
    }
    modalBodyDiv.appendChild(divUsersStillToAnswer);

    // answers
    let answers = {};
    for (const [optionNumber, optionValue] of Object.entries(pollData.options)) {
        answers[optionNumber] = {
            "value": optionValue,
            "chosenTimes": 0,
            "chosenBy": []
        }
    }
    for (const [uid, optionNumber] of Object.entries(pollData.answersToPoll)) {
        answers[optionNumber]["chosenTimes"] += 1;
        answers[optionNumber]["chosenBy"].push(parsedTripParticipantsUIDsPictures[uid].username);
    }
    let sortedAnswers = [];
    for (let answer in answers) {
        sortedAnswers.push([answer, answers[answer]]);
    }
    
    sortedAnswers.sort(function(a, b) {
        // sort descending. highest number of votes first
        return b[1].chosenTimes - a[1].chosenTimes;
    });

    let divAnswersContainer = document.createElement("div");
    divAnswersContainer.setAttribute("class", `answers-container`);

    let pAnswerTitle = document.createElement("p");
    pAnswerTitle.innerHTML = "Answers: ";
    divAnswersContainer.appendChild(pAnswerTitle);

    for (let optionNumberAndData of sortedAnswers) {
        let divAnswerContainer = document.createElement("div");
        divAnswerContainer.setAttribute("class", `answer-container`); 

        let pAnswerText = document.createElement("p");
        pAnswerText.innerHTML = optionNumberAndData[1].value;
        divAnswerContainer.appendChild(pAnswerText);

        let pNumberVotes = document.createElement("p");
        pNumberVotes.innerHTML = "Votes: " + optionNumberAndData[1].chosenTimes;
        divAnswerContainer.appendChild(pNumberVotes);

        if(optionNumberAndData[1].chosenTimes > 0){
            let pVotedBy = document.createElement("p"); 
            pVotedBy.innerHTML = "Voted by: " + optionNumberAndData[1].chosenBy.join(", ");
            divAnswerContainer.appendChild(pVotedBy);
        }

        divAnswersContainer.appendChild(divAnswerContainer);
    }
    modalBodyDiv.appendChild(divAnswersContainer);

    modalContentDiv.appendChild(modalBodyDiv);

    // --------------------- modal footer ------------------------------------------
    let divModalFooter = document.createElement("div");
    divModalFooter.setAttribute("class", `modal-footer`); 

    let divModalFooterLeft = document.createElement("div");
    divModalFooterLeft.setAttribute("class", `footer-left`); 
    divModalFooter.appendChild(divModalFooterLeft);

    let divModalFooterRight = document.createElement("div");
    divModalFooterRight.setAttribute("class", `footer-right`); 

    let closeButton = document.createElement("button");
    closeButton.setAttribute("class", `btn btn-secondary`); 
    closeButton.setAttribute("type", `button`); 
    closeButton.innerHTML = "Close"; 
    closeButton.addEventListener('click', function(event){
        event.stopPropagation(); 
        $(`#${pollData.docID}-poll-results-modal`).hide()
    });
    divModalFooterRight.appendChild(closeButton);
    divModalFooter.appendChild(divModalFooterRight);
    modalContentDiv.appendChild(divModalFooter);

    // ---------------------- assemble modal parts ------------------------------------------
    modalDialogDiv.appendChild(modalContentDiv);
    modalDiv.appendChild(modalDialogDiv);
    document.body.appendChild(modalDiv);
}

function createNewEventDOMElements(eventData){
    // create div for the poll
    let divPollContainer = document.createElement("div");
    divPollContainer.setAttribute("class", `poll-container`);
    divPollContainer.setAttribute("id", eventData.docID);

    let pEventTitle = document.createElement("p");
    pEventTitle.setAttribute("class", `poll-title`);
    pEventTitle.innerHTML = eventData.question;

    divPollContainer.appendChild(pEventTitle);

    let divParticipantsAndCommentsContainer = document.createElement("div");
    divParticipantsAndCommentsContainer.setAttribute("class", `participants-comments-container`);

    let participants = document.createElement("div");
    participants.setAttribute("class", `participants-container`);
    let answersReceived = document.createElement("p");
    answersReceived.setAttribute("class", `number-participants-p`);
    answersReceived.innerHTML = Object.keys(eventData.answersToPoll).length + " / " + eventData.participants.length + " answers received";
    participants.appendChild(answersReceived);
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

    divPollContainer.appendChild(divParticipantsAndCommentsContainer);

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
                    url: `/trips/` + tripID + "/polls/" + eventData.docID,
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
    
    // view poll results button
    let viewPollResultsButton = document.createElement("button");
    viewPollResultsButton.setAttribute("class", `btn btn-secondary`);
    viewPollResultsButton.setAttribute("id", `view-poll-results-button-` + eventData.docID);
    viewPollResultsButton.setAttribute("type", `button`);
    viewPollResultsButton.innerHTML = "See poll results";

    let parsedTripParticipantsUIDsPictures = JSON.parse(tripParticipantsUIDsPictures);
    createPollResultsModal(eventData, parsedTripParticipantsUIDsPictures);
    viewPollResultsButton.addEventListener('click', function(event){
        event.stopPropagation(); 
        $(`#${eventData.docID}-poll-results-modal`).show();
    });
    divAddCommentContainer.appendChild(viewPollResultsButton);

    // if user is poll owner, display button to edit poll details
    let userUID = document.getElementById("hidden-user-uid").innerHTML.trim();
    if(userUID === eventData.pollOwner){
        let editPollButton = document.createElement("button");
        editPollButton.setAttribute("class", `btn btn-secondary`);
        editPollButton.setAttribute("id", `edit-poll-button-` + eventData.docID);
        editPollButton.setAttribute("type", `button`);
        editPollButton.innerHTML = "Edit poll";
        editPollButton.addEventListener('click', function(event){
            event.stopPropagation(); 
            $(`#${eventData.docID}-new-poll-modal`).show();
        });
        divAddCommentContainer.appendChild(editPollButton);
    }
    divAddCommentContainer.appendChild(addCommentButton);
    divPollContainer.appendChild(divAddCommentContainer);

    // display comments
    let divCommentsContainer = document.createElement("div");
    divCommentsContainer.setAttribute("id", `comments-container-`+ eventData.docID);
    divCommentsContainer.setAttribute("class", `comments-container`);

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
    divPollContainer.appendChild(divCommentsContainer);

    // add event modal to DOM
    createEventDetailsModal(eventData);

    return divPollContainer;
}

function removeExistingPollDomElements(docID){
    let elementToRemove = document.getElementById(docID);
    if(elementToRemove !== null){
        elementToRemove.remove();
    }
}

function addNewPollDomElements(eventData, docID){
    eventData.docID = docID;

    let eventsContainer = document.getElementById("polls-container");
    let newEventDomElements = createNewEventDOMElements(eventData);
    eventsContainer.appendChild(newEventDomElements);
}

function getAllEvents(querySnapshot){
    // returns list of trip events
    let allEvents = [];

    querySnapshot.forEach((doc) => {
        let data = doc.data();
        data.docID = doc.id;
        allEvents.push(data);
    });
    return allEvents;
}
 
function getTripPolls(tripID){
    /* 
    Gets data for currently authenticates user in real time. 
    Whenever anything changes in this document, data is pushed to the client.
    Updates events as they're added or removed

    https://firebase.google.com/docs/firestore/query-data/listen
    */
    db.collection(`trips`).doc(tripID).collection("polls").onSnapshot((querySnapshot) => {
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
                removeExistingPollDomElements(change.doc.id);
            }
        });

        let allEvents = getAllEvents(querySnapshot);

        for (let event of allEvents){
            if(addedOrModifiedDocs.hasOwnProperty(event.docID)){
                // deal with events to add or remove
                if (addedOrModifiedDocs[event.docID].type === "added") {
                    addNewPollDomElements(addedOrModifiedDocs[event.docID].data, 
                                           event.docID);
                }
                if (addedOrModifiedDocs[event.docID].type === "modified") {
                    // TODO: IMPROVE - update existing elements instead of deleting and recreating
                    removeExistingPollDomElements(event.docID);
                    addNewPollDomElements(addedOrModifiedDocs[event.docID].data, 
                                           event.docID);
                }
            }
        }

        // called when user navigates to trip event URL. Automatically open requested modal
        let pollToOpen = document.getElementById("hidden-pollToOpen").innerHTML.trim();
        if(pollToOpen != 'null'){
            $(`#${pollToOpen}-new-poll-modal`).show();
        }
        
    });
}

function submitAnswerPoll(tripID, pollID){
    let allOptions = document.getElementsByClassName("form-check-input available-poll-options");
    let selectedOptions = [];

    for (let option of allOptions){
        if(option.checked === true){
            selectedOptions.push(option.value);
        }
    }

    let choosableOptionsElement = document.getElementById("number-poll-options-choosable").innerHTML.trim().replace("Please select ", "");
    choosableOptionsElement = parseInt(choosableOptionsElement.replace(" options", ""));

    if(selectedOptions.length > choosableOptionsElement){
        alert("Please only choose " + choosableOptionsElement + " options.")
        return;
    }

    $.ajax({
        url: `/trips/` + tripID + "/polls/" + pollID,
        method: "POST",
        xhrFields: {
          withCredentials: true
        },
        data: jQuery.param({
            "answersToPoll": selectedOptions
        }),
        success: function() {   
            window.location.href = `/trips/` + tripID + "/polls/"
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
          alert(XMLHttpRequest.responseText, textStatus, errorThrown); 
        }
      });
}

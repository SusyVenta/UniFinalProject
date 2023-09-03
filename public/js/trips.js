function filterTrips(item) {
    // function updates the button of dropdown menu with chosen option
    document.getElementById("tripTypeDropdownButton").innerHTML = item.innerHTML;

    if(item.innerHTML === "Upcoming trips"){
      let elementsToDisplay = document.getElementsByName("upcoming");
      for (let element of elementsToDisplay){
        $(element).show();
      }

      let elementsToHide = document.getElementsByName("archived");
      for (let element of elementsToHide){
        $(element).hide();
      }
    } else if (item.innerHTML === "Past trips"){
      let elementsToDisplay = document.getElementsByName("archived");
      for (let element of elementsToDisplay){
        $(element).show();
      }

      let elementsToHide = document.getElementsByName("upcoming");
      for (let element of elementsToHide){
        $(element).hide();
      }
    } else if(item.innerHTML === "All"){
      let elementsToDisplay = document.getElementsByClassName("trip");
      for (let element of elementsToDisplay){
        $(element).show();
      }
    }
};

function showModal(item){
  /* 
  Detect what action the user wants to do and pop up relative modal. 
  User can either want to delete a trip or share its details.
  */
  let indexFirstUnderscore = item.name.indexOf("_");
  let action = item.name.slice(0, indexFirstUnderscore);
  let tripId = item.name.slice(indexFirstUnderscore + 1);
  let tripTitle = document.getElementById(`trip-title-${tripId}`).innerHTML;

  let tripModal = document.getElementById("trips-modal");
  let modalMessage = document.getElementById("trips-modal-message");
  let modalTitle = document.getElementById("trips-modal-title");
  let closeButton = document.getElementById("close-button");
  let deleteButton = document.getElementById("delete-button");
  let cancelButton = document.getElementById("cancel-button");

  if(action === "delete"){
    modalMessage.innerHTML = `Are you sure you want to delete your trip called '${tripTitle}'?`;
    modalTitle.innerHTML = "Confirm trip deletion";
    deleteButton.setAttribute("name", tripId);

    $(closeButton).hide();
    $(deleteButton).show();
    $(cancelButton).show();
  }

  if(action === "share"){
    modalMessage.innerHTML = `Share this link to invite your friends to join this trip.`;
    modalTitle.innerHTML = `Share trip '${tripTitle}'`;

    $(closeButton).show();
    $(deleteButton).hide();
    $(cancelButton).hide();
  }
  
  let modal = new bootstrap.Modal(tripModal, {});
  modal.show();

};

function deleteTrip(item){
  // deletes selected trip by calling API endpoint
  let tripId = item.name;
  $.ajax({
    url: `/trips/${tripId}`,
    method: "DELETE",
    xhrFields: {
      withCredentials: true
   },
    success : function () {
      // reload trips page on status 200
      window.location.href = "/trips";
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) { 
        alert(XMLHttpRequest.responseText, textStatus, errorThrown); 
    }
  });
};

function redirectTripView(element, tripId){
  window.location.href = `/trips/${tripId}/participants`;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
//   New trip Modal functionality
/////////////////////////////////////////////////////////////////////////////////////////////////// 
function updateDateCollectionTypeDropdown(item){
  // function updates the button of dropdown menu with chosen option
  document.getElementById("date-collection-type").innerHTML = item.innerHTML;
  document.getElementById("date-collection-type").name = item.name;

  let addNewDatesDiv = document.getElementById("add-dates-div");

  if(item.name == 2){
    $(addNewDatesDiv).hide();
  } else {
    $(addNewDatesDiv).show();
  }
};

function deleteDateAvailability(element){
  // deletes div with date availability
  let elementToDelete = document.getElementById(`date-availability-${element.name}`);
  elementToDelete.remove();
}

function addDateAvailabilityInput(){
  /* 
  creates new date-range picker div every time the "add" button is clicked:

  <div id="date-availability-1" class="date-availability-container">
    <div class="horizontal-flex">
      <div class="label-and-input-container">
        <label for="new-trip-availability-1" class="form-label">When are you available?</label>
        <div class="form-control" >
          <i class="fa fa-calendar"></i>
          <input class="form-control" id="new-trip-availability-1" type="text" name="daterange" value="start date - end date" />
        </div>
      </div>
      <div class="date-availability-delete-button-container">
        <button id="delete_date-availability-1" class="btn btn-secondary" onclick="deleteDateAvailability(this);">
          <span class="material-symbols-outlined modified">delete</span>
        </button>
      </div>
    </div>
  </div>
  */
  let dateAvailabilitiesContainer = document.getElementById("date-availabilities-container");
  let numberExistingDatePickers = dateAvailabilitiesContainer.childNodes.length;
  let newId = numberExistingDatePickers + 1;

  // form control ------------------------------------
  let formControlDiv = document.createElement("div");
  formControlDiv.setAttribute("class", `form-control`);

  let icon = document.createElement("i");
  icon.setAttribute("class", `fa fa-calendar`);

  let input = document.createElement("input");
  input.setAttribute("class", `form-control`);
  input.setAttribute("id", `new-trip-availability-${newId}`);
  input.setAttribute("type", `text`);
  input.setAttribute("name", `daterange`);
  input.setAttribute("value", `start date - end date`);

  formControlDiv.appendChild(icon);
  formControlDiv.appendChild(input);

  // label ------------------------------------------
  let label = document.createElement("label");
  label.setAttribute("for", `new-trip-availability-${newId}`);
  label.setAttribute("class", `form-label`);
  label.innerHTML = "When are you available?";

  // label-and-input-container -----------------------
  let labelAndInputContainerDiv = document.createElement("div");
  labelAndInputContainerDiv.setAttribute("class", `label-and-input-container`);
  labelAndInputContainerDiv.appendChild(label);
  labelAndInputContainerDiv.appendChild(formControlDiv);

  // date-availability-delete-button-container -------
  let span = document.createElement("span");
  span.setAttribute("class", `material-symbols-outlined modified`);
  span.innerHTML = "delete";

  let spanButton = document.createElement("button");
  spanButton.setAttribute("id", `delete_date-availability-${newId}`);
  spanButton.setAttribute("name", newId);
  spanButton.setAttribute("class", `btn btn-secondary`);
  spanButton.setAttribute("onclick", `deleteDateAvailability(this);`);
  spanButton.appendChild(span);

  let spanButtonContainerDiv = document.createElement("div");
  spanButtonContainerDiv.setAttribute("class", `date-availability-delete-button-container`);
  spanButtonContainerDiv.appendChild(spanButton);

  // horizontal flex div -----------------------------
  let horizontalFlexDiv = document.createElement("div");
  horizontalFlexDiv.setAttribute("class", `horizontal-flex`);
  horizontalFlexDiv.appendChild(labelAndInputContainerDiv);
  horizontalFlexDiv.appendChild(spanButtonContainerDiv);

  // date availability external div ------------------
  let dateAvailabilityDiv = document.createElement("div");
  dateAvailabilityDiv.setAttribute("id", `date-availability-${newId}`);
  dateAvailabilityDiv.setAttribute("class", `date-availability-container`);

  dateAvailabilityDiv.appendChild(horizontalFlexDiv);

  dateAvailabilitiesContainer.appendChild(dateAvailabilityDiv);

  // associate date picker to input created above
  $(function() {
    $(`#new-trip-availability-${newId}`).daterangepicker({
      opens: 'left',
      minYear: moment().year(),
      startDate: moment().date(),
      endDate: moment().date()
    });
  });

  // add event listener to change value of the changed date picker input element
  $(`#new-trip-availability-${newId}`).on('apply.daterangepicker', function(event, picker) {
    let newValue = picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY');
    document.getElementById(event.target.id).value = newValue;
  });
};

function getSelectedDates(){
  // returns availability dates selected by user as an array
  let dateAvailabilities = document.querySelectorAll('[id^="new-trip-availability-"]');
  
  let selectedDates = [];
  for(let date of dateAvailabilities){
    selectedDates.push(date.value);
  }
  return selectedDates;
};

function saveTrip(){
  // collects data from modal and submits it to the API endpoint
  let nullChecks = {
    workingDays: {
      value: document.getElementById("working-days-availability").value,
      message: "Please enter a number of working days you are available"
    },
    totalDays: {
      value: document.getElementById("total-days-availability").value,
      message: "Please enter a number of total days you are available"
    },
    title: {
      value: document.getElementById("new-trip-title").value,
      message: "Please enter a title for your trip"
    }
  }

  for (const [fieldName, value_message] of Object.entries(nullChecks)) {
    if (value_message.value == ""){
      alert(value_message.message);
      return;
    }
  }  

  let payload = { 
    tripTitle: nullChecks.title.value, 
    askAllParticipantsDates: document.getElementById("date-collection-type").name,
    datesPreferences: getSelectedDates(),
    workingDaysAvailability: nullChecks.workingDays.value,
    totalDaysAvailability: nullChecks.totalDays.value
  };
  
  $.ajax({
    url: `/trips`,
    method: "POST",
    xhrFields: {
      withCredentials: true
    },
    data: jQuery.param(payload),
    success : function () {
      // reload trips page on status 200
      window.location.href = "/trips";
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) { 
        alert(XMLHttpRequest.responseText, textStatus, errorThrown); 
    }
  });
};